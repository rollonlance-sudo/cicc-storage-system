import { ClassificationBadge, DocumentTypeBadge, PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { type RecordDetail } from '@/types/documents';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArrowLeft,
    Check,
    Copy,
    Download,
    FileText,
    History,
    LoaderCircle,
    Paperclip,
    Pencil,
    Plus,
    Printer,
    RotateCcw,
    ScrollText,
    Trash2,
    Upload,
} from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

interface Attachment {
    id: number;
    name: string;
    mime: string | null;
    size: number;
    uploaded_by: string | null;
    uploaded_at: string | null;
    downloads: number;
    download_url: string;
}
interface Version {
    id: number;
    version_no: number;
    summary: string | null;
    author: string | null;
    at: string | null;
}
interface Activity {
    action: string;
    description: string;
    user: string | null;
    properties: Record<string, string> | null;
    at: string | null;
}
interface Props {
    record: RecordDetail;
    attachments: Attachment[];
    versions: Version[];
    activity: Activity[];
    canManage: boolean;
}

const peso = (n: number) => '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatBytes = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);

const ACTION_META: Record<string, { icon: typeof Plus; cls: string }> = {
    created: { icon: Plus, cls: 'bg-emerald-500' },
    updated: { icon: Pencil, cls: 'bg-blue-500' },
    status_changed: { icon: RotateCcw, cls: 'bg-indigo-500' },
    archived: { icon: Archive, cls: 'bg-amber-500' },
    restored: { icon: RotateCcw, cls: 'bg-emerald-500' },
    attachment_added: { icon: Paperclip, cls: 'bg-blue-500' },
    attachment_removed: { icon: Trash2, cls: 'bg-red-500' },
    downloaded: { icon: Download, cls: 'bg-slate-500' },
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="border-b py-2.5 last:border-0 sm:flex sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground text-sm">{label}</dt>
            <dd className="text-sm font-medium sm:text-right">{children}</dd>
        </div>
    );
}

export default function RecordShow({ record, attachments, versions, activity, canManage }: Props) {
    const [archiving, setArchiving] = useState(false);
    const [removing, setRemoving] = useState<Attachment | null>(null);
    const [copied, setCopied] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = useForm<{ file: File | null }>({ file: null });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'File Records', href: '/records' },
        { title: record.tracking_no ?? record.reference_no, href: route('records.show', record.id) },
    ];

    const copyTracking = () => {
        navigator.clipboard?.writeText(record.tracking_no ?? record.reference_no);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const submitUpload: FormEventHandler = (e) => {
        e.preventDefault();
        upload.post(route('records.attachments.store', record.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { upload.reset(); if (fileRef.current) fileRef.current.value = ''; },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={record.tracking_no ?? record.title} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit">
                    <Link href={route('records.index')}><ArrowLeft className="size-4" />All file records</Link>
                </Button>

                {/* Header */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-primary font-mono text-sm font-semibold">{record.tracking_no ?? record.reference_no}</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button onClick={copyTracking} className="text-muted-foreground hover:text-foreground rounded p-1" aria-label="Copy tracking number">
                                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{copied ? 'Copied!' : 'Copy tracking number'}</TooltipContent>
                            </Tooltip>
                        </div>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{record.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <StatusBadge status={record.status} />
                            <PriorityBadge priority={record.priority} />
                            <ClassificationBadge classification={record.classification} />
                            {record.type_code && <DocumentTypeBadge code={record.type_code} name={record.type_name} />}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        {canManage && <Button asChild><Link href={route('records.edit', record.id)}><Pencil className="size-4" />Edit</Link></Button>}
                        <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                        {canManage && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Plus className="size-4 rotate-45" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setArchiving(true)}>
                                        <Archive className="size-4" />Archive Record
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="overview">
                    <TabsList className="flex h-auto flex-wrap justify-start">
                        <TabsTrigger value="overview"><FileText className="size-4" />Overview</TabsTrigger>
                        <TabsTrigger value="attachments"><Paperclip className="size-4" />Attachments{attachments.length > 0 && ` (${attachments.length})`}</TabsTrigger>
                        <TabsTrigger value="activity"><History className="size-4" />Activity</TabsTrigger>
                        <TabsTrigger value="versions"><ScrollText className="size-4" />Versions{versions.length > 0 && ` (${versions.length})`}</TabsTrigger>
                        <TabsTrigger value="remarks">Remarks</TabsTrigger>
                    </TabsList>

                    {/* Overview */}
                    <TabsContent value="overview" className="mt-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card className="p-5">
                                <h3 className="mb-2 font-medium">Basic Information</h3>
                                <dl>
                                    <Field label="Tracking Number"><span className="font-mono text-xs">{record.tracking_no ?? '—'}</span></Field>
                                    <Field label="Reference Number"><span className="font-mono text-xs">{record.reference_no}</span></Field>
                                    <Field label="Document Type">{record.type_code ? `${record.type_code} — ${record.type_name}` : '—'}</Field>
                                    <Field label="Tags">
                                        {record.tags.length ? <span className="flex flex-wrap justify-end gap-1">{record.tags.map((t) => <span key={t} className="bg-muted rounded px-1.5 py-0.5 text-xs">{t}</span>)}</span> : '—'}
                                    </Field>
                                </dl>
                            </Card>
                            <Card className="p-5">
                                <h3 className="mb-2 font-medium">Classification</h3>
                                <dl>
                                    <Field label="Status"><StatusBadge status={record.status} /></Field>
                                    <Field label="Priority"><PriorityBadge priority={record.priority} /></Field>
                                    <Field label="Security Classification"><ClassificationBadge classification={record.classification} /></Field>
                                    <Field label="Amount">{record.amount != null ? peso(record.amount) : '—'}</Field>
                                </dl>
                            </Card>
                            <Card className="p-5">
                                <h3 className="mb-2 font-medium">Office Routing</h3>
                                <dl>
                                    <Field label="Department / Office">{record.department ?? '—'}</Field>
                                    <Field label="Head of Office">{record.department_head ?? '—'}</Field>
                                    <Field label="Prepared By">{record.prepared_by ?? '—'}</Field>
                                </dl>
                            </Card>
                            <Card className="p-5">
                                <h3 className="mb-2 font-medium">Dates & Record Info</h3>
                                <dl>
                                    <Field label="Document Date">{record.document_date ?? '—'}</Field>
                                    <Field label="Created">{record.created_at ?? '—'}</Field>
                                    <Field label="Last Updated">{record.updated_at ?? '—'}</Field>
                                </dl>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Attachments */}
                    <TabsContent value="attachments" className="mt-4">
                        <Card className="p-5">
                            {canManage && (
                                <form onSubmit={submitUpload} className="mb-5 flex flex-col gap-3 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center">
                                    <div className="flex-1">
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            onChange={(e) => upload.setData('file', e.target.files?.[0] ?? null)}
                                            className="file:bg-secondary file:text-secondary-foreground text-muted-foreground block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                                        />
                                        <p className="text-muted-foreground mt-1 text-xs">PDF, images, or Office docs up to 10 MB.</p>
                                        {upload.errors.file && <p className="text-destructive mt-1 text-xs">{upload.errors.file}</p>}
                                    </div>
                                    <Button type="submit" disabled={!upload.data.file || upload.progress !== null}>
                                        {upload.progress ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}
                                        {upload.progress ? `Uploading ${upload.progress.percentage}%` : 'Upload Attachment'}
                                    </Button>
                                </form>
                            )}

                            {attachments.length === 0 ? (
                                <EmptyState icon={Paperclip} title="No attachments yet" description={canManage ? 'Upload the source file(s) for this record.' : 'No files have been attached to this record.'} className="py-10" />
                            ) : (
                                <ul className="divide-y">
                                    {attachments.map((a) => (
                                        <li key={a.id} className="flex items-center gap-3 py-3">
                                            <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg"><FileText className="size-5" /></div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{a.name}</p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatBytes(a.size)} · {a.uploaded_by ?? 'Unknown'} · {a.uploaded_at} · {a.downloads} download{a.downloads === 1 ? '' : 's'}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild><a href={a.download_url}><Download className="size-4" />Download</a></Button>
                                            {canManage && (
                                                <Button variant="ghost" size="icon" className="text-destructive size-8" onClick={() => setRemoving(a)} aria-label="Remove attachment"><Trash2 className="size-4" /></Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Activity */}
                    <TabsContent value="activity" className="mt-4">
                        <Card className="p-5">
                            <h3 className="mb-4 font-medium">Activity Timeline</h3>
                            <ol className="relative ml-3 border-l pl-6">
                                {activity.map((a, i) => {
                                    const meta = ACTION_META[a.action] ?? { icon: History, cls: 'bg-slate-400' };
                                    const Icon = meta.icon;
                                    return (
                                        <li key={i} className="mb-5 last:mb-0">
                                            <span className={cn('absolute -left-[13px] mt-0.5 flex size-6 items-center justify-center rounded-full text-white ring-4 ring-background', meta.cls)}>
                                                <Icon className="size-3" />
                                            </span>
                                            <p className="text-sm font-medium">{a.description}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {a.user ?? 'System'} · {a.at ?? '—'}
                                                {a.properties?.from && a.properties?.to && <span className="ml-1">({a.properties.from} → {a.properties.to})</span>}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ol>
                        </Card>
                    </TabsContent>

                    {/* Versions */}
                    <TabsContent value="versions" className="mt-4">
                        <Card className="p-5">
                            <h3 className="mb-4 font-medium">Version History</h3>
                            {versions.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Only the current version exists. New versions are captured automatically on each edit.</p>
                            ) : (
                                <ul className="divide-y">
                                    {versions.map((v) => (
                                        <li key={v.id} className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-secondary text-secondary-foreground flex size-9 items-center justify-center rounded-lg text-xs font-semibold">v{v.version_no}</span>
                                                <div>
                                                    <p className="text-sm font-medium">{v.summary ?? `Version ${v.version_no}`}</p>
                                                    <p className="text-muted-foreground text-xs">{v.author ?? 'System'} · {v.at}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Remarks */}
                    <TabsContent value="remarks" className="mt-4">
                        <Card className="p-5">
                            <h3 className="mb-2 font-medium">Description / Remarks</h3>
                            {record.description ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{record.description}</p> : <p className="text-muted-foreground text-sm">No remarks recorded.</p>}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <AlertDialog open={archiving} onOpenChange={setArchiving}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive this record?</AlertDialogTitle>
                        <AlertDialogDescription>“{record.tracking_no ?? record.reference_no}” will move to the archive and can be restored later.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.delete(route('records.destroy', record.id), { onFinish: () => setArchiving(false) })}>Archive Record</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove “{removing?.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently deletes the attached file.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { if (removing) router.delete(route('attachments.destroy', removing.id), { preserveScroll: true, onFinish: () => setRemoving(null) }); }}
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
