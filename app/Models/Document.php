<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    /** @use HasFactory<\Database\Factories\DocumentFactory> */
    use HasFactory, SoftDeletes;

    /** Workflow statuses a document can move through. */
    public const STATUSES = [
        'draft', 'received', 'for_review', 'for_approval', 'approved',
        'released', 'returned', 'pending', 'completed', 'cancelled',
    ];

    public const PRIORITIES = ['low', 'normal', 'high', 'urgent', 'critical'];

    public const CLASSIFICATIONS = ['public', 'internal', 'confidential', 'restricted', 'highly_confidential'];

    /** Classifications visible only to authorized (records.manage) users. */
    public const SENSITIVE_CLASSIFICATIONS = ['confidential', 'restricted', 'highly_confidential'];

    protected $fillable = [
        'tracking_no',
        'document_type_id',
        'department_id',
        'reference_no',
        'title',
        'description',
        'status',
        'classification',
        'priority',
        'tags',
        'document_date',
        'amount',
        'prepared_by',
    ];

    protected function casts(): array
    {
        return [
            'document_date' => 'date',
            'amount' => 'decimal:2',
            'tags' => 'array',
        ];
    }

    /** Generate the next unique official tracking number for a type: CICC-{year}-{CODE}-{seq}. */
    public static function nextTrackingNo(DocumentType $type): string
    {
        $year = now()->format('Y');
        $seq = static::withTrashed()->where('document_type_id', $type->id)->count() + 1;

        do {
            $candidate = sprintf('CICC-%s-%s-%04d', $year, $type->code, $seq);
            $seq++;
        } while (static::withTrashed()->where('tracking_no', $candidate)->exists());

        return $candidate;
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(DocumentAttachment::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
