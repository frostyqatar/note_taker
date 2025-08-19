
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { AlertTriangle } from '../icons';

const ConfirmationModal: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { confirmationModalState, closeConfirmationModal } = context;
    const { isOpen, title, message, onConfirm } = confirmationModalState;

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        closeConfirmationModal();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={closeConfirmationModal}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="mt-0 text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">{title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        onClick={closeConfirmationModal}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
