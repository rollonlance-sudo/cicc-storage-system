import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

type Accent = 'navy' | 'blue' | 'emerald' | 'amber' | 'red' | 'slate' | 'purple';

const accentMap: Record<Accent, { bar: string; icon: string }> = {
    navy: { bar: 'bg-primary', icon: 'bg-primary/10 text-primary' },
    blue: { bar: 'bg-blue-500', icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    emerald: { bar: 'bg-emerald-500', icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    amber: { bar: 'bg-amber-500', icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    red: { bar: 'bg-red-500', icon: 'bg-red-500/10 text-red-600 dark:text-red-400' },
    slate: { bar: 'bg-slate-400', icon: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
    purple: { bar: 'bg-purple-500', icon: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    helper?: string;
    accent?: Accent;
    trend?: { value: number; label?: string };
}

export function StatCard({ title, value, icon: Icon, helper, accent = 'navy', trend }: StatCardProps) {
    const a = accentMap[accent];
    const up = trend && trend.value >= 0;

    return (
        <Card className="relative overflow-hidden p-4">
            <span className={cn('absolute inset-y-0 left-0 w-1', a.bar)} aria-hidden />
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                <div className={cn('flex size-9 items-center justify-center rounded-lg', a.icon)}>
                    <Icon className="size-5" />
                </div>
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
            <div className="mt-1 flex items-center gap-2">
                {trend && (
                    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                        {Math.abs(trend.value)}%{trend.label ? ` ${trend.label}` : ''}
                    </span>
                )}
                {helper && <span className="text-muted-foreground text-xs">{helper}</span>}
            </div>
        </Card>
    );
}
