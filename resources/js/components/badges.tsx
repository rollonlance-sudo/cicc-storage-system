import { cn } from '@/lib/utils';
import {
    CLASSIFICATION_META,
    PRIORITY_META,
    ROLE_META,
    STATUS_META,
    type Classification,
    type DocumentStatus,
    type Priority,
} from '@/types/documents';
import { Lock, ShieldAlert } from 'lucide-react';

const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap';

export function StatusBadge({ status, className }: { status: DocumentStatus; className?: string }) {
    const meta = STATUS_META[status] ?? STATUS_META.draft;
    return (
        <span className={cn(base, meta.badge, className)}>
            <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />
            {meta.label}
        </span>
    );
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
    const meta = PRIORITY_META[priority] ?? PRIORITY_META.normal;
    return (
        <span className={cn(base, meta.badge, className)}>
            <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />
            {meta.label}
        </span>
    );
}

/** Classified items (confidential and above) get a lock/alert icon so status isn't color-only. */
export function ClassificationBadge({ classification, className }: { classification: Classification; className?: string }) {
    const meta = CLASSIFICATION_META[classification] ?? CLASSIFICATION_META.internal;
    const sensitive = ['confidential', 'restricted', 'highly_confidential'].includes(classification);
    const Icon = classification === 'highly_confidential' || classification === 'restricted' ? ShieldAlert : Lock;
    return (
        <span className={cn(base, meta.badge, className)}>
            {sensitive && <Icon className="size-3" aria-hidden />}
            {meta.label}
        </span>
    );
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
    const meta = ROLE_META[role] ?? { label: role.replace(/_/g, ' '), badge: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300' };
    return <span className={cn(base, 'capitalize', meta.badge, className)}>{meta.label}</span>;
}

/** CODE — Full Name, with the code emphasised. */
export function DocumentTypeBadge({ code, name, className }: { code: string; name?: string | null; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1.5', className)}>
            <span className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 font-mono text-xs font-semibold">{code}</span>
            {name && <span className="text-muted-foreground truncate text-sm">{name}</span>}
        </span>
    );
}

export function ActiveStatusBadge({ active, className }: { active: boolean; className?: string }) {
    return (
        <span
            className={cn(
                base,
                active
                    ? 'bg-emerald-100 text-emerald-800 ring-emerald-700/20 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-400',
                className,
            )}
        >
            <span className={cn('size-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-slate-400')} aria-hidden />
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}
