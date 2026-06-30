import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useAppearance } from '@/hooks/use-appearance';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, Moon, Search, Sun, Upload } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export function AppTopbar({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [q, setQ] = useState('');

    const search: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('papers.index'), q.trim() ? { q: q.trim() } : {}, { preserveScroll: true });
    };

    const isDark = appearance === 'dark';
    const canManage = !!auth.can?.manageDocument;

    return (
        <header className="border-sidebar-border/60 bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
            <SidebarTrigger className="-ml-1" />

            <div className="hidden lg:block">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Global search */}
            <form onSubmit={search} className="relative ml-auto hidden flex-1 sm:block sm:max-w-sm">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search tracking no., reference, title, type…"
                    className="bg-muted/50 h-9 pl-9"
                    aria-label="Global search"
                />
            </form>

            <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
                {canManage && (
                    <Button asChild size="sm" className="hidden sm:inline-flex">
                        <Link href="/papers">
                            <Upload className="size-4" />
                            Quick Upload
                        </Link>
                    </Button>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative size-9" aria-label="Notifications">
                            <Bell className="size-4.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <div className="text-muted-foreground px-2 py-6 text-center text-sm">You're all caught up.</div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 gap-2 px-1.5">
                            <UserInfo user={auth.user} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
