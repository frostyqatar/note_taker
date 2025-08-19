
import React, { useContext } from 'react';
import { Note } from '../types';
import { AppContext } from '../context/AppContext';
import { Pin, Trash2, Calendar } from './icons';

interface NoteCardProps {
    note: Note;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1 && now.getDate() === date.getDate()) return 'Today';
    if (diffDays <= 2 && (now.getDate() - 1) === date.getDate()) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays-1} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const truncateText = (text: string, maxLength = 100) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substr(0, maxLength) + '...';
};


const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { projects, openNoteModal, deleteNote, openConfirmationModal, viewMode } = context;
    const project = projects.find(p => p.id === note.project_id);

    const isDue = note.due_date && new Date(note.due_date) < new Date();
    const dueDateColor = isDue ? 'text-red-500' : 'text-amber-600 dark:text-amber-400';

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        openConfirmationModal({
            title: `Delete Note "${note.title}"?`,
            message: "This action cannot be undone.",
            onConfirm: () => deleteNote(note.id)
        });
    };
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', note.id);
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('dragging');
    };

    if (viewMode === 'list') {
        return (
            <div
                className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-sm transition-all cursor-pointer note-list-item"
                onClick={() => openNoteModal(note)}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex items-center gap-2 shrink-0">
                    {note.pinned && <Pin className="w-4 h-4 text-amber-500" />}
                    {project && <span className="text-lg">{project.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">{note.title}</h3>
                    {note.content && <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 truncate">{truncateText(note.content, 80)}</p>}
                </div>
                 <div className="flex-shrink-0 flex items-center gap-2">
                    {note.tags.length > 0 && note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{tag}</span>
                    ))}
                    {note.tags.length > 2 && <span className="text-xs text-slate-500">+${note.tags.length - 2}</span>}
                 </div>
                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500">
                    <span title={new Date(note.updated_at).toLocaleString()}>{formatDate(note.updated_at)}</span>
                    {note.due_date && <Calendar className={`w-4 h-4 ${dueDateColor}`} />}
                    <button onClick={handleDelete} className="delete-card opacity-0 group-hover:opacity-100 p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div
            className="group rounded-2xl border shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 cursor-pointer relative"
            onClick={() => openNoteModal(note)}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 flex-1 pr-2">{note.title}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                        {note.pinned && <Pin className="w-4 h-4 text-amber-500" />}
                        <button onClick={handleDelete} className="delete-card opacity-0 group-hover:opacity-100 p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-opacity">
                             <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {note.content && <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-3">{truncateText(note.content)}</p>}
                {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="rounded-full px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{tag}</span>
                        ))}
                        {note.tags.length > 3 && <span className="text-xs text-slate-500">+{note.tags.length - 3}</span>}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                        {project && <span className="text-lg shrink-0">{project.emoji}</span>}
                        <span className="truncate" title={new Date(note.updated_at).toLocaleString()}>{formatDate(note.updated_at)}</span>
                    </div>
                    {note.due_date && (
                        <div className={`flex items-center gap-1 text-xs ${dueDateColor} shrink-0`}>
                            <Calendar className="w-3 h-3"/>
                            <span>{formatDate(note.due_date)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
