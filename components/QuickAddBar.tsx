
import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const QuickAddBar: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const context = useContext(AppContext);

    if (!context) return null;
    const { createNote, currentProjectId, projects } = context;

    const handleAdd = async () => {
        if (!title.trim()) return;
        
        await createNote({
            title: title.trim(),
            content: content.trim(),
            project_id: currentProjectId || projects[0]?.id
        });
        setTitle('');
        setContent('');
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

     const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="fixed bottom-0 left-72 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                    <input 
                        type="text" 
                        placeholder="Quick note title... (Enter to save)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleTitleKeyDown}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                    />
                    <textarea 
                        rows={1}
                        placeholder="Description (optional, ⌘+Enter to save)..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleContentKeyDown}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40 resize-none"
                    />
                </div>
                <button 
                    onClick={handleAdd}
                    className="px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 font-medium self-end transition-opacity disabled:opacity-50"
                    disabled={!title.trim()}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default QuickAddBar;
