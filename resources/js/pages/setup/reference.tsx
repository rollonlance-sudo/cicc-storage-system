import { ClassificationBadge, PriorityBadge, StatusBadge } from '@/components/badges';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    CLASSIFICATION_META,
    PRIORITY_META,
    STATUS_META,
    type Classification,
    type DocumentStatus,
    type Priority,
} from '@/types/documents';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ListChecks } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'General Setup', href: '/setup' },
    { title: 'System Reference', href: '/setup/reference' },
];

interface Props {
    statuses: DocumentStatus[];
    priorities: Priority[];
    classifications: Classification[];
}

export default function Reference({ statuses, priorities, classifications }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Reference — General Setup" />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    icon={<ListChecks className="size-5" />}
                    title="System Reference Values"
                    description="Standardized file statuses, security classifications, and priority levels used across all records."
                    actions={<Button variant="outline" asChild><Link href={route('setup.index')}><ArrowLeft className="size-4" />Setup</Link></Button>}
                />

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="p-5">
                        <h2 className="font-medium">File Statuses</h2>
                        <p className="text-muted-foreground mt-0.5 text-xs">The official document workflow.</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {statuses.map((s) => (
                                <div key={s} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <StatusBadge status={s} />
                                    <span className="text-muted-foreground font-mono text-xs">{s}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h2 className="font-medium">Security Classifications</h2>
                        <p className="text-muted-foreground mt-0.5 text-xs">Confidential and above are access-controlled.</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {classifications.map((c) => (
                                <div key={c} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <ClassificationBadge classification={c} />
                                    <span className="text-muted-foreground font-mono text-xs">{CLASSIFICATION_META[c].label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h2 className="font-medium">Priority Levels</h2>
                        <p className="text-muted-foreground mt-0.5 text-xs">Routing urgency indicators.</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {priorities.map((p) => (
                                <div key={p} className="flex items-center justify-between rounded-md border px-3 py-2">
                                    <PriorityBadge priority={p} />
                                    <span className="text-muted-foreground font-mono text-xs">{PRIORITY_META[p].label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <p className="text-muted-foreground text-xs">
                    These values are system-standardized for consistency and audit integrity. To adjust the available set, update the application configuration.
                </p>
            </div>
        </AppLayout>
    );
}
