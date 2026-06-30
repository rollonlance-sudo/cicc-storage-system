<?php

namespace Tests\Feature\Papers;

use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function makeType(string $code = 'TST'): DocumentType
    {
        return DocumentType::factory()->create(['code' => $code]);
    }

    public function test_authenticated_home_redirects_to_dashboard(): void
    {
        $this->actingAs($this->userWithRole('staff'))
            ->get('/')
            ->assertRedirect(route('dashboard'));
    }

    public function test_dashboard_loads_for_authenticated_user(): void
    {
        $this->actingAs($this->userWithRole('staff'))
            ->get(route('dashboard'))
            ->assertOk();
    }

    public function test_guest_cannot_view_papers(): void
    {
        $this->get(route('papers.index'))->assertRedirect(route('login'));
    }

    public function test_papers_index_and_show_load(): void
    {
        $user = $this->userWithRole('staff');
        $type = $this->makeType('NoM');
        Document::factory()->count(3)->create(['document_type_id' => $type->id]);

        $this->actingAs($user)->get(route('papers.index'))->assertOk();
        $this->actingAs($user)->get(route('papers.show', $type->code))->assertOk();
    }

    public function test_manager_can_create_document_and_reference_is_unique(): void
    {
        $manager = $this->userWithRole('manager');
        $type = $this->makeType('PR');

        Document::factory()->create(['document_type_id' => $type->id, 'reference_no' => 'PR-2026-0001']);

        // Duplicate reference is rejected.
        $this->actingAs($manager)
            ->from(route('papers.show', $type->code))
            ->post(route('documents.store', $type->code), [
                'reference_no' => 'PR-2026-0001',
                'title' => 'Dup',
                'status' => 'draft',
            ])
            ->assertSessionHasErrors('reference_no');

        // Missing title/reference rejected.
        $this->actingAs($manager)
            ->from(route('papers.show', $type->code))
            ->post(route('documents.store', $type->code), [
                'reference_no' => '',
                'title' => '',
                'status' => 'draft',
            ])
            ->assertSessionHasErrors(['reference_no', 'title']);

        // Valid creates the record under the right type.
        $this->actingAs($manager)
            ->post(route('documents.store', $type->code), [
                'reference_no' => 'PR-2026-0002',
                'title' => 'Purchase of supplies',
                'status' => 'pending',
                'classification' => 'internal',
                'priority' => 'normal',
                'amount' => 12500.50,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('documents', [
            'reference_no' => 'PR-2026-0002',
            'document_type_id' => $type->id,
            'status' => 'pending',
        ]);

        // Tracking number is auto-generated when left blank.
        $this->assertNotNull(Document::where('reference_no', 'PR-2026-0002')->first()->tracking_no);
    }

    public function test_user_without_permission_cannot_create_documents(): void
    {
        $user = User::factory()->create(); // no role → no document.manage
        $type = $this->makeType('SO');

        // Can still browse (read needs only auth)...
        $this->actingAs($user)->get(route('papers.show', $type->code))->assertOk();

        // ...but cannot create.
        $this->actingAs($user)
            ->post(route('documents.store', $type->code), [
                'reference_no' => 'SO-2026-0001',
                'title' => 'X',
                'status' => 'draft',
            ])
            ->assertForbidden();
    }

    public function test_index_search_finds_documents_inside_types(): void
    {
        $user = $this->userWithRole('staff');
        $type = $this->makeType('TOR');
        Document::factory()->create(['document_type_id' => $type->id, 'reference_no' => 'TOR-2026-0007', 'title' => 'Bridge project scope']);
        Document::factory()->create(['document_type_id' => $type->id, 'reference_no' => 'TOR-2026-0008', 'title' => 'Road repair scope']);

        // Matches a reference number.
        $this->actingAs($user)
            ->get(route('papers.index', ['q' => 'TOR-2026-0007']))
            ->assertInertia(fn ($page) => $page
                ->component('papers/index')
                ->where('documentMatches', 1)
                ->where('filters.q', 'TOR-2026-0007'));

        // Matches a word in the title across the type's documents.
        $this->actingAs($user)
            ->get(route('papers.index', ['q' => 'scope']))
            ->assertInertia(fn ($page) => $page->where('documentMatches', 2));

        // No matches.
        $this->actingAs($user)
            ->get(route('papers.index', ['q' => 'nothinghere']))
            ->assertInertia(fn ($page) => $page->where('documentMatches', 0));
    }

    public function test_document_can_be_archived_and_restored(): void
    {
        $manager = $this->userWithRole('manager');
        $type = $this->makeType('DV');
        $doc = Document::factory()->create(['document_type_id' => $type->id]);

        $this->actingAs($manager)->delete(route('documents.destroy', $doc->id))->assertSessionHasNoErrors();
        $this->assertSoftDeleted('documents', ['id' => $doc->id]);

        $this->actingAs($manager)->post(route('documents.restore', $doc->id))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('documents', ['id' => $doc->id, 'deleted_at' => null]);
    }
}
