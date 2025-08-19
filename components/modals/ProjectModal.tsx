
import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { PROJECT_COLORS } from '../../constants';
import { ProjectColor } from '../../types';

const ProjectModal: React.FC = () => {
    const context = useContext(AppContext);
    const { addToast } = useToast();
    
    if (!context) return null;
    const { closeProjectModal, createProject } = context;

    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('📁');
    const [color, setColor] = useState<ProjectColor>('violet');

    const handleSave = async () => {
        if (!name.trim()) {
            addToast('Please enter a project name', 'error');
            return;
        }
        await createProject({ name: name.trim(), emoji, color });
        closeProjectModal();
        setName('');
        setEmoji('📁');
        setColor('violet');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeProjectModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-semibold">New Project</h3>
                    <button onClick={closeProjectModal} className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Project name..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
                    <div className="flex gap-2">
                        <input type="text" value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="📁" maxLength={2}
                            className="w-16 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40" />
                        <select value={color} onChange={e => setColor(e.target.value as ProjectColor)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400/40">
                            {PROJECT_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-200 dark:border-slate-800">
                    <button onClick={closeProjectModal} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity">Create</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
