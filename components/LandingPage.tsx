
import React, { useState, useEffect } from 'react';
import { Icons } from './icons';
import DemoRequestModal from './DemoRequestModal';
import SupportModal from './SupportModal';
import WorkflowDemo from './WorkflowDemo';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
}

const FAQ_DATA = [
    {
        question: "How accurate is the roster extraction?",
        answer: "We use a multi-source verification engine powered by Gemini 1.5 Flash. It cross-references official league websites, team pages, and reputable sports databases to ensure near-100% accuracy, automatically filtering out loans and transfers."
    },
    {
        question: "Does this integrate directly with Iconik?",
        answer: "Yes! RosterSync is purpose-built for Iconik MAM. You can export metadata directly to your Iconik instance via API, or copy-paste the pre-formatted JSON schema into your metadata field settings."
    },
    {
        question: "What security protocols are in place?",
        answer: "We utilize a Zero-Knowledge security model with Client-Side AES-256 Encryption. Your Iconik credentials are encrypted locally in your browser using a unique key that only exists on your device before being synced to the cloud. We cannot access or decrypt your sensitive tokens."
    },
    {
        question: "What happens if I clear my browser cache?",
        answer: "Because your unique encryption key is stored locally to ensure we never have access to it, clearing your browser storage will remove this key. Your saved rosters remain safe in the cloud, but you will need to re-enter your Iconik Application ID and Auth Token in the Settings tab to reconnect the integration."
    },
    {
        question: "What sports and leagues are supported?",
        answer: "We support all major professional leagues (NFL, NBA, EPL, MLS, MLB, NHL) as well as collegiate sports (NCAA), semi-pro leagues, and international federations."
    },
    {
        question: "Can I manage multiple team rosters?",
        answer: "Absolutely. The Pro plan allows for unlimited roster management. You can save, update, and track changes for as many teams as you need in your personal library."
    },
    {
        question: "Can I export to CSV or Excel?",
        answer: "Yes, every roster can be instantly exported as a clean CSV file, ready for use in spreadsheets or other broadcast character generator systems."
    },
    {
        question: "Can I manually edit or merge player lists?",
        answer: "Yes. You have full control to manually add missing players, edit names for consistency, or merge data from multiple seasons before saving the final roster to your library."
    }
];

const ANIMATION_EXAMPLES = [
    {
        team: "Liverpool FC",
        players: ["Mohamed Salah", "Virgil van Dijk", "Alisson Becker", "Trent Alexander-Arnold"]
    },
    {
        team: "San Francisco 49ers",
        players: ["Brock Purdy", "Christian McCaffrey", "Nick Bosa", "Deebo Samuel"]
    },
    {
        team: "Los Angeles Dodgers",
        players: ["Shohei Ohtani", "Mookie Betts", "Freddie Freeman", "Clayton Kershaw"]
    }
];

const AnimatedFlowCard = () => {
    const [step, setStep] = useState(0);
    const [typedQuery, setTypedQuery] = useState('');
    const [exampleIndex, setExampleIndex] = useState(0);

    const currentExample = ANIMATION_EXAMPLES[exampleIndex];

    useEffect(() => {
        let timeout: any;

        switch (step) {
            case 0:
                timeout = setTimeout(() => setStep(1), 1000);
                break;
            case 1:
                timeout = setTimeout(() => setStep(2), 1500);
                break;
            case 2:
                timeout = setTimeout(() => setStep(3), 2000);
                break;
            case 3:
                timeout = setTimeout(() => setStep(4), 3000);
                break;
            case 4:
                timeout = setTimeout(() => setStep(5), 2500);
                break;
            case 5:
                timeout = setTimeout(() => setStep(6), 2500);
                break;
            case 6:
                timeout = setTimeout(() => {
                    setTypedQuery('');
                    setStep(0);
                    setExampleIndex((prev) => (prev + 1) % ANIMATION_EXAMPLES.length);
                }, 7000);
                break;
        }

        return () => clearTimeout(timeout);
    }, [step]);

    useEffect(() => {
        if (step === 1 && typedQuery.length < currentExample.team.length) {
            const timeout = setTimeout(() => {
                setTypedQuery(currentExample.team.slice(0, typedQuery.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [step, typedQuery, currentExample.team]);

    return (
        <div className="relative h-[380px] w-full glass-card rounded-3xl flex flex-col overflow-hidden transition-all duration-700 text-sm group">
            {/* Window Header */}
            <div className={`h-12 border-b transition-all duration-700 flex items-center px-5 justify-between z-10 ${step >= 6 ? 'opacity-0 h-0 border-none' : 'bg-slate-800/80 border-white/5 opacity-100'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold">RosterSync</span>
                </div>
            </div>

            <div className="relative flex-1">
                {/* Search & Results View */}
                <div className={`absolute inset-0 p-6 transition-all duration-700 transform ${step >= 4 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                    <div className="relative mb-5">
                        <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={typedQuery}
                            readOnly
                            placeholder="Search team..."
                            className="w-full text-sm bg-slate-900/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 placeholder-gray-600 text-white focus:outline-none"
                        />
                        {step === 2 && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <Icons.Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className={`space-y-2 transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-3 uppercase font-semibold tracking-wider">
                            <span>Extracted Roster</span>
                            <span className="text-cyan-400">{currentExample.players.length} Found</span>
                        </div>
                        {currentExample.players.map((player, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                                <span className="text-sm font-medium text-gray-200">{player}</span>
                                <Icons.CheckCircle className="w-4 h-4 text-emerald-400/70" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* JSON Payload View */}
                <div className={`absolute inset-0 p-6 bg-slate-900 transition-all duration-500 transform ${step === 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono text-gray-500">payload.json</span>
                        <span className="badge badge-success text-[9px] py-0.5">Ready to Sync</span>
                    </div>
                    <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5 h-full font-mono text-[11px] leading-relaxed text-gray-300 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117] z-10"></div>
                        <span className="text-purple-400">{"{"}</span><br />
                        &nbsp;&nbsp;<span className="text-blue-400">"name"</span>: <span className="text-orange-400">"{currentExample.team.toLowerCase().replace(/\s+/g, '-')}"</span>,<br />
                        &nbsp;&nbsp;<span className="text-blue-400">"options"</span>: <span className="text-purple-400">{"["}</span><br />
                        {currentExample.players.map((p, i) => (
                            <div key={i}>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">{"{"}</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"label"</span>: <span className="text-green-400">"{p}"</span>,<br />
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">"value"</span>: <span className="text-green-400">"{p}"</span><br />
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">{"}"}</span>{i < currentExample.players.length - 1 ? ',' : ''}
                            </div>
                        ))}
                        &nbsp;&nbsp;<span className="text-purple-400">{"]"}</span><br />
                        <span className="text-purple-400">{"}"}</span>
                    </div>
                </div>

                {/* Syncing Animation */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${step === 5 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full"></div>
                        <div className="relative glass-card rounded-3xl p-6 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <Icons.Share2 className="w-6 h-6 text-white animate-bounce" />
                            </div>
                            <span className="text-sm font-semibold text-white">Syncing to Iconik API</span>
                            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-gradient w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Iconik Success View */}
                <div className={`absolute inset-0 bg-[#282c34] transition-all duration-700 transform flex flex-col ${step >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                    {/* Iconik Header Bar - Green */}
                    <div className="h-10 bg-[#45a049] flex items-center px-3 justify-between flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                                <Icons.ChevronDown className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="font-medium text-white text-xs">{currentExample.team.toLowerCase().replace(/\s+/g, '-')}</span>
                        </div>
                        <Icons.Close className="w-4 h-4 text-white/80 hover:text-white cursor-pointer" />
                    </div>

                    {/* Iconik Form Content */}
                    <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto custom-scrollbar bg-[#282c34]">
                        {/* Label Field */}
                        <div className="flex items-center">
                            <label className="w-16 text-[10px] text-gray-400 text-right mr-3 flex-shrink-0">Label *</label>
                            <div className="flex-1 bg-[#1e2329] text-gray-200 text-[11px] px-3 py-2 rounded border border-white/10 font-medium">
                                {currentExample.team}
                            </div>
                        </div>

                        {/* Multiselect Toggle */}
                        <div className="flex items-center">
                            <label className="w-16 text-[10px] text-gray-400 text-right mr-3 flex-shrink-0">Multiselect</label>
                            <div className="w-9 h-5 bg-[#45a049] rounded-full relative cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow"></div>
                            </div>
                        </div>

                        {/* Options Field */}
                        <div className="flex items-start">
                            <label className="w-16 text-[10px] text-gray-400 text-right mr-3 flex-shrink-0 mt-1">Options</label>
                            <div className="flex-1 space-y-2">
                                {/* Player options - each row has player in both columns */}
                                <div className="space-y-0.5">
                                    {currentExample.players.map((player, i) => (
                                        <div key={i} className="grid grid-cols-2 gap-x-2 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                            {/* Left column */}
                                            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Icons.Menu className="w-3 h-3 text-gray-500 flex-shrink-0" />
                                                    <span className="text-[11px] text-gray-300 truncate">{player}</span>
                                                </div>
                                            </div>
                                            {/* Right column */}
                                            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                                <span className="text-[11px] text-gray-300 truncate">{player}</span>
                                                <Icons.Close className="w-3 h-3 text-red-400 flex-shrink-0 cursor-pointer hover:text-red-300" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action buttons row */}
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/20 text-gray-300 text-[10px] font-medium hover:bg-white/5 transition-colors">
                                            <Icons.New className="w-3 h-3" />
                                            ADD
                                        </button>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/20 text-gray-300 text-[10px] font-medium hover:bg-white/5 transition-colors">
                                            <Icons.Sort className="w-3 h-3" />
                                            ABC
                                        </button>
                                    </div>
                                    <span className="text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer">SHOW ALL</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="flex items-center pt-1">
                            <label className="w-16 text-[10px] text-gray-400 text-right mr-3 flex-shrink-0">Description</label>
                            <div className="flex-1 bg-[#1e2329] text-gray-400 text-[11px] px-3 py-2 rounded border border-white/10">
                                Imported via RosterSync from web search
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/5 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-5 text-left focus:outline-none group"
            >
                <span className="text-base font-medium text-gray-200 group-hover:text-white transition-colors pr-4">
                    {question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transform transition-all duration-300 group-hover:bg-white/10 ${isOpen ? 'rotate-180 bg-indigo-500/20' : ''}`}>
                    <Icons.ChevronDown className={`w-4 h-4 ${isOpen ? 'text-indigo-400' : 'text-gray-500'}`} />
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <p className="text-gray-400 text-sm leading-relaxed pl-0">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick }) => {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    return (
        <div className="bg-slate-950 min-h-screen text-white overflow-x-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

                {/* Orbs */}
                <div className="orb orb-indigo w-[800px] h-[800px] -top-[300px] -left-[200px] animate-float"></div>
                <div className="orb orb-purple w-[600px] h-[600px] top-[20%] right-[-200px] animate-float" style={{ animationDelay: '-2s' }}></div>
                <div className="orb orb-cyan w-[500px] h-[500px] bottom-[-150px] left-[20%] animate-float" style={{ animationDelay: '-4s' }}></div>

                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-20"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 p-5 flex justify-between items-center z-50 glass-subtle">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                        <Icons.Library className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-display font-bold gradient-text">RosterSync</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onLoginClick} className="btn-ghost text-sm">
                        Login
                    </button>
                    <button onClick={onSignUpClick} className="btn-primary text-sm py-2 px-4">
                        Sign Up Free
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-6 pt-32 pb-24 relative">
                {/* Hero Section */}
                <div className="text-center animate-slide-up">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                        <span className="text-xs font-medium text-cyan-400">Powered by Gemini 1.5 Flash</span>
                    </div>

                    {/* Headline */}
                    <h2 className="font-display text-4xl md:text-6xl font-extrabold max-w-4xl mx-auto leading-tight">
                        <span className="gradient-text animate-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Sync sports rosters
                        </span>
                        <br />
                        <span className="text-white">to Iconik, instantly.</span>
                    </h2>

                    <p className="max-w-2xl mx-auto mt-4 text-base text-gray-400 leading-relaxed">
                        Leverage Google's Gemini to extract, normalize, and format high-fidelity athlete data from the web, directly into your MAM. Eliminate manual data entry, ensure broadcast-level accuracy with multi-source verification, and sync production-ready metadata in seconds.
                    </p>

                    {/* Demo Card */}
                    <div className="mt-10 w-full flex justify-center animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <WorkflowDemo />
                    </div>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                        <button onClick={onSignUpClick} className="btn-primary text-sm py-2.5 px-6 flex items-center justify-center gap-2">
                            Get Started Free
                            <Icons.ChevronRight className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsDemoModalOpen(true)} className="btn-secondary text-sm py-2.5 px-6 flex items-center justify-center gap-2">
                            <Icons.Calendar className="w-4 h-4 text-gray-400" />
                            Book Demo
                        </button>
                    </div>
                </div>

                {/* Pricing Section */}
                <section className="mt-32 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <div className="text-center mb-12">
                        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                            Simple, Transparent Pricing
                        </h3>
                        <p className="text-gray-400 text-base max-w-2xl mx-auto">
                            Choose the plan that fits your workflow. Cancel anytime, no questions asked.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        {/* Starter */}
                        <div className="glass-card rounded-3xl p-8 h-full flex flex-col hover-lift">
                            <h4 className="font-display text-xl font-bold text-white">Starter</h4>
                            <p className="text-gray-400 mt-2 text-sm">For individuals and hobbyists starting out.</p>
                            <p className="font-display text-5xl font-extrabold mt-6 text-white">
                                $0<span className="text-lg font-medium text-gray-500">/mo</span>
                            </p>
                            <ul className="space-y-4 mt-8 text-gray-300 text-sm flex-1">
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> 5 Extractions per month</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Save up to 3 Rosters</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> CSV Export</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Standard Support</li>
                            </ul>
                            <button onClick={onSignUpClick} className="w-full mt-8 btn-secondary">
                                Get Started Free
                            </button>
                        </div>

                        {/* Pro - Featured */}
                        <div className="glass-card rounded-3xl p-8 h-full flex flex-col border-indigo-500/30 shadow-glow-indigo relative lg:-translate-y-4">
                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                <span className="badge badge-primary text-[10px] py-1 px-4">Most Popular</span>
                            </div>
                            <h4 className="font-display text-xl font-bold text-white">Pro</h4>
                            <p className="text-gray-400 mt-2 text-sm">For professionals managing multiple projects.</p>
                            <p className="font-display text-5xl font-extrabold mt-6 text-white">
                                $29<span className="text-lg font-medium text-gray-500">/mo</span>
                            </p>
                            <ul className="space-y-4 mt-8 text-gray-300 text-sm flex-1">
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-indigo-400" /> Unlimited Extractions</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-indigo-400" /> Unlimited Saved Rosters</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-indigo-400" /> Iconik JSON Export</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-indigo-400" /> Merge Historical Seasons</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-indigo-400" /> Priority Support</li>
                            </ul>
                            <button onClick={onSignUpClick} className="w-full mt-8 btn-primary">
                                Go Pro
                            </button>
                        </div>

                        {/* Enterprise */}
                        <div className="glass-card rounded-3xl p-8 h-full flex flex-col hover-lift">
                            <h4 className="font-display text-xl font-bold text-white">Enterprise</h4>
                            <p className="text-gray-400 mt-2 text-sm">For large organizations with advanced needs.</p>
                            <p className="font-display text-5xl font-extrabold mt-6 text-white">Custom</p>
                            <ul className="space-y-4 mt-8 text-gray-300 text-sm flex-1">
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Everything in Pro, plus:</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Direct Iconik API Sync</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Custom Integrations</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> SAML/SSO Login</li>
                                <li className="flex items-center gap-3"><Icons.CheckCircle className="w-5 h-5 text-cyan-400" /> Dedicated Account Manager</li>
                            </ul>
                            <button onClick={() => setIsDemoModalOpen(true)} className="w-full mt-8 btn-secondary">
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mt-32 max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                            Frequently Asked Questions
                        </h3>
                        <p className="text-gray-400 text-base">
                            Everything you need to know about the product and workflow.
                        </p>
                    </div>

                    <div className="glass-card rounded-3xl p-6 sm:p-8">
                        {FAQ_DATA.map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-gray-400 mb-4 text-sm">Still have questions? We're here to help.</p>
                        <button onClick={() => setIsSupportModalOpen(true)} className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold group text-sm">
                            Contact Support
                            <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm py-12">
                <div className="container mx-auto px-6 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Icons.Library className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-display font-bold text-white">RosterSync</h1>
                    </div>

                    <div className="flex items-center gap-6 mb-8">
                        <a href="https://x.com/rostersync" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            <Icons.Close className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="TikTok" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            <Icons.TikTok className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            <Icons.Linkedin className="w-4 h-4" />
                        </a>
                    </div>

                    <p className="text-sm text-gray-500">© 2026 RosterSync. Powered by Google Gemini. Optimized for Iconik MAM.</p>
                </div>
            </footer>

            {isDemoModalOpen && <DemoRequestModal onClose={() => setIsDemoModalOpen(false)} />}
            {isSupportModalOpen && <SupportModal onClose={() => setIsSupportModalOpen(false)} />}
        </div>
    );
};

export default LandingPage;
