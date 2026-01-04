
import React, { useState } from 'react';
import type { User, SavedRoster } from '../types';
import { Page } from '../types';
import { Icons } from './icons';

interface SidebarProps {
    user: User;
    currentPage: Page;
    onNavigate: (page: Page) => void;
    savedRosters: SavedRoster[];
    onSelectRoster: (roster: SavedRoster) => void;
    onNewExtraction: () => void;
    onDeleteRoster: (roster: SavedRoster) => void;
    onRenameRoster: (rosterId: string, newName: string) => void;
    onSignOut: () => void;
    activeRosterId: string | null;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    user,
    currentPage,
    onNavigate,
    savedRosters,
    onSelectRoster,
    onNewExtraction,
    onDeleteRoster,
    onRenameRoster,
    onSignOut,
    activeRosterId,
    isCollapsed,
    onToggleCollapse
}) => {
    const [isLibraryOpen, setLibraryOpen] = useState(true);
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    const navItems = [
        { id: Page.DASHBOARD, icon: Icons.Dashboard, label: 'Dashboard' },
        { id: Page.ACTIVITY, icon: Icons.Activity, label: 'Activity' },
        { id: Page.SETTINGS, icon: Icons.Settings, label: 'Settings' }
    ];

    const handleStartRename = (roster: SavedRoster) => {
        setRenamingId(roster.id);
        setNewName(roster.team_name);
    };

    const handleCancelRename = () => {
        setRenamingId(null);
        setNewName('');
    };

    const handleSaveRename = (e: React.FormEvent) => {
        e.preventDefault();
        if (renamingId && newName.trim()) {
            onRenameRoster(renamingId, newName.trim());
        }
        handleCancelRename();
    };

    const NavLink: React.FC<{ page: Page, icon: React.ElementType, label: string }> = ({ page, icon: Icon, label }) => {
        const isActive = currentPage === page && !activeRosterId;
        return (
            <button
                onClick={() => {
                    onNewExtraction();
                    onNavigate(page);
                }}
                className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/10 border border-indigo-500/20'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? label : ''}
            >
                {/* Active indicator glow */}
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-xl"></div>
                )}

                <div className={`relative flex items-center ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} transition-colors duration-300`}>
                    <Icon className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} />
                </div>
                {!isCollapsed && (
                    <span className="relative truncate font-medium">{label}</span>
                )}

                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
            </button>
        );
    };

    return (
        <aside className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-72'} glass-subtle flex flex-col z-20 transform -translate-x-full md:translate-x-0 transition-all duration-500 ease-out`}>
            {/* Logo Section */}
            <div className="flex items-center justify-center h-20 border-b border-white/5 px-4 flex-shrink-0">
                {isCollapsed ? (
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <span className="relative text-2xl font-display font-bold gradient-text">RS</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-50"></div>
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Icons.Library className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-display font-bold gradient-text">RosterSync</h1>
                            <p className="text-[10px] text-gray-500 font-mono tracking-wider">AI-POWERED</p>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 flex flex-col min-h-0 px-4 py-6">
                {/* New Extraction Button */}
                <button
                    onClick={onNewExtraction}
                    className={`mb-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0 ${isCollapsed ? 'px-3' : 'px-4'}`}
                >
                    <Icons.New className="w-5 h-5" />
                    {!isCollapsed && <span>New Extraction</span>}
                </button>

                {/* Navigation Links */}
                <div className="space-y-2 flex-shrink-0">
                    {navItems.map(item => <NavLink key={item.id} page={item.id} icon={item.icon} label={item.label} />)}
                </div>

                {/* Saved Rosters Section */}
                {!isCollapsed && (
                    <div className="flex-1 flex flex-col min-h-0 mt-6 pt-6 border-t border-white/5">
                        <button
                            onClick={() => setLibraryOpen(!isLibraryOpen)}
                            className="flex-shrink-0 flex items-center justify-between w-full px-3 py-2 text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold group"
                        >
                            <div className="flex items-center gap-2">
                                <Icons.Library className="w-4 h-4" />
                                <span>Saved Rosters</span>
                                <span className="bg-white/10 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-full">
                                    {savedRosters.length}
                                </span>
                            </div>
                            <div className={`transform transition-transform duration-300 ${isLibraryOpen ? 'rotate-180' : ''}`}>
                                <Icons.ChevronDown className="w-3 h-3" />
                            </div>
                        </button>

                        <div className={`mt-3 flex-1 overflow-hidden transition-all duration-300 ${isLibraryOpen ? 'opacity-100' : 'opacity-0 max-h-0'}`}>
                            <div className="h-full overflow-y-auto custom-scrollbar space-y-1 pl-2 border-l border-white/5 ml-2 pr-1">
                                {savedRosters.length > 0 ? (
                                    savedRosters.map(roster => (
                                        renamingId === roster.id ? (
                                            <form key={roster.id} onSubmit={handleSaveRename} className="p-1">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    onBlur={handleCancelRename}
                                                    onKeyDown={(e) => e.key === 'Escape' && handleCancelRename()}
                                                    className="w-full text-xs p-2.5 rounded-lg bg-slate-900/80 border border-indigo-500/50 text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all duration-200"
                                                    autoFocus
                                                />
                                            </form>
                                        ) : (
                                            <button
                                                key={roster.id}
                                                onClick={() => onSelectRoster(roster)}
                                                className={`w-full group flex items-center justify-between text-xs text-left p-2.5 rounded-lg transition-all duration-200 ${activeRosterId === roster.id
                                                        ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-400 rounded-l-none pl-3 shadow-lg shadow-cyan-500/5'
                                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                    }`}
                                            >
                                                <span className="truncate">{roster.team_name}</span>
                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleStartRename(roster); }}
                                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                    >
                                                        <Icons.Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDeleteRoster(roster); }}
                                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                    >
                                                        <Icons.Delete className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </button>
                                        )
                                    ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                                            <Icons.Library className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <p className="text-xs text-gray-500">No saved rosters yet</p>
                                        <p className="text-[10px] text-gray-600 mt-1">Extract and save your first roster</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Footer Section */}
            <div className="px-4 py-4 border-t border-white/5 bg-black/20 flex-shrink-0">
                <button
                    onClick={onToggleCollapse}
                    className={`w-full flex items-center p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-300 mb-4 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Icons.ChevronsLeft className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
                    {!isCollapsed && <span className="ml-3 text-sm">Collapse</span>}
                </button>

                <div className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'}`}>
                    {!isCollapsed && (
                        <div className="truncate">
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse"></div>
                                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Enterprise</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onSignOut}
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all duration-300"
                        title="Sign Out"
                    >
                        <Icons.Logout className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
