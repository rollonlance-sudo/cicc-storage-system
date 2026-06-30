import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, BarChart3, Download, Printer } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'Records Report', href: '/reports/records' },
];

const GROUPS = [
    { value: 'department', label: 'Department' },
    { value: 'type', label: 'Document Type' },
    { value: 'status', label: 'Status' },
    { value: 'classification', label: 'Classification' },
    { value: 'priority', label: 'Priority' },
];

interface Row {
    label: string;
    count: number;
    amount: number;
}
interface Props {
    filters: { group_by: string; from: string | null; to: string | null };
    rows: Row[];
    totals: { count: number; amount: number };
    generatedAt: string;
    generatedBy: string;
}

const peso = (n: number) => '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function RecordsReport({ filters, rows, totals, generatedAt, generatedBy }: Props) {
    const [groupBy, setGroupBy] = useState(filters.group_by);
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    const generate = () => {
        const q: Record<string, string> = { group_by: groupBy };
        if (from) q.from = from;
        if (to) q.to = to;
        router.get(route('reports.records'), q, { preserveState: true });
    };

    const exportUrl = (() => {
        const p = new URLSearchParams({ group_by: groupBy });
        if (from) p.set('from', from);
        if (to) p.set('to', to);
        return `${route('reports.records.export')}?${p.toString()}`;
    })();

    const max = Math.max(1, ...rows.map((r) => r.count));
    const groupLabel = GROUPS.find((g) => g.value === filters.group_by)?.label ?? 'Group';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Records Report" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <div className="print:hidden">
                    <PageHeader
                        icon={<BarChart3 className="size-5" />}
                        title="Records Report"
                        description="Summarize document records by department, type, status, classification, or priority."
                        actions={<Button variant="outline" asChild><Link href={route('reports.index')}><ArrowLeft className="size-4" />Reports</Link></Button>}
                    />
                </div>

                {/* Filters */}
                <Card className="p-4 print:hidden">
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="grid gap-1.5">
                            <Label>Group by</Label>
                            <Select value={groupBy} onValueChange={setGroupBy}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{GROUPS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2">
                            <Button onClick={generate} className="flex-1">Generate</Button>
                        </div>
                    </div>
                </Card>

                {/* Report */}
                <Card className="p-6">
                    {/* Print header */}
                    <div className="mb-4 border-b pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-primary font-semibold">GovFile Storage System</p>
                                <h2 className="mt-1 text-lg font-semibold">Records Report — by {groupLabel}</h2>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    {filters.from || filters.to ? `Period: ${filters.from ?? '…'} to ${filters.to ?? '…'}` : 'Period: All dates'} · Generated by {generatedBy} · {generatedAt}
                                </p>
                            </div>
                            <div className="flex gap-2 print:hidden">
                                <Button variant="outline" size="sm" asChild><a href={exportUrl}><Download className="size-4" />CSV</a></Button>
                                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                            </div>
                        </div>
                    </div>

                    {rows.length === 0 ? (
                        <p className="text-muted-foreground py-10 text-center text-sm">No records found for the selected period.</p>
                    ) : (
                        <>
                            <div className="mb-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Total records</p>
                                    <p className="text-2xl font-semibold tabular-nums">{totals.count.toLocaleString()}</p>
                                </div>
                                <div className="rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Total amount</p>
                                    <p className="text-2xl font-semibold tabular-nums">{peso(totals.amount)}</p>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{groupLabel}</TableHead>
                                        <TableHead className="w-1/3">Distribution</TableHead>
                                        <TableHead className="w-28 text-right">Records</TableHead>
                                        <TableHead className="w-40 text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map((r) => (
                                        <TableRow key={r.label}>
                                            <TableCell className="font-medium">{r.label}</TableCell>
                                            <TableCell>
                                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                                    <div className="bg-primary h-full rounded-full" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right tabular-nums">{r.count.toLocaleString()}</TableCell>
                                            <TableCell className="text-right tabular-nums">{r.amount > 0 ? peso(r.amount) : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}

                    <p className="text-muted-foreground mt-6 hidden border-t pt-3 text-xs print:block">
                        GovFile Storage System · Confidential government records · Page generated {generatedAt}
                    </p>
                </Card>
            </div>
        </AppLayout>
    );
}
