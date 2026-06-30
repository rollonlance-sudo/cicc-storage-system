import { ClassificationBadge, PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
import { DocumentDialog } from '@/components/papers/document-dialog';
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import {
    STATUS_META,
    STATUS_ORDER,
    type Department,
    type DocumentStatus,
    type PaperDocument,
    type PaperType,
} from '@/types/documents';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Archive, ArrowLeft, FileSearch, MoreHorizontal, Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type Doc = PaperDocument & { department_id: number | null };

interface Props {
    type: PaperType;
    documents: Doc[];
    departments: Department[];
    filters?: { q: string };
}

const peso = (n: number) => '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PapersShow({ type, documents, departments, filters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const canManage = !!auth.can?.manageDocument;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'File Records', href: '/papers' },
        { title: type.code, href: `/papers/${type.code}` },
    ];

    const [search, setSearch] = useState(filters?.q ?? '');
    const [status, setStatus] = useState<'all' | DocumentStatus>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Doc | null>(null);
    const [archiving, setArchiving] = useState<Doc | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return documents.filter((d) => {
            if (status !== 'all' && d.status !== status) return false;
            if (!q) return true;
            return (
                (d.tracking_no ?? '').toLowerCase().includes(q) ||
                d.reference_no.toLowerCase().includes(q) ||
                d.title.toLowerCase().includes(q) ||
                (d.prepared_by ?? '').toLowerCase().includes(q)
            );
        });
    }, [documents, search, status]);

    const openNew = () => {
        setEditing(null);
        setDialogOpen(true);
    };
    const openEdit = (d: Doc) => {
        setEditing(d);
        setDialogOpen(true);
    };
    const confirmArchive = () => {
        if (!archiving) return;
        router.delete(route('documents.destroy', archiving.id), { preserveScroll: true, onFinish: () => setArchiving(null) });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${type.code} — ${type.name}`} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
                        <Link href={route('papers.index')}>
                            <ArrowLeft className="size-4" />
                            All file records
                        </Link>
                    </Button>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg">
                                <span className="font-mono text-sm font-bold">{type.code}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">{type.name}</h1>
                                {type.category && <p className="text-muted-foreground mt-0.5 text-sm">{type.category}</p>}
                                {type.description && <p className="text-muted-foreground mt-2 max-w-3xl text-sm">{type.description}</p>}
                            </div>
                        </div>
                        {canManage && (
                            <Button onClick={openNew}>
                                <Plus className="size-4" />
                                Create Record
                            </Button>
                        )}
                    </div>
                </div>

                <Card className="p-0">
                    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:w-80">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tracking no., reference, title…" className="pl-8" />
                        </div>
                        <Select value={status} onValueChange={(v) => setStatus(v as 'all' | DocumentStatus)}>
                            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {STATUS_ORDER.map((s) => (
                                    <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={FileSearch}
                            title="No file records found"
                            description={canManage ? 'Start by creating a record, or adjust your search and filters.' : 'Adjust your search and filters.'}
                            action={canManage ? <Button onClick={openNew}><Plus className="size-4" />Create Record</Button> : undefined}
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Tracking No.</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-28">Priority</TableHead>
                                    <TableHead className="w-40">Classification</TableHead>
                                    <TableHead className="w-32">Department</TableHead>
                                    <TableHead className="w-28">Date</TableHead>
                                    {canManage && <TableHead className="w-12" />}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-mono text-xs font-medium">{d.tracking_no ?? d.reference_no}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{d.title}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {d.reference_no}
                                                {d.amount != null && ` · ${peso(d.amount)}`}
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={d.status} /></TableCell>
                                        <TableCell><PriorityBadge priority={d.priority} /></TableCell>
                                        <TableCell><ClassificationBadge classification={d.classification} /></TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{d.department ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{d.document_date ?? '—'}</TableCell>
                                        {canManage && (
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => openEdit(d)}><Pencil className="size-4" />Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => setArchiving(d)} className="text-destructive focus:text-destructive">
                                                            <Archive className="size-4" />Archive
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>

                <p className="text-muted-foreground text-sm">
                    Showing {filtered.length} of {documents.length} {type.code} records.
                </p>
            </div>

            {canManage && <DocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} typeCode={type.code} document={editing} departments={departments} />}

            <AlertDialog open={!!archiving} onOpenChange={(o) => !o && setArchiving(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive “{archiving?.tracking_no ?? archiving?.reference_no}”?</AlertDialogTitle>
                        <AlertDialogDescription>This moves the record to the archive. It can be restored later.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmArchive}>Archive Record</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
