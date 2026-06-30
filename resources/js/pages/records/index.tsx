import { ClassificationBadge, PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    CLASSIFICATION_META,
    PRIORITY_META,
    STATUS_META,
    type Paginated,
    type RecordOptions,
    type RecordRow,
} from '@/types/documents';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownUp,
    ChevronDown,
    Download,
    FileSearch,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'File Records', href: '/records' }];

interface Filters {
    q: string;
    type: string;
    department: string;
    status: string;
    priority: string;
    classification: string;
    trashed: boolean;
}

interface Props {
    records: Paginated<RecordRow>;
    filters: Filters;
    sort: { column: string; dir: 'asc' | 'desc' };
    perPage: number;
    options: RecordOptions;
}

export default function RecordsIndex({ records, filters, sort, perPage, options }: Props) {
    const { auth } = usePage<SharedData>().props;
    const canManage = !!auth.can?.manageDocument;
    const canPurge = !!auth.can?.purgeSetting;

    const [search, setSearch] = useState(filters.q);
    const [showFilters, setShowFilters] = useState(
        !!(filters.type || filters.department || filters.status || filters.priority || filters.classification),
    );
    const [selected, setSelected] = useState<number[]>([]);
    const [confirmBulk, setConfirmBulk] = useState(false);
    const first = useRef(true);

    // Build a query object from current filters + overrides, dropping empties.
    const visit = (overrides: Partial<Filters & { sort: string; dir: string; per_page: number }>) => {
        const merged: Record<string, string> = {};
        const base = { ...filters, sort: sort.column, dir: sort.dir, per_page: perPage, ...overrides } as Record<string, unknown>;
        for (const [k, v] of Object.entries(base)) {
            if (k === 'trashed') {
                if (v) merged.trashed = '1';
            } else if (v !== '' && v != null) {
                merged[k] = String(v);
            }
        }
        router.get(route('records.index'), merged, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Debounced search.
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const t = setTimeout(() => {
            if (search !== filters.q) visit({ q: search });
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const activeFilterCount = useMemo(
        () => [filters.type, filters.department, filters.status, filters.priority, filters.classification].filter(Boolean).length,
        [filters],
    );

    const toggleSort = (column: string) => visit({ sort: column, dir: sort.column === column && sort.dir === 'asc' ? 'desc' : 'asc' });
    const clearFilters = () => {
        setSearch('');
        router.get(route('records.index'), filters.trashed ? { trashed: '1' } : {}, { preserveScroll: true });
    };

    const allChecked = records.data.length > 0 && selected.length === records.data.length;
    const toggleAll = () => setSelected(allChecked ? [] : records.data.map((r) => r.id));
    const toggleOne = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const bulkArchive = () => {
        router.post(route('records.bulk-archive'), { ids: selected }, { preserveScroll: true, onFinish: () => { setSelected([]); setConfirmBulk(false); } });
    };

    const exportUrl = (() => {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (k === 'trashed') { if (v) p.set('trashed', '1'); }
            else if (v) p.set(k, String(v));
        });
        return `${route('records.export')}?${p.toString()}`;
    })();

    const SortHead = ({ column, label, className }: { column: string; label: string; className?: string }) => (
        <TableHead className={className}>
            <button onClick={() => toggleSort(column)} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
                {label}
                {sort.column === column ? (
                    <ChevronDown className={cn('size-3.5 transition-transform', sort.dir === 'asc' && 'rotate-180')} />
                ) : (
                    <ArrowDownUp className="size-3 opacity-40" />
                )}
            </button>
        </TableHead>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="File Records" />

            <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<FileSearch className="size-5" />}
                    title="File Records"
                    description="Manage, track, search, and archive official document records."
                    actions={
                        <>
                            <Button variant="outline" asChild>
                                <a href={exportUrl}><Download className="size-4" />Export CSV</a>
                            </Button>
                            {canManage && (
                                <Button asChild>
                                    <Link href={route('records.create')}><Plus className="size-4" />Create Record</Link>
                                </Button>
                            )}
                        </>
                    }
                />

                {filters.trashed && (
                    <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                        <span className="flex items-center gap-2"><Trash2 className="size-4" />Viewing archived records</span>
                        <Button variant="ghost" size="sm" asChild><Link href={route('records.index')}>Exit archive</Link></Button>
                    </div>
                )}

                <Card className="p-0">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tracking no., reference, title, preparer…" className="pl-9" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant={showFilters ? 'secondary' : 'outline'} onClick={() => setShowFilters((v) => !v)}>
                                    <SlidersHorizontal className="size-4" />
                                    Filters
                                    {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>}
                                </Button>
                                <Select value={String(perPage)} onValueChange={(v) => visit({ per_page: Number(v) })}>
                                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[15, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-5">
                                <FilterSelect label="Document Type" value={filters.type} onChange={(v) => visit({ type: v })} options={options.types.map((t) => ({ value: t.code, label: `${t.code} — ${t.name}` }))} />
                                <FilterSelect label="Department" value={filters.department} onChange={(v) => visit({ department: v })} options={options.departments.map((d) => ({ value: String(d.id), label: d.name }))} />
                                <FilterSelect label="Status" value={filters.status} onChange={(v) => visit({ status: v })} options={options.statuses.map((s) => ({ value: s, label: STATUS_META[s].label }))} />
                                <FilterSelect label="Priority" value={filters.priority} onChange={(v) => visit({ priority: v })} options={options.priorities.map((p) => ({ value: p, label: PRIORITY_META[p].label }))} />
                                <FilterSelect label="Classification" value={filters.classification} onChange={(v) => visit({ classification: v })} options={options.classifications.map((c) => ({ value: c, label: CLASSIFICATION_META[c].label }))} />
                                <div className="flex items-end">
                                    {(activeFilterCount > 0 || filters.q) && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters}><X className="size-4" />Clear all</Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bulk bar */}
                    {canManage && selected.length > 0 && !filters.trashed && (
                        <div className="bg-primary/5 flex items-center justify-between border-b px-4 py-2.5 text-sm">
                            <span className="font-medium">{selected.length} selected</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelected([])}>Clear</Button>
                                <Button variant="destructive" size="sm" onClick={() => setConfirmBulk(true)}><Trash2 className="size-4" />Archive selected</Button>
                            </div>
                        </div>
                    )}

                    {records.data.length === 0 ? (
                        <EmptyState
                            icon={FileSearch}
                            title="No file records found"
                            description={canManage ? 'Start by creating your first document record or adjusting your filters.' : 'No records match your filters.'}
                            action={canManage && !filters.trashed ? <Button asChild><Link href={route('records.create')}><Plus className="size-4" />Create Record</Link></Button> : undefined}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {canManage && !filters.trashed && (
                                            <TableHead className="w-10"><Checkbox checked={allChecked} onClick={toggleAll} aria-label="Select all" /></TableHead>
                                        )}
                                        <SortHead column="tracking_no" label="Tracking No." className="w-44" />
                                        <SortHead column="title" label="Title" />
                                        <TableHead className="w-20">Type</TableHead>
                                        <TableHead className="w-32">Department</TableHead>
                                        <SortHead column="status" label="Status" className="w-32" />
                                        <SortHead column="priority" label="Priority" className="w-28" />
                                        <TableHead className="w-36">Classification</TableHead>
                                        <SortHead column="document_date" label="Date" className="w-28" />
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.data.map((r) => (
                                        <TableRow key={r.id} className={cn(r.trashed && 'opacity-70')}>
                                            {canManage && !filters.trashed && (
                                                <TableCell><Checkbox checked={selected.includes(r.id)} onClick={() => toggleOne(r.id)} aria-label={`Select ${r.tracking_no}`} /></TableCell>
                                            )}
                                            <TableCell>
                                                <Link href={route('records.show', r.id)} className="text-primary font-mono text-xs font-semibold hover:underline">
                                                    {r.tracking_no ?? r.reference_no}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={route('records.show', r.id)} className="font-medium hover:underline">{r.title}</Link>
                                                <div className="text-muted-foreground text-xs">{r.reference_no}</div>
                                            </TableCell>
                                            <TableCell>{r.type_code && <Badge variant="secondary" className="font-mono" title={r.type_name ?? undefined}>{r.type_code}</Badge>}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{r.department ?? '—'}</TableCell>
                                            <TableCell><StatusBadge status={r.status} /></TableCell>
                                            <TableCell><PriorityBadge priority={r.priority} /></TableCell>
                                            <TableCell><ClassificationBadge classification={r.classification} /></TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{r.document_date ?? '—'}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild><Link href={route('records.show', r.id)}><FileSearch className="size-4" />View</Link></DropdownMenuItem>
                                                        {canManage && !r.trashed && <DropdownMenuItem asChild><Link href={route('records.edit', r.id)}>Edit</Link></DropdownMenuItem>}
                                                        {canManage && !r.trashed && (
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => router.delete(route('records.destroy', r.id), { preserveScroll: true })}>
                                                                <Trash2 className="size-4" />Archive
                                                            </DropdownMenuItem>
                                                        )}
                                                        {r.trashed && canManage && (
                                                            <DropdownMenuItem onSelect={() => router.post(route('records.restore', r.id), {}, { preserveScroll: true })}><RotateCcw className="size-4" />Restore</DropdownMenuItem>
                                                        )}
                                                        {r.trashed && canPurge && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => router.delete(route('records.force', r.id), { preserveScroll: true })}>
                                                                    <Trash2 className="size-4" />Delete permanently
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {records.data.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t p-4 sm:flex-row">
                            <p className="text-muted-foreground text-sm">
                                Showing <span className="font-medium">{records.from}</span>–<span className="font-medium">{records.to}</span> of{' '}
                                <span className="font-medium">{records.total}</span> records
                            </p>
                            <div className="flex flex-wrap items-center gap-1">
                                {records.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                                        // eslint-disable-next-line react/no-danger
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="min-w-9"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <AlertDialog open={confirmBulk} onOpenChange={setConfirmBulk}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive {selected.length} record(s)?</AlertDialogTitle>
                        <AlertDialogDescription>The selected records will move to the archive. They can be restored later.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={bulkArchive}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    const ALL = '__all__';
    return (
        <div className="grid gap-1.5">
            <label className="text-muted-foreground text-xs font-medium">{label}</label>
            <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );
}
