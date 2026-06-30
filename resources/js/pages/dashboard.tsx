import { PriorityBadge, StatusBadge } from '@/components/badges';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import {
    CLASSIFICATION_META,
    PRIORITY_META,
    STATUS_META,
    type Classification,
    type DashboardStats,
    type DocumentStatus,
    type Priority,
    type RecentDocument,
} from '@/types/documents';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    FileStack,
    FolderTree,
    Inbox,
    Layers,
    Lock,
    Send,
    Building2,
    CalendarDays,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Props {
    stats: DashboardStats;
    byStatus: Record<DocumentStatus, number>;
    byClassification: Record<Classification, number>;
    byPriority: Record<Priority, number>;
    byDepartment: { name: string; count: number }[];
    byType: { name: string; count: number }[];
    perMonth: { label: string; count: number }[];
    recent: RecentDocument[];
    pending: RecentDocument[];
}

const peso = (n: number) => '₱' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Horizontal labelled bar list used for the breakdown cards. */
function BarList({ rows, total, color }: { rows: { label: string; count: number; dot?: string }[]; total: number; color?: string }) {
    const denom = total || 1;
    return (
        <div className="flex flex-col gap-3">
            {rows.map((r) => (
                <div key={r.label}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                            {r.dot && <span className={cn('size-2 rounded-full', r.dot)} aria-hidden />}
                            {r.label}
                        </span>
                        <span className="text-muted-foreground tabular-nums">{r.count}</span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div className={cn('h-full rounded-full', color ?? 'bg-primary')} style={{ width: `${Math.round((r.count / denom) * 100)}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RecordsTable({ rows, empty }: { rows: RecentDocument[]; empty: string }) {
    if (rows.length === 0) {
        return <EmptyState icon={Inbox} title={empty} className="py-10" />;
    }
    return (
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
                {rows.map((d) => (
                    <TableRow key={d.id}>
                        <TableCell>
                            <Link href={d.type_code ? route('papers.show', { documentType: d.type_code, q: d.reference_no }) : '#'} className="text-primary font-mono text-xs font-medium hover:underline">
                                {d.tracking_no ?? d.reference_no}
                            </Link>
                        </TableCell>
                        <TableCell className="max-w-xs truncate font-medium">{d.title}</TableCell>
                        <TableCell>
                            {d.type_code && <span className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 font-mono text-xs font-semibold">{d.type_code}</span>}
                        </TableCell>
                        <TableCell><StatusBadge status={d.status} /></TableCell>
                        <TableCell><PriorityBadge priority={d.priority} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{d.document_date ?? '—'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function Dashboard({ stats, byStatus, byClassification, byPriority, byDepartment, perMonth, recent, pending }: Props) {
    const monthMax = Math.max(1, ...perMonth.map((m) => m.count));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Dashboard"
                    description="Overview of document records, uploads, pending files, and recent activity."
                />

                {/* Primary stat cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Records" value={stats.documents.toLocaleString()} icon={FileStack} accent="navy" helper="across all paper types" />
                    <StatCard title="Uploaded This Month" value={stats.thisMonth.toLocaleString()} icon={CalendarDays} accent="blue" helper={`${stats.today} today`} />
                    <StatCard title="Pending Files" value={stats.pending.toLocaleString()} icon={Clock} accent="amber" helper="for review" />
                    <StatCard title="For Approval" value={stats.forApproval.toLocaleString()} icon={Send} accent="purple" helper="awaiting sign-off" />
                    <StatCard title="Released Files" value={stats.released.toLocaleString()} icon={CheckCircle2} accent="emerald" />
                    <StatCard title="Confidential Files" value={stats.confidential.toLocaleString()} icon={Lock} accent="red" helper="restricted access" />
                    <StatCard title="Document Types" value={stats.types.toLocaleString()} icon={Layers} accent="slate" />
                    <StatCard title="Departments" value={stats.departments.toLocaleString()} icon={Building2} accent="slate" />
                </div>

                <Card className="p-4">
                    <span className="text-muted-foreground text-sm font-medium">Total recorded amount (financial papers)</span>
                    <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{peso(stats.totalAmount)}</div>
                </Card>

                {/* Charts row 1 */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="p-4 lg:col-span-2">
                        <h2 className="font-medium">Uploads per month</h2>
                        <div className="mt-4 flex h-44 items-end justify-between gap-3">
                            {perMonth.map((m) => (
                                <div key={m.label} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-muted-foreground text-xs tabular-nums">{m.count}</span>
                                    <div className="bg-primary/85 hover:bg-primary w-full rounded-t transition-colors" style={{ height: `${Math.max(4, (m.count / monthMax) * 130)}px` }} />
                                    <span className="text-muted-foreground text-xs">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="p-4">
                        <h2 className="font-medium">By status</h2>
                        <div className="mt-4">
                            <BarList
                                total={stats.documents}
                                rows={(Object.keys(byStatus) as DocumentStatus[]).filter((s) => byStatus[s] > 0).map((s) => ({ label: STATUS_META[s].label, count: byStatus[s], dot: STATUS_META[s].dot }))}
                            />
                        </div>
                    </Card>
                </div>

                {/* Charts row 2 */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="p-4">
                        <h2 className="font-medium">By security classification</h2>
                        <div className="mt-4">
                            <BarList
                                total={stats.documents}
                                color="bg-amber-500"
                                rows={(Object.keys(byClassification) as Classification[]).filter((c) => byClassification[c] > 0).map((c) => ({ label: CLASSIFICATION_META[c].label, count: byClassification[c], dot: CLASSIFICATION_META[c].dot }))}
                            />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <h2 className="font-medium">By priority</h2>
                        <div className="mt-4">
                            <BarList
                                total={stats.documents}
                                color="bg-orange-500"
                                rows={(Object.keys(byPriority) as Priority[]).filter((p) => byPriority[p] > 0).map((p) => ({ label: PRIORITY_META[p].label, count: byPriority[p], dot: PRIORITY_META[p].dot }))}
                            />
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-2">
                            <FolderTree className="text-muted-foreground size-4" />
                            <h2 className="font-medium">Top departments</h2>
                        </div>
                        <div className="mt-4">
                            {byDepartment.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No documents yet.</p>
                            ) : (
                                <BarList total={Math.max(...byDepartment.map((d) => d.count))} color="bg-emerald-500" rows={byDepartment.map((d) => ({ label: d.name, count: d.count }))} />
                            )}
                        </div>
                    </Card>
                </div>

                {/* Pending queue */}
                <Card className="p-0">
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="font-medium">Pending documents</h2>
                        <span className="text-muted-foreground text-sm">{stats.pending + stats.forApproval} awaiting action</span>
                    </div>
                    <RecordsTable rows={pending} empty="No pending documents." />
                </Card>

                {/* Recently uploaded */}
                <Card className="p-0">
                    <div className="flex items-center justify-between border-b p-4">
                        <h2 className="font-medium">Recently uploaded files</h2>
                        <Link href={route('papers.index')} className="text-primary text-sm font-medium hover:underline">
                            View all records →
                        </Link>
                    </div>
                    <RecordsTable rows={recent} empty="No records found." />
                </Card>
            </div>
        </AppLayout>
    );
}
