<?php

namespace App\Http\Controllers\Setup;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setup\DocumentTypeRequest;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DocumentTypeController extends Controller
{
    /** Read-only reference page for the system-standardized statuses, classifications, and priorities. */
    public function reference(): Response
    {
        return Inertia::render('setup/reference', [
            'statuses' => Document::STATUSES,
            'priorities' => Document::PRIORITIES,
            'classifications' => Document::CLASSIFICATIONS,
        ]);
    }

    /**
     * The General Setup page — lists document types and the categories that
     * power the category selector / Categories tab.
     */
    public function index(): Response
    {
        $documentTypes = DocumentType::with('category:id,name')
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get()
            ->map(fn (DocumentType $t) => [
                'id' => $t->id,
                'code' => $t->code,
                'name' => $t->name,
                'document_category_id' => $t->document_category_id,
                'category' => $t->category?->name,
                'description' => $t->description,
                'is_active' => $t->is_active,
                'sort_order' => $t->sort_order,
            ]);

        $categories = DocumentCategory::withCount('documentTypes')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (DocumentCategory $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'is_active' => $c->is_active,
                'sort_order' => $c->sort_order,
                'types_count' => $c->document_types_count,
            ]);

        return Inertia::render('setup/index', [
            'documentTypes' => $documentTypes,
            'categories' => $categories,
            'stats' => [
                'types' => $documentTypes->count(),
                'categories' => $categories->count(),
                'archivedTypes' => DocumentType::onlyTrashed()->count(),
                'archivedCategories' => DocumentCategory::onlyTrashed()->count(),
            ],
        ]);
    }

    public function store(DocumentTypeRequest $request): RedirectResponse
    {
        DocumentType::create($request->validated());

        return back()->with('success', 'Document type created.');
    }

    public function update(DocumentTypeRequest $request, DocumentType $documentType): RedirectResponse
    {
        $documentType->update($request->validated());

        return back()->with('success', 'Document type updated.');
    }

    /**
     * Archive (soft-delete) a document type.
     */
    public function destroy(DocumentType $documentType): RedirectResponse
    {
        $documentType->delete();

        return back()->with('success', "“{$documentType->code}” moved to the archive.");
    }

    public function restore(int $id): RedirectResponse
    {
        $documentType = DocumentType::onlyTrashed()->findOrFail($id);
        $documentType->restore();

        return back()->with('success', "“{$documentType->code}” restored.");
    }

    /**
     * Permanently delete an archived document type. System Administrator only.
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        $documentType = DocumentType::onlyTrashed()->findOrFail($id);
        $code = $documentType->code;
        $documentType->forceDelete();

        return back()->with('success', "“{$code}” permanently deleted.");
    }
}
