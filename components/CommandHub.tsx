
import React, { useState } from 'react';
import { Icons } from './icons';

interface CommandHubProps {
    onExtract: (query: string) => void;
    isLoading: boolean;
}

const CommandHub: React.FC<CommandHubProps> = ({ onExtract, isLoading }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim() && !isLoading) {
            onExtract(query.trim());
        }
    };

    return (
        <div className="animate-slide-up stagger-1">
            <div className="glass-card rounded-3xl overflow-hidden hover-lift">
                {/* Card Header */}
                <div className="h-14 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center px-5 gap-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
                    </div>
                    <div className="h-5 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                            <Icons.Search className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-300 tracking-wide">Extraction Hub</span>
                        <span className="badge badge-primary text-[9px] py-0.5">AI-Powered</span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="relative">
                            {/* Animated glow effect */}
                            <div className={`absolute -inset-1 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur-lg transition-all duration-500 ${isFocused ? 'opacity-40' : 'opacity-0'}`}></div>

                            <div className="relative">
                                {/* Search icon with pulse */}
                                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                    <Icons.Search className={`w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-gray-500'}`} />
                                </div>

                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder="Enter team name to extract roster..."
                                    disabled={isLoading}
                                    autoFocus
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-14 pr-40 py-5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-300 placeholder-gray-500 text-white text-base font-medium"
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || !query.trim()}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-100 transition-all duration-300 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Icons.Loader className="w-4 h-4 animate-spin" />
                                            <span className="hidden sm:inline">Processing</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="hidden sm:inline">Extract Roster</span>
                                            <span className="sm:hidden">Extract</span>
                                            <Icons.ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Footer info */}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-emerald-400/80">
                                    <Icons.CheckCircle className="w-3.5 h-3.5" />
                                    <span className="font-medium">Gemini 1.5 Flash</span>
                                </div>
                                <span className="text-gray-600">•</span>
                                <span>Multi-source verification enabled</span>
                            </p>

                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                <span>Supports</span>
                                <span className="text-gray-400">NFL • NBA • MLB • NHL • MLS • EPL</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommandHub;
