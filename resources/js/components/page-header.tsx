import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

/** Consistent page title block: optional icon, title, helper text, and right-aligned actions. */
export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">{icon}</div>
                )}
                <div>
                    <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
