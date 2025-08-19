
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Plus, FolderPlus, Upload, Download, Moon, Sun, Search } from './icons';
import { useToast } from '../context/ToastContext';
import { Note, Project } from '../types';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    const { addToast } = useToast();

    if (!context) return null;

    const {
        theme, setTheme,
        searchQuery, setSearchQuery,
        openNoteModal, openProjectModal, openExportModal,
        createNote, createProject, notes, projects,
    } = context;
    
    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : (theme === 'light' ? 'dark' : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark'));
        setTheme(newTheme);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                const data = JSON.parse(text as string);
                if (!data.projects || !data.notes) {
                    throw new Error('Invalid file format');
                }
                
                let importedProjects = 0;
                let importedNotes = 0;
                
                for (const projectToImport of data.projects as Project[]) {
                    if (!projects.some(p => p.name_lc === projectToImport.name_lc)) {
                        await createProject(projectToImport);
                        const newProject = projects.find(p => p.name_lc === projectToImport.name_lc)
                        const projectNotes = (data.notes as Note[]).filter(n => n.project_id === projectToImport.id);
                        for (const noteToImport of projectNotes) {
                           await createNote({...noteToImport, project_id: newProject?.id})
                           importedNotes++;
                        }
                        importedProjects++;
                    }
                }
                addToast(`Imported ${importedProjects} projects and ${importedNotes} notes`, 'success');
            } catch (error) {
                console.error('Import failed:', error);
                addToast('Import failed - invalid file format', 'error');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    return (
        <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="text-2xl">📝</div>
                        <h1 className="text-xl font-bold whitespace-nowrap">CardForge AI</h1>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"/>
                        <input 
                            type="text" 
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => openNoteModal(null)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity font-medium">
                        <Plus className="w-5 h-5"/> New Note
                    </button>
                    <button onClick={openProjectModal} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <FolderPlus className="w-5 h-5"/>
                    </button>
                     <button onClick={openExportModal} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Upload className="w-5 h-5"/>
                    </button>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Download className="w-5 h-5"/>
                        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                    </label>
                    <button onClick={handleThemeToggle} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        {theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
