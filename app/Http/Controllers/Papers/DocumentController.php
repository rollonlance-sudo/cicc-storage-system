<?php

namespace App\Http\Controllers\Papers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DocumentRequest;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Http\RedirectResponse;

class DocumentController extends Controller
{
    public function store(DocumentRequest $request, DocumentType $documentType): RedirectResponse
    {
        $documentType->documents()->create($request->validated());

        return back()->with('success', 'Document record created.');
    }

    public function update(DocumentRequest $request, Document $document): RedirectResponse
    {
        $document->update($request->validated());

        return back()->with('success', 'Document updated.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        return back()->with('success', "“{$document->reference_no}” archived.");
    }

    public function restore(int $id): RedirectResponse
    {
        $document = Document::onlyTrashed()->findOrFail($id);
        $document->restore();

        return back()->with('success', "“{$document->reference_no}” restored.");
    }
}
