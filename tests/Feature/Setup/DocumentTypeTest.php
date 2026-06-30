<?php

namespace Tests\Feature\Setup;

use App\Models\DocumentCategory;
use App\Models\DocumentType;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentTypeTest extends TestCase
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

    private function makeCategory(array $attrs = []): DocumentCategory
    {
        return DocumentCategory::create(array_merge([
            'name' => 'Procurement Document',
            'is_active' => true,
            'sort_order' => 1,
        ], $attrs));
    }

    public function test_admin_can_view_general_setup(): void
    {
        $admin = $this->userWithRole('admin');
        $this->makeCategory();

        $this->actingAs($admin)
            ->get(route('setup.document-types.index'))
            ->assertOk();
    }

    public function test_staff_cannot_view_general_setup(): void
    {
        $staff = $this->userWithRole('staff');

        $this->actingAs($staff)
            ->get(route('setup.document-types.index'))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get(route('setup.document-types.index'))
            ->assertRedirect(route('login'));
    }

    public function test_store_requires_name_and_unique_code(): void
    {
        $admin = $this->userWithRole('admin');
        $category = $this->makeCategory();

        DocumentType::create([
            'code' => 'NoM',
            'name' => 'Notice of Meeting',
            'document_category_id' => $category->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        // Duplicate code is rejected.
        $this->actingAs($admin)
            ->from(route('setup.document-types.index'))
            ->post(route('setup.document-types.store'), [
                'code' => 'NoM',
                'name' => 'Another',
                'document_category_id' => $category->id,
                'is_active' => true,
                'sort_order' => 0,
            ])
            ->assertSessionHasErrors('code');

        // Missing name is rejected.
        $this->actingAs($admin)
            ->from(route('setup.document-types.index'))
            ->post(route('setup.document-types.store'), [
                'code' => 'TOR',
                'name' => '',
                'document_category_id' => $category->id,
                'is_active' => true,
                'sort_order' => 0,
            ])
            ->assertSessionHasErrors('name');

        // Valid payload creates the row.
        $this->actingAs($admin)
            ->post(route('setup.document-types.store'), [
                'code' => 'TOR',
                'name' => 'Terms of Reference',
                'document_category_id' => $category->id,
                'description' => 'Defines scope.',
                'is_active' => true,
                'sort_order' => 2,
            ])
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('document_types', ['code' => 'TOR', 'name' => 'Terms of Reference']);
    }

    public function test_archive_and_restore_a_document_type(): void
    {
        $admin = $this->userWithRole('admin');
        $category = $this->makeCategory();
        $type = DocumentType::create([
            'code' => 'PR',
            'name' => 'Purchase Request',
            'document_category_id' => $category->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->delete(route('setup.document-types.destroy', $type->id))
            ->assertSessionHasNoErrors();
        $this->assertSoftDeleted('document_types', ['id' => $type->id]);

        $this->actingAs($admin)
            ->post(route('setup.document-types.restore', $type->id))
            ->assertSessionHasNoErrors();
        $this->assertDatabaseHas('document_types', ['id' => $type->id, 'deleted_at' => null]);
    }

    public function test_only_system_admin_can_permanently_delete(): void
    {
        $category = $this->makeCategory();
        $type = DocumentType::create([
            'code' => 'DV',
            'name' => 'Disbursement Voucher',
            'document_category_id' => $category->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $type->delete(); // archived

        // Manager may manage but cannot purge.
        $manager = $this->userWithRole('manager');
        $this->actingAs($manager)
            ->delete(route('setup.document-types.force', $type->id))
            ->assertForbidden();
        $this->assertSoftDeleted('document_types', ['id' => $type->id]);

        // System Administrator can purge.
        $admin = $this->userWithRole('admin');
        $this->actingAs($admin)
            ->delete(route('setup.document-types.force', $type->id))
            ->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('document_types', ['id' => $type->id]);
    }

    public function test_category_in_use_cannot_be_archived(): void
    {
        $admin = $this->userWithRole('admin');
        $category = $this->makeCategory();
        DocumentType::create([
            'code' => 'APP',
            'name' => 'Annual Procurement Plan',
            'document_category_id' => $category->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)
            ->from(route('setup.document-types.index'))
            ->delete(route('setup.categories.destroy', $category->id))
            ->assertSessionHas('error');

        $this->assertDatabaseHas('document_categories', ['id' => $category->id, 'deleted_at' => null]);
    }

    public function test_category_create_is_validated_and_unique(): void
    {
        $admin = $this->userWithRole('admin');
        $this->makeCategory(['name' => 'Meeting Document']);

        $this->actingAs($admin)
            ->from(route('setup.document-types.index'))
            ->post(route('setup.categories.store'), [
                'name' => 'Meeting Document',
                'is_active' => true,
                'sort_order' => 0,
            ])
            ->assertSessionHasErrors('name');
    }
}
