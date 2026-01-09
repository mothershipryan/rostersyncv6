
import React, { useState } from 'react';
import type { ExtractionResult } from '../types';
import { Icons } from './icons';
import { formatForIconik } from '../services/iconikFormatter';

interface WorkspaceProps {
    roster: ExtractionResult;
    onSave: (roster: ExtractionResult) => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ roster, onSave }) => {
    const [copied, setCopied] = useState(false);

    if (!roster) return null;

    const { rosterField, searchAliasesField } = formatForIconik(roster);
    const iconikPayload = searchAliasesField
        ? { rosterField, searchAliasesField }
        : { rosterField };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(iconikPayload, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    };

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Header Card */}
            <header className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyan-500 to-emerald-500 rounded-l-3xl"></div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 blur-3xl -z-10"></div>

                <div className="pl-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-success text-[9px] py-0.5">Draft Stage</span>
                        {roster.meta && (
                            <span className="badge badge-primary text-[9px] py-0.5">
                                {roster.meta.model}
                            </span>
                        )}
                    </div>
                    <h2 className="font-display text-2xl font-extrabold text-white tracking-tight">
                        {roster.teamName || 'Unknown Team'}
                    </h2>
                    <p className="text-gray-400 font-medium mt-1">
                        {roster.sport || 'Sports'} • <span className="text-cyan-400">{roster.players?.length || 0} Verified Identities</span>
                    </p>
                </div>

                <button
                    onClick={() => onSave(roster)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Icons.Save className="w-4 h-4" />
                    Save to Library
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Player List Card */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center justify-between px-5">
                            <div className="flex items-center gap-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="h-5 w-px bg-white/10"></div>
                                <div className="flex items-center gap-2.5">
                                    <Icons.Library className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs font-semibold text-gray-300 tracking-wide">Roster Preview</span>
                                </div>
                            </div>
                            <span className="badge badge-success text-[9px] py-0.5">{roster.players?.length || 0} Found</span>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto p-5 custom-scrollbar">
                            <ul className="space-y-2">
                                {roster.players?.map((player, i) => (
                                    <li
                                        key={i}
                                        className="text-sm p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all flex items-center gap-4 group"
                                    >
                                        <span className="text-xs font-mono font-bold text-cyan-500/50 w-6 text-right">{i + 1}</span>
                                        <span className="font-semibold text-gray-200 group-hover:text-white flex-1">{player.name}</span>
                                        <span className="text-[10px] font-mono text-gray-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">
                                            {player.position}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* JSON Payload Card */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center justify-between px-5">
                            <div className="flex items-center gap-4">
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                                </div>
                                <div className="h-5 w-px bg-white/10"></div>
                                <div className="flex items-center gap-2.5">
                                    <Icons.Copy className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-semibold text-gray-300 tracking-wide">Iconik JSON Schema</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white'
                                    }`}
                            >
                                {copied ? <Icons.Check className="w-3 h-3" /> : <Icons.Copy className="w-3 h-3" />}
                                {copied ? 'Copied!' : 'Copy JSON'}
                            </button>
                        </div>

                        <div className="overflow-auto max-h-[400px] custom-scrollbar bg-[#0d1117]">
                            <pre className="p-4 font-mono text-[10px] leading-relaxed">
                                <code className="text-emerald-400">
                                    {JSON.stringify(iconikPayload, null, 2)}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Metadata Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* AI Analysis Card */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="h-12 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center px-5 gap-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="h-5 w-px bg-white/10"></div>
                            <div className="flex items-center gap-2.5">
                                <Icons.Activity className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-semibold text-gray-300 tracking-wide">AI Analysis</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {roster.meta && (
                                <div className="grid grid-cols-2 gap-3 pb-6 border-b border-white/5">
                                    <div className="glass-subtle rounded-xl p-3">
                                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Tokens</p>
                                        <p className="text-xl font-mono text-emerald-400 font-bold">{roster.meta.totalTokens?.toLocaleString() || 0}</p>
                                    </div>
                                    <div className="glass-subtle rounded-xl p-3">
                                        <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Latency</p>
                                        <p className="text-xl font-mono text-blue-400 font-bold">{(roster.meta.latencyMs / 1000).toFixed(2)}s</p>
                                    </div>
                                    <div className="col-span-2 flex justify-between text-[10px] text-gray-500 font-mono px-1">
                                        <span>Prompt: {roster.meta.promptTokens || 0}</span>
                                        <span>Output: {roster.meta.candidatesTokens || 0}</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">AI Logic Context</p>
                                <p className="text-sm bg-slate-900/80 p-3 rounded-xl border border-white/5 italic text-gray-300 leading-relaxed">
                                    "{roster.verificationNotes || 'No notes available.'}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MAM Integration Card */}
                    <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Icons.Sync className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-sm font-semibold text-white">MAM Integration</h4>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-4">
                            This payload is structured for direct injection into Iconik metadata fields. No additional mapping required.
                        </p>
                        <a
                            href="https://app.iconik.io/docs/api.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full btn-secondary text-xs flex items-center justify-center gap-2"
                        >
                            Learn More
                            <Icons.ChevronRight className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Workspace;
