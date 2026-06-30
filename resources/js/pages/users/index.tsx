import { RoleBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { UserDialog, type UserRow } from '@/components/users/user-dialog';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Search, Trash2, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';

type User = UserRow & { verified: boolean; created_at: string | null; is_self: boolean };

interface Props {
    users: User[];
    roles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'User Management', href: '/users' }];

export default function UsersIndex({ users, roles }: Props) {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleting, setDeleting] = useState<User | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.role ?? '').toLowerCase().includes(q));
    }, [users, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<UserCog className="size-5" />}
                    title="User Management"
                    description="Create internal accounts and assign roles. Only the System Administrator can access this page."
                    actions={<Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" />Add User</Button>}
                />

                <Card className="p-0">
                    <div className="border-b p-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, role…" className="pl-8" />
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <EmptyState icon={UserCog} title="No users found" description="Add an internal account to grant access." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead className="w-48">Role</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead className="w-28">Created</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">
                                            {u.name}
                                            {u.is_self && <span className="text-muted-foreground ml-2 text-xs">(you)</span>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                                        <TableCell>{u.role ? <RoleBadge role={u.role} /> : <span className="text-muted-foreground text-sm">—</span>}</TableCell>
                                        <TableCell>
                                            {u.verified
                                                ? <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Verified</Badge>
                                                : <Badge variant="secondary">Pending</Badge>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{u.created_at ?? '—'}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => { setEditing(u); setDialogOpen(true); }}><Pencil className="size-4" />Edit</DropdownMenuItem>
                                                    {!u.is_self && (
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleting(u)}>
                                                            <Trash2 className="size-4" />Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>

            <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editing} roles={roles} />

            <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete “{deleting?.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>This permanently removes the account. This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => { if (deleting) router.delete(route('users.destroy', deleting.id), { preserveScroll: true, onFinish: () => setDeleting(null) }); }}
                        >
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
