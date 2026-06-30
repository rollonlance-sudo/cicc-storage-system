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
import { Switch } from '@/components/ui/switch';
import { type DocumentCategory } from '@/types/setup';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: DocumentCategory | null;
}

export function CategoryDialog({ open, onOpenChange, category }: Props) {
    const isEdit = !!category;

    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        is_active: true as boolean,
        sort_order: 0 as number,
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                name: category?.name ?? '',
                description: category?.description ?? '',
                is_active: category?.is_active ?? true,
                sort_order: category?.sort_order ?? 0,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, category]);

    const close = () => {
        onOpenChange(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => close() };

        if (isEdit) {
            patch(route('setup.categories.update', category!.id), options);
        } else {
            post(route('setup.categories.store'), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit category' : 'Add category'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update this document category.' : 'Create a category that document types can be grouped under.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                            id="cat-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Procurement Document"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cat-description">Description</Label>
                        <textarea
                            id="cat-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={2}
                            placeholder="Optional"
                            className="border-input focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-hidden"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex items-end gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="cat-sort">Sort order</Label>
                            <Input
                                id="cat-sort"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', Number(e.target.value))}
                                className="w-28"
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Switch id="cat-active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', c)} />
                            <Label htmlFor="cat-active">Active</Label>
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
