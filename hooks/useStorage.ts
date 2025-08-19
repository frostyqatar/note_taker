
import { useState, useEffect, useCallback } from 'react';
import { Note, Project } from '../types';

interface AppData {
    notes: Note[];
    projects: Project[];
}

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        const request = indexedDB.open('cardforge-db', 2);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains('projects')) {
                tempDb.createObjectStore('projects', { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains('notes')) {
                tempDb.createObjectStore('notes', { keyPath: 'id' });
            }
        };
    });
};

const getStore = (storeName: 'notes' | 'projects', mode: IDBTransactionMode) => {
    if (!db) throw new Error("Database not initialized");
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
};

export const useStorage = () => {
    const [data, setData] = useState<AppData>({ notes: [], projects: [] });
    const [isReady, setIsReady] = useState(false);

    const loadData = useCallback(async () => {
        try {
            await initDB();
            const notesRequest = getStore('notes', 'readonly').getAll();
            const projectsRequest = getStore('projects', 'readonly').getAll();

            const notes = await new Promise<Note[]>((resolve, reject) => {
                notesRequest.onsuccess = () => resolve(notesRequest.result);
                notesRequest.onerror = () => reject(notesRequest.error);
            });
            const projects = await new Promise<Project[]>((resolve, reject) => {
                projectsRequest.onsuccess = () => resolve(projectsRequest.result);
                projectsRequest.onerror = () => reject(projectsRequest.error);
            });
            
            setData({ notes, projects });
        } catch (error) {
            console.warn('IndexedDB failed, falling back to localStorage:', error);
            const notes = JSON.parse(localStorage.getItem('cardforge:notes') || '[]');
            const projects = JSON.parse(localStorage.getItem('cardforge:projects') || '[]');
            setData({ notes, projects });
        } finally {
            setIsReady(true);
        }
    }, []);
    
    useEffect(() => {
        loadData();
    }, [loadData]);


    const saveData = useCallback(async (updates: Partial<AppData>) => {
        const newData = { ...data, ...updates };
        setData(newData);

        try {
            if (!db) await initDB();
            if (updates.notes) {
                const noteStore = getStore('notes', 'readwrite');
                noteStore.clear(); // Simple way to handle deletions
                updates.notes.forEach(note => noteStore.put(note));
            }
            if (updates.projects) {
                const projectStore = getStore('projects', 'readwrite');
                projectStore.clear();
                updates.projects.forEach(project => projectStore.put(project));
            }
        } catch (error) {
            console.warn('IndexedDB save failed, falling back to localStorage:', error);
            if(updates.notes) localStorage.setItem('cardforge:notes', JSON.stringify(updates.notes));
            if(updates.projects) localStorage.setItem('cardforge:projects', JSON.stringify(updates.projects));
        }
    }, [data]);

    return { data, saveData, isReady };
};
