import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Note, Project, Theme, ViewMode, SortBy, ConfirmationModalState } from '../types';
import { useStorage } from '../hooks/useStorage';
import { useToast } from './ToastContext';

type AppContextType = {
    notes: Note[];
    projects: Project[];
    currentProjectId: string | null;
    setCurrentProjectId: (id: string | null) => void;
    currentNote: Note | null;
    
    theme: Theme;
    setTheme: (theme: Theme) => void;
    viewMode: ViewMode;
    toggleViewMode: () => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    createNote: (data: Partial<Note>) => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    createProject: (data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;

    isNoteModalOpen: boolean;
    openNoteModal: (note?: Note | null) => void;
    closeNoteModal: () => void;

    isProjectModalOpen: boolean;
    openProjectModal: () => void;
    closeProjectModal: () => void;
    
    isConfirmationModalOpen: boolean;
    confirmationModalState: ConfirmationModalState;
    openConfirmationModal: (options: Omit<ConfirmationModalState, 'isOpen'>) => void;
    closeConfirmationModal: () => void;
    
    isExportModalOpen: boolean;
    openExportModal: () => void;
    closeExportModal: () => void;

    getFilteredNotes: () => Note[];
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => crypto.randomUUID();

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const { data, saveData, isReady } = useStorage();
    const { addToast } = useToast();

    const [notes, setNotes] = useState<Note[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(null);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);

    const [theme, setThemeState] = useState<Theme>('system');
    const [viewMode, setViewModeState] = useState<ViewMode>('grid');
    const [sortBy, setSortBy] = useState<SortBy>('updated_desc');
    const [searchQuery, setSearchQuery] = useState('');

    const [isNoteModalOpen, setNoteModalOpen] = useState(false);
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [confirmationModalState, setConfirmationModalState] = useState<ConfirmationModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        if (isReady) {
            setNotes(data.notes);
            setProjects(data.projects.sort((a, b) => a.sort_order - b.sort_order));
            
            const savedTheme = localStorage.getItem('cardforge:theme') as Theme || 'system';
            setThemeState(savedTheme);

            const savedViewMode = localStorage.getItem('cardforge:viewMode') as ViewMode || 'grid';
            setViewModeState(savedViewMode);

            const savedProjectId = localStorage.getItem('cardforge:currentProject');
            if (savedProjectId && data.projects.some(p => p.id === savedProjectId)) {
                setCurrentProjectIdState(savedProjectId);
            } else if (data.projects.length > 0) {
                 setCurrentProjectIdState(data.projects[0].id);
            }

            if (data.projects.length === 0) {
                createProject({
                    name: 'Personal',
                    emoji: '✨',
                    color: 'violet'
                });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReady, data.notes, data.projects]);


    const setCurrentProjectId = (id: string | null) => {
        setCurrentProjectIdState(id);
        if (id) {
            localStorage.setItem('cardforge:currentProject', id);
        } else {
            localStorage.removeItem('cardforge:currentProject');
        }
    };

    const setTheme = (theme: Theme) => {
        setThemeState(theme);
        localStorage.setItem('cardforge:theme', theme);
    };

    const toggleViewMode = () => {
        const newMode = viewMode === 'grid' ? 'list' : 'grid';
        setViewModeState(newMode);
        localStorage.setItem('cardforge:viewMode', newMode);
    };

    const createNote = async (data: Partial<Note>) => {
        const title = data.title || "Untitled Note";
        const newNote: Note = {
            id: generateId(),
            project_id: data.project_id || currentProjectId || projects[0]?.id,
            title,
            content: data.content || '',
            tags: data.tags || [],
            pinned: data.pinned || false,
            due_date: data.due_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            title_lc: title.toLowerCase(),
            tags_flat: (data.tags || []).join(' ').toLowerCase(),
        };
        const newNotes = [...notes, newNote];
        setNotes(newNotes);
        await saveData({ notes: newNotes });
        addToast(`Created "${title}"`, 'success');
    };

    const updateNote = async (id: string, updates: Partial<Note>) => {
        const newNotes = notes.map(note => {
            if (note.id === id) {
                return {
                    ...note,
                    ...updates,
                    updated_at: new Date().toISOString(),
                    title_lc: updates.title ? updates.title.toLowerCase() : note.title_lc,
                    tags_flat: updates.tags ? updates.tags.join(' ').toLowerCase() : note.tags_flat,
                };
            }
            return note;
        });
        setNotes(newNotes);
        await saveData({ notes: newNotes });
        addToast(`Updated "${updates.title || 'note'}"`, 'success');
    };

    const deleteNote = async (id: string) => {
        const noteToDelete = notes.find(n => n.id === id);
        if (!noteToDelete) return;
        const newNotes = notes.filter(note => note.id !== id);
        setNotes(newNotes);
        await saveData({ notes: newNotes });
        addToast(`Deleted "${noteToDelete.title}"`, 'success');
    };

    const createProject = async (data: Partial<Project>) => {
        const name = data.name || "Untitled Project";
        if (projects.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            addToast(`Project "${name}" already exists`, 'error');
            return;
        }
        const newProject: Project = {
            id: generateId(),
            name,
            emoji: data.emoji || '📁',
            color: data.color || 'violet',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sort_order: projects.length,
            name_lc: name.toLowerCase(),
        };
        const newProjects = [...projects, newProject];
        setProjects(newProjects);
        await saveData({ projects: newProjects });
        setCurrentProjectId(newProject.id); // switch to the new project
        addToast(`Created project "${name}"`, 'success');
    };

    const deleteProject = async (id: string) => {
        const projectToDelete = projects.find(p => p.id === id);
        if (!projectToDelete) return;

        const newNotes = notes.filter(note => note.project_id !== id);
        const newProjects = projects.filter(project => project.id !== id);
        
        setNotes(newNotes);
        setProjects(newProjects);
        
        await saveData({ notes: newNotes, projects: newProjects });

        if (currentProjectId === id) {
            setCurrentProjectId(newProjects[0]?.id || null);
        }
        addToast(`Deleted project "${projectToDelete.name}"`, 'success');
    };

    const getFilteredNotes = useCallback(() => {
        let filtered = [...notes];
        if (currentProjectId) {
            filtered = filtered.filter(note => note.project_id === currentProjectId);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(note => 
                note.title_lc.includes(query) ||
                note.content.toLowerCase().includes(query) ||
                note.tags_flat.includes(query)
            );
        }

        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;

            switch (sortBy) {
                case 'title_asc':
                    return a.title.localeCompare(b.title);
                case 'created_desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            }
        });
    }, [notes, currentProjectId, searchQuery, sortBy]);

    const openNoteModal = (note: Note | null = null) => {
        setCurrentNote(note);
        setNoteModalOpen(true);
    };
    const closeNoteModal = () => setNoteModalOpen(false);

    const openProjectModal = () => setProjectModalOpen(true);
    const closeProjectModal = () => setProjectModalOpen(false);
    
    const openExportModal = () => setExportModalOpen(true);
    const closeExportModal = () => setExportModalOpen(false);

    const openConfirmationModal = (options: Omit<ConfirmationModalState, 'isOpen'>) => {
        setConfirmationModalState({ ...options, isOpen: true });
    };
    const closeConfirmationModal = () => {
        setConfirmationModalState(prev => ({ ...prev, isOpen: false }));
    };

    const isConfirmationModalOpen = confirmationModalState.isOpen;

    const value: AppContextType = {
        notes, projects, currentProjectId, setCurrentProjectId, currentNote,
        theme, setTheme, viewMode, toggleViewMode, sortBy, setSortBy, searchQuery, setSearchQuery,
        createNote, updateNote, deleteNote, createProject, deleteProject,
        isNoteModalOpen, openNoteModal, closeNoteModal,
        isProjectModalOpen, openProjectModal, closeProjectModal,
        isConfirmationModalOpen, confirmationModalState, openConfirmationModal, closeConfirmationModal,
        isExportModalOpen, openExportModal, closeExportModal,
        getFilteredNotes
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};