import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROLE_META } from '@/types/documents';
import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

export interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserRow | null;
    roles: string[];
}

export function UserDialog({ open, onOpenChange, user, roles }: Props) {
    const isEdit = !!user;
    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: roles[0] ?? '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (open) {
            clearErrors();
            setData({
                name: user?.name ?? '',
                email: user?.email ?? '',
                role: user?.role ?? roles[0] ?? '',
                password: '',
                password_confirmation: '',
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user]);

    const close = () => {
        onOpenChange(false);
        reset();
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: () => close() };
        if (isEdit) patch(route('users.update', user!.id), opts);
        else post(route('users.store'), opts);
    };

    return (
        <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
            <DialogContent>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
                        <DialogDescription>{isEdit ? 'Update account details and role.' : 'Create an internal account and assign a role.'}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} autoFocus />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role *</Label>
                        <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                            <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => <SelectItem key={r} value={r}>{ROLE_META[r]?.label ?? r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="password">{isEdit ? 'New Password' : 'Password *'}</Label>
                            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder={isEdit ? 'leave blank to keep' : ''} autoComplete="new-password" />
                            <InputError message={errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={close}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
