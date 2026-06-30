<?php

namespace App\Http\Controllers\Papers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaperController extends Controller
{
    /** Max document hits returned for a search. */
    private const SEARCH_LIMIT = 50;

    /**
     * Browse hub — every document type, grouped by category, with its record
     * count. A search query also looks *inside* the types, returning matching
     * document records across all types.
     */
    public function index(Request $request): Response
    {
        $q = trim((string) $request->query('q', ''));

        $types = DocumentType::query()
            ->withCount('documents')
            ->with('category:id,name,sort_order')
            ->orderBy('sort_order')
            ->orderBy('code')
            ->get();

        $groups = $types
            ->groupBy(fn (DocumentType $t) => $t->category?->name ?? 'Uncategorized')
            ->map(fn ($items, $name) => [
                'category' => $name,
                'sort' => $items->first()->category?->sort_order ?? 999,
                'types' => $items->map(fn (DocumentType $t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'name' => $t->name,
                    'description' => $t->description,
                    'is_active' => $t->is_active,
                    'documents_count' => $t->documents_count,
                ])->values(),
            ])
            ->sortBy('sort')
            ->values();

        [$documents, $documentMatches] = $this->searchDocuments($q);

        return Inertia::render('papers/index', [
            'groups' => $groups,
            'totalDocuments' => Document::count(),
            'filters' => ['q' => $q],
            'documents' => $documents,
            'documentMatches' => $documentMatches,
        ]);
    }

    /**
     * @return array{0: list<array<string,mixed>>, 1: int}
     */
    private function searchDocuments(string $q): array
    {
        if ($q === '') {
            return [[], 0];
        }

        $base = Document::query()
            ->with('type:id,code,name')
            ->where(function ($w) use ($q) {
                $like = '%'.$q.'%';
                $w->where('tracking_no', 'like', $like)
                    ->orWhere('reference_no', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    ->orWhere('prepared_by', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });

        $matches = (clone $base)->count();

        $documents = $base
            ->orderByDesc('document_date')
            ->orderByDesc('id')
            ->limit(self::SEARCH_LIMIT)
            ->get()
            ->map(fn (Document $d) => [
                'id' => $d->id,
                'tracking_no' => $d->tracking_no,
                'reference_no' => $d->reference_no,
                'title' => $d->title,
                'status' => $d->status,
                'priority' => $d->priority,
                'classification' => $d->classification,
                'document_date' => $d->document_date?->toDateString(),
                'type_code' => $d->type?->code,
                'type_name' => $d->type?->name,
            ])
            ->all();

        return [$documents, $matches];
    }

    /**
     * A dedicated page for one paper type, listing its document records.
     */
    public function show(Request $request, DocumentType $documentType): Response
    {
        $documentType->loadCount('documents')->load('category:id,name');

        $documents = $documentType->documents()
            ->with('department:id,name')
            ->orderByDesc('document_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Document $d) => $this->presentDocument($d));

        return Inertia::render('papers/show', [
            'type' => [
                'id' => $documentType->id,
                'code' => $documentType->code,
                'name' => $documentType->name,
                'description' => $documentType->description,
                'category' => $documentType->category?->name,
                'is_active' => $documentType->is_active,
                'documents_count' => $documentType->documents_count,
            ],
            'documents' => $documents,
            'statuses' => Document::STATUSES,
            'priorities' => Document::PRIORITIES,
            'classifications' => Document::CLASSIFICATIONS,
            'departments' => Department::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name']),
            'filters' => ['q' => trim((string) $request->query('q', ''))],
        ]);
    }

    /** @return array<string,mixed> */
    private function presentDocument(Document $d): array
    {
        return [
            'id' => $d->id,
            'tracking_no' => $d->tracking_no,
            'reference_no' => $d->reference_no,
            'title' => $d->title,
            'description' => $d->description,
            'status' => $d->status,
            'priority' => $d->priority,
            'classification' => $d->classification,
            'department' => $d->department?->name,
            'department_id' => $d->department_id,
            'document_date' => $d->document_date?->toDateString(),
            'amount' => $d->amount !== null ? (float) $d->amount : null,
            'prepared_by' => $d->prepared_by,
            'tags' => $d->tags ?? [],
        ];
    }
}
