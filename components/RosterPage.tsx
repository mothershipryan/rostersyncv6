
import React, { useState, useEffect } from 'react';
import type { SavedRoster, ExtractionResult, ActivityLog, Player } from '../types';
import { Icons } from './icons';
import { formatForIconik } from '../services/iconikFormatter';
import MergeModal from './MergeModal';
import ConfirmationModal from './DeleteConfirmationModal';
import { decryptToken } from '../services/cryptoService';
import { syncRosterToIconik } from '../services/iconikService';
import IconikImportModal from './IconikImportModal';

interface RosterPageProps {
    roster: SavedRoster;
    onUpdate: (rosterId: string, updatedData: ExtractionResult) => void;
    onAddActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp' | 'user_id'>) => void;
}

type RosterTab = 'roster' | 'sources' | 'json';

const RosterPage: React.FC<RosterPageProps> = ({ roster, onUpdate, onAddActivityLog }) => {
    const [activeTab, setActiveTab] = useState<RosterTab>('roster');
    const [currentPlayers, setCurrentPlayers] = useState<Player[]>(
        Array.isArray(roster.data?.players) ? roster.data.players : []
    );
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerPosition, setNewPlayerPosition] = useState('');
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [jsonCopied, setJsonCopied] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [mergeSuccess, setMergeSuccess] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
    const [editingPlayer, setEditingPlayer] = useState<{ index: number; originalPlayer: Player; currentPlayer: Player } | null>(null);

    useEffect(() => {
        setCurrentPlayers(Array.isArray(roster.data?.players) ? roster.data.players : []);
        setActiveTab('roster');
        setIsAddingPlayer(false);
        setIsMergeModalOpen(false);
        setPlayerToDelete(null);
        setEditingPlayer(null);
    }, [roster]);

    const getHostname = (url: string) => {
        try {
            return new URL(url).hostname;
        } catch {
            return url;
        }
    };

    const handleConfirmSinglePlayerDelete = () => {
        if (!playerToDelete) return;

        const updatedPlayers = currentPlayers.filter(p => p.name !== playerToDelete.name);
        setCurrentPlayers(updatedPlayers);

        const updatedData = { ...roster.data, players: updatedPlayers };
        onUpdate(roster.id, updatedData);

        onAddActivityLog({
            action: 'Deletion',
            details: `Removed player: ${playerToDelete.name} from "${roster.team_name}"`,
            status: 'OK'
        });

        setPlayerToDelete(null);
    };

    const handleManualAddPlayerToggle = () => {
        if (activeTab !== 'roster') {
            setActiveTab('roster');
            setIsAddingPlayer(true);
        } else {
            setIsAddingPlayer(p => !p);
        }
    };

    const handleAddPlayer = () => {
        if (newPlayerName.trim() && newPlayerPosition.trim()) {
            const newPlayer: Player = { name: newPlayerName.trim(), position: newPlayerPosition.trim() };
            const updatedPlayers = [...currentPlayers, newPlayer].sort((a, b) => {
                const lastNameA = a.name.split(' ').pop() || '';
                const lastNameB = b.name.split(' ').pop() || '';
                return lastNameA.localeCompare(lastNameB);
            });
            setCurrentPlayers(updatedPlayers);
            const updatedData = { ...roster.data, players: updatedPlayers };
            onUpdate(roster.id, updatedData);

            onAddActivityLog({
                action: 'Modification',
                details: `Added player: ${newPlayer.name} to "${roster.team_name}"`,
                status: 'OK'
            });

            setNewPlayerName('');
            setNewPlayerPosition('');
            setIsAddingPlayer(false);
        }
    };

    const handleStartEdit = (player: Player, index: number) => {
        setEditingPlayer({ index, originalPlayer: player, currentPlayer: { ...player } });
    };

    const handleCancelEdit = () => {
        setEditingPlayer(null);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (editingPlayer) {
            setEditingPlayer({
                ...editingPlayer,
                currentPlayer: { ...editingPlayer.currentPlayer, [e.target.name]: e.target.value }
            });
        }
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleSaveEdit = () => {
        if (!editingPlayer || !editingPlayer.currentPlayer.name.trim()) {
            handleCancelEdit();
            return;
        }

        const newPlayer = {
            name: editingPlayer.currentPlayer.name.trim(),
            position: editingPlayer.currentPlayer.position.trim()
        };
        const originalName = editingPlayer.originalPlayer.name;

        const updatedPlayers = [...currentPlayers];
        updatedPlayers[editingPlayer.index] = newPlayer;
        updatedPlayers.sort((a, b) => {
            const lastNameA = a.name.split(' ').pop() || '';
            const lastNameB = b.name.split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });

        setCurrentPlayers(updatedPlayers);

        const updatedData = { ...roster.data, players: updatedPlayers };
        onUpdate(roster.id, updatedData);

        onAddActivityLog({
            action: 'Modification',
            details: `Updated player "${originalName}" in "${roster.team_name}"`,
            status: 'OK'
        });

        handleCancelEdit();
    };

    const handleConfirmMerge = (newPlayersToMerge: Player[], newSources: string[], season: string) => {
        const playerMap = new Map<string, Player>();
        currentPlayers.forEach(p => playerMap.set(p.name.toLowerCase(), p));
        newPlayersToMerge.forEach(p => playerMap.set(p.name.toLowerCase(), p));

        const combinedPlayers = Array.from(playerMap.values());
        combinedPlayers.sort((a, b) => {
            const lastNameA = a.name.split(' ').pop() || '';
            const lastNameB = b.name.split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });

        setCurrentPlayers(combinedPlayers);
        const combinedSources = [...new Set([...(roster.data.verifiedSources || []), ...newSources])];
        const updatedNote = `Merged ${newPlayersToMerge.length} historical identities from the ${season} season on ${new Date().toLocaleDateString()}. ${roster.data.verificationNotes || ''}`;

        const updatedData = {
            ...roster.data,
            players: combinedPlayers,
            verifiedSources: combinedSources,
            verificationNotes: updatedNote,
        };

        onUpdate(roster.id, updatedData);

        setMergeSuccess(true);
        setTimeout(() => setMergeSuccess(false), 4000);
    };

    const handleSyncIconik = async () => {
        setIsSyncing(true);

        const appId = localStorage.getItem('iconik_app_id');
        const encryptedToken = localStorage.getItem('iconik_auth_token');
        const iconikUrl = localStorage.getItem('iconik_url') || 'https://app.iconik.io';

        if (!appId || !encryptedToken) {
            alert("Please configure your Iconik settings first.");
            setIsSyncing(false);
            return;
        }

        try {
            const authToken = decryptToken(encryptedToken);
            const payload = formatForIconik({ ...roster.data, players: currentPlayers });

            const result = await syncRosterToIconik(appId, authToken, iconikUrl, payload);

            if (result.success) {
                setSyncSuccess(true);

                onAddActivityLog({
                    action: 'Export',
                    details: `Synced "${roster.team_name}" to Iconik`,
                    status: 'OK'
                });

                setTimeout(() => setSyncSuccess(false), 3000);
            } else {
                alert(`Sync Failed: ${result.data}`);
                onAddActivityLog({
                    action: 'Export',
                    details: `Failed to sync "${roster.team_name}": ${result.data}`,
                    status: 'ERR'
                });
            }
        } catch (error) {
            console.error("Sync error", error);
            alert("An error occurred during sync. Check settings.");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleImportFromIconik = (importedPlayers: Player[], merge: boolean, teamName?: string) => {
        let finalPlayers = [...importedPlayers];

        if (merge) {
            const playerMap = new Map<string, Player>();
            currentPlayers.forEach(p => playerMap.set(p.name.toLowerCase(), p));

            importedPlayers.forEach(p => {
                const normalized = p.name.toLowerCase();
                if (!playerMap.has(normalized)) {
                    playerMap.set(normalized, p);
                }
            });
            finalPlayers = Array.from(playerMap.values());
        }

        finalPlayers.sort((a, b) => {
            const lastNameA = a.name.split(' ').pop() || '';
            const lastNameB = b.name.split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });

        setCurrentPlayers(finalPlayers);

        const updatedData = { ...roster.data, players: finalPlayers };
        onUpdate(roster.id, updatedData);

        onAddActivityLog({
            action: 'Modification',
            details: `Imported ${importedPlayers.length} players from Iconik (${merge ? 'Merged' : 'Overwritten'})`,
            status: 'OK'
        });

        setIsImportModalOpen(false);
    };

    const handleDownloadCSV = () => {
        const headers = "Name,Position";
        const rows = currentPlayers.map(p => `"${p.name}","${p.position}"`).join("\n");
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${roster.team_name.replace(/\s+/g, '_')}_roster.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyJson = () => {
        const payload = formatForIconik({ ...roster.data, players: currentPlayers });
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setJsonCopied(true);
        setTimeout(() => setJsonCopied(false), 2000);
    };

    const NavButton: React.FC<{ tab: RosterTab, label: string, icon?: React.ElementType, count?: number }> = ({ tab, label, icon: Icon, count }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
        >
            {Icon && <Icon className={`w-3.5 h-3.5 ${activeTab === tab ? 'text-white' : 'text-gray-500'}`} />}
            {label}
            {count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab ? 'bg-white/20' : 'bg-slate-800'}`}>
                    {count}
                </span>
            )}
        </button>
    );

    const iconikPayload = formatForIconik({ ...roster.data, players: currentPlayers });

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header Card */}
            <header className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-3xl -z-10"></div>

                {/* Gradient accent bar */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-400 to-cyan-500 rounded-l-3xl"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pl-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="badge badge-success text-[9px] py-0.5">Archived Roster</span>
                            <span className="text-gray-600 text-[10px] font-mono">{roster.id.split('_')[1]}</span>
                            {roster.data.meta && (
                                <span className="badge badge-primary text-[9px] py-0.5">{roster.data.meta.model}</span>
                            )}
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {roster.team_name}
                        </h1>
                        <div className="flex items-center gap-3 mt-3 text-sm">
                            <span className="text-indigo-400 font-semibold">{roster.data.sport}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500">Last Synced {new Date(roster.created_at).toLocaleDateString()}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-emerald-400 font-medium">{currentPlayers.length} Players</span>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleManualAddPlayerToggle}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Icons.New className="w-4 h-4 text-cyan-400" /> Add Player
                        </button>
                        <button
                            onClick={() => setIsMergeModalOpen(true)}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Icons.Merge className="w-4 h-4 text-indigo-400" /> Merge Season
                        </button>
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Icons.Cloud className="w-4 h-4 text-purple-400" /> Import
                        </button>
                        <button
                            onClick={handleSyncIconik}
                            disabled={isSyncing}
                            className="btn-primary flex items-center gap-2 text-sm"
                        >
                            {isSyncing ? (
                                <Icons.Loader className="w-4 h-4 animate-spin" />
                            ) : syncSuccess ? (
                                <Icons.Check className="w-4 h-4" />
                            ) : (
                                <Icons.Sync className="w-4 h-4" />
                            )}
                            {isSyncing ? 'Syncing...' : (syncSuccess ? 'Synced!' : 'Sync Iconik')}
                        </button>
                    </div>
                </div>
            </header>

            {/* Merge Success Alert */}
            {mergeSuccess && (
                <div className="glass-card rounded-2xl p-4 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between animate-scale-in">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Icons.CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Season Merge Successful</p>
                            <p className="text-xs text-gray-400">Historical identities have been integrated into your master roster.</p>
                        </div>
                    </div>
                    <button onClick={() => setMergeSuccess(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                        <Icons.Close className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Content Card */}
            <div className="glass-card rounded-3xl overflow-hidden min-h-[550px] flex flex-col">
                {/* Tab Header */}
                <div className="h-16 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-b border-white/5 flex items-center justify-between px-5">
                    <div className="flex items-center gap-4">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="h-6 w-px bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <NavButton tab="roster" label="Roster" icon={Icons.Library} count={currentPlayers.length} />
                            <NavButton tab="sources" label="AI Analysis" icon={Icons.Shield} />
                            <NavButton tab="json" label="JSON" icon={Icons.Paste} />
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadCSV}
                        className="btn-ghost text-xs flex items-center gap-2"
                    >
                        <Icons.Download className="w-3.5 h-3.5 text-emerald-400" />
                        Export CSV
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-6 md:p-8 relative flex flex-col overflow-hidden">
                    {/* Roster Tab */}
                    {activeTab === 'roster' && (
                        <div className="flex flex-col h-full animate-fade-in">
                            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verified Athlete Directory</h3>
                            </div>

                            {/* Add Player Form */}
                            {isAddingPlayer && (
                                <div className="mb-4 animate-scale-in">
                                    <div className="flex gap-3 p-4 glass-subtle rounded-2xl border border-indigo-500/20">
                                        <input
                                            type="text"
                                            value={newPlayerName}
                                            onChange={(e) => setNewPlayerName(e.target.value)}
                                            placeholder="Player Name (First Last)"
                                            className="input-premium flex-grow"
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            value={newPlayerPosition}
                                            onChange={(e) => setNewPlayerPosition(e.target.value)}
                                            placeholder="Position"
                                            className="input-premium w-32"
                                        />
                                        <button onClick={handleAddPlayer} className="btn-primary text-sm">Commit</button>
                                        <button onClick={() => setIsAddingPlayer(false)} className="btn-ghost text-sm">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* Player List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4">
                                <div className="space-y-2">
                                    {currentPlayers.map((player, i) => (
                                        editingPlayer && editingPlayer.index === i ? (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl glass-subtle border border-indigo-500/30 animate-scale-in">
                                                <span className="text-xs font-mono font-bold text-indigo-500/50 w-8 text-right flex-shrink-0">{i + 1}</span>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editingPlayer.currentPlayer.name}
                                                    onChange={handleEditInputChange}
                                                    onKeyDown={handleEditKeyDown}
                                                    className="input-premium flex-grow py-2"
                                                    autoFocus
                                                />
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={editingPlayer.currentPlayer.position}
                                                    onChange={handleEditInputChange}
                                                    onKeyDown={handleEditKeyDown}
                                                    className="input-premium w-28 py-2"
                                                />
                                                <button onClick={handleSaveEdit} title="Save" className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center">
                                                    <Icons.Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={handleCancelEdit} title="Cancel" className="w-8 h-8 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center">
                                                    <Icons.Close className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                key={i}
                                                className="text-sm p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all flex items-center group gap-4"
                                            >
                                                <span className="text-xs font-mono font-bold text-indigo-500/40 w-8 text-right">{i + 1}</span>
                                                <div className="flex-1 flex justify-between items-center gap-4">
                                                    <span className="font-semibold text-gray-100 group-hover:text-white transition-colors truncate">{player.name}</span>
                                                    <span className="flex-shrink-0 text-[10px] font-mono text-gray-500 bg-slate-800 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                                                        {player.position}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button
                                                        onClick={() => handleStartEdit(player, i)}
                                                        className="w-8 h-8 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center"
                                                        title={`Edit ${player.name}`}
                                                    >
                                                        <Icons.Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setPlayerToDelete(player); }}
                                                        className="w-8 h-8 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                                        title={`Delete ${player.name}`}
                                                    >
                                                        <Icons.Delete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sources Tab */}
                    {activeTab === 'sources' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar -mr-4 pr-4 animate-fade-in">
                            <div className="space-y-8 max-w-4xl mx-auto py-4">
                                {/* AI Model Stats */}
                                {roster.data.meta && (
                                    <div className="glass-subtle rounded-2xl p-5 flex flex-wrap justify-between items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/20">
                                                <Icons.Database className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Model</p>
                                                <p className="text-base font-semibold text-white">{roster.data.meta.model}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total Tokens</p>
                                                <p className="text-lg font-mono text-emerald-400 font-bold">{roster.data.meta.totalTokens?.toLocaleString() || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Latency</p>
                                                <p className="text-lg font-mono text-blue-400 font-bold">{(roster.data.meta.latencyMs / 1000).toFixed(2)}s</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Verification Notes */}
                                <div className="glass-card rounded-2xl p-6 border-l-4 border-cyan-500 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                                        <Icons.Shield className="w-24 h-24 text-cyan-400" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                            <Icons.Shield className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">AI Verification Ledger</p>
                                    </div>
                                    <p className="text-base text-gray-200 leading-relaxed italic relative z-10">
                                        "{roster.data.verificationNotes}"
                                    </p>
                                </div>
                            </div>
                    )}
                            {/* JSON Tab */}
                            {activeTab === 'json' && (
                                <div className="relative group flex-1 flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0d1117] animate-fade-in">
                                    <div className="absolute left-6 top-6 z-10 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                            <Icons.Paste className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <span className="text-xs font-semibold text-white uppercase tracking-wider">Iconik JSON Schema</span>
                                    </div>
                                    <button
                                        onClick={copyJson}
                                        className={`absolute right-6 top-6 z-10 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${jsonCopied
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white'
                                            }`}
                                    >
                                        {jsonCopied ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                                        {jsonCopied ? 'Copied!' : 'Copy Schema'}
                                    </button>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <pre className="text-[11px] p-8 pt-20 font-mono leading-relaxed">
                                            <code className="text-emerald-400">
                                                {JSON.stringify(iconikPayload, null, 2)}
                                            </code>
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
            </div>

                {/* Modals */}
                {isMergeModalOpen && (
                    <MergeModal
                        teamName={roster.team_name}
                        currentPlayers={currentPlayers}
                        onClose={() => setIsMergeModalOpen(false)}
                        onConfirmMerge={handleConfirmMerge}
                    />
                )}

                {isImportModalOpen && (
                    <IconikImportModal
                        onClose={() => setIsImportModalOpen(false)}
                        onImport={handleImportFromIconik}
                    />
                )}

                <ConfirmationModal
                    isOpen={playerToDelete !== null}
                    onClose={() => setPlayerToDelete(null)}
                    onConfirm={handleConfirmSinglePlayerDelete}
                    title="Delete Player?"
                    message={<>You are about to permanently delete <strong className="text-white font-semibold">{playerToDelete?.name}</strong> from this roster.</>}
                    warningTitle="This action is final"
                    warningMessage="Deleted players must be manually re-added or re-extracted via a season merge. This action *will not* affect your Iconik MAM instance."
                    confirmText="Yes, Delete Player"
                    icon={Icons.Delete}
                    variant="danger"
                />
            </div>
            );
};

            export default RosterPage;
