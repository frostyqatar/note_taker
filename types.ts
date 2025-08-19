
export type Note = {
    id: string;
    project_id: string;
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    title_lc: string;
    tags_flat: string;
};

export type Project = {
    id: string;
    name: string;
    emoji: string;
    color: ProjectColor;
    created_at: string;
    updated_at: string;
    sort_order: number;
    name_lc: string;
};

export type ProjectColor = 'violet' | 'emerald' | 'blue' | 'amber' | 'rose';

export type Theme = 'system' | 'light' | 'dark';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'updated_desc' | 'title_asc' | 'created_desc';

export interface ConfirmationModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}
