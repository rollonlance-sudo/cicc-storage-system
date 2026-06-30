export interface DocumentType {
    id: number;
    code: string;
    name: string;
    document_category_id: number | null;
    category: string | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
}

export interface DocumentCategory {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    types_count?: number;
}

export interface SetupStats {
    types: number;
    categories: number;
    archivedTypes: number;
    archivedCategories: number;
}

export interface TrashedDocumentType {
    id: number;
    code: string;
    name: string;
    category: string | null;
    is_active: boolean;
    deleted_at: string | null;
}

export interface TrashedDocumentCategory {
    id: number;
    name: string;
    description: string | null;
    deleted_at: string | null;
}
