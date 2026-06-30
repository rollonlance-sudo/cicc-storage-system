// ── Status ────────────────────────────────────────────────────────────────
export type DocumentStatus =
    | 'draft'
    | 'received'
    | 'for_review'
    | 'for_approval'
    | 'approved'
    | 'released'
    | 'returned'
    | 'pending'
    | 'completed'
    | 'cancelled';

export type Priority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export type Classification = 'public' | 'internal' | 'confidential' | 'restricted' | 'highly_confidential';

interface Meta {
    label: string;
    /** Tailwind classes for a soft badge (bg + text + ring), readable in light & dark. */
    badge: string;
    /** Solid dot/accent color for charts and indicators. */
    dot: string;
}

export const STATUS_META: Record<DocumentStatus, Meta> = {
    draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
    received: { label: 'Received', badge: 'bg-blue-100 text-blue-800 ring-blue-700/20 dark:bg-blue-950 dark:text-blue-300', dot: 'bg-blue-500' },
    for_review: { label: 'For Review', badge: 'bg-indigo-100 text-indigo-800 ring-indigo-700/20 dark:bg-indigo-950 dark:text-indigo-300', dot: 'bg-indigo-500' },
    for_approval: { label: 'For Approval', badge: 'bg-amber-100 text-amber-800 ring-amber-700/20 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
    approved: { label: 'Approved', badge: 'bg-green-100 text-green-800 ring-green-700/20 dark:bg-green-950 dark:text-green-300', dot: 'bg-green-500' },
    released: { label: 'Released', badge: 'bg-emerald-100 text-emerald-800 ring-emerald-700/20 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-500' },
    returned: { label: 'Returned', badge: 'bg-orange-100 text-orange-800 ring-orange-700/20 dark:bg-orange-950 dark:text-orange-300', dot: 'bg-orange-500' },
    pending: { label: 'Pending', badge: 'bg-yellow-100 text-yellow-800 ring-yellow-700/20 dark:bg-yellow-950 dark:text-yellow-300', dot: 'bg-yellow-500' },
    completed: { label: 'Completed', badge: 'bg-green-100 text-green-800 ring-green-700/20 dark:bg-green-950 dark:text-green-300', dot: 'bg-green-600' },
    cancelled: { label: 'Cancelled', badge: 'bg-red-100 text-red-800 ring-red-700/20 dark:bg-red-950 dark:text-red-300', dot: 'bg-red-500' },
};

export const STATUS_ORDER: DocumentStatus[] = [
    'draft', 'received', 'for_review', 'for_approval', 'approved', 'released', 'returned', 'pending', 'completed', 'cancelled',
];

export const PRIORITY_META: Record<Priority, Meta> = {
    low: { label: 'Low', badge: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' },
    normal: { label: 'Normal', badge: 'bg-blue-100 text-blue-800 ring-blue-700/20 dark:bg-blue-950 dark:text-blue-300', dot: 'bg-blue-500' },
    high: { label: 'High', badge: 'bg-amber-100 text-amber-800 ring-amber-700/20 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
    urgent: { label: 'Urgent', badge: 'bg-orange-100 text-orange-800 ring-orange-700/20 dark:bg-orange-950 dark:text-orange-300', dot: 'bg-orange-500' },
    critical: { label: 'Critical', badge: 'bg-red-100 text-red-800 ring-red-700/20 dark:bg-red-950 dark:text-red-300', dot: 'bg-red-500' },
};

export const PRIORITY_ORDER: Priority[] = ['low', 'normal', 'high', 'urgent', 'critical'];

export const CLASSIFICATION_META: Record<Classification, Meta> = {
    public: { label: 'Public', badge: 'bg-green-100 text-green-800 ring-green-700/20 dark:bg-green-950 dark:text-green-300', dot: 'bg-green-500' },
    internal: { label: 'Internal', badge: 'bg-blue-100 text-blue-800 ring-blue-700/20 dark:bg-blue-950 dark:text-blue-300', dot: 'bg-blue-500' },
    confidential: { label: 'Confidential', badge: 'bg-amber-100 text-amber-800 ring-amber-700/20 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
    restricted: { label: 'Restricted', badge: 'bg-orange-100 text-orange-800 ring-orange-700/20 dark:bg-orange-950 dark:text-orange-300', dot: 'bg-orange-500' },
    highly_confidential: { label: 'Highly Confidential', badge: 'bg-red-100 text-red-800 ring-red-700/20 dark:bg-red-950 dark:text-red-300', dot: 'bg-red-500' },
};

export const CLASSIFICATION_ORDER: Classification[] = ['public', 'internal', 'confidential', 'restricted', 'highly_confidential'];

/** Roles → label + badge classes (RoleBadge falls back gracefully for unknown roles). */
export const ROLE_META: Record<string, { label: string; badge: string }> = {
    admin: { label: 'Super Admin', badge: 'bg-purple-100 text-purple-800 ring-purple-700/20 dark:bg-purple-950 dark:text-purple-300' },
    records_admin: { label: 'Records Administrator', badge: 'bg-blue-100 text-blue-800 ring-blue-700/20 dark:bg-blue-950 dark:text-blue-300' },
    manager: { label: 'Records Administrator', badge: 'bg-blue-100 text-blue-800 ring-blue-700/20 dark:bg-blue-950 dark:text-blue-300' },
    department_officer: { label: 'Department Officer', badge: 'bg-emerald-100 text-emerald-800 ring-emerald-700/20 dark:bg-emerald-950 dark:text-emerald-300' },
    encoder: { label: 'Encoder', badge: 'bg-amber-100 text-amber-800 ring-amber-700/20 dark:bg-amber-950 dark:text-amber-300' },
    staff: { label: 'Encoder', badge: 'bg-amber-100 text-amber-800 ring-amber-700/20 dark:bg-amber-950 dark:text-amber-300' },
    viewer: { label: 'Viewer', badge: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300' },
};

// ── Records ─────────────────────────────────────────────────────────────────
export interface PaperDocument {
    id: number;
    tracking_no: string | null;
    reference_no: string;
    title: string;
    description: string | null;
    status: DocumentStatus;
    priority: Priority;
    classification: Classification;
    department: string | null;
    document_date: string | null;
    amount: number | null;
    prepared_by: string | null;
    tags: string[];
}

export interface PaperType {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string | null;
    is_active: boolean;
    documents_count: number;
}

export interface PaperTypeSummary {
    id: number;
    code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    documents_count: number;
}

export interface PaperGroup {
    category: string;
    sort: number;
    types: PaperTypeSummary[];
}

export interface DocumentSearchResult {
    id: number;
    tracking_no: string | null;
    reference_no: string;
    title: string;
    status: DocumentStatus;
    priority: Priority;
    classification: Classification;
    document_date: string | null;
    type_code: string | null;
    type_name: string | null;
}

export interface DashboardStats {
    documents: number;
    types: number;
    categories: number;
    departments: number;
    thisMonth: number;
    today: number;
    pending: number;
    forApproval: number;
    released: number;
    confidential: number;
    totalAmount: number;
}

export interface RecentDocument {
    id: number;
    tracking_no: string | null;
    reference_no: string;
    title: string;
    status: DocumentStatus;
    priority: Priority;
    document_date: string | null;
    type_code: string | null;
    department: string | null;
}

export interface Department {
    id: number;
    code: string;
    name: string;
}

export interface RecordRow {
    id: number;
    tracking_no: string | null;
    reference_no: string;
    title: string;
    type_code: string | null;
    type_name: string | null;
    department: string | null;
    status: DocumentStatus;
    priority: Priority;
    classification: Classification;
    document_date: string | null;
    created_by: string | null;
    created_at: string | null;
    trashed: boolean;
}

export interface RecordDetail {
    id: number;
    tracking_no: string | null;
    reference_no: string;
    title: string;
    description: string | null;
    document_type_id: number | null;
    type_code: string | null;
    type_name: string | null;
    department_id: number | null;
    department: string | null;
    department_head: string | null;
    status: DocumentStatus;
    priority: Priority;
    classification: Classification;
    document_date: string | null;
    amount: number | null;
    prepared_by: string | null;
    tags: string[];
    created_at: string | null;
    updated_at: string | null;
}

export interface TypeOption {
    id: number;
    code: string;
    name: string;
}

export interface RecordOptions {
    statuses: DocumentStatus[];
    priorities: Priority[];
    classifications: Classification[];
    departments: Department[];
    types: TypeOption[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}
