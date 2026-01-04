import React, { useState, useEffect } from 'react';
import { Icons } from './icons';
import { LOADING_MESSAGES } from '../constants';

interface LoadingIndicatorProps {
    message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (message) {
            return;
        }

        const interval = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                setMessageIndex(prevIndex => (prevIndex + 1) % LOADING_MESSAGES.length);
                setIsFading(false);
            }, 300);
        }, 2500);

        return () => clearInterval(interval);
    }, [message]);

    const currentMessage = message || LOADING_MESSAGES[messageIndex];

    return (
        <div className="w-full animate-fade-in py-6 px-4 flex justify-center">
            <div className="flex items-center gap-6 glass-card p-8 rounded-3xl">
                {/* Animated logo */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Icons.Loader className="w-7 h-7 text-white animate-spin" />
                    </div>
                </div>

                {/* Text content */}
                <div className="text-left min-w-[240px]">
                    <p className="font-display font-bold text-lg text-white flex items-center gap-2">
                        RosterSync Active
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                    </p>
                    <p className={`text-cyan-400 transition-opacity duration-300 text-sm h-5 font-medium ${isFading && !message ? 'opacity-0' : 'opacity-100'}`}>
                        {currentMessage}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingIndicator;