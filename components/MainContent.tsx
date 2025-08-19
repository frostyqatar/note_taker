
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import NoteCard from './NoteCard';
import { PROJECT_COLOR_STYLES } from '../constants';
import { Grid, List, Plus } from './icons';

const MainContent: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) return null;

    const {
        getFilteredNotes,
        projects,
        currentProjectId,
        sortBy, setSortBy,
        viewMode, toggleViewMode,
        openNoteModal
    } = context;

    const filteredNotes = getFilteredNotes();
    const currentProject = projects.find(p => p.id === currentProjectId);

    const projectChipClasses = currentProject ? `${PROJECT_COLOR_STYLES[currentProject.color].chip} ${PROJECT_COLOR_STYLES[currentProject.color].text}` : '';

    return (
        <div className="p-6 pb-40"> {/* Increased padding-bottom */}
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    {currentProject && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${projectChipClasses}`}>
                            <span>{currentProject.emoji}</span>
                            <span>{currentProject.name}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                     <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                    >
                        <option value="updated_desc">Recently updated</option>
                        <option value="created_desc">Recently created</option>
                        <option value="title_asc">Title A-Z</option>
                    </select>
                    <button onClick={toggleViewMode} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        {viewMode === 'grid' ? <List className="w-5 h-5"/> : <Grid className="w-5 h-5"/>}
                    </button>
                </div>
            </div>

            {/* Notes Container */}
            {filteredNotes.length > 0 ? (
                <div className={viewMode === 'grid' 
                    ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4' 
                    : 'space-y-3'}>
                    {filteredNotes.map(note => <NoteCard key={note.id} note={note} />)}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first note to get started</p>
                    <button onClick={() => openNoteModal(null)} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition-opacity">
                        <Plus className="w-5 h-5"/> Create first note
                    </button>
                </div>
            )}
        </div>
    );
};

export default MainContent;
