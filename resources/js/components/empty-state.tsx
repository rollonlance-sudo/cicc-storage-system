import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
            <div className="bg-muted text-muted-foreground mb-4 flex size-12 items-center justify-center rounded-full">
                <Icon className="size-6" />
            </div>
            <h3 className="text-foreground text-base font-medium">{title}</h3>
            {description && <p className="text-muted-foreground mt-1 max-w-sm text-sm">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
