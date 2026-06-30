import { ClassificationBadge, PriorityBadge, StatusBadge } from '@/components/badges';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    CLASSIFICATION_META,
    CLASSIFICATION_ORDER,
    PRIORITY_META,
    PRIORITY_ORDER,
    STATUS_META,
    STATUS_ORDER,
    type Classification,
    type DocumentStatus,
    type Priority,
    type RecordDetail,
    type RecordOptions,
} from '@/types/documents';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, FolderTree, LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    record: RecordDetail | null;
    options: RecordOptions;
}

const NONE = 'none';

function Section({ step, title, description, children }: { step: number; title: string; description?: string; children: React.ReactNode }) {
    return (
        <Card className="p-5">
            <div className="mb-4 flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-full text-sm font-semibold">{step}</span>
                <div>
                    <h2 className="font-medium">{title}</h2>
                    {description && <p className="text-muted-foreground text-xs">{description}</p>}
                </div>
            </div>
            <div className="grid gap-4">{children}</div>
        </Card>
    );
}

export default function RecordForm({ record, options }: Props) {
    const isEdit = !!record;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'File Records', href: '/records' },
        { title: isEdit ? 'Edit Record' : 'Create Record', href: '#' },
    ];

    const { data, setData, post, patch, processing, errors, transform } = useForm({
        document_type_id: record?.document_type_id ? String(record.document_type_id) : '',
        tracking_no: record?.tracking_no ?? '',
        reference_no: record?.reference_no ?? '',
        title: record?.title ?? '',
        department_id: record?.department_id ? String(record.department_id) : NONE,
        status: (record?.status ?? 'draft') as DocumentStatus,
        classification: (record?.classification ?? 'internal') as Classification,
        priority: (record?.priority ?? 'normal') as Priority,
        document_date: record?.document_date ?? '',
        amount: record?.amount != null ? String(record.amount) : '',
        prepared_by: record?.prepared_by ?? '',
        tags: (record?.tags ?? []).join(', '),
        description: record?.description ?? '',
    });

    transform((d) => ({
        ...d,
        document_type_id: d.document_type_id ? Number(d.document_type_id) : null,
        department_id: d.department_id === NONE ? null : Number(d.department_id),
        tags: d.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (isEdit) patch(route('records.update', record!.id));
        else post(route('records.store'));
    };

    const selectedType = options.types.find((t) => String(t.id) === data.document_type_id);
    const selectedDept = options.departments.find((d) => String(d.id) === data.department_id);

    // Simple completion meter.
    const requiredFields = [data.document_type_id, data.tracking_no, data.reference_no, data.title];
    const completion = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Record' : 'Create Record'} />

            <form onSubmit={submit} className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<FileText className="size-5" />}
                    title={isEdit ? 'Edit Document Record' : 'Create Document Record'}
                    description="Capture the official document details, classification, and routing."
                    actions={
                        <Button variant="outline" asChild><Link href={isEdit ? route('records.show', record!.id) : route('records.index')}>Cancel</Link></Button>
                    }
                />

                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Form sections */}
                    <div className="flex flex-col gap-5 lg:col-span-2">
                        <Section step={1} title="Basic Information" description="What the document is and how it is referenced.">
                            <div className="grid gap-2">
                                <Label htmlFor="type">Document Type / Paper Type *</Label>
                                <Select value={data.document_type_id} onValueChange={(v) => setData('document_type_id', v)}>
                                    <SelectTrigger id="type"><SelectValue placeholder="Select a document type" /></SelectTrigger>
                                    <SelectContent>
                                        {options.types.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.code} — {t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <p className="text-muted-foreground text-xs">e.g. Notice of Meeting, Purchase Request, PPMP, Disbursement Voucher.</p>
                                <InputError message={errors.document_type_id} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="reference_no">Reference Number *</Label>
                                    <Input id="reference_no" value={data.reference_no} onChange={(e) => setData('reference_no', e.target.value)} placeholder="e.g. PR-2026-0001" />
                                    <InputError message={errors.reference_no} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tracking_no">Official Tracking Number *</Label>
                                    <Input id="tracking_no" value={data.tracking_no} onChange={(e) => setData('tracking_no', e.target.value)} placeholder="e.g. CICC-2026-PR-0001" />
                                    <InputError message={errors.tracking_no} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Document Title *</Label>
                                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Title / subject of the document" />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags</Label>
                                <Input id="tags" value={data.tags} onChange={(e) => setData('tags', e.target.value)} placeholder="comma separated, e.g. fy2026, audit" />
                                <InputError message={errors.tags} />
                            </div>
                        </Section>

                        <Section step={2} title="Classification & Routing" description="Department, status, security classification, and priority.">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="department">Department / Office</Label>
                                    <Select value={data.department_id} onValueChange={(v) => setData('department_id', v)}>
                                        <SelectTrigger id="department"><SelectValue placeholder="Select department" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={NONE}>— None —</SelectItem>
                                            {options.departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.code} — {d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status *</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v as DocumentStatus)}>
                                        <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                        <SelectContent>{STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="classification">Security Classification *</Label>
                                    <Select value={data.classification} onValueChange={(v) => setData('classification', v as Classification)}>
                                        <SelectTrigger id="classification"><SelectValue /></SelectTrigger>
                                        <SelectContent>{CLASSIFICATION_ORDER.map((c) => <SelectItem key={c} value={c}>{CLASSIFICATION_META[c].label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <p className="text-muted-foreground text-xs">Confidential files are only visible to authorized users.</p>
                                    <InputError message={errors.classification} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Priority *</Label>
                                    <Select value={data.priority} onValueChange={(v) => setData('priority', v as Priority)}>
                                        <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                                        <SelectContent>{PRIORITY_ORDER.map((p) => <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <InputError message={errors.priority} />
                                </div>
                            </div>
                        </Section>

                        <Section step={3} title="Dates, Amount & Remarks">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="document_date">Document Date</Label>
                                    <Input id="document_date" type="date" value={data.document_date} onChange={(e) => setData('document_date', e.target.value)} />
                                    <InputError message={errors.document_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount (₱)</Label>
                                    <Input id="amount" type="number" min={0} step="0.01" value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="optional" />
                                    <InputError message={errors.amount} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="prepared_by">Prepared By</Label>
                                    <Input id="prepared_by" value={data.prepared_by} onChange={(e) => setData('prepared_by', e.target.value)} placeholder="optional" />
                                    <InputError message={errors.prepared_by} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description / Remarks</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    placeholder="Notes about this document"
                                    className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </Section>
                    </div>

                    {/* Summary panel */}
                    <div className="flex flex-col gap-5">
                        <Card className="sticky top-20 p-5">
                            <h2 className="font-medium">Record Summary</h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Type</dt>
                                    <dd className="font-medium">{selectedType ? selectedType.code : '—'}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Tracking</dt>
                                    <dd className="font-mono text-xs">{data.tracking_no || '—'}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Department</dt>
                                    <dd className="text-right">{selectedDept?.name ?? '—'}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Status</dt>
                                    <dd><StatusBadge status={data.status} /></dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Priority</dt>
                                    <dd><PriorityBadge priority={data.priority} /></dd>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-muted-foreground">Classification</dt>
                                    <dd><ClassificationBadge classification={data.classification} /></dd>
                                </div>
                            </dl>

                            <div className="mt-5">
                                <div className="mb-1 flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Required fields</span>
                                    <span className="font-medium">{completion}%</span>
                                </div>
                                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${completion}%` }} />
                                </div>
                            </div>

                            <div className="mt-5 flex flex-col gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                                    {isEdit ? 'Save Changes' : 'Save Record'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={isEdit ? route('records.show', record!.id) : route('records.index')}>Cancel</Link>
                                </Button>
                            </div>
                        </Card>

                        <Card className="text-muted-foreground p-5 text-xs">
                            <div className="mb-2 flex items-center gap-2 font-medium text-foreground"><ShieldCheck className="size-4" />Tips</div>
                            <ul className="list-inside list-disc space-y-1">
                                <li>Enter the official tracking number printed on the source document.</li>
                                <li>Set the classification accurately — confidential files are access-controlled.</li>
                                <li>Use tags to group related files for faster search.</li>
                            </ul>
                            <div className="text-muted-foreground/70 mt-3 flex items-center gap-1"><FolderTree className="size-3.5" />Document types are managed in General Setup.</div>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
