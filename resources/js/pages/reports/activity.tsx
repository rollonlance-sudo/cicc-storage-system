import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type Paginated } from '@/types/documents';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity as ActivityIcon,
    Archive,
    Download,
    History,
    Paperclip,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    X,
    type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/reports' },
    { title: 'User Activity', href: '/reports/activity' },
];

interface LogRow {
    id: number;
    user: string | null;
    action: string;
    description: string;
    properties: Record<string, string> | null;
    document_id: number | null;
    tracking_no: string | null;
    at: string | null;
}
interface Props {
    logs: Paginated<LogRow>;
    filters: { user: string; action: string; from: string | null; to: string | null };
    users: { id: number; name: string }[];
    actions: string[];
    total: number;
}

const ACTION_META: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
    created: { label: 'Created', icon: Plus, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    updated: { label: 'Updated', icon: Pencil, cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    status_changed: { label: 'Status Changed', icon: RotateCcw, cls: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    archived: { label: 'Archived', icon: Archive, cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    restored: { label: 'Restored', icon: RotateCcw, cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    attachment_added: { label: 'Attachment Added', icon: Paperclip, cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    attachment_removed: { label: 'Attachment Removed', icon: Trash2, cls: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    downloaded: { label: 'Downloaded', icon: Download, cls: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
};

const ALL = '__all__';

export default function ActivityReport({ logs, filters, users, actions, total }: Props) {
    const visit = (overrides: Partial<typeof filters>) => {
        const merged: Record<string, string> = {};
        const base = { ...filters, ...overrides } as Record<string, unknown>;
        for (const [k, v] of Object.entries(base)) if (v) merged[k] = String(v);
        router.get(route('reports.activity'), merged, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasFilters = !!(filters.user || filters.action || filters.from || filters.to);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Activity" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<ActivityIcon className="size-5" />}
                    title="User Activity"
                    description={`Audit trail of actions across the system — ${total.toLocaleString()} logged events.`}
                />

                <Card className="p-4">
                    <div className="grid gap-4 sm:grid-cols-4">
                        <div className="grid gap-1.5">
                            <Label>User</Label>
                            <Select value={filters.user || ALL} onValueChange={(v) => visit({ user: v === ALL ? '' : v })}>
                                <SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All users</SelectItem>
                                    {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Action</Label>
                            <Select value={filters.action || ALL} onValueChange={(v) => visit({ action: v === ALL ? '' : v })}>
                                <SelectTrigger><SelectValue placeholder="All actions" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All actions</SelectItem>
                                    {actions.map((a) => <SelectItem key={a} value={a}>{ACTION_META[a]?.label ?? a}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="from">From</Label>
                            <Input id="from" type="date" defaultValue={filters.from ?? ''} onChange={(e) => visit({ from: e.target.value })} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="to">To</Label>
                            <Input id="to" type="date" defaultValue={filters.to ?? ''} onChange={(e) => visit({ to: e.target.value })} />
                        </div>
                    </div>
                    {hasFilters && (
                        <div className="mt-3">
                            <Button variant="ghost" size="sm" onClick={() => router.get(route('reports.activity'), {}, { preserveScroll: true })}>
                                <X className="size-4" />Clear filters
                            </Button>
                        </div>
                    )}
                </Card>

                <Card className="p-0">
                    {logs.data.length === 0 ? (
                        <EmptyState icon={History} title="No activity found" description="No logged events match the selected filters. New events are recorded as users work." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">When</TableHead>
                                    <TableHead className="w-40">User</TableHead>
                                    <TableHead className="w-44">Action</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead className="w-40">Record</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.map((l) => {
                                    const meta = ACTION_META[l.action] ?? { label: l.action, icon: History, cls: 'bg-muted text-muted-foreground' };
                                    const Icon = meta.icon;
                                    return (
                                        <TableRow key={l.id}>
                                            <TableCell className="text-muted-foreground text-xs">{l.at}</TableCell>
                                            <TableCell className="font-medium">{l.user ?? 'System'}</TableCell>
                                            <TableCell>
                                                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium', meta.cls)}>
                                                    <Icon className="size-3" />{meta.label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {l.description}
                                                {l.properties?.from && l.properties?.to && (
                                                    <span className="text-muted-foreground"> ({l.properties.from} → {l.properties.to})</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {l.document_id ? (
                                                    <Link href={route('records.show', l.document_id)} className="text-primary font-mono text-xs hover:underline">
                                                        {l.tracking_no ?? `#${l.document_id}`}
                                                    </Link>
                                                ) : <span className="text-muted-foreground text-xs">—</span>}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    {logs.data.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                            <p className="text-muted-foreground text-sm">
                                Showing <span className="font-medium">{logs.from}</span>–<span className="font-medium">{logs.to}</span> of{' '}
                                <span className="font-medium">{logs.total}</span> events
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="min-w-9"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
