
import React, { useContext, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import NoteEditorModal from './components/modals/NoteEditorModal';
import ProjectModal from './components/modals/ProjectModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import ExportModal from './components/modals/ExportModal';
import { AppContext } from './context/AppContext';
import QuickAddBar from './components/QuickAddBar';

const App: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("AppContext not found");
    }

    const { 
        theme, 
        isNoteModalOpen, 
        isProjectModalOpen, 
        isConfirmationModalOpen,
        isExportModalOpen 
    } = context;

    useEffect(() => {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.classList.toggle('dark', isDark);
    }, [theme]);
    
    return (
        <div className="h-full flex flex-col">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto relative">
                    <MainContent />
                    <QuickAddBar />
                </main>
            </div>

            {isNoteModalOpen && <NoteEditorModal />}
            {isProjectModalOpen && <ProjectModal />}
            {isConfirmationModalOpen && <ConfirmationModal />}
            {isExportModalOpen && <ExportModal />}
        </div>
    );
};

export default App;
