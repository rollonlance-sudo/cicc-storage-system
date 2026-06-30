<?php

namespace Tests\Feature\Records;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentAttachment;
use App\Models\DocumentVersion;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AttachmentActivityTest extends TestCase
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

    public function test_creating_and_updating_logs_activity_and_versions(): void
    {
        $this->actingAs($this->user('manager'));
        $doc = Document::factory()->create(['status' => 'draft']);

        $this->assertDatabaseHas('activity_logs', ['document_id' => $doc->id, 'action' => 'created']);
        $this->assertSame(1, DocumentVersion::where('document_id', $doc->id)->count());

        $doc->update(['status' => 'approved']);

        $this->assertDatabaseHas('activity_logs', ['document_id' => $doc->id, 'action' => 'status_changed']);
        $this->assertSame(2, DocumentVersion::where('document_id', $doc->id)->count());
    }

    public function test_archive_and_restore_are_logged(): void
    {
        $this->actingAs($this->user('manager'));
        $doc = Document::factory()->create();
        $doc->delete();
        $doc->restore();

        $this->assertDatabaseHas('activity_logs', ['document_id' => $doc->id, 'action' => 'archived']);
        $this->assertDatabaseHas('activity_logs', ['document_id' => $doc->id, 'action' => 'restored']);
    }

    public function test_seeded_records_do_not_create_activity(): void
    {
        // No authenticated user → observer is a no-op (keeps mock data clean).
        $doc = Document::factory()->create();
        $this->assertSame(0, ActivityLog::where('document_id', $doc->id)->count());
        $this->assertSame(0, DocumentVersion::where('document_id', $doc->id)->count());
    }

    public function test_attachment_upload_download_and_delete(): void
    {
        Storage::fake('local');
        $manager = $this->user('manager');
        $doc = Document::factory()->create();

        // Upload
        $this->actingAs($manager)
            ->post(route('records.attachments.store', $doc), ['file' => UploadedFile::fake()->create('memo.pdf', 200, 'application/pdf')])
            ->assertSessionHasNoErrors();

        $attachment = DocumentAttachment::where('document_id', $doc->id)->first();
        $this->assertNotNull($attachment);
        Storage::disk('local')->assertExists($attachment->path);
        $this->assertDatabaseHas('activity_logs', ['document_id' => $doc->id, 'action' => 'attachment_added']);

        // Download increments count
        $this->actingAs($manager)->get(route('attachments.download', $attachment))->assertOk();
        $this->assertSame(1, $attachment->fresh()->download_count);

        // Delete
        $this->actingAs($manager)->delete(route('attachments.destroy', $attachment))->assertSessionHasNoErrors();
        Storage::disk('local')->assertMissing($attachment->path);
        $this->assertDatabaseMissing('document_attachments', ['id' => $attachment->id]);
    }

    public function test_upload_validates_file(): void
    {
        $manager = $this->user('manager');
        $doc = Document::factory()->create();

        $this->actingAs($manager)
            ->from(route('records.show', $doc))
            ->post(route('records.attachments.store', $doc), [])
            ->assertSessionHasErrors('file');
    }

    public function test_upload_requires_document_manage(): void
    {
        Storage::fake('local');
        $doc = Document::factory()->create();

        $this->actingAs(User::factory()->create()) // no role
            ->post(route('records.attachments.store', $doc), ['file' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf')])
            ->assertForbidden();
    }

    public function test_record_show_exposes_attachments_versions_activity(): void
    {
        $this->actingAs($this->user('staff'));
        $doc = Document::factory()->create();

        $this->get(route('records.show', $doc))->assertInertia(fn ($p) => $p
            ->component('records/show')
            ->has('attachments')
            ->has('versions')
            ->has('activity'));
    }
}
