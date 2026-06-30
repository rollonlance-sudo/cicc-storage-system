<?php

namespace App\Http\Controllers\Setup;

use App\Http\Controllers\Controller;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The Archive (trash) page — lists soft-deleted document types and categories.
 * Anyone with setting.manage can restore; only setting.purge (System
 * Administrator) sees the permanent-delete action.
 */
class ArchiveController extends Controller
{
    public function index(): Response
    {
        $documentTypes = DocumentType::onlyTrashed()
            ->with(['category' => fn ($q) => $q->withTrashed()])
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (DocumentType $t) => [
                'id' => $t->id,
                'code' => $t->code,
                'name' => $t->name,
                'category' => $t->category?->name,
                'is_active' => $t->is_active,
                'deleted_at' => $t->deleted_at?->toDateTimeString(),
            ]);

        $categories = DocumentCategory::onlyTrashed()
            ->orderByDesc('deleted_at')
            ->get()
            ->map(fn (DocumentCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'deleted_at' => $c->deleted_at?->toDateTimeString(),
            ]);

        return Inertia::render('setup/archive', [
            'documentTypes' => $documentTypes,
            'categories' => $categories,
        ]);
    }
}
