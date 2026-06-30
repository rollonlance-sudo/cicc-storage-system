import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Building2, FolderCog, ListChecks, Lock, Tag, FolderTree, AlertTriangle, FolderClock } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'General Setup', href: '/setup' }];

interface Props {
    counts: { types: number; categories: number; departments: number; statuses: number; classifications: number; priorities: number };
}

interface CardDef {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    count: number;
    accent: string;
    manageable?: boolean;
}

export default function SetupLanding({ counts }: Props) {
    const cards: CardDef[] = [
        { title: 'Document Types / Paper Types', description: 'Classify records — Notice of Meeting, Purchase Request, PPMP, Disbursement Voucher, and more.', icon: FolderCog, href: route('setup.document-types.index'), count: counts.types, accent: 'text-primary bg-primary/10', manageable: true },
        { title: 'Paper Categories', description: 'Group document types into procurement, planning, accounting, and other categories.', icon: FolderTree, href: route('setup.document-types.index'), count: counts.categories, accent: 'text-blue-600 bg-blue-500/10', manageable: true },
        { title: 'Departments / Offices', description: 'Maintain the offices that prepare and route official document records.', icon: Building2, href: route('setup.departments.index'), count: counts.departments, accent: 'text-emerald-600 bg-emerald-500/10', manageable: true },
        { title: 'File Statuses', description: 'Standardized workflow states from Draft through Released and Completed.', icon: ListChecks, href: route('setup.reference'), count: counts.statuses, accent: 'text-indigo-600 bg-indigo-500/10' },
        { title: 'Security Classifications', description: 'Public, Internal, Confidential, Restricted, and Highly Confidential controls.', icon: Lock, href: route('setup.reference'), count: counts.classifications, accent: 'text-amber-600 bg-amber-500/10' },
        { title: 'Priority Levels', description: 'Low, Normal, High, Urgent, and Critical priority indicators.', icon: AlertTriangle, href: route('setup.reference'), count: counts.priorities, accent: 'text-orange-600 bg-orange-500/10' },
        { title: 'Archive', description: 'Restore or permanently remove archived document types and categories.', icon: FolderClock, href: route('setup.archive.index'), count: 0, accent: 'text-slate-600 bg-slate-500/10' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Setup" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    icon={<FolderCog className="size-5" />}
                    title="General Setup"
                    description="Configure the master data that powers document records — types, categories, departments, and standardized values."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((c) => (
                        <Link key={c.title} href={c.href} className="group">
                            <Card className="flex h-full flex-col p-5 transition-colors group-hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div className={`flex size-10 items-center justify-center rounded-lg ${c.accent}`}><c.icon className="size-5" /></div>
                                    {c.count > 0 && <span className="text-muted-foreground text-sm font-medium tabular-nums">{c.count}</span>}
                                </div>
                                <h3 className="mt-3 font-medium">{c.title}</h3>
                                <p className="text-muted-foreground mt-1 flex-1 text-sm">{c.description}</p>
                                <span className="text-primary mt-3 inline-flex items-center gap-1 text-sm font-medium">
                                    {c.manageable ? 'Manage' : 'View'}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </Card>
                        </Link>
                    ))}
                </div>
                <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"><Tag className="size-3.5" />Tags are free-form and managed directly on each document record.</p>
            </div>
        </AppLayout>
    );
}
