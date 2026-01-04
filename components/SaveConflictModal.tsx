import React from 'react';
import { Icons } from './icons';

interface SaveConflictModalProps {
    isOpen: boolean;
    rosterName: string;
    onClose: () => void;
    onMerge: () => void;
    onSaveNew: () => void;
}

const SaveConflictModal: React.FC<SaveConflictModalProps> = ({
    isOpen,
    rosterName,
    onClose,
    onMerge,
    onSaveNew
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] animate-fade-in p-4" onClick={onClose}>
            <div
                className="glass-card rounded-3xl w-full max-w-lg overflow-hidden animate-scale-in relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -z-10"></div>

                <div className="p-8">
                    <div className="text-center">
                        {/* Icon */}
                        <div className="relative inline-flex mb-6">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Icons.Library className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <h2 className="font-display text-2xl font-bold text-white">Save Conflict</h2>
                        <p className="text-gray-400 mt-3 text-sm">
                            A roster named <strong className="text-white font-semibold">"{rosterName}"</strong> already exists in your library.
                        </p>
                    </div>

                    {/* Action Options */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={onMerge}
                            className="group p-5 text-left glass-subtle rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover-lift"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <Icons.Merge className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h3 className="font-semibold text-white text-sm">Merge with Existing</h3>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                                Combines new and existing players, creating a master list. Ideal for updating a team with historical data.
                            </p>
                        </button>

                        <button
                            onClick={onSaveNew}
                            className="group p-5 text-left glass-subtle rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 hover-lift"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                    <Icons.Save className="w-5 h-5 text-cyan-400" />
                                </div>
                                <h3 className="font-semibold text-white text-sm">Save as New Copy</h3>
                            </div>
                            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                                Saves this extraction as a separate entry. Use this to track different versions or seasons.
                            </p>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 border-t border-white/5 p-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="btn-secondary text-sm py-2.5 px-5"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveConflictModal;
