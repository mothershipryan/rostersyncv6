
import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Icons } from './icons';

interface AuthModalProps {
    initialView: 'login' | 'signup';
    onClose: () => void;
    onAuthSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialView, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(initialView === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!isLogin) {
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setLoading(false);
                return;
            }
            if (!name.trim() || !company.trim()) {
                setError('Please fill out all fields.');
                setLoading(false);
                return;
            }
        }

        try {
            if (isLogin) {
                const { session, error } = await supabase.signIn(email, password);
                if (error) {
                    setError(error.message);
                } else if (session) {
                    onAuthSuccess();
                    onClose();
                }
            } else {
                const { session, error, requiresConfirmation } = await supabase.signUp(email, password, name, company);

                if (error) {
                    setError(error.message);
                } else if (session) {
                    onAuthSuccess();
                    onClose();
                } else if (requiresConfirmation) {
                    setSuccessMessage('Success! Please check your email to verify your account.');
                } else {
                    setError('An unexpected issue occurred during sign up.');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div
                className="glass-card rounded-3xl p-8 w-full max-w-md relative animate-scale-in overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-3xl -z-10"></div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                    <Icons.Close className="w-4 h-4" />
                </button>

                {successMessage ? (
                    <div className="text-center py-6">
                        <div className="relative inline-flex mb-6">
                            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Icons.CheckCircle className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="font-display text-2xl font-bold text-white">Check Your Inbox</h2>
                        <p className="text-gray-400 mt-3 text-sm">{successMessage}</p>
                        <button
                            onClick={onClose}
                            className="mt-8 w-full btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
                                <Icons.Library className="w-7 h-7 text-white" />
                            </div>
                            <h2 className="font-display text-2xl font-bold text-white">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-gray-400 mt-2 text-sm">
                                {isLogin ? "Sign in to access your dashboard." : "Get started with RosterSync."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="name">Full Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            className="input-premium w-full mt-2"
                                            placeholder="Alex Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="company">Company</label>
                                        <input
                                            id="company"
                                            type="text"
                                            value={company}
                                            onChange={e => setCompany(e.target.value)}
                                            required
                                            className="input-premium w-full mt-2"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="input-premium w-full mt-2"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="input-premium w-full mt-2"
                                    placeholder="••••••••"
                                />
                            </div>

                            {!isLogin && (
                                <div>
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        className="input-premium w-full mt-2"
                                        placeholder="••••••••"
                                    />
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                                    <Icons.Error className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-red-300 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {loading && <Icons.Loader className="w-4 h-4 animate-spin" />}
                                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            <span className="text-xs text-gray-500">or</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        </div>

                        <p className="text-center text-sm text-gray-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                {isLogin ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
