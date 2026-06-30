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
        $data = $request->validated();

        // Auto-generate an official tracking number when one isn't supplied.
        if (empty($data['tracking_no'])) {
            $data['tracking_no'] = Document::nextTrackingNo($documentType);
        }

        $documentType->documents()->create($data);

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
