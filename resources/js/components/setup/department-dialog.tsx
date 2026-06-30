import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

export interface DepartmentRow {
    id: number;
    code: string;
    name: string;
    head_of_office: string | null;
    email: string | null;
    contact_number: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    department: DepartmentRow | null;
}

export function DepartmentDialog({ open, onOpenChange, department }: Props) {
    const isEdit = !!department;
    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        head_of_office: '',
        email: '',
        contact_number: '',
        is_active: true as boolean,
        sort_order: 0 as number,
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                code: department?.code ?? '',
                name: department?.name ?? '',
                head_of_office: department?.head_of_office ?? '',
                email: department?.email ?? '',
                contact_number: department?.contact_number ?? '',
                is_active: department?.is_active ?? true,
                sort_order: department?.sort_order ?? 0,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, department]);

    const close = () => {
        onOpenChange(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => close() };
        if (isEdit) patch(route('setup.departments.update', department!.id), opts);
        else post(route('setup.departments.store'), opts);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Department' : 'Add Department'}</DialogTitle>
                        <DialogDescription>Offices that prepare and route official document records.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code *</Label>
                            <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. FIN" autoFocus />
                            <InputError message={errors.code} />
                        </div>
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="name">Department Name *</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Finance and Budget Division" />
                            <InputError message={errors.name} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="head">Head of Office</Label>
                        <Input id="head" value={data.head_of_office} onChange={(e) => setData('head_of_office', e.target.value)} placeholder="optional" />
                        <InputError message={errors.head_of_office} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="optional" />
                            <InputError message={errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact">Contact Number</Label>
                            <Input id="contact" value={data.contact_number} onChange={(e) => setData('contact_number', e.target.value)} placeholder="optional" />
                            <InputError message={errors.contact_number} />
                        </div>
                    </div>
                    <div className="flex items-end gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="sort">Sort order</Label>
                            <Input id="sort" type="number" min={0} value={data.sort_order} onChange={(e) => setData('sort_order', Number(e.target.value))} className="w-28" />
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <Switch id="active" checked={data.is_active} onCheckedChange={(c) => setData('is_active', c)} />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            {isEdit ? 'Save Changes' : 'Add Department'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
