<?php

namespace Tests\Feature\Records;

use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    private function user(string $role): User
    {
        $u = User::factory()->create();
        $u->assignRole($role);

        return $u;
    }

    public function test_records_index_loads_for_any_authenticated_user(): void
    {
        $this->actingAs($this->user('staff'))->get(route('records.index'))->assertOk();
    }

    public function test_guest_cannot_access_records(): void
    {
        $this->get(route('records.index'))->assertRedirect(route('login'));
    }

    public function test_create_is_gated_by_document_manage(): void
    {
        $type = DocumentType::factory()->create();
        // no-role user lacks document.manage
        $this->actingAs(User::factory()->create())->get(route('records.create'))->assertForbidden();
        $this->actingAs($this->user('manager'))->get(route('records.create'))->assertOk();
    }

    public function test_store_creates_record_and_autogenerates_tracking_number(): void
    {
        $type = DocumentType::factory()->create(['code' => 'PR']);
        $dept = Department::factory()->create();

        $this->actingAs($this->user('manager'))
            ->post(route('records.store'), [
                'document_type_id' => $type->id,
                'reference_no' => 'PR-2026-9001',
                'title' => 'Purchase of laptops',
                'department_id' => $dept->id,
                'status' => 'received',
                'classification' => 'internal',
                'priority' => 'high',
                'tags' => ['fy2026', 'procurement'],
            ])
            ->assertRedirect();

        $doc = Document::where('reference_no', 'PR-2026-9001')->first();
        $this->assertNotNull($doc);
        $this->assertStringStartsWith('CICC-', $doc->tracking_no);
        $this->assertSame(['fy2026', 'procurement'], $doc->tags);
    }

    public function test_store_validates_required_fields(): void
    {
        $this->actingAs($this->user('manager'))
            ->from(route('records.create'))
            ->post(route('records.store'), ['title' => ''])
            ->assertSessionHasErrors(['document_type_id', 'reference_no', 'title', 'status', 'classification', 'priority']);
    }

    public function test_show_and_update_record(): void
    {
        $doc = Document::factory()->create(['status' => 'draft']);

        $this->actingAs($this->user('staff'))->get(route('records.show', $doc))->assertOk();

        $this->actingAs($this->user('manager'))
            ->patch(route('records.update', $doc), [
                'document_type_id' => $doc->document_type_id,
                'reference_no' => $doc->reference_no,
                'title' => 'Updated title',
                'status' => 'approved',
                'classification' => $doc->classification,
                'priority' => $doc->priority,
            ])
            ->assertRedirect(route('records.show', $doc));

        $this->assertSame('Updated title', $doc->fresh()->title);
        $this->assertSame('approved', $doc->fresh()->status);
    }

    public function test_archive_restore_and_bulk_archive(): void
    {
        $manager = $this->user('manager');
        $docs = Document::factory()->count(3)->create();

        $this->actingAs($manager)->delete(route('records.destroy', $docs[0]))->assertRedirect();
        $this->assertSoftDeleted('documents', ['id' => $docs[0]->id]);

        $this->actingAs($manager)->post(route('records.restore', $docs[0]->id))->assertRedirect();
        $this->assertDatabaseHas('documents', ['id' => $docs[0]->id, 'deleted_at' => null]);

        $this->actingAs($manager)->post(route('records.bulk-archive'), ['ids' => [$docs[1]->id, $docs[2]->id]])->assertRedirect();
        $this->assertSoftDeleted('documents', ['id' => $docs[1]->id]);
        $this->assertSoftDeleted('documents', ['id' => $docs[2]->id]);
    }

    public function test_force_delete_requires_purge_permission(): void
    {
        $doc = Document::factory()->create();
        $doc->delete();

        $this->actingAs($this->user('manager'))->delete(route('records.force', $doc->id))->assertForbidden();
        $this->actingAs($this->user('admin'))->delete(route('records.force', $doc->id))->assertRedirect();
        $this->assertDatabaseMissing('documents', ['id' => $doc->id]);
    }

    public function test_csv_export_streams(): void
    {
        Document::factory()->count(2)->create();
        $res = $this->actingAs($this->user('staff'))->get(route('records.export'));
        $res->assertOk();
        $this->assertStringContainsString('text/csv', $res->headers->get('content-type'));
    }

    public function test_reports_pages_load_and_export(): void
    {
        Document::factory()->count(5)->create();
        $user = $this->user('staff');

        $this->actingAs($user)->get(route('reports.index'))->assertOk();
        $this->actingAs($user)->get(route('reports.records', ['group_by' => 'status']))->assertOk();
        $this->actingAs($user)->get(route('reports.records.export', ['group_by' => 'department']))->assertOk();
    }
}
