import { ActiveStatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { DepartmentDialog, type DepartmentRow } from '@/components/setup/department-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, MoreHorizontal, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type Dept = DepartmentRow & { documents_count: number; trashed: boolean };

interface Props {
    departments: Dept[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Setup', href: '/setup' },
    { title: 'Departments', href: '/setup/departments' },
];

export default function Departments({ departments }: Props) {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Dept | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return departments;
        return departments.filter((d) => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || (d.head_of_office ?? '').toLowerCase().includes(q));
    }, [departments, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments — General Setup" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<Building2 className="size-5" />}
                    title="Departments / Offices"
                    description="Maintain the offices that prepare and route official document records."
                    actions={
                        <>
                            <Button variant="outline" asChild><Link href={route('setup.index')}><ArrowLeft className="size-4" />Setup</Link></Button>
                            <Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" />Add Department</Button>
                        </>
                    }
                />

                <Card className="p-0">
                    <div className="border-b p-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments…" className="pl-8" />
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <EmptyState icon={Building2} title="No departments found" description="Add an office to start routing records to it." action={<Button onClick={() => { setEditing(null); setDialogOpen(true); }}><Plus className="size-4" />Add Department</Button>} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-24">Code</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Head of Office</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="w-20 text-center">Records</TableHead>
                                    <TableHead className="w-28">Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((d) => (
                                    <TableRow key={d.id} className={d.trashed ? 'opacity-60' : ''}>
                                        <TableCell><Badge variant="secondary" className="font-mono">{d.code}</Badge></TableCell>
                                        <TableCell className="font-medium">{d.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{d.head_of_office ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {d.email ?? '—'}
                                            {d.contact_number && <div className="text-xs">{d.contact_number}</div>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-center">{d.documents_count}</TableCell>
                                        <TableCell>{d.trashed ? <Badge variant="secondary">Archived</Badge> : <ActiveStatusBadge active={d.is_active} />}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {!d.trashed && <DropdownMenuItem onSelect={() => { setEditing(d); setDialogOpen(true); }}><Pencil className="size-4" />Edit</DropdownMenuItem>}
                                                    {!d.trashed ? (
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => router.delete(route('setup.departments.destroy', d.id), { preserveScroll: true })}>
                                                            <Trash2 className="size-4" />Archive
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onSelect={() => router.post(route('setup.departments.restore', d.id), {}, { preserveScroll: true })}>
                                                            <RotateCcw className="size-4" />Restore
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

            <DepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} department={editing} />
        </AppLayout>
    );
}
