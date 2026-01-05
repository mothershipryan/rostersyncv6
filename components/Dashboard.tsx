
import React, { useState, useEffect } from 'react';
import type { ExtractionResult } from '../types';
import { extractRoster } from '../services/geminiService';
import CommandHub from './CommandHub';
import ExtractionAnimation from './ExtractionAnimation';
import { Icons } from './icons';
import Workspace from './Workspace';

interface DashboardProps {
    activeRoster: ExtractionResult | null;
    onSaveRoster: (rosterData: ExtractionResult) => void;
    onNewExtractionResult: (result: ExtractionResult | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ activeRoster, onSaveRoster, onNewExtractionResult }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [targetTeam, setTargetTeam] = useState<string>('');



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

                    {/* Quick Stats */}
                    <div className="flex items-center gap-3">
                        <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                                <Icons.Activity className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Status</p>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <p className="text-sm font-semibold text-white">Ready</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Command Hub */}
            <CommandHub onExtract={handleExtraction} isLoading={isLoading} />

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

                        {/* Feature Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                            <div className="badge badge-primary">
                                <Icons.CheckCircle className="w-3 h-3 mr-1.5" />
                                Multi-Source Verified
                            </div>
                            <div className="badge badge-success">
                                <Icons.Activity className="w-3 h-3 mr-1.5" />
                                Real-Time Data
                            </div>
                            <div className="badge badge-primary">
                                <Icons.Shield className="w-3 h-3 mr-1.5" />
                                Iconik Ready
                            </div>
                        </div>

                        {/* Sample Teams */}
                        <div className="mt-10">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Try these examples</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {['Liverpool FC', 'Dallas Cowboys', 'Los Angeles Lakers', 'New York Yankees'].map((team) => (
                                    <button
                                        key={team}
                                        onClick={() => handleExtraction(team)}
                                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300"
                                    >
                                        {team}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
