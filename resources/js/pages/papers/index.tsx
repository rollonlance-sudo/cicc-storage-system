import { PriorityBadge, StatusBadge } from '@/components/badges';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type DocumentSearchResult, type PaperGroup } from '@/types/documents';
import { Head, Link, router } from '@inertiajs/react';
import { FileStack, FileText, LoaderCircle, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Documents', href: '/papers' }];

interface Props {
    groups: PaperGroup[];
    totalDocuments: number;
    filters: { q: string };
    documents: DocumentSearchResult[];
    documentMatches: number;
}

export default function PapersIndex({ groups, totalDocuments, filters, documents, documentMatches }: Props) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [searching, setSearching] = useState(false);
    const firstRender = useRef(true);

    // Debounced server search — looks *inside* the types for matching documents.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const handle = setTimeout(() => {
            const q = search.trim();
            if (q === (filters.q ?? '')) {
                setSearching(false);
                return;
            }
            router.get(route('papers.index'), q ? { q } : {}, {
                only: ['documents', 'documentMatches', 'filters'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setSearching(true),
                onFinish: () => setSearching(false),
            });
        }, 300);

        return () => clearTimeout(handle);
    }, [search, filters.q]);

    const query = search.trim();
    const typesCount = useMemo(() => groups.reduce((n, g) => n + g.types.length, 0), [groups]);

    // Type cards filter instantly on the client by code / name / category.
    const filteredGroups = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return groups;
        return groups
            .map((g) => ({
                ...g,
                types: g.types.filter(
                    (t) => t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q),
                ),
            }))
            .filter((g) => g.types.length > 0);
    }, [groups, query]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
                {/* Search-first header */}
                <div className="flex flex-col gap-4">
                    <PageHeader
                        icon={<FileStack className="size-5" />}
                        title="File Records"
                        description={`Search ${totalDocuments.toLocaleString()} records across ${typesCount} paper types, or browse by category below.`}
                    />
                    <div className="relative">
                        {searching ? (
                            <LoaderCircle className="text-muted-foreground absolute top-1/2 left-3.5 size-5 -translate-y-1/2 animate-spin" />
                        ) : (
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2" />
                        )}
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by reference no., title, preparer, or paper type…"
                            className="h-12 pl-11 text-base"
                            autoFocus
                        />
                        {query !== '' && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Matching documents (server search across all types) */}
                {query !== '' && (
                    <Card className="p-0">
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="font-medium">
                                Matching documents
                                <span className="text-muted-foreground ml-2 text-sm font-normal">
                                    {documentMatches} found{documentMatches > documents.length ? ` (showing first ${documents.length})` : ''}
                                </span>
                            </h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">Tracking No.</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="w-20">Type</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-28">Priority</TableHead>
                                    <TableHead className="w-28">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                                            No documents match “{query}”.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.map((d) => (
                                        <TableRow
                                            key={d.id}
                                            className="cursor-pointer"
                                            onClick={() =>
                                                d.type_code &&
                                                router.get(route('papers.show', { documentType: d.type_code, q: d.reference_no }))
                                            }
                                        >
                                            <TableCell className="text-primary font-mono text-xs font-medium">{d.tracking_no ?? d.reference_no}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{d.title}</div>
                                                <div className="text-muted-foreground text-xs">{d.reference_no}</div>
                                            </TableCell>
                                            <TableCell>
                                                {d.type_code && (
                                                    <Badge variant="secondary" className="font-mono" title={d.type_name ?? undefined}>
                                                        {d.type_code}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell><StatusBadge status={d.status} /></TableCell>
                                            <TableCell><PriorityBadge priority={d.priority} /></TableCell>
                                            <TableCell className="text-muted-foreground">{d.document_date ?? '—'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                )}

                {/* Paper types, grouped by category */}
                {filteredGroups.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">No paper types match “{query}”.</p>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.category} className="flex flex-col gap-3">
                            <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">{group.category}</h2>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {group.types.map((t) => (
                                    <Link key={t.id} href={route('papers.show', t.code)} className="group">
                                        <Card className="h-full p-4 transition-colors group-hover:border-primary/50">
                                            <div className="flex items-start justify-between gap-2">
                                                <Badge variant="secondary" className="font-mono">
                                                    {t.code}
                                                </Badge>
                                                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                                    <FileText className="size-3.5" />
                                                    {t.documents_count}
                                                </span>
                                            </div>
                                            <h3 className="mt-2 font-medium leading-tight">{t.name}</h3>
                                            {t.description && <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{t.description}</p>}
                                            {!t.is_active && <span className="text-muted-foreground mt-2 inline-block text-xs">(inactive)</span>}
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
