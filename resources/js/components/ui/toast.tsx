import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ToastType = 'success' | 'error';
interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

const DURATION = 5000;

/**
 * Global toast notifications driven by the shared session flash
 * (`flash.success` / `flash.error`). Mounted once in the app layout, it shows a
 * pop-up for the initial page load and for every subsequent Inertia visit.
 */
export function Toaster() {
    const page = usePage<SharedData>();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counter = useRef(0);
    const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    const remove = (id: number) => {
        setToasts((list) => list.filter((t) => t.id !== id));
        if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    };

    const push = (type: ToastType, message: string) => {
        const id = ++counter.current;
        setToasts((list) => [...list, { id, type, message }]);
        timers.current[id] = setTimeout(() => remove(id), DURATION);
    };

    // Flash present on the very first (full) page load.
    useEffect(() => {
        const flash = page.props.flash;
        if (flash?.success) push('success', flash.success);
        if (flash?.error) push('error', flash.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Flash arriving with any later Inertia visit (e.g. after a redirect).
    useEffect(() => {
        const off = router.on('success', (event) => {
            const flash = (event.detail.page.props as unknown as SharedData).flash;
            if (flash?.success) push('success', flash.success);
            if (flash?.error) push('error', flash.error);
        });
        return off;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const current = timers.current;
        return () => Object.values(current).forEach(clearTimeout);
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    role="status"
                    className={cn(
                        'animate-in slide-in-from-top-2 fade-in pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg',
                        'bg-background',
                        t.type === 'success'
                            ? 'border-emerald-500/40'
                            : 'border-destructive/50',
                    )}
                >
                    {t.type === 'success' ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                    ) : (
                        <XCircle className="text-destructive mt-0.5 size-5 shrink-0" />
                    )}
                    <p className="flex-1 text-sm leading-snug">{t.message}</p>
                    <button
                        type="button"
                        onClick={() => remove(t.id)}
                        className="text-muted-foreground hover:text-foreground -mr-1 -mt-1 rounded p-1 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
