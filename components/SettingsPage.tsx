
import React, { useState, useEffect } from 'react';
import { encryptToken, decryptToken } from '../services/cryptoService';
import { testIconikConnection } from '../services/iconikService';
import { Icons } from './icons';

const SettingsPage: React.FC = () => {
    const [appId, setAppId] = useState('');
    const [authToken, setAuthToken] = useState('');
    const [iconikUrl, setIconikUrl] = useState('https://app.iconik.io');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [connectionMessage, setConnectionMessage] = useState('');

    useEffect(() => {
        const storedAppId = localStorage.getItem('iconik_app_id');
        const storedEncryptedToken = localStorage.getItem('iconik_auth_token');
        const storedUrl = localStorage.getItem('iconik_url');
        const storedUsername = localStorage.getItem('iconik_username');
        const storedEncryptedPassword = localStorage.getItem('iconik_password');

        if (storedAppId) setAppId(storedAppId);
        if (storedUrl) setIconikUrl(storedUrl);
        if (storedUsername) setUsername(storedUsername);

        if (storedEncryptedToken) {
            try {
                setAuthToken(decryptToken(storedEncryptedToken));
            } catch (e) {
                console.error("Failed to decrypt token", e);
                localStorage.removeItem('iconik_auth_token');
            }
        }

        if (storedEncryptedPassword) {
            try {
                setPassword(decryptToken(storedEncryptedPassword));
            } catch (e) {
                console.error("Failed to decrypt password", e);
                localStorage.removeItem('iconik_password');
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('iconik_app_id', appId);
        localStorage.setItem('iconik_auth_token', encryptToken(authToken));
        if (password) {
            localStorage.setItem('iconik_password', encryptToken(password));
        }

        const cleanUrl = iconikUrl.replace(/\/$/, "");
        localStorage.setItem('iconik_url', cleanUrl);
        localStorage.setItem('iconik_username', username);

        setIconikUrl(cleanUrl);
        setConnectionStatus('success');
        setConnectionMessage('Settings saved securely.');
        setTimeout(() => setConnectionStatus('idle'), 3000);
    };

    const handleTestConnection = async () => {
        setConnectionStatus('testing');
        setConnectionMessage('');
        const cleanUrl = iconikUrl.replace(/\/$/, "");

        const result = await testIconikConnection(appId, authToken, cleanUrl, username, password);

        if (result.success) {
            setConnectionStatus('success');

            if (result.data && result.data.token) {
                const newToken = result.data.token;
                setAuthToken(newToken);
                localStorage.setItem('iconik_app_id', appId);
                localStorage.setItem('iconik_auth_token', encryptToken(newToken));
                localStorage.setItem('iconik_url', cleanUrl);
                if (username) localStorage.setItem('iconik_username', username);
                if (password) localStorage.setItem('iconik_password', encryptToken(password));

                const userEmail = result.data.email || result.data.user_email || username || 'User';
                setConnectionMessage(`Login successful! Connected as ${userEmail}`);
            } else if (result.data) {
                const display = result.data.email ||
                    (result.data.first_name ? `${result.data.first_name} ${result.data.last_name}` : '') ||
                    result.data.username ||
                    'Authorized User';
                setConnectionMessage(`Connected as ${display}`);
            } else {
                setConnectionMessage('Connected! (No user details available)');
            }
        } else {
            setConnectionStatus('error');
            setConnectionMessage(result.data || 'Failed to connect.');
        }
    };

    const InputField: React.FC<{
        id: string;
        label: string;
        value: string;
        onChange: (v: string) => void;
        type?: string;
        placeholder?: string;
        hint?: string;
    }> = ({ id, label, value, onChange, type = 'text', placeholder = '', hint }) => (
        <div>
            <label htmlFor={id} className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </label>
            <input
                type={type}
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="input-premium w-full"
                placeholder={placeholder}
            />
            {hint && (
                <p className="mt-1.5 text-[10px] text-gray-500 font-medium">{hint}</p>
            )}
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <header className="animate-slide-up">
                <h1 className="font-display text-4xl font-bold text-white tracking-tight">Settings</h1>
                <p className="mt-2 text-gray-400 text-base">Configure your Iconik MAM integration</p>
            </header>

            {/* Main Settings Card */}
            <div className="max-w-2xl glass-card rounded-3xl overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
                {/* Card Header */}
                <div className="h-14 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center px-5 gap-4">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    </div>
                    <div className="h-5 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                            <Icons.Settings className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-semibold text-gray-300 tracking-wide">Iconik Integration</span>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-8 space-y-8">
                    {/* Login Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/20">
                                <Icons.Logout className="w-4 h-4 text-blue-400 transform -scale-x-100" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Quick Login</h3>
                                <p className="text-xs text-gray-500">Use email & password to fetch a new auth token</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                id="username"
                                label="Iconik Email"
                                value={username}
                                onChange={setUsername}
                                type="email"
                            />
                            <InputField
                                id="password"
                                label="Password"
                                value={password}
                                onChange={setPassword}
                                type="password"
                            />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">or use tokens</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>

                    {/* Token Section */}
                    <div className="space-y-4">
                        <InputField
                            id="appId"
                            label="Application ID"
                            value={appId}
                            onChange={setAppId}
                            type="password"
                            hint="Admin → Settings → Application Tokens"
                        />
                        <InputField
                            id="authToken"
                            label="Auth Token"
                            value={authToken}
                            onChange={setAuthToken}
                            type="password"
                            hint="Encrypted & stored locally in browser"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleTestConnection}
                            disabled={connectionStatus === 'testing'}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                            {connectionStatus === 'testing' ? (
                                <Icons.Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                <Icons.Activity className="w-5 h-5 text-cyan-400" />
                            )}
                            <span>{username && password ? 'Login & Test' : 'Test Connection'}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            <Icons.Save className="w-5 h-5" />
                            <span>Save Settings</span>
                        </button>
                    </div>

                    {/* Status Message */}
                    {connectionStatus !== 'idle' && connectionStatus !== 'testing' && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 animate-scale-in ${connectionStatus === 'success'
                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                : 'bg-red-500/10 border border-red-500/20'
                            }`}>
                            {connectionStatus === 'success' ? (
                                <Icons.CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            ) : (
                                <Icons.Error className="w-5 h-5 text-red-400 flex-shrink-0" />
                            )}
                            <p className={`text-sm ${connectionStatus === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
                                {connectionMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Security Info Card */}
            <div className="max-w-2xl glass-card rounded-2xl p-6 animate-slide-up border-emerald-500/10" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-30"></div>
                            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <Icons.Shield className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Zero-Knowledge Security</h2>
                        <p className="text-gray-400 mt-1.5 text-sm leading-relaxed">
                            Your Iconik Auth Token is encrypted with AES-256 and stored only in your browser's local storage.
                            Your unique encryption key never leaves your device — we never see or store your credentials on our servers.
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>AES-256 Encryption</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Client-Side Only</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Zero Telemetry</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
