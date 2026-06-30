import { RoleBadge } from '@/components/badges';
import { NavUser } from '@/components/nav-user';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type Auth, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    BarChart3,
    Building2,
    CalendarRange,
    ChevronRight,
    FileStack,
    FolderCog,
    LayoutDashboard,
    ListChecks,
    Lock,
    LogOut,
    Upload,
    UserCog,
    Users,
    type LucideIcon,
} from 'lucide-react';

type Gate = keyof NonNullable<Auth['can']>;
interface NavLink {
    title: string;
    icon: LucideIcon;
    url?: string;
    gate?: Gate;
    soon?: boolean;
}
interface NavSectionDef {
    label: string;
    gate?: Gate;
    collapsible?: boolean;
    items: NavLink[];
}

const sections: NavSectionDef[] = [
    {
        label: 'Main',
        items: [
            { title: 'Dashboard', icon: LayoutDashboard, url: '/dashboard' },
            { title: 'File Records', icon: FileStack, url: '/records' },
            { title: 'Browse by Type', icon: FolderCog, url: '/papers' },
            { title: 'Upload File', icon: Upload, url: '/records/create', gate: 'manageDocument' },
            { title: 'Archive', icon: Archive, url: '/records?trashed=1', gate: 'manageDocument' },
        ],
    },
    {
        label: 'Reports',
        collapsible: true,
        items: [
            { title: 'Reports Overview', icon: BarChart3, url: '/reports' },
            { title: 'By Department', icon: Building2, url: '/reports/records?group_by=department' },
            { title: 'By Document Type', icon: FileStack, url: '/reports/records?group_by=type' },
            { title: 'By Status', icon: ListChecks, url: '/reports/records?group_by=status' },
            { title: 'By Date Range', icon: CalendarRange, url: '/reports/records' },
            { title: 'Confidential Files', icon: Lock, url: '/records?classification=confidential', gate: 'manageSetting' },
            { title: 'User Activity', icon: Users, url: '/reports/activity', gate: 'manageUser' },
        ],
    },
    {
        label: 'Administration',
        gate: 'manageSetting',
        items: [
            { title: 'General Setup', icon: FolderCog, url: '/setup', gate: 'manageSetting' },
            { title: 'Departments', icon: Building2, url: '/setup/departments', gate: 'manageSetting' },
            { title: 'User Management', icon: UserCog, url: '/users', gate: 'manageUser' },
        ],
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();
    const can = auth.can ?? {};
    const role = auth.roles?.[0];

    const visible = (item: NavLink) => !item.gate || can[item.gate];
    const isActive = (url?: string) => !!url && (page.url === url || page.url.startsWith(url + '/') || (url !== '/' && page.url.startsWith(url + '?')));

    const renderItems = (items: NavLink[]) =>
        items.filter(visible).map((item) => (
            <SidebarMenuItem key={item.title}>
                {item.url ? (
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                        <Link href={item.url} prefetch>
                            <item.icon />
                            <span>{item.title}</span>
                        </Link>
                    </SidebarMenuButton>
                ) : (
                    <SidebarMenuButton tooltip={`${item.title} — coming soon`} className="cursor-not-allowed opacity-55" aria-disabled>
                        <item.icon />
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                )}
                {item.soon && <SidebarMenuBadge className="text-[10px] tracking-wide uppercase">Soon</SidebarMenuBadge>}
            </SidebarMenuItem>
        ));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <img src="/images/cicc-logo.png" alt="CICC" className="size-8 shrink-0 object-contain" />
                                <div className="grid flex-1 text-left leading-tight">
                                    <span className="truncate font-semibold">CICC</span>
                                    <span className="text-sidebar-foreground/70 truncate text-xs">Storage System</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {role && (
                    <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden">
                        <RoleBadge role={role} />
                    </div>
                )}
            </SidebarHeader>

            <SidebarContent>
                {sections
                    .filter((s) => !s.gate || can[s.gate])
                    .map((section) =>
                        section.collapsible ? (
                            <Collapsible key={section.label} defaultOpen className="group/collapsible">
                                <SidebarGroup>
                                    <SidebarGroupLabel asChild>
                                        <CollapsibleTrigger className="flex w-full items-center">
                                            {section.label}
                                            <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                        </CollapsibleTrigger>
                                    </SidebarGroupLabel>
                                    <CollapsibleContent>
                                        <SidebarGroupContent>
                                            <SidebarMenu>{renderItems(section.items)}</SidebarMenu>
                                        </SidebarGroupContent>
                                    </CollapsibleContent>
                                </SidebarGroup>
                            </Collapsible>
                        ) : (
                            <SidebarGroup key={section.label}>
                                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>{renderItems(section.items)}</SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ),
                    )}

                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={page.url.startsWith('/settings')} tooltip="Account Settings">
                                    <Link href={route('profile.edit')} prefetch>
                                        <UserCog />
                                        <span>Account Settings</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Logout">
                                    <Link href={route('logout')} method="post" as="button">
                                        <LogOut />
                                        <span>Logout</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
