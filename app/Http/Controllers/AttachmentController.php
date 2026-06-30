<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttachmentController extends Controller
{
    /** Storage disk for attachments — `local` in dev, set FILESYSTEM_DISK=s3 in production/serverless. */
    private function disk(): string
    {
        return config('filesystems.default');
    }

    public function store(Request $request, Document $record): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,csv,txt'],
        ]);

        $file = $request->file('file');
        $path = $file->store("attachments/{$record->id}", $this->disk());

        $attachment = $record->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        ActivityLog::record($record, 'attachment_added', "Attachment added: {$attachment->original_name}");

        return back()->with('success', 'Attachment uploaded.');
    }

    public function download(DocumentAttachment $attachment): StreamedResponse
    {
        abort_unless(Storage::disk($this->disk())->exists($attachment->path), 404);

        $attachment->increment('download_count');
        ActivityLog::record($attachment->document, 'downloaded', "Attachment downloaded: {$attachment->original_name}");

        return Storage::disk($this->disk())->download($attachment->path, $attachment->original_name);
    }

    public function destroy(DocumentAttachment $attachment): RedirectResponse
    {
        Storage::disk($this->disk())->delete($attachment->path);
        $document = $attachment->document;
        $name = $attachment->original_name;
        $attachment->delete();

        if ($document) {
            ActivityLog::record($document, 'attachment_removed', "Attachment removed: {$name}");
        }

        return back()->with('success', 'Attachment removed.');
    }
}
