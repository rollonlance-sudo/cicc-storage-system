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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { type TrashedDocumentCategory, type TrashedDocumentType } from '@/types/setup';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Setup', href: '/setup/document-types' },
    { title: 'Archive', href: '/setup/archive' },
];

interface Props {
    documentTypes: TrashedDocumentType[];
    categories: TrashedDocumentCategory[];
}

type PurgeTarget = { kind: 'type' | 'category'; id: number; label: string } | null;

export default function SetupArchive({ documentTypes, categories }: Props) {
    const { auth } = usePage<SharedData>().props;
    const canPurge = !!auth.can?.purgeSetting;

    const [purging, setPurging] = useState<PurgeTarget>(null);

    const restoreType = (id: number) => router.post(route('setup.document-types.restore', id), {}, { preserveScroll: true });
    const restoreCategory = (id: number) => router.post(route('setup.categories.restore', id), {}, { preserveScroll: true });

    const confirmPurge = () => {
        if (!purging) return;
        const routeName = purging.kind === 'type' ? 'setup.document-types.force' : 'setup.categories.force';
        router.delete(route(routeName, purging.id), {
            preserveScroll: true,
            onFinish: () => setPurging(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archive — General Setup" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Archive</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Archived document types and categories. Restore them, or{' '}
                            {canPurge ? 'permanently delete them.' : 'ask a System Administrator to permanently delete them.'}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('setup.document-types.index')}>
                            <ArrowLeft className="size-4" />
                            Back to setup
                        </Link>
                    </Button>
                </div>

                {/* Archived document types */}
                <Card className="p-0">
                    <div className="border-b p-4">
                        <h2 className="font-medium">Document types ({documentTypes.length})</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-28">Code</TableHead>
                                <TableHead>Full name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Archived</TableHead>
                                <TableHead className="w-56 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documentTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-10 text-center">
                                        No archived document types.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documentTypes.map((t) => (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">
                                                {t.code}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{t.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{t.category ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{t.deleted_at ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => restoreType(t.id)}>
                                                    <RotateCcw className="size-4" />
                                                    Restore
                                                </Button>
                                                {canPurge && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setPurging({ kind: 'type', id: t.id, label: t.code })}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* Archived categories */}
                <Card className="p-0">
                    <div className="border-b p-4">
                        <h2 className="font-medium">Categories ({categories.length})</h2>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Archived</TableHead>
                                <TableHead className="w-56 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                                        No archived categories.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-md truncate">{c.description ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{c.deleted_at ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => restoreCategory(c.id)}>
                                                    <RotateCcw className="size-4" />
                                                    Restore
                                                </Button>
                                                {canPurge && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setPurging({ kind: 'category', id: c.id, label: c.name })}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <AlertDialog open={!!purging} onOpenChange={(o) => !o && setPurging(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently delete “{purging?.label}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. The record will be removed from the database for good.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmPurge}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
