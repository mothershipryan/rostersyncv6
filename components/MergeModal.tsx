import React, { useState } from 'react';
import { Icons } from './icons';
import type { ExtractionResult, Player } from '../types';
import { extractRoster } from '../services/geminiService';
import LoadingIndicator from './LoadingIndicator';
import { LOADING_MESSAGES } from '../constants';

interface MergeModalProps {
    teamName: string;
    currentPlayers: Player[];
    onClose: () => void;
    onConfirmMerge: (newPlayers: Player[], newSources: string[], season: string) => void;
}

type MergeStep = 'input' | 'confirm' | 'error';

const MergeModal: React.FC<MergeModalProps> = ({ teamName, currentPlayers, onClose, onConfirmMerge }) => {
    const [season, setSeason] = useState('');
    const [step, setStep] = useState<MergeStep>('input');
    const [isSearching, setIsSearching] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
    const [selectedNewPlayers, setSelectedNewPlayers] = useState<Player[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleStartExtraction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!season.trim() || isSearching) return;

        setIsSearching(true);
        setErrorMessage('');
        setLoadingMessage("Searching historical archives...");

        try {
            const query = `${teamName} ${season.trim()}`;
            const result = await extractRoster(query);

            const newPlayers = result.players.filter(p =>
                !currentPlayers.some(cp => cp.name.toLowerCase() === p.name.toLowerCase())
            );

            setExtractedData(result);
            setSelectedNewPlayers(newPlayers);
            setStep('confirm');
        } catch (err: any) {
            const message = err.message || "Failed to extract historical data.";
            setErrorMessage(message);
            setStep('error');
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirm = () => {
        if (extractedData) {
            onConfirmMerge(selectedNewPlayers, extractedData.verifiedSources, season);
            onClose();
        }
    };

    const togglePlayer = (player: Player) => {
        setSelectedNewPlayers(prev =>
            prev.some(p => p.name === player.name) ? prev.filter(p => p.name !== player.name) : [...prev, player]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] animate-fade-in p-4" onClick={onClose}>
            <div
                className="glass-card rounded-3xl w-full max-w-xl overflow-hidden animate-scale-in relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -z-10"></div>

                {/* Loading Overlay */}
                {isSearching && (
                    <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-3xl">
                        <LoadingIndicator message={loadingMessage || LOADING_MESSAGES[0]} />
                    </div>
                )}

                {/* Input Step */}
                {step === 'input' && (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30"></div>
                                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Icons.Merge className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-display font-bold text-white">Merge Season</h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Enhance <span className="text-white font-medium">{teamName}</span> with historical data.
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                                <Icons.Close className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleStartExtraction} className="space-y-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Target Season / Year</label>
                                <div className="relative">
                                    <Icons.Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={season}
                                        onChange={(e) => setSeason(e.target.value)}
                                        placeholder="e.g. '2021-22' or '1998'"
                                        autoFocus
                                        disabled={isSearching}
                                        className="input-premium w-full pl-12"
                                    />
                                </div>
                                <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                                    Gemini will cross-reference historical archives to find players from this period that aren't currently in your list.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!season.trim() || isSearching}
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    <Icons.Search className="w-4 h-4" />
                                    Begin AI Search
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Confirm Step */}
                {step === 'confirm' && extractedData && (
                    <div className="flex flex-col h-[80vh] max-h-[600px]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-slate-800/80 to-slate-800/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Icons.CheckCircle className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-display font-bold text-white">Extraction Complete</h3>
                                    <p className="text-sm text-gray-400">
                                        Found <span className="text-white font-semibold">{selectedNewPlayers.length}</span> new identities for the <span className="text-cyan-400">{season}</span> season.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Player List */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {selectedNewPlayers.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Deduplicated Player Discoveries</p>
                                    {selectedNewPlayers.map((player, idx) => (
                                        <label
                                            key={idx}
                                            className="flex items-center gap-4 p-4 rounded-xl glass-subtle border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedNewPlayers.some(p => p.name === player.name)}
                                                onChange={() => togglePlayer(player)}
                                                className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                                            />
                                            <span className="text-gray-200 group-hover:text-white transition-colors flex-1 font-medium">{player.name}</span>
                                            <span className="text-[10px] font-mono text-gray-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                                                {player.position}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                        <Icons.Library className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No new players found for this season.</p>
                                    <p className="text-sm text-gray-500 mt-1">All players from this period are already in your roster.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setStep('input')}
                                className="flex-1 btn-secondary"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={selectedNewPlayers.length === 0}
                                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Icons.Merge className="w-4 h-4" />
                                Confirm & Merge
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Step */}
                {step === 'error' && (
                    <div className="p-8 text-center">
                        <div className="relative inline-flex mb-6">
                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-30"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Icons.Error className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">Extraction Failed</h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">{errorMessage}</p>
                        <button
                            onClick={() => setStep('input')}
                            className="w-full btn-secondary"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MergeModal;