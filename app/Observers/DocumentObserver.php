<?php

namespace App\Observers;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DocumentVersion;

/**
 * Records an audit trail and version snapshots for document changes made by an
 * authenticated user. Seeder/factory writes (no auth) are intentionally skipped
 * so mock data stays clean.
 */
class DocumentObserver
{
    private function active(): bool
    {
        return auth()->check();
    }

    public function created(Document $document): void
    {
        if (! $this->active()) {
            return;
        }
        DocumentVersion::capture($document, 'Record created');
        ActivityLog::record($document, 'created', 'Record created');
    }

    public function updated(Document $document): void
    {
        if (! $this->active()) {
            return;
        }

        // restore() also fires `updated`; let the `restored` event handle that case.
        if ($document->wasChanged('deleted_at')) {
            return;
        }

        if ($document->wasChanged('status')) {
            ActivityLog::record($document, 'status_changed', 'Status changed', [
                'from' => $document->getOriginal('status'),
                'to' => $document->status,
            ]);
        }

        DocumentVersion::capture($document, 'Record updated');
        ActivityLog::record($document, 'updated', 'Record details updated');
    }

    public function deleted(Document $document): void
    {
        if (! $this->active() || $document->isForceDeleting()) {
            return;
        }
        ActivityLog::record($document, 'archived', 'Record archived');
    }

    public function restored(Document $document): void
    {
        if (! $this->active()) {
            return;
        }
        ActivityLog::record($document, 'restored', 'Record restored from archive');
    }
}
