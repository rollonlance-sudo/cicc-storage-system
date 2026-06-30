import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Building2, CalendarRange, Clock, FileStack, Layers, ListChecks, Lock, ShieldAlert } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports', href: '/reports' }];

interface Props {
    summary: { total: number; thisMonth: number; pending: number; confidential: number };
}

export default function ReportsIndex({ summary }: Props) {
    const reports: { title: string; description: string; icon: LucideIcon; href: string; accent: string }[] = [
        { title: 'Files by Department', description: 'Record volume and value grouped by office.', icon: Building2, href: route('reports.records', { group_by: 'department' }), accent: 'text-emerald-600 bg-emerald-500/10' },
        { title: 'Files by Document Type', description: 'Counts per paper type across the registry.', icon: Layers, href: route('reports.records', { group_by: 'type' }), accent: 'text-primary bg-primary/10' },
        { title: 'Files by Status', description: 'Workflow distribution from draft to released.', icon: ListChecks, href: route('reports.records', { group_by: 'status' }), accent: 'text-indigo-600 bg-indigo-500/10' },
        { title: 'Files by Classification', description: 'Public, internal, and confidential breakdown.', icon: Lock, href: route('reports.records', { group_by: 'classification' }), accent: 'text-amber-600 bg-amber-500/10' },
        { title: 'Files by Date Range', description: 'Filter and summarize records over any period.', icon: CalendarRange, href: route('reports.records'), accent: 'text-blue-600 bg-blue-500/10' },
        { title: 'Confidential Files', description: 'Restricted and confidential records overview.', icon: ShieldAlert, href: route('reports.records', { group_by: 'classification' }), accent: 'text-red-600 bg-red-500/10' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
                <PageHeader icon={<BarChart3 className="size-5" />} title="Reports" description="Generate, view, and export summaries of document records." />

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Records" value={summary.total.toLocaleString()} icon={FileStack} accent="navy" />
                    <StatCard title="This Month" value={summary.thisMonth.toLocaleString()} icon={CalendarRange} accent="blue" />
                    <StatCard title="Pending" value={summary.pending.toLocaleString()} icon={Clock} accent="amber" />
                    <StatCard title="Confidential" value={summary.confidential.toLocaleString()} icon={Lock} accent="red" />
                </div>

                <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">Available reports</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map((r) => (
                        <Link key={r.title} href={r.href} className="group">
                            <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-primary/50">
                                <div className={`flex size-10 items-center justify-center rounded-lg ${r.accent}`}><r.icon className="size-5" /></div>
                                <h3 className="mt-3 font-medium">{r.title}</h3>
                                <p className="text-muted-foreground mt-1 flex-1 text-sm">{r.description}</p>
                                <span className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium">Generate<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
