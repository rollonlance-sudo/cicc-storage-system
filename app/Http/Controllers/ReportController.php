<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private const GROUPS = ['department', 'status', 'type', 'classification', 'priority'];

    public function index(): Response
    {
        return Inertia::render('reports/index', [
            'summary' => [
                'total' => Document::count(),
                'thisMonth' => Document::whereBetween('document_date', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'pending' => Document::whereIn('status', ['pending', 'for_review', 'for_approval'])->count(),
                'confidential' => Document::whereIn('classification', Document::SENSITIVE_CLASSIFICATIONS)->count(),
            ],
        ]);
    }

    /** System-wide user activity audit trail (Super Admin only). */
    public function activity(Request $request): Response
    {
        $filters = [
            'user' => $request->query('user', ''),
            'action' => $request->query('action', ''),
            'from' => $request->query('from') ?: null,
            'to' => $request->query('to') ?: null,
        ];

        $logs = ActivityLog::query()
            ->with(['user:id,name', 'document' => fn ($q) => $q->withTrashed()->select('id', 'tracking_no', 'reference_no')])
            ->when($filters['user'] !== '', fn ($q) => $q->where('user_id', $filters['user']))
            ->when($filters['action'] !== '', fn ($q) => $q->where('action', $filters['action']))
            ->when($filters['from'], fn ($q) => $q->whereDate('created_at', '>=', $filters['from']))
            ->when($filters['to'], fn ($q) => $q->whereDate('created_at', '<=', $filters['to']))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ActivityLog $a) => [
                'id' => $a->id,
                'user' => $a->user?->name,
                'action' => $a->action,
                'description' => $a->description,
                'properties' => $a->properties,
                'document_id' => $a->document_id,
                'tracking_no' => $a->document?->tracking_no ?? $a->document?->reference_no,
                'at' => $a->created_at?->toDayDateTimeString(),
            ]);

        return Inertia::render('reports/activity', [
            'logs' => $logs,
            'filters' => $filters,
            'users' => User::orderBy('name')->get(['id', 'name']),
            'actions' => ['created', 'updated', 'status_changed', 'archived', 'restored', 'attachment_added', 'attachment_removed', 'downloaded'],
            'total' => ActivityLog::count(),
        ]);
    }

    public function records(Request $request): Response
    {
        [$groupBy, $from, $to, $rows, $total, $totalAmount] = $this->build($request);

        return Inertia::render('reports/records', [
            'filters' => ['group_by' => $groupBy, 'from' => $from, 'to' => $to],
            'rows' => $rows,
            'totals' => ['count' => $total, 'amount' => $totalAmount],
            'generatedAt' => now()->toDayDateTimeString(),
            'generatedBy' => $request->user()->name,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        [$groupBy, , , $rows] = $this->build($request);
        $filename = "report-by-{$groupBy}-".now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($rows, $groupBy) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [ucfirst($groupBy), 'Records', 'Total Amount']);
            foreach ($rows as $r) {
                fputcsv($out, [$r['label'], $r['count'], $r['amount']]);
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * @return array{0:string,1:?string,2:?string,3:list<array{label:string,count:int,amount:float}>,4:int,5:float}
     */
    private function build(Request $request): array
    {
        $groupBy = in_array($request->query('group_by'), self::GROUPS, true) ? $request->query('group_by') : 'department';
        $from = $request->query('from') ?: null;
        $to = $request->query('to') ?: null;

        /** @var Collection<int,Document> $docs */
        $docs = Document::query()
            ->with(['type:id,code,name', 'department:id,name'])
            ->when($from, fn ($q) => $q->whereDate('document_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('document_date', '<=', $to))
            ->get();

        $keyFor = function (Document $d) use ($groupBy): string {
            return match ($groupBy) {
                'department' => $d->department?->name ?? 'Unassigned',
                'type' => $d->type ? $d->type->code.' — '.$d->type->name : 'Unknown',
                'status' => ucwords(str_replace('_', ' ', $d->status)),
                'classification' => ucwords(str_replace('_', ' ', $d->classification)),
                'priority' => ucfirst($d->priority),
                default => 'Other',
            };
        };

        $rows = $docs->groupBy($keyFor)
            ->map(fn (Collection $g, $label) => [
                'label' => (string) $label,
                'count' => $g->count(),
                'amount' => (float) $g->sum('amount'),
            ])
            ->sortByDesc('count')
            ->values()
            ->all();

        return [$groupBy, $from, $to, $rows, $docs->count(), (float) $docs->sum('amount')];
    }
}
