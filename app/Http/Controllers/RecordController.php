<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Global File Records — the premium, filterable table across every document
 * type, plus record detail and the multi-section create/edit form.
 */
class RecordController extends Controller
{
    private const SORTABLE = ['tracking_no', 'reference_no', 'title', 'status', 'priority', 'classification', 'document_date', 'created_at'];

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $sort = in_array($request->query('sort'), self::SORTABLE, true) ? $request->query('sort') : 'document_date';
        $dir = $request->query('dir') === 'asc' ? 'asc' : 'desc';
        $perPage = (int) $request->query('per_page', 15);
        $perPage = in_array($perPage, [15, 25, 50, 100], true) ? $perPage : 15;

        $records = $this->query($filters)
            ->with(['type:id,code,name', 'department:id,name'])
            ->orderBy($sort, $dir)
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Document $d) => $this->row($d));

        return Inertia::render('records/index', [
            'records' => $records,
            'filters' => $filters,
            'sort' => ['column' => $sort, 'dir' => $dir],
            'perPage' => $perPage,
            'options' => $this->options(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('records/form', [
            'record' => null,
            'options' => $this->options(),
        ]);
    }

    public function store(DocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $type = DocumentType::findOrFail($data['document_type_id']);

        if (empty($data['tracking_no'])) {
            $data['tracking_no'] = Document::nextTrackingNo($type);
        }

        $document = Document::create($data);

        return redirect()->route('records.show', $document)->with('success', 'Document record created.');
    }

    public function show(Document $record): Response
    {
        $record->load(['type:id,code,name', 'department:id,name,code,head_of_office']);

        $attachments = $record->attachments()->with('uploader:id,name')->latest()->get()->map(fn ($a) => [
            'id' => $a->id,
            'name' => $a->original_name,
            'mime' => $a->mime_type,
            'size' => $a->size,
            'uploaded_by' => $a->uploader?->name,
            'uploaded_at' => $a->created_at?->toDayDateTimeString(),
            'downloads' => $a->download_count,
            'download_url' => route('attachments.download', $a->id),
        ]);

        $versions = $record->versions()->with('author:id,name')->orderByDesc('version_no')->get()->map(fn ($v) => [
            'id' => $v->id,
            'version_no' => $v->version_no,
            'summary' => $v->summary,
            'author' => $v->author?->name,
            'at' => $v->created_at?->toDayDateTimeString(),
        ]);

        $activity = $record->activities()->with('user:id,name')->latest()->limit(50)->get()->map(fn ($a) => [
            'action' => $a->action,
            'description' => $a->description,
            'user' => $a->user?->name,
            'properties' => $a->properties,
            'at' => $a->created_at?->toDayDateTimeString(),
        ]);

        // Fallback so freshly-seeded records (created without auth) still show a timeline.
        if ($activity->isEmpty()) {
            $activity = collect([
                ['action' => 'created', 'description' => 'Record created', 'user' => null, 'properties' => null, 'at' => $record->created_at?->toDayDateTimeString()],
            ]);
        }

        return Inertia::render('records/show', [
            'record' => $this->detail($record),
            'attachments' => $attachments,
            'versions' => $versions,
            'activity' => $activity,
            'canManage' => (bool) request()->user()?->can('document.manage'),
        ]);
    }

    public function edit(Document $record): Response
    {
        return Inertia::render('records/form', [
            'record' => $this->detail($record),
            'options' => $this->options(),
        ]);
    }

    public function update(DocumentRequest $request, Document $record): RedirectResponse
    {
        $record->update($request->validated());

        return redirect()->route('records.show', $record)->with('success', 'Document record updated.');
    }

    public function destroy(Document $record): RedirectResponse
    {
        $record->delete();

        return back()->with('success', "“{$record->tracking_no}” archived.");
    }

    /** Bulk archive selected records. */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = collect($request->input('ids', []))->map(fn ($i) => (int) $i)->all();
        $count = Document::whereIn('id', $ids)->get()->each->delete()->count();

        return back()->with('success', "{$count} record(s) archived.");
    }

    public function restore(int $id): RedirectResponse
    {
        $record = Document::onlyTrashed()->findOrFail($id);
        $record->restore();

        return back()->with('success', "“{$record->tracking_no}” restored.");
    }

    public function forceDestroy(int $id): RedirectResponse
    {
        $record = Document::onlyTrashed()->findOrFail($id);
        $tn = $record->tracking_no;
        $record->forceDelete();

        return back()->with('success', "“{$tn}” permanently deleted.");
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $rows = $this->query($filters)->with(['type:id,code', 'department:id,name'])->orderByDesc('document_date')->get();

        $filename = 'file-records-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Tracking No', 'Reference No', 'Title', 'Type', 'Department', 'Status', 'Priority', 'Classification', 'Date', 'Amount', 'Prepared By']);
            foreach ($rows as $d) {
                fputcsv($out, [
                    $d->tracking_no, $d->reference_no, $d->title, $d->type?->code, $d->department?->name,
                    $d->status, $d->priority, $d->classification, $d->document_date?->toDateString(),
                    $d->amount, $d->prepared_by,
                ]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /** @return array<string,mixed> */
    private function filters(Request $request): array
    {
        return [
            'q' => trim((string) $request->query('q', '')),
            'type' => $request->query('type', ''),
            'department' => $request->query('department', ''),
            'status' => $request->query('status', ''),
            'priority' => $request->query('priority', ''),
            'classification' => $request->query('classification', ''),
            'trashed' => $request->query('trashed') === '1',
        ];
    }

    /** @param array<string,mixed> $f */
    private function query(array $f): Builder
    {
        return Document::query()
            ->when($f['trashed'], fn (Builder $q) => $q->onlyTrashed())
            ->when($f['q'] !== '', function (Builder $q) use ($f) {
                $like = '%'.$f['q'].'%';
                $q->where(fn (Builder $w) => $w
                    ->where('tracking_no', 'like', $like)
                    ->orWhere('reference_no', 'like', $like)
                    ->orWhere('title', 'like', $like)
                    ->orWhere('prepared_by', 'like', $like));
            })
            ->when($f['type'] !== '', fn (Builder $q) => $q->whereHas('type', fn (Builder $t) => $t->where('code', $f['type'])))
            ->when($f['department'] !== '', fn (Builder $q) => $q->where('department_id', $f['department']))
            ->when($f['status'] !== '', fn (Builder $q) => $q->where('status', $f['status']))
            ->when($f['priority'] !== '', fn (Builder $q) => $q->where('priority', $f['priority']))
            ->when($f['classification'] !== '', fn (Builder $q) => $q->where('classification', $f['classification']));
    }

    /** @return array<string,mixed> */
    private function options(): array
    {
        return [
            'statuses' => Document::STATUSES,
            'priorities' => Document::PRIORITIES,
            'classifications' => Document::CLASSIFICATIONS,
            'departments' => Department::orderBy('name')->get(['id', 'code', 'name']),
            'types' => DocumentType::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name']),
        ];
    }

    /** @return array<string,mixed> */
    private function row(Document $d): array
    {
        return [
            'id' => $d->id,
            'tracking_no' => $d->tracking_no,
            'reference_no' => $d->reference_no,
            'title' => $d->title,
            'type_code' => $d->type?->code,
            'type_name' => $d->type?->name,
            'department' => $d->department?->name,
            'status' => $d->status,
            'priority' => $d->priority,
            'classification' => $d->classification,
            'document_date' => $d->document_date?->toDateString(),
            'created_by' => $d->prepared_by,
            'created_at' => $d->created_at?->toDateString(),
            'trashed' => $d->trashed(),
        ];
    }

    /** @return array<string,mixed> */
    private function detail(Document $d): array
    {
        return [
            'id' => $d->id,
            'tracking_no' => $d->tracking_no,
            'reference_no' => $d->reference_no,
            'title' => $d->title,
            'description' => $d->description,
            'document_type_id' => $d->document_type_id,
            'type_code' => $d->type?->code,
            'type_name' => $d->type?->name,
            'department_id' => $d->department_id,
            'department' => $d->department?->name,
            'department_head' => $d->department?->head_of_office,
            'status' => $d->status,
            'priority' => $d->priority,
            'classification' => $d->classification,
            'document_date' => $d->document_date?->toDateString(),
            'amount' => $d->amount !== null ? (float) $d->amount : null,
            'prepared_by' => $d->prepared_by,
            'tags' => $d->tags ?? [],
            'created_at' => $d->created_at?->toDayDateTimeString(),
            'updated_at' => $d->updated_at?->toDayDateTimeString(),
        ];
    }
}
