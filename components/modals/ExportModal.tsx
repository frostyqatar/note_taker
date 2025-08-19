
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { FileJson, FileText } from '../icons';

const ExportModal: React.FC = () => {
    const context = useContext(AppContext);
    const { addToast } = useToast();
    if (!context) return null;

    const { closeExportModal, notes, projects, currentProjectId } = context;
    const currentProject = projects.find(p => p.id === currentProjectId);

    const downloadFile = (filename: string, content: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportJson = () => {
        const date = new Date().toISOString().split('T')[0];
        if (currentProject) {
            const projectNotes = notes.filter(n => n.project_id === currentProject.id);
            const data = JSON.stringify({ project: currentProject, notes: projectNotes }, null, 2);
            downloadFile(`cardforge-export-${currentProject.name_lc}-${date}.json`, data, 'application/json');
            addToast(`Exported "${currentProject.name}" as JSON`, 'success');
        } else {
            const data = JSON.stringify({ projects, notes }, null, 2);
            downloadFile(`cardforge-export-all-${date}.json`, data, 'application/json');
            addToast('Exported all data as JSON', 'success');
        }
        closeExportModal();
    };

    const handleExportText = () => {
        const date = new Date().toISOString().split('T')[0];
        let textContent = '';
        let notesToExport = [];
        let filename = `cardforge-export-all-${date}.txt`;
        let title = "All Notes";

        if (currentProject) {
            notesToExport = notes.filter(n => n.project_id === currentProject.id);
            filename = `cardforge-export-${currentProject.name_lc}-${date}.txt`;
            title = currentProject.name;
        } else {
            notesToExport = [...notes].sort((a,b) => (projects.find(p=>p.id === a.project_id)?.name || '').localeCompare(projects.find(p=>p.id === b.project_id)?.name || ''));
        }

        textContent += `CardForge Notes Export - ${title}\n`;
        textContent += `Generated on: ${new Date().toLocaleString()}\n`;
        textContent += `Total Notes: ${notesToExport.length}\n\n`;
        textContent += "========================================\n\n";

        notesToExport.forEach((note, index) => {
            const project = projects.find(p => p.id === note.project_id);
            textContent += `${index + 1}. ${note.title}\n`;
            if (project) {
                textContent += `   Project: ${project.name}\n`;
            }
            if (note.tags.length > 0) {
                 textContent += `   Tags: ${note.tags.join(', ')}\n`;
            }
             textContent += `   Updated: ${new Date(note.updated_at).toLocaleString()}\n\n`;
            if (note.content) {
                textContent += `${note.content}\n\n`;
            }
            textContent += "----------------------------------------\n\n";
        });
        
        downloadFile(filename, textContent, 'text/plain');
        addToast(`Exported notes as text`, 'success');
        closeExportModal();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeExportModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm animate-slide-up" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Exporting: <span className="font-medium text-slate-700 dark:text-slate-300">{currentProject ? `Project "${currentProject.name}"` : 'All Notes & Projects'}</span>
                </p>
                <div className="space-y-3">
                    <button onClick={handleExportJson} className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <FileJson className="w-6 h-6 text-blue-500" />
                        <div>
                            <div className="font-medium">JSON Format</div>
                            <div className="text-sm text-slate-500">Backup projects and notes.</div>
                        </div>
                    </button>
                    <button onClick={handleExportText} className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-500" />
                        <div>
                            <div className="font-medium">Text Format</div>
                            <div className="text-sm text-slate-500">Readable plain text file.</div>
                        </div>
                    </button>
                </div>
                <button onClick={closeExportModal} className="mt-6 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            </div>
        </div>
    );
};

export default ExportModal;
