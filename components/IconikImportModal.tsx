
import React, { useState } from 'react';
import { Icons } from './icons';
import { getIconikField } from '../services/iconikService';
import { decryptToken } from '../services/cryptoService';
import { Player } from '../types';

interface IconikImportModalProps {
    onClose: () => void;
    onImport: (players: Player[], merge: boolean, teamName?: string) => void;
}

const IconikImportModal: React.FC<IconikImportModalProps> = ({ onClose, onImport }) => {
    const [step, setStep] = useState<'search' | 'preview'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
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

            // DIRECT LOOKUP by exact field name
            const result = await getIconikField(appId, authToken, iconikUrl, searchQuery.trim());

            if (result.success) {
                const field = result.data;
                // Only allow drop_down fields
                if (field.field_type !== 'drop_down') {
                    setError(`Field found but is type '${field.field_type}', not 'drop_down'. Cannot import.`);
                    setIsSearching(false);
                    return;
                }

                // Field found! Proceed to preview directly.
                setSelectedField(field); // For title

                const options = field.options || [];
                const players: Player[] = options.map((opt: any) => ({
                    name: opt.label,
                    position: 'Imported' // Default position
                }));

                setPreviewData(players);
                setStep('preview');

            } else {
                setError("Field not found. Ensure exact metadata field name.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSearching(false);
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
                            <p className="text-xs text-indigo-300">Enter exact metadata field name to import</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <Icons.Close className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 min-h-[400px]">
                    {step === 'search' ? (
                        <div className="space-y-6">
                            <div className="flex gap-3 h-12">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    // Handle Enter key for search
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Exact field name (e.g. 'warriors_2024_roster')"
                                    className="input-premium flex-1 h-full"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="btn-primary w-32 h-full flex items-center justify-center"
                                >
                                    {isSearching ? <Icons.Loader className="animate-spin w-4 h-4" /> : 'Find Field'}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                                    <Icons.Warning className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {!error && !isSearching && (
                                <div className="text-center text-gray-500 py-10 opacity-60">
                                    <Icons.Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Enter the system name of the metadata field in Iconik.</p>
                                    <p className="text-xs mt-1">This is usually lowercase with underscores.</p>
                                </div>
                            )}
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
                                            onClick={() => onImport(previewData, true, selectedField?.label)}
                                            className="btn-secondary h-12 flex items-center justify-center"
                                        >
                                            <Icons.Merge className="w-4 h-4 mr-2" />
                                            Merge into Current
                                        </button>
                                        <button
                                            onClick={() => onImport(previewData, false, selectedField?.label)}
                                            className="btn-primary h-12 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400"
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
