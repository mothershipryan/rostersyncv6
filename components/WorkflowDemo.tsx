import React, { useState, useEffect } from 'react';
import { Icons } from './icons';

const LIVERPOOL_PLAYERS = [
    { name: "Alisson Becker", position: "GK" },
    { name: "Trent Alexander-Arnold", position: "RB" },
    { name: "Virgil van Dijk", position: "CB" },
    { name: "Mohamed Salah", position: "RW" },
    { name: "Darwin Núñez", position: "ST" },
    { name: "Luis Díaz", position: "LW" },
    { name: "Alexis Mac Allister", position: "CM" },
    { name: "Dominik Szoboszlai", position: "CM" }
];

type WorkflowStep =
    | 'idle'
    | 'typing'
    | 'searching'
    | 'results'
    | 'viewing-players'
    | 'saving'
    | 'saved-confirmation'
    | 'syncing'
    | 'success';

const WorkflowDemo: React.FC = () => {
    const [step, setStep] = useState<WorkflowStep>('idle');
    const [typedText, setTypedText] = useState('');
    const [visiblePlayers, setVisiblePlayers] = useState(0);
    const targetText = "Liverpool FC";

    // Main workflow state machine
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        switch (step) {
            case 'idle':
                timeout = setTimeout(() => setStep('typing'), 1500);
                break;
            case 'typing':
                // Typing is handled by separate effect
                if (typedText === targetText) {
                    timeout = setTimeout(() => setStep('searching'), 800);
                }
                break;
            case 'searching':
                timeout = setTimeout(() => setStep('results'), 2500);
                break;
            case 'results':
                timeout = setTimeout(() => setStep('viewing-players'), 1000);
                break;
            case 'viewing-players':
                timeout = setTimeout(() => setStep('saving'), 3000);
                break;
            case 'saving':
                timeout = setTimeout(() => setStep('saved-confirmation'), 1500);
                break;
            case 'saved-confirmation':
                timeout = setTimeout(() => setStep('syncing'), 2000);
                break;
            case 'syncing':
                timeout = setTimeout(() => setStep('success'), 2500);
                break;
            case 'success':
                timeout = setTimeout(() => {
                    setTypedText('');
                    setVisiblePlayers(0);
                    setStep('idle');
                }, 4000);
                break;
        }

        return () => clearTimeout(timeout);
    }, [step, typedText]);

    // Typing animation
    useEffect(() => {
        if (step === 'typing' && typedText.length < targetText.length) {
            const timeout = setTimeout(() => {
                setTypedText(targetText.slice(0, typedText.length + 1));
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [step, typedText]);

    // Player reveal animation
    useEffect(() => {
        if (step === 'results' && visiblePlayers < LIVERPOOL_PLAYERS.length) {
            const timeout = setTimeout(() => {
                setVisiblePlayers(prev => prev + 1);
            }, 150);
            return () => clearTimeout(timeout);
        }
    }, [step, visiblePlayers]);

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Main Demo Container */}
            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                {/* App Header */}
                <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center px-5 gap-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="h-5 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                            <Icons.Search className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-300 tracking-wide">Dashboard</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="relative bg-slate-900/50 min-h-[500px]">
                    {/* Search Input Section */}
                    <div className={`p-6 transition-all duration-500 ${step === 'success' ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Icons.Search className={`w-4 h-4 transition-colors duration-300 ${step === 'typing' ? 'text-indigo-400' : 'text-gray-500'}`} />
                                </div>
                                <input
                                    type="text"
                                    value={typedText}
                                    readOnly
                                    placeholder="Enter team name to extract roster..."
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-12 pr-36 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all duration-300 placeholder-gray-500 text-white text-sm font-medium"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    {step === 'searching' ? (
                                        <Icons.Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                                    ) : (
                                        <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                                            <span className="hidden sm:inline">Extract Roster</span>
                                            <Icons.ChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extraction Loading State */}
                    {step === 'searching' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full"></div>
                                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center animate-bounce">
                                        <Icons.Search className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-white font-semibold mb-1">Extracting Liverpool FC Roster</p>
                                <p className="text-gray-400 text-sm">Multi-source verification in progress...</p>
                            </div>
                        </div>
                    )}

                    {/* Results View */}
                    {(step === 'results' || step === 'viewing-players' || step === 'saving' || step === 'saved-confirmation' || step === 'syncing') && (
                        <div className="p-6 animate-fade-in">
                            <div className="max-w-3xl mx-auto">
                                {/* Header with Save Button */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Liverpool FC</h2>
                                        <p className="text-gray-400 text-sm mt-1">Premier League • {visiblePlayers} players extracted</p>
                                    </div>
                                    <button
                                        className={`btn-primary px-5 py-2.5 flex items-center gap-2 transition-all duration-300 ${step === 'saving' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                                            }`}
                                    >
                                        {step === 'saving' ? (
                                            <>
                                                <Icons.Loader className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Save className="w-4 h-4" />
                                                <span>Save to Library</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Player List */}
                                <div className="glass-card rounded-2xl overflow-hidden">
                                    <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center justify-between px-5">
                                        <div className="flex items-center gap-2.5">
                                            <Icons.Library className="w-4 h-4 text-cyan-400" />
                                            <span className="text-xs font-semibold text-gray-300 tracking-wide">Roster Preview</span>
                                        </div>
                                        <span className="badge badge-success text-[9px] py-0.5">{visiblePlayers} Found</span>
                                    </div>
                                    <div className="p-5 space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                                        {LIVERPOOL_PLAYERS.slice(0, visiblePlayers).map((player, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all animate-slide-up"
                                                style={{ animationDelay: `${i * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-mono font-bold text-cyan-500/50 w-6 text-right">{i + 1}</span>
                                                    <span className="font-semibold text-gray-200">{player.name}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5">
                                                    {player.position}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Saved Confirmation Toast */}
                                {step === 'saved-confirmation' && (
                                    <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 animate-scale-in">
                                        <Icons.CheckCircle className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-emerald-300 font-semibold">Roster Saved Successfully!</p>
                                            <p className="text-emerald-400/70 text-xs mt-0.5">Ready to sync to Iconik</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Syncing to Iconik Animation */}
                    {step === 'syncing' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-fade-in">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="absolute inset-0 bg-purple-500/30 blur-3xl rounded-full"></div>
                                    <div className="relative glass-card rounded-2xl p-6">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto">
                                            <Icons.Share2 className="w-8 h-8 text-white animate-bounce" />
                                        </div>
                                        <p className="text-white font-bold mb-1">Syncing to Iconik</p>
                                        <p className="text-gray-400 text-sm mb-4">Uploading metadata field...</p>
                                        <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-gradient w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 animate-fade-in">
                            <div className="text-center animate-scale-in">
                                <div className="relative inline-block mb-6">
                                    <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full"></div>
                                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl">
                                        <Icons.CheckCircle className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2">Successfully Synced!</h3>
                                <p className="text-gray-300 mb-1">Liverpool FC roster is now in Iconik</p>
                                <p className="text-gray-500 text-sm">8 players • Ready for broadcast</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-4 flex justify-center gap-2">
                {['idle', 'typing', 'searching', 'results', 'viewing-players', 'saving', 'saved-confirmation', 'syncing', 'success'].map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-300 ${['idle', 'typing', 'searching', 'results', 'viewing-players', 'saving', 'saved-confirmation', 'syncing', 'success'].indexOf(step) >= i
                                ? 'w-8 bg-indigo-500'
                                : 'w-1.5 bg-gray-700'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkflowDemo;
