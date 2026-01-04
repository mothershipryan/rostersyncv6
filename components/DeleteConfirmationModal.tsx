
import React from 'react';
import { Icons } from './icons';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    warningTitle: string;
    warningMessage: string;
    confirmText: string;
    variant?: 'danger' | 'default';
    icon: React.ElementType;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    warningTitle,
    warningMessage,
    confirmText,
    variant = 'default',
    icon: Icon,
    onClose,
    onConfirm
}) => {
    if (!isOpen) return null;

    const theme = {
        danger: {
            glow: 'from-red-500/20 to-red-600/20',
            iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
            border: 'border-red-500/20',
            confirmButton: 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/25',
        },
        default: {
            glow: 'from-indigo-500/20 to-purple-500/20',
            iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            border: 'border-indigo-500/20',
            confirmButton: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25',
        }
    };

    const currentTheme = theme[variant];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[70] animate-fade-in p-4" onClick={onClose}>
            <div
                className={`glass-card rounded-3xl w-full max-w-lg overflow-hidden animate-scale-in relative ${currentTheme.border}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Background glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${currentTheme.glow} blur-3xl -z-10`}></div>

                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="relative inline-flex mb-6">
                        <div className={`absolute inset-0 ${variant === 'danger' ? 'bg-red-500' : 'bg-indigo-500'} blur-xl opacity-30`}></div>
                        <div className={`relative w-16 h-16 ${currentTheme.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
                    <p className="text-gray-400 mt-3 text-sm leading-relaxed">{message}</p>

                    {/* Warning box */}
                    <div className="mt-6 glass-subtle rounded-xl p-4 text-left flex items-start gap-3 border border-amber-500/20">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Icons.Activity className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">{warningTitle}</h3>
                            <p
                                className="text-xs text-gray-400 mt-1 leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: warningMessage.replace(/\*(.*?)\*/g, '<strong class="text-amber-300">$1</strong>')
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-900/50 border-t border-white/5 p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="btn-secondary text-sm py-2.5 px-5"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white ${currentTheme.confirmButton} transition-all`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
