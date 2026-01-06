
import React, { useState, useEffect } from 'react';
import type { ExtractionResult } from '../types';
import { extractRoster } from '../services/geminiService';
import CommandHub from './CommandHub';
import ExtractionAnimation from './ExtractionAnimation';
import { Icons } from './icons';
import Workspace from './Workspace';
import IconikImportModal from './IconikImportModal';
import type { Player } from '../types';

interface DashboardProps {
    activeRoster: ExtractionResult | null;
    onSaveRoster: (rosterData: ExtractionResult) => void;
    onNewExtractionResult: (result: ExtractionResult | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeRoster, onSaveRoster, onNewExtractionResult }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [targetTeam, setTargetTeam] = useState<string>('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);



    const handleExtraction = async (query: string) => {
        setIsLoading(true);
        setError(null);
        setTargetTeam(query);
        onNewExtractionResult(null);

        try {
            const result = await extractRoster(query);
            onNewExtractionResult(result);
        } catch (err: any) {
            const message = err.message || "An unknown error occurred.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportFromIconik = (importedPlayers: Player[], merge: boolean, teamName?: string) => {
        const name = teamName || "Imported Team";

        // Construct a pseudo-ExtractionResult
        const rosterResult: ExtractionResult = {
            teamName: name,
            sport: "Imported",
            players: importedPlayers,
            verifiedSources: [],
            verificationNotes: "Imported directly from Iconik metadata.",
            meta: {
                model: "Iconik",
                totalTokens: 0,
                promptTokens: 0,
                candidatesTokens: 0,
                latencyMs: 0
            }
        };

        // For dashboard flow, we don't save immediately, we just set it as active
        // But the user requested "read it and save".
        // In the App flow, `onNewExtractionResult` sets `activeRoster`.
        // Then the user clicks "Save" in Workspace. 
        // We can just set it as active so they can preview and save.

        onNewExtractionResult(rosterResult);
        setIsImportModalOpen(false);
    };

    return (
        <div className="animate-slide-up space-y-8">
            {/* Header Section */}
            <header className="relative">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-4xl font-bold text-white tracking-tight">
                            Dashboard
                        </h1>
                        <p className="mt-2 text-gray-400 text-base">
                            Extract and manage sports rosters with AI-powered precision
                        </p>
                    </div>


                </div>
            </header>

            {/* Command Hub */}
            <CommandHub onExtract={handleExtraction} isLoading={isLoading} onOpenImport={() => setIsImportModalOpen(true)} />

            {/* Loading State */}
            {isLoading && (
                <ExtractionAnimation teamName={targetTeam} />
            )}

            {/* Error State */}
            {error && (
                <div className="glass-card rounded-2xl p-6 border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent animate-scale-in">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/20">
                            <Icons.Error className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-300 text-lg">Extraction Failed</h3>
                            <p className="text-red-200/70 text-sm mt-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-4 text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                                <Icons.Close className="w-3 h-3" />
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Roster Workspace */}
            {activeRoster && !isLoading && (
                <Workspace roster={activeRoster} onSave={onSaveRoster} />
            )}

            {/* Empty State */}
            {!activeRoster && !isLoading && !error && (
                <div className="relative py-20 animate-slide-up">
                    {/* Background decoration */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-3xl"></div>
                    </div>

                    <div className="relative text-center">
                        {/* Icon */}
                        <div className="relative inline-flex mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 blur-2xl opacity-30 animate-pulse"></div>
                            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                                    <Icons.Search className="w-8 h-8 text-indigo-400" />
                                </div>
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="font-display text-3xl font-bold text-white mb-3">
                            RosterSync Engine Ready
                        </h2>
                        <p className="text-gray-400 max-w-md mx-auto text-base">
                            Enter any team name above to begin extracting player rosters using our AI-powered multi-source verification system.
                        </p>

                        {/* Search Tips */}
                        <div className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-gray-300 text-sm">
                                    <span className="font-bold text-indigo-400 mr-2">1. Be Specific:</span> "Lakers 2024"
                                </div>
                                <div className="hidden md:block w-px h-4 bg-white/10"></div>
                                <div className="text-gray-300 text-sm">
                                    <span className="font-bold text-indigo-400 mr-2">2. Use Official Names:</span> "Manchester United"
                                </div>
                                <div className="hidden md:block w-px h-4 bg-white/10"></div>
                                <div className="text-gray-300 text-sm">
                                    <span className="font-bold text-indigo-400 mr-2">3. Gender/Level:</span> "Duke Women's Soccer"
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
                            <div className="badge badge-primary px-4 py-2">
                                <Icons.Shield className="w-3.5 h-3.5 mr-2" />
                                Iconik Ready
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isImportModalOpen && (
                <IconikImportModal
                    onClose={() => setIsImportModalOpen(false)}
                    onImport={handleImportFromIconik}
                />
            )}
        </div>
    );
};

export default Dashboard;
