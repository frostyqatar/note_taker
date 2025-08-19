
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { summarizeText, isGeminiConfigured } from '../../services/geminiService';
import { Trash2, Sparkles, Loader } from '../icons';

const NoteEditorModal: React.FC = () => {
    const context = useContext(AppContext);
    const { addToast } = useToast();
    
    if (!context) return null;

    const { currentNote, closeNoteModal, createNote, updateNote, deleteNote, openConfirmationModal } = context;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [pinned, setPinned] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        if (currentNote) {
            setTitle(currentNote.title);
            setContent(currentNote.content);
            setTags(currentNote.tags.join(', '));
            setDueDate(currentNote.due_date ? currentNote.due_date.split('T')[0] : '');
            setPinned(currentNote.pinned);
        } else {
            setTitle('');
            setContent('');
            setTags('');
            setDueDate('');
            setPinned(false);
        }
    }, [currentNote]);

    const handleSave = async () => {
        if (!title.trim()) {
            addToast('Please enter a title', 'error');
            return;
        }

        const noteData = {
            title: title.trim(),
            content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            due_date: dueDate || null,
            pinned
        };

        if (currentNote) {
            await updateNote(currentNote.id, noteData);
        } else {
            await createNote(noteData);
        }
        closeNoteModal();
    };

    const handleDelete = () => {
        if (currentNote) {
             openConfirmationModal({
                title: `Delete Note "${currentNote.title}"?`,
                message: "This action cannot be undone.",
                onConfirm: async () => {
                    await deleteNote(currentNote.id);
                    closeNoteModal();
                }
            });
        }
    };
    
    const handleSummarize = async () => {
        if (!content.trim()) {
            addToast('Cannot summarize empty content.', 'warning');
            return;
        }
        setIsSummarizing(true);
        try {
            const summary = await summarizeText(content);
            setContent(prev => `${prev}\n\n---\n✨ AI Summary:\n${summary}`);
            addToast('Summary generated!', 'success');
        } catch (error) {
            addToast((error as Error).message, 'error');
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeNoteModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold">{currentNote ? 'Edit Note' : 'New Note'}</h3>
                    <button onClick={closeNoteModal} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..."
                        className="w-full text-2xl font-bold border-none bg-transparent focus:outline-none placeholder:text-slate-400" />
                    <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} placeholder="Start writing..."
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-violet-400/40 bg-slate-50 dark:bg-slate-800/50 resize-none" />
                    <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
                    <div className="flex gap-4 items-center">
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="rounded" />
                            <span>Pin this note</span>
                        </label>
                    </div>
                </div>
                <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex gap-2">
                        {currentNote && <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"><Trash2 className="w-4 h-4"/> Delete</button>}
                         {isGeminiConfigured() && <button onClick={handleSummarize} disabled={isSummarizing} className="px-4 py-2 rounded-xl text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors flex items-center gap-2 disabled:opacity-50">
                            {isSummarizing ? <Loader className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                            {isSummarizing ? 'Summarizing...' : 'AI Summary'}
                         </button>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={closeNoteModal} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteEditorModal;
