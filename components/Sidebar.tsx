import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Plus, Trash2 } from './icons';

const Sidebar: React.FC = () => {
    const context = useContext(AppContext);
    const { addToast } = useToast();
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    if (!context) return null;

    const {
        projects,
        notes,
        currentProjectId,
        setCurrentProjectId,
        deleteProject,
        openProjectModal,
        openConfirmationModal,
        updateNote
    } = context;
    
    const handleDeleteProject = (e: React.MouseEvent, project: typeof projects[0]) => {
        e.stopPropagation();
        openConfirmationModal({
            title: `Delete Project "${project.name}"?`,
            message: "This will also delete all notes within this project. This action cannot be undone.",
            onConfirm: () => deleteProject(project.id)
        });
    };

    const handleDragOver = (e: React.DragEvent, projectId: string | null) => {
        e.preventDefault();
        setDragOverId(projectId);
    };

    const handleDrop = async (e: React.DragEvent, projectId: string | null) => {
        e.preventDefault();
        setDragOverId(null);
        if (projectId === null) return;
        const noteId = e.dataTransfer.getData('text/plain');
        const note = notes.find(n => n.id === noteId);
        const project = projects.find(p => p.id === projectId);

        if (note && project && note.project_id !== projectId) {
            await updateNote(noteId, { project_id: projectId });
            addToast(`Moved "${note.title}" to ${project.name}`, 'success');
        }
    };
    
    return (
        <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 overflow-y-auto flex flex-col">
            <div className="p-4 flex-1">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-700 dark:text-slate-300">Projects</h2>
                    <button onClick={openProjectModal} className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200">
                        <Plus className="w-5 h-5"/>
                    </button>
                </div>
                <div className="space-y-1">
                     <div
                        onClick={() => setCurrentProjectId(null)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 ${!currentProjectId ? 'bg-slate-200 dark:bg-slate-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <span className="text-slate-600">📝</span>
                        <span className="flex-1 font-medium">All Notes</span>
                        <span className="text-sm text-slate-500">{notes.length}</span>
                    </div>

                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => setCurrentProjectId(project.id)}
                            onDragOver={(e) => handleDragOver(e, project.id)}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={(e) => handleDrop(e, project.id)}
                            className={`group flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 border-2 ${currentProjectId === project.id ? 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600' : `hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent`} ${dragOverId === project.id ? 'border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/50' : ''}`}
                        >
                            <span className="text-lg">{project.emoji}</span>
                            <span className="flex-1 font-medium truncate">{project.name}</span>
                            <span className="text-sm text-slate-500">{notes.filter(n => n.project_id === project.id).length}</span>
                            <button onClick={(e) => handleDeleteProject(e, project)} className="delete-project hidden group-hover:block p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20">
                                <Trash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 text-xs text-center text-slate-500">
                CardForge AI v1.0
            </div>
        </aside>
    );
};

export default Sidebar;