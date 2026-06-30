import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CLASSIFICATION_META,
    CLASSIFICATION_ORDER,
    PRIORITY_META,
    PRIORITY_ORDER,
    STATUS_META,
    STATUS_ORDER,
    type Classification,
    type Department,
    type DocumentStatus,
    type PaperDocument,
    type Priority,
} from '@/types/documents';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    typeCode: string;
    document: (PaperDocument & { department_id?: number | null }) | null;
    departments: Department[];
}

const NONE = 'none';

export function DocumentDialog({ open, onOpenChange, typeCode, document, departments }: Props) {
    const isEdit = !!document;

    const form = useForm({
        tracking_no: '',
        reference_no: '',
        title: '',
        department_id: NONE,
        status: 'draft' as DocumentStatus,
        classification: 'internal' as Classification,
        priority: 'normal' as Priority,
        document_date: '',
        amount: '' as string,
        prepared_by: '',
        tags: '',
        description: '',
    });
    const { data, setData, processing, errors, reset, clearErrors, transform } = form;

    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                tracking_no: document?.tracking_no ?? '',
                reference_no: document?.reference_no ?? '',
                title: document?.title ?? '',
                department_id: document?.department_id ? String(document.department_id) : NONE,
                status: document?.status ?? 'draft',
                classification: document?.classification ?? 'internal',
                priority: document?.priority ?? 'normal',
                document_date: document?.document_date ?? '',
                amount: document?.amount != null ? String(document.amount) : '',
                prepared_by: document?.prepared_by ?? '',
                tags: (document?.tags ?? []).join(', '),
                description: document?.description ?? '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, document]);

    const close = () => {
        onOpenChange(false);
        reset();
    };

    transform((d) => ({
        ...d,
        department_id: d.department_id === NONE ? null : Number(d.department_id),
        tags: d.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => close() };
        if (isEdit) {
            form.patch(route('documents.update', document!.id), options);
        } else {
            form.post(route('documents.store', typeCode), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Document Record' : 'Create Document Record'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? `Update this ${typeCode} record.` : `Add a new ${typeCode} record.`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="tracking_no">Official Tracking Number *</Label>
                            <Input id="tracking_no" value={data.tracking_no} onChange={(e) => setData('tracking_no', e.target.value)} placeholder="e.g. CICC-2026-PR-0001" />
                            <InputError message={errors.tracking_no} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reference_no">Reference Number *</Label>
                            <Input id="reference_no" value={data.reference_no} onChange={(e) => setData('reference_no', e.target.value)} placeholder={`${typeCode}-2026-0001`} autoFocus />
                            <InputError message={errors.reference_no} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="title">Document Title *</Label>
                        <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Title of the document" />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="department">Department / Office</Label>
                            <Select value={data.department_id} onValueChange={(v) => setData('department_id', v)}>
                                <SelectTrigger id="department"><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>— None —</SelectItem>
                                    {departments.map((d) => (
                                        <SelectItem key={d.id} value={String(d.id)}>
                                            {d.code} — {d.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.department_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={data.status} onValueChange={(v) => setData('status', v as DocumentStatus)}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {STATUS_ORDER.map((s) => (
                                        <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="classification">Security Classification *</Label>
                            <Select value={data.classification} onValueChange={(v) => setData('classification', v as Classification)}>
                                <SelectTrigger id="classification"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {CLASSIFICATION_ORDER.map((c) => (
                                        <SelectItem key={c} value={c}>{CLASSIFICATION_META[c].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.classification} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority *</Label>
                            <Select value={data.priority} onValueChange={(v) => setData('priority', v as Priority)}>
                                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_ORDER.map((p) => (
                                        <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.priority} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="document_date">Date</Label>
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
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" value={data.tags} onChange={(e) => setData('tags', e.target.value)} placeholder="comma separated, e.g. fy2026, audit" />
                        <p className="text-muted-foreground text-xs">Separate tags with commas.</p>
                        <InputError message={errors.tags} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="doc-description">Description / Remarks</Label>
                        <textarea
                            id="doc-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            placeholder="Optional notes"
                            className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {isEdit ? 'Save Changes' : 'Create Record'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
