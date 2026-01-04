
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Icons } from './icons';

interface WorkflowVideoModalProps {
    onClose: () => void;
}

const WorkflowVideoModal: React.FC<WorkflowVideoModalProps> = ({ onClose }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'authorizing' | 'generating' | 'polling' | 'ready' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [progress, setProgress] = useState(0);

    const generateTour = async () => {
        setStatus('authorizing');
        setErrorMessage('');
        setProgress(5);

        try {
            // 1. Check for API Key selection (Mandatory for Veo)
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                // Proceed assuming selection was successful (mitigating race condition)
            }

            setStatus('generating');
            
            // Create a fresh instance right before the call as per guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = "A professional 30-second screen-recording style product demonstration video for RosterSync. " +
                           "Start with a high-end dark-themed dashboard. A user types 'San Francisco 49ers' into a glowing purple search bar. " +
                           "Transition to a technical 'AI Extraction' screen with code lines scrolling and emerald progress bars. " +
                           "End with a beautifully formatted roster of players and a 'Sync to Iconik' button being clicked with a checkmark success. " +
                           "Aesthetic: Sleek, high-contrast, sports broadcast style, purple and emerald accent colors.";

            let operation;
            try {
                operation = await ai.models.generateVideos({
                    model: 'veo-3.1-fast-generate-preview',
                    prompt: prompt,
                    config: {
                        numberOfVideos: 1,
                        resolution: '1080p',
                        aspectRatio: '16:9'
                    }
                });
            } catch (initError: any) {
                // If initial call fails with 404, the key probably doesn't have Veo access
                if (initError.message?.includes("Requested entity was not found") || initError.status === 404) {
                    await (window as any).aistudio.openSelectKey();
                    throw new Error("Veo requires a paid GCP project. Please ensure your selected API key belongs to a project with billing enabled.");
                }
                throw initError;
            }

            setStatus('polling');
            let pollCount = 0;
            
            while (!operation.done) {
                pollCount++;
                setProgress(Math.min(95, 10 + (pollCount * 3))); // Smooth progress simulation
                
                // Wait 10 seconds between polls
                await new Promise(resolve => setTimeout(resolve, 10000));
                
                try {
                    // Create a fresh instance for polling too, ensuring key stability
                    const pollAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    operation = await pollAi.operations.getVideosOperation({ operation: operation });
                } catch (pollError: any) {
                    if (pollError.message?.includes("Requested entity was not found") || pollError.status === 404) {
                        setStatus('error');
                        setErrorMessage("API Key session lost or project not found. Please re-select your paid GCP project key.");
                        await (window as any).aistudio.openSelectKey();
                        return;
                    }
                    throw pollError;
                }
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (!downloadLink) throw new Error("Video generation completed but no asset URI was returned.");

            // Fetch the MP4 bytes using the key as a query parameter
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            if (!videoResponse.ok) throw new Error("Failed to download generated video asset.");
            
            const blob = await videoResponse.blob();
            const url = URL.createObjectURL(blob);
            
            setVideoUrl(url);
            setStatus('ready');
            setProgress(100);

        } catch (err: any) {
            console.error("Video generation failed:", err);
            setStatus('error');
            setErrorMessage(err.message || "An unexpected error occurred during AI video generation.");
        }
    };

    useEffect(() => {
        generateTour();
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] animate-fade-in p-4" onClick={onClose}>
            <div 
                className="w-full max-w-5xl aspect-video bg-slate-900 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-20 bg-black/50 hover:bg-black text-white p-2 rounded-full transition-all"
                >
                    <Icons.Close className="w-6 h-6" />
                </button>

                {status === 'ready' && videoUrl ? (
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain animate-fade-in bg-black"
                    />
                ) : status === 'error' ? (
                    <div className="text-center p-8 max-w-md animate-fade-in">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <Icons.Error className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white mb-2">Generation Failed</h2>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            {errorMessage}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={generateTour} 
                                className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-glow-primary"
                            >
                                Retry with New Key
                            </button>
                            <a 
                                href="https://ai.google.dev/gemini-api/docs/billing" 
                                target="_blank" 
                                className="text-xs text-gray-500 hover:text-white underline"
                            >
                                View billing requirements docs
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-8 animate-fade-in max-w-lg px-6">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Icons.Activity className="w-8 h-8 text-accent animate-pulse" />
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-2">
                                {status === 'authorizing' ? 'Verifying Project...' : 
                                 status === 'generating' ? 'Drafting Workflow...' : 
                                 'Rendering AI Tour...'}
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Our multimodal AI engine (<strong>Veo 3.1</strong>) is creating a customized 30-second production walkthrough of the RosterSync engine.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
                                <span>{status}...</span>
                                <span>{progress}% Rendered</span>
                            </div>
                        </div>
                        
                        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                            <div className="flex items-start gap-3 text-left">
                                <Icons.Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[11px] text-gray-300 font-bold mb-1">Billing Notice</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed italic">
                                        Veo video generation requires an API key from a <strong>paid GCP project</strong>. 
                                        If the process stalls, ensure your account has a valid billing method attached.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkflowVideoModal;
