
import React, { useState, useEffect } from 'react';
import { Icons } from './icons';
import { searchIconikFields, getIconikField } from '../services/iconikService';
import { decryptToken } from '../services/cryptoService';
import { Player } from '../types';

interface IconikImportModalProps {
    onClose: () => void;
    onImport: (players: Player[], merge: boolean) => void;
}

const IconikImportModal: React.FC<IconikImportModalProps> = ({ onClose, onImport }) => {
    const [step, setStep] = useState<'search' | 'preview'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<any | null>(null);
    const [previewData, setPreviewData] = useState<Player[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            const appId = localStorage.getItem('iconik_app_id');
            const encryptedToken = localStorage.getItem('iconik_auth_token');
            const iconikUrl = localStorage.getItem('iconik_url') || 'https://app.iconik.io';

            if (!appId || !encryptedToken) {
                setError("Iconik credentials not found.");
                setIsSearching(false);
                return;
            }

            const authToken = decryptToken(encryptedToken);
            const result = await searchIconikFields(appId, authToken, iconikUrl, searchQuery);

            if (result.success && result.data?.objects) {
                // Filter for drop_down fields as those contain our roster data
                const fields = result.data.objects.filter((f: any) => f.field_type === 'drop_down');
                setSearchResults(fields);
                if (fields.length === 0) setError("No matching roster fields found.");
            } else {
                setError(result.data || "Search failed.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectField = async (field: any) => {
        setSelectedField(field);
        setStep('preview');
        setLoadingPreview(true);
        setError(null);

        try {
            const appId = localStorage.getItem('iconik_app_id');
            const encryptedToken = localStorage.getItem('iconik_auth_token');
            const iconikUrl = localStorage.getItem('iconik_url') || 'https://app.iconik.io';
            const authToken = decryptToken(encryptedToken!);

            // Fetch full field details to get options
            const result = await getIconikField(appId!, authToken, iconikUrl, field.name);

            if (result.success) {
                const options = result.data.options || [];
                // Map Iconik options to Player objects
                const players: Player[] = options.map((opt: any) => ({
                    name: opt.label, // Use label as it's the beautiful name
                    position: 'Imported' // Default position
                }));
                setPreviewData(players);
            } else {
                setError("Failed to load roster details.");
                setStep('search');
            }
        } catch (err: any) {
            setError(err.message);
            setStep('search');
        } finally {
            setLoadingPreview(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Icons.Cloud className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Import from Iconik</h2>
                            <p className="text-xs text-indigo-300">Read existing metadata fields as rosters</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <Icons.Close className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 min-h-[400px]">
                    {step === 'search' ? (
                        <div className="space-y-6">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search for roster name (e.g. 'Warriors 2024')"
                                    className="input-premium flex-1"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="btn-primary w-32"
                                >
                                    {isSearching ? <Icons.Loader className="animate-spin w-4 h-4 mx-auto" /> : 'Search'}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                    <Icons.Warning className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {searchResults.length === 0 && !isSearching && !error && (
                                    <div className="text-center text-gray-500 py-10">
                                        <Icons.Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Search for a metadata field to import</p>
                                    </div>
                                )}

                                {searchResults.map((field) => (
                                    <div
                                        key={field.name}
                                        onClick={() => handleSelectField(field)}
                                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <Icons.Paste className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{field.label || field.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{field.name}</p>
                                            </div>
                                        </div>
                                        <Icons.ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 h-full flex flex-col">
                            {loadingPreview ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
                                    <Icons.Loader className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p>Loading roster details...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{selectedField?.label}</h3>
                                            <p className="text-sm text-gray-400">{previewData.length} players found</p>
                                        </div>
                                        <button onClick={() => setStep('search')} className="text-xs text-indigo-400 hover:text-indigo-300">Change Selection</button>
                                    </div>

                                    <div className="flex-1 bg-black/20 rounded-xl overflow-hidden border border-white/5 max-h-[250px] overflow-y-auto custom-scrollbar p-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {previewData.map((p, i) => (
                                                <div key={i} className="px-3 py-2 rounded-lg bg-white/5 text-sm text-gray-300 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <button
                                            onClick={() => onImport(previewData, true)}
                                            className="btn-secondary py-3 justify-center"
                                        >
                                            <Icons.Merge className="w-4 h-4 mr-2" />
                                            Merge into Current
                                        </button>
                                        <button
                                            onClick={() => onImport(previewData, false)}
                                            className="btn-primary py-3 justify-center bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
                                        >
                                            <Icons.Download className="w-4 h-4 mr-2" />
                                            Overwrite Roster
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IconikImportModal;
