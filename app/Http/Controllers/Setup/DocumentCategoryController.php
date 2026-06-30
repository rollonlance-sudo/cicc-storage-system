<?php

namespace App\Http\Controllers\Setup;

use App\Http\Controllers\Controller;
use App\Http\Requests\Setup\DocumentCategoryRequest;
use App\Models\DocumentCategory;
use Illuminate\Http\RedirectResponse;

class DocumentCategoryController extends Controller
{
    public function store(DocumentCategoryRequest $request): RedirectResponse
    {
        DocumentCategory::create($request->validated());

        return back()->with('success', 'Category created.');
    }

    public function update(DocumentCategoryRequest $request, DocumentCategory $documentCategory): RedirectResponse
    {
        $documentCategory->update($request->validated());

        return back()->with('success', 'Category updated.');
    }

    /**
     * Archive (soft-delete) a category. Blocked while active document types
     * still reference it — those would otherwise lose their category.
     */
    public function destroy(DocumentCategory $documentCategory): RedirectResponse
    {
        $inUse = $documentCategory->documentTypes()->count();

        if ($inUse > 0) {
            return back()->with('error', "Cannot archive “{$documentCategory->name}”: {$inUse} document type(s) still use it. Reassign or archive those first.");
        }

        $documentCategory->delete();

        return back()->with('success', "“{$documentCategory->name}” moved to the archive.");
    }

    public function restore(int $id): RedirectResponse
    {
        $category = DocumentCategory::onlyTrashed()->findOrFail($id);
        $category->restore();

        return back()->with('success', "“{$category->name}” restored.");
    }

    /**
     * Permanently delete an archived category. System Administrator only.
     * Blocked if any document type (including archived ones) still references it.
     */
    public function forceDestroy(int $id): RedirectResponse
    {
        $category = DocumentCategory::onlyTrashed()->findOrFail($id);

        $referencing = $category->documentTypes()->withTrashed()->count();

        if ($referencing > 0) {
            return back()->with('error', "Cannot permanently delete “{$category->name}”: {$referencing} document type(s) (including archived) still reference it.");
        }

        $name = $category->name;
        $category->forceDelete();

        return back()->with('success', "“{$name}” permanently deleted.");
    }
}
