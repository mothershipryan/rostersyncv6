
import React, { useState, useEffect } from 'react';
import { Icons } from './icons';

interface ExtractionAnimationProps {
    teamName: string;
}

const STEPS = [
    { label: "Initializing Agent", icon: Icons.Loader, gradient: "from-gray-500 to-slate-600" },
    { label: "Grounding (Google Search)", icon: Icons.Globe, gradient: "from-blue-500 to-cyan-500" },
    { label: "Verifying Identities", icon: Icons.Shield, gradient: "from-emerald-500 to-teal-500" },
    { label: "Normalizing Data", icon: Icons.Database, gradient: "from-purple-500 to-pink-500" },
    { label: "Formatting JSON", icon: Icons.Paste, gradient: "from-amber-500 to-orange-500" },
];

const LOG_MESSAGES = [
    "Establishing secure connection to Gemini 1.5 Flash...",
    "Querying official league databases...",
    "Filtering coaching staff and non-active players...",
    "Cross-referencing roster against news sources...",
    "Applying Iconik metadata schema...",
    "Finalizing extraction payload..."
];

const ExtractionAnimation: React.FC<ExtractionAnimationProps> = ({ teamName }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const [codeLines, setCodeLines] = useState<string[]>([]);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
        }, 1200);

        return () => clearInterval(stepInterval);
    }, []);

    useEffect(() => {
        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < LOG_MESSAGES.length) {
                setLogs((prev) => [LOG_MESSAGES[logIndex], ...prev].slice(0, 5));
                logIndex++;
            }
        }, 800);

        return () => clearInterval(logInterval);
    }, []);

    useEffect(() => {
        const lines = [
            `{`,
            `  "target": "${teamName}",`,
            `  "status": "processing",`,
            `  "engine": "gemini-1.5-flash",`,
            `  "grounding": true,`,
            `  "sources_found": [`,
            `    "official_site",`,
            `    "league_db"`,
            `  ]`,
            `}`
        ];

        let lineIndex = 0;
        const codeInterval = setInterval(() => {
            if (lineIndex < lines.length) {
                setCodeLines(prev => [...prev, lines[lineIndex]]);
                lineIndex++;
            }
        }, 300);

        return () => clearInterval(codeInterval);
    }, [teamName]);

    return (
        <div className="w-full max-w-4xl mx-auto py-4 animate-scale-in">
            <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex flex-col md:flex-row min-h-[400px]">
                    {/* Left Sidebar - Steps */}
                    <div className="md:w-72 p-6 bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-b md:border-b-0 md:border-r border-white/5">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50"></div>
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Icons.Loader className="w-5 h-5 text-white animate-spin" />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Processing</p>
                                <p className="text-sm font-semibold text-white truncate max-w-[140px]">{teamName}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Extraction Pipeline</p>
                            {STEPS.map((step, index) => {
                                const isActive = index === currentStep;
                                const isCompleted = index < currentStep;

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${isActive
                                                ? 'bg-white/5 border border-white/10'
                                                : ''
                                            } ${index > currentStep ? 'opacity-40' : 'opacity-100'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted
                                                ? 'bg-emerald-500/20'
                                                : isActive
                                                    ? `bg-gradient-to-br ${step.gradient}`
                                                    : 'bg-white/5'
                                            }`}>
                                            {isCompleted ? (
                                                <Icons.CheckCircle className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <step.icon className={`w-4 h-4 ${isActive ? 'text-white animate-pulse' : 'text-gray-500'}`} />
                                            )}
                                        </div>
                                        <span className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-[#0d1117] relative">
                        {/* Background effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 blur-3xl rounded-full"></div>

                        {/* Top Status Bar */}
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-5 bg-slate-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <span className="text-[10px] font-mono text-gray-500">task_{Math.random().toString(36).substring(7)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">Live</span>
                            </div>
                        </div>

                        <div className="flex-1 p-6 font-mono text-xs overflow-hidden flex flex-col gap-6 relative z-10">
                            {/* Code View */}
                            <div className="glass-subtle rounded-xl p-4 min-h-[160px]">
                                <p className="text-[9px] text-gray-500 mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Icons.Copy className="w-3 h-3" />
                                    Live Data Stream
                                </p>
                                <div className="space-y-1">
                                    {codeLines.map((line, i) => (
                                        <div key={i} className="text-gray-300 animate-fade-in flex">
                                            <span className="text-gray-600 w-6 text-right mr-4 select-none">{i + 1}</span>
                                            <span className={
                                                line.includes('"target"') ? 'text-cyan-400' :
                                                    line.includes('"status"') ? 'text-amber-400' :
                                                        line.includes('"engine"') ? 'text-purple-400' :
                                                            line.includes('true') ? 'text-emerald-400' :
                                                                'text-gray-300'
                                            }>{line}</span>
                                        </div>
                                    ))}
                                    <div className="flex">
                                        <span className="w-6 mr-4"></span>
                                        <div className="w-2 h-4 bg-indigo-500 animate-pulse rounded-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Terminal Logs */}
                            <div className="flex-1">
                                <p className="text-[9px] text-gray-500 mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                                    <Icons.Activity className="w-3 h-3" />
                                    System Logs
                                </p>
                                <div className="space-y-2">
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex items-start gap-2 text-gray-400 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                                            <span className="text-cyan-400 mt-0.5">→</span>
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer text */}
            <div className="text-center mt-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                    <Icons.Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                    <p className="text-sm text-gray-400">
                        Extracting roster for <span className="text-white font-semibold">{teamName}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ExtractionAnimation;
