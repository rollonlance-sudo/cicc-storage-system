import { PageHeader } from '@/components/page-header';
import { CategoryDialog } from '@/components/setup/category-dialog';
import { DocumentTypeDialog } from '@/components/setup/document-type-dialog';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DocumentCategory, type DocumentType, type SetupStats } from '@/types/setup';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, FolderCog, MoreHorizontal, Pencil, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'General Setup', href: '/setup/document-types' }];

interface Props {
    documentTypes: DocumentType[];
    categories: DocumentCategory[];
    stats: SetupStats;
}

export default function SetupIndex({ documentTypes, categories, stats }: Props) {
    const [typeSearch, setTypeSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<DocumentType | null>(null);

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);

    const [archivingType, setArchivingType] = useState<DocumentType | null>(null);
    const [archivingCategory, setArchivingCategory] = useState<DocumentCategory | null>(null);

    const filteredTypes = useMemo(() => {
        const q = typeSearch.trim().toLowerCase();
        if (!q) return documentTypes;
        return documentTypes.filter(
            (t) =>
                t.code.toLowerCase().includes(q) ||
                t.name.toLowerCase().includes(q) ||
                (t.category ?? '').toLowerCase().includes(q),
        );
    }, [documentTypes, typeSearch]);

    const filteredCategories = useMemo(() => {
        const q = categorySearch.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q));
    }, [categories, categorySearch]);

    const openNewType = () => {
        setEditingType(null);
        setTypeDialogOpen(true);
    };
    const openEditType = (t: DocumentType) => {
        setEditingType(t);
        setTypeDialogOpen(true);
    };
    const openNewCategory = () => {
        setEditingCategory(null);
        setCategoryDialogOpen(true);
    };
    const openEditCategory = (c: DocumentCategory) => {
        setEditingCategory(c);
        setCategoryDialogOpen(true);
    };

    const toggleType = (t: DocumentType) => {
        router.patch(
            route('setup.document-types.update', t.id),
            {
                code: t.code,
                name: t.name,
                document_category_id: t.document_category_id,
                description: t.description ?? '',
                is_active: !t.is_active,
                sort_order: t.sort_order,
            },
            { preserveScroll: true },
        );
    };

    const toggleCategory = (c: DocumentCategory) => {
        router.patch(
            route('setup.categories.update', c.id),
            {
                name: c.name,
                description: c.description ?? '',
                is_active: !c.is_active,
                sort_order: c.sort_order,
            },
            { preserveScroll: true },
        );
    };

    const confirmArchiveType = () => {
        if (!archivingType) return;
        router.delete(route('setup.document-types.destroy', archivingType.id), {
            preserveScroll: true,
            onFinish: () => setArchivingType(null),
        });
    };

    const confirmArchiveCategory = () => {
        if (!archivingCategory) return;
        router.delete(route('setup.categories.destroy', archivingCategory.id), {
            preserveScroll: true,
            onFinish: () => setArchivingCategory(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Setup" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<FolderCog className="size-5" />}
                    title="General Setup"
                    description={`Manage document / paper types and their categories — ${stats.types} types across ${stats.categories} categories.`}
                    actions={
                        <Button variant="outline" asChild>
                            <Link href={route('setup.archive.index')}>
                                <Archive className="size-4" />
                                Archive
                                {stats.archivedTypes + stats.archivedCategories > 0 && (
                                    <Badge variant="secondary" className="ml-1">
                                        {stats.archivedTypes + stats.archivedCategories}
                                    </Badge>
                                )}
                            </Link>
                        </Button>
                    }
                />

                <Tabs defaultValue="types">
                    <TabsList>
                        <TabsTrigger value="types">Document Types</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>

                    {/* DOCUMENT TYPES TAB */}
                    <TabsContent value="types">
                        <Card className="p-0">
                            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:w-72">
                                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                                    <Input
                                        value={typeSearch}
                                        onChange={(e) => setTypeSearch(e.target.value)}
                                        placeholder="Search code, name, category…"
                                        className="pl-8"
                                    />
                                </div>
                                <Button onClick={openNewType}>
                                    <Plus className="size-4" />
                                    Add document type
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-28">Code</TableHead>
                                        <TableHead>Full name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="w-24 text-center">Active</TableHead>
                                        <TableHead className="w-16 text-center">Sort</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                                                No document types found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTypes.map((t) => (
                                            <TableRow key={t.id}>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        {t.code}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">{t.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{t.category ?? '—'}</TableCell>
                                                <TableCell className="text-center">
                                                    <Switch checked={t.is_active} onCheckedChange={() => toggleType(t)} aria-label="Toggle active" />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-center">{t.sort_order}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => openEditType(t)}>
                                                                <Pencil className="size-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={() => setArchivingType(t)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Archive className="size-4" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    {/* CATEGORIES TAB */}
                    <TabsContent value="categories">
                        <Card className="p-0">
                            <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="relative w-full sm:w-72">
                                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                                    <Input
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        placeholder="Search categories…"
                                        className="pl-8"
                                    />
                                </div>
                                <Button onClick={openNewCategory}>
                                    <Plus className="size-4" />
                                    Add category
                                </Button>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-20 text-center">Types</TableHead>
                                        <TableHead className="w-24 text-center">Active</TableHead>
                                        <TableHead className="w-16 text-center">Sort</TableHead>
                                        <TableHead className="w-12" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                                                No categories found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map((c) => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.name}</TableCell>
                                                <TableCell className="text-muted-foreground max-w-md truncate">{c.description ?? '—'}</TableCell>
                                                <TableCell className="text-muted-foreground text-center">{c.types_count ?? 0}</TableCell>
                                                <TableCell className="text-center">
                                                    <Switch checked={c.is_active} onCheckedChange={() => toggleCategory(c)} aria-label="Toggle active" />
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-center">{c.sort_order}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-8">
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => openEditCategory(c)}>
                                                                <Pencil className="size-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onSelect={() => setArchivingCategory(c)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Archive className="size-4" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialogs */}
            <DocumentTypeDialog
                open={typeDialogOpen}
                onOpenChange={setTypeDialogOpen}
                documentType={editingType}
                categories={categories}
            />
            <CategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} category={editingCategory} />

            {/* Archive confirms */}
            <AlertDialog open={!!archivingType} onOpenChange={(o) => !o && setArchivingType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive “{archivingType?.code}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This moves <strong>{archivingType?.name}</strong> to the archive. You can restore it later from the Archive page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmArchiveType}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!archivingCategory} onOpenChange={(o) => !o && setArchivingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive “{archivingCategory?.name}”?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This moves the category to the archive. Categories still used by active document types cannot be archived.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmArchiveCategory}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
