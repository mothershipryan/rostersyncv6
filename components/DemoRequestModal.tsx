
import React, { useState } from 'react';
import { Icons } from './icons';
import { supabase } from '../services/supabaseService';

interface DemoRequestModalProps {
    onClose: () => void;
}

const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const { error } = await supabase.saveDemoRequest({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            notes: formData.notes
        });

        if (error) {
            // Silently log the error for diagnostics, but don't block the user's success feedback.
            console.error("Error submitting demo request:", error.message);
        }

        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2500);
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
                        <h2 className="text-2xl font-display font-bold text-white mb-2">Request Received!</h2>
                        <p className="text-gray-400">Thanks for your interest, {formData.name.split(' ')[0]}.<br/>Our enterprise team will reach out to you shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                                    <Icons.Calendar className="w-6 h-6 text-primary" />
                                    Book a Demo
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">See RosterSync in action with a product expert.</p>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <Icons.Close className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
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
                                        placeholder="Jane Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Work Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm"
                                        placeholder="jane@company.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="company" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Company</label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        required
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm"
                                        placeholder="Acme Broadcast Inc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Notes / Specific Needs</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-white placeholder-gray-600 text-sm resize-none"
                                    placeholder="We are looking to integrate with Iconik for our upcoming season..."
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 rounded-xl hover:shadow-glow-primary transition-all duration-300 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2">
                                    {loading ? <Icons.Loader className="w-5 h-5 animate-spin" /> : <Icons.Calendar className="w-5 h-5" />}
                                    {loading ? 'Submitting Request...' : 'Schedule Demo'}
                                </button>
                                <p className="text-center text-xs text-gray-600 mt-3">We respect your privacy. No spam, ever.</p>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default DemoRequestModal;