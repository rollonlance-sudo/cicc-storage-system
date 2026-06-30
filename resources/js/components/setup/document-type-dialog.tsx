import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { type DocumentCategory, type DocumentType } from '@/types/setup';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documentType: DocumentType | null;
    categories: DocumentCategory[];
}

export function DocumentTypeDialog({ open, onOpenChange, documentType, categories }: Props) {
    const isEdit = !!documentType;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        document_category_id: '',
        description: '',
        is_active: true as boolean,
        sort_order: 0 as number,
    });

    // Sync the form whenever the dialog opens for a new/different record.
    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                code: documentType?.code ?? '',
                name: documentType?.name ?? '',
                document_category_id: documentType?.document_category_id ? String(documentType.document_category_id) : '',
                description: documentType?.description ?? '',
                is_active: documentType?.is_active ?? true,
                sort_order: documentType?.sort_order ?? 0,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, documentType]);

    const close = () => {
        onOpenChange(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => close() };

        if (isEdit) {
            patch(route('setup.document-types.update', documentType!.id), options);
        } else {
            post(route('setup.document-types.store'), options);
        }
    };

    // Active categories first; keep the current value selectable even if inactive.
    const selectable = categories.filter((c) => c.is_active || String(c.id) === data.document_category_id);

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit document type' : 'Add document type'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update this paper/document type.' : 'Create a new paper/document type. The code/abbreviation must be unique.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code / Abbreviation</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="e.g. NoM"
                                autoFocus
                            />
                            <InputError message={errors.code} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Notice of Meeting"
                            />
                            <InputError message={errors.name} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={data.document_category_id} onValueChange={(v) => setData('document_category_id', v)}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectable.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                        {!c.is_active ? ' (inactive)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.document_category_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            placeholder="What is this document used for?"
                            className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-end gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="sort_order">Sort order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', Number(e.target.value))}
                                className="w-28"
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Switch id="is_active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', c)} />
                            <Label htmlFor="is_active">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {isEdit ? 'Save changes' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
