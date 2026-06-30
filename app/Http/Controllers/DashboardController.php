<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Models\DocumentType;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();

        return Inertia::render('dashboard', [
            'stats' => [
                'documents' => Document::count(),
                'types' => DocumentType::count(),
                'categories' => DocumentCategory::count(),
                'departments' => Department::count(),
                'today' => Document::whereDate('document_date', $now->toDateString())->count(),
                'thisMonth' => Document::whereBetween('document_date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->count(),
                'pending' => Document::whereIn('status', ['pending', 'for_review'])->count(),
                'forApproval' => Document::where('status', 'for_approval')->count(),
                'released' => Document::where('status', 'released')->count(),
                'confidential' => Document::whereIn('classification', Document::SENSITIVE_CLASSIFICATIONS)->count(),
                'totalAmount' => (float) Document::sum('amount'),
            ],
            'byStatus' => $this->countBy('status', Document::STATUSES),
            'byClassification' => $this->countBy('classification', Document::CLASSIFICATIONS),
            'byPriority' => $this->countBy('priority', Document::PRIORITIES),
            'byDepartment' => $this->byDepartment(),
            'byType' => $this->byType(),
            'perMonth' => $this->perMonth(),
            'recent' => $this->recent(),
            'pending' => $this->pendingQueue(),
        ]);
    }

    /**
     * @param  list<string>  $keys
     * @return array<string,int>
     */
    private function countBy(string $column, array $keys): array
    {
        $counts = Document::selectRaw("$column as k, count(*) as c")->groupBy($column)->pluck('c', 'k')->toArray();
        $ordered = [];
        foreach ($keys as $k) {
            $ordered[$k] = (int) ($counts[$k] ?? 0);
        }

        return $ordered;
    }

    /** @return list<array{name:string,count:int}> */
    private function byDepartment(): array
    {
        return Department::query()
            ->withCount('documents')
            ->orderByDesc('documents_count')
            ->take(8)
            ->get()
            ->filter(fn ($d) => $d->documents_count > 0)
            ->map(fn (Department $d) => ['name' => $d->code, 'count' => $d->documents_count])
            ->values()
            ->all();
    }

    /** @return list<array{name:string,count:int}> */
    private function byType(): array
    {
        return DocumentType::query()
            ->withCount('documents')
            ->orderByDesc('documents_count')
            ->take(8)
            ->get()
            ->filter(fn ($t) => $t->documents_count > 0)
            ->map(fn (DocumentType $t) => ['name' => $t->code, 'count' => $t->documents_count])
            ->values()
            ->all();
    }

    /** @return list<array{label:string,count:int}> */
    private function perMonth(): array
    {
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $start = Carbon::now()->startOfMonth()->subMonths($i);
            $months[] = [
                'label' => $start->format('M'),
                'count' => Document::whereBetween('document_date', [$start, $start->copy()->endOfMonth()])->count(),
            ];
        }

        return $months;
    }

    /** @return list<array<string,mixed>> */
    private function recent(): array
    {
        return Document::with(['type:id,code', 'department:id,name'])
            ->latest('document_date')->latest('id')->limit(8)->get()
            ->map(fn (Document $d) => $this->row($d))->all();
    }

    /** @return list<array<string,mixed>> */
    private function pendingQueue(): array
    {
        return Document::with(['type:id,code', 'department:id,name'])
            ->whereIn('status', ['pending', 'for_review', 'for_approval'])
            ->orderByRaw("CASE priority WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 WHEN 'high' THEN 3 WHEN 'normal' THEN 4 ELSE 5 END")
            ->latest('document_date')->limit(6)->get()
            ->map(fn (Document $d) => $this->row($d))->all();
    }

    /** @return array<string,mixed> */
    private function row(Document $d): array
    {
        return [
            'id' => $d->id,
            'tracking_no' => $d->tracking_no,
            'reference_no' => $d->reference_no,
            'title' => $d->title,
            'status' => $d->status,
            'priority' => $d->priority,
            'document_date' => $d->document_date?->toDateString(),
            'type_code' => $d->type?->code,
            'department' => $d->department?->name,
        ];
    }
}
