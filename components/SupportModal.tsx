
import React, { useState } from 'react';
import { Icons } from './icons';
import { supabase } from '../services/supabaseService';

interface SupportModalProps {
    onClose: () => void;
}

const SupportModal: React.FC<SupportModalProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        
        try {
            const { error } = await supabase.saveSupportTicket({
                name: formData.name,
                email: formData.email,
                message: formData.message
            });

            if (error) {
                throw error;
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (err: any) {
            console.error("Submission error:", err);
            setErrorMsg("Failed to send message. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div 
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-primary/20 w-full max-w-lg backdrop-blur-xl animate-slide-in-from-bottom overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {success ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Icons.CheckCircle className="w-8 h-8 text-accent" />
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white mb-2">Message Sent</h2>
                        <p className="text-gray-400">We've sent your request to <span className="text-white font-medium">ryan@rostersync.app</span>.<br/>We'll get back to you shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                                    <Icons.Activity className="w-6 h-6 text-primary" />
                                    Contact Support
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">Need help? Send a message directly to our engineering team.</p>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm"
                                    placeholder="Your Name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm"
                                    placeholder="you@company.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm resize-none"
                                    placeholder="Describe your issue or question..."
                                />
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2">
                                    {loading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Share2 className="w-5 h-5" />}
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default SupportModal;
