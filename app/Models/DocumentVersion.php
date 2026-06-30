<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentVersion extends Model
{
    protected $fillable = [
        'document_id',
        'version_no',
        'changed_by',
        'summary',
        'snapshot',
    ];

    protected function casts(): array
    {
        return [
            'snapshot' => 'array',
            'version_no' => 'integer',
        ];
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /** Snapshot the current state of a document as the next version. */
    public static function capture(Document $document, ?string $summary = null): self
    {
        $next = static::where('document_id', $document->id)->max('version_no') + 1;

        return static::create([
            'document_id' => $document->id,
            'version_no' => $next,
            'changed_by' => auth()->id(),
            'summary' => $summary,
            'snapshot' => $document->only([
                'tracking_no', 'reference_no', 'title', 'status', 'classification',
                'priority', 'document_date', 'amount', 'prepared_by',
            ]),
        ]);
    }
}
