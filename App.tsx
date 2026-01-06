import React, { useState, useEffect, useCallback } from 'react';
import type { Session, SavedRoster, ExtractionResult, ActivityLog, Player } from './types';
import { Page } from './types';
import { supabase } from './services/supabaseService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ActivityPage from './components/ActivityPage';
import SettingsPage from './components/SettingsPage';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import RosterPage from './components/RosterPage';
import DatabaseSetupModal from './components/DatabaseSetupModal';
import ConfirmationModal from './components/DeleteConfirmationModal';
import SaveConflictModal from './components/SaveConflictModal';
import { Icons } from './components/icons';

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [savedRosters, setSavedRosters] = useState<SavedRoster[]>([]);
    const [activeRoster, setActiveRoster] = useState<ExtractionResult | null>(null);
    const [activeRosterId, setActiveRosterId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');
    const [isDbSetupOpen, setIsDbSetupOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rosterToDelete, setRosterToDelete] = useState<SavedRoster | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [rosterToSave, setRosterToSave] = useState<ExtractionResult | null>(null);
    const [conflictingRoster, setConflictingRoster] = useState<SavedRoster | null>(null);

    const loadInitialData = async (userId: string) => {
        const rostersPromise = supabase.getSavedRosters(userId);
        const logsPromise = supabase.getActivityLogs(userId);

        const [rostersResult, logsResult] = await Promise.all([rostersPromise, logsPromise]);

        if (rostersResult.error === 'missing_table' || logsResult.error === 'missing_table') {
            setIsDbSetupOpen(true);
        }

        setSavedRosters(rostersResult.data);
        setActivityLogs(logsResult.data);
    };

    useEffect(() => {
        const loadInitialSession = async () => {
            const currentSession = await supabase.getSession();
            setSession(currentSession);
            if (currentSession) {
                await loadInitialData(currentSession.user.id);
            }
        };
        loadInitialSession();
    }, []);

    const handleAddActivityLog = useCallback(async (log: Omit<ActivityLog, 'id' | 'timestamp' | 'user_id'>) => {
        if (!session) return;
        const newLog = await supabase.addActivityLog(session.user.id, log);
        if (newLog) {
            setActivityLogs(prev => [newLog, ...prev]);
        }
    }, [session]);

    const handleAuthSuccess = async () => {
        const currentSession = await supabase.getSession();
        setSession(currentSession);
        if (currentSession) {
            await loadInitialData(currentSession.user.id);

            const newLog = await supabase.addActivityLog(currentSession.user.id, {
                action: 'Login',
                details: `User sign-in: ${currentSession.user.email}`,
                status: 'OK'
            });

            if (newLog) {
                setActivityLogs(prev => [newLog, ...prev]);
            }
        }
    };

    const handleSignOut = async () => {
        if (session) {
            await handleAddActivityLog({
                action: 'Logout',
                details: `User sign-out: ${session.user.email}`,
                status: 'OK'
            });
        }
        await supabase.signOut();
        setSession(null);
        setSavedRosters([]);
        setActivityLogs([]);
        setActiveRoster(null);
        setActiveRosterId(null);
        setCurrentPage(Page.DASHBOARD);
    };

    const handleNewExtraction = () => {
        setActiveRoster(null);
        setActiveRosterId(null);
        setCurrentPage(Page.DASHBOARD);
    };

    const handleSaveRoster = async (rosterData: ExtractionResult) => {
        if (!session) return;

        const existingRoster = savedRosters.find(
            r => r.team_name.trim().toLowerCase() === rosterData.teamName.trim().toLowerCase()
        );

        if (existingRoster) {
            setRosterToSave(rosterData);
            setConflictingRoster(existingRoster);
            setIsConflictModalOpen(true);
        } else {
            const newRoster = await supabase.saveRoster(session.user.id, rosterData.teamName, rosterData.sport, rosterData);
            if (newRoster) {
                setSavedRosters(prev => [newRoster, ...prev].sort((a, b) => a.team_name.localeCompare(b.team_name)));

                await handleAddActivityLog({
                    action: 'Extraction',
                    details: `Saved: ${newRoster.team_name} - ${newRoster.player_names.length} players`,
                    status: 'OK'
                });

                setActiveRosterId(newRoster.id);
                setActiveRoster(null);
            }
        }
    };

    const initiateDeleteRoster = (roster: SavedRoster) => {
        setRosterToDelete(roster);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteRoster = async () => {
        if (!rosterToDelete || !session) return;

        await handleAddActivityLog({
            action: 'Deletion',
            details: `Deleted: ${rosterToDelete.team_name}`,
            status: 'OK'
        });

        await supabase.deleteRoster(rosterToDelete.id, session.user.id);
        setSavedRosters(prev => prev.filter(r => r.id !== rosterToDelete.id));
        if (activeRosterId === rosterToDelete.id) {
            handleNewExtraction();
        }

        setIsDeleteModalOpen(false);
        setRosterToDelete(null);
    };

    const handleRenameRoster = async (rosterId: string, newName: string) => {
        if (!session || !newName.trim()) return;
        const updatedRoster = await supabase.renameRoster(rosterId, session.user.id, newName);
        if (updatedRoster) {
            setSavedRosters(prev => prev.map(r => r.id === rosterId ? updatedRoster : r).sort((a, b) => a.team_name.localeCompare(b.team_name)));
        }
    };

    const handleSelectRoster = (roster: SavedRoster) => {
        setActiveRosterId(roster.id);
        setActiveRoster(null);
        setCurrentPage(Page.DASHBOARD);
    };

    const handleUpdateRoster = async (rosterId: string, updatedData: ExtractionResult) => {
        if (!session) return;
        const updatedRoster = await supabase.updateRoster(rosterId, session.user.id, updatedData);
        if (updatedRoster) {
            setSavedRosters(prev => prev.map(r => r.id === rosterId ? updatedRoster : r).sort((a, b) => a.team_name.localeCompare(b.team_name)));
        }
    };

    const handleOpenLogin = () => {
        setAuthModalView('login');
        setAuthModalOpen(true);
    };

    const handleOpenSignUp = () => {
        setAuthModalView('signup');
        setAuthModalOpen(true);
    };

    const handleConfirmMergeFromConflict = async () => {
        if (!rosterToSave || !conflictingRoster || !session) return;

        const playerMap = new Map<string, Player>();
        conflictingRoster.data.players.forEach(p => playerMap.set(p.name.toLowerCase(), p));
        rosterToSave.players.forEach(p => playerMap.set(p.name.toLowerCase(), p));

        const combinedPlayers = Array.from(playerMap.values()).sort((a, b) => {
            const lastNameA = a.name.split(' ').pop() || '';
            const lastNameB = b.name.split(' ').pop() || '';
            return lastNameA.localeCompare(lastNameB);
        });

        const combinedSources = [...new Set([...conflictingRoster.data.verifiedSources, ...rosterToSave.verifiedSources])];
        const updatedNote = `Merged new extraction from ${new Date().toLocaleDateString()}. Original notes: ${conflictingRoster.data.verificationNotes}`;

        const mergedData: ExtractionResult = {
            ...conflictingRoster.data,
            players: combinedPlayers,
            verifiedSources: combinedSources,
            verificationNotes: updatedNote,
        };

        await handleUpdateRoster(conflictingRoster.id, mergedData);

        await handleAddActivityLog({
            action: 'Modification',
            details: `Merged new extraction into "${conflictingRoster.team_name}"`,
            status: 'OK'
        });

        setActiveRosterId(conflictingRoster.id);
        setActiveRoster(null);

        setIsConflictModalOpen(false);
        setRosterToSave(null);
        setConflictingRoster(null);
    };

    const handleConfirmSaveAsNew = async () => {
        if (!rosterToSave || !session) return;

        let newName = rosterToSave.teamName;
        let counter = 1;
        while (savedRosters.some(r => r.team_name.trim().toLowerCase() === newName.trim().toLowerCase())) {
            newName = `${rosterToSave.teamName} (${counter})`;
            counter++;
        }

        const newRosterData = { ...rosterToSave, teamName: newName };

        const newRoster = await supabase.saveRoster(session.user.id, newRosterData.teamName, newRosterData.sport, newRosterData);
        if (newRoster) {
            setSavedRosters(prev => [newRoster, ...prev].sort((a, b) => a.team_name.localeCompare(b.team_name)));

            await handleAddActivityLog({
                action: 'Extraction',
                details: `Saved new version: ${newRoster.team_name}`,
                status: 'OK'
            });

            setActiveRosterId(newRoster.id);
            setActiveRoster(null);
        }

        setIsConflictModalOpen(false);
        setRosterToSave(null);
        setConflictingRoster(null);
    };

    if (!session) {
        return (
            <>
                <LandingPage onLoginClick={handleOpenLogin} onSignUpClick={handleOpenSignUp} />
                {isAuthModalOpen && <AuthModal initialView={authModalView} onClose={() => setAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />}
            </>
        );
    }

    const renderPage = () => {
        const selectedRoster = savedRosters.find(r => r.id === activeRosterId);
        if (selectedRoster) {
            return <RosterPage
                roster={selectedRoster}
                onUpdate={handleUpdateRoster}
                onAddActivityLog={handleAddActivityLog}
            />;
        }

        switch (currentPage) {
            case Page.DASHBOARD:
                return <Dashboard activeRoster={activeRoster} onSaveRoster={handleSaveRoster} onNewExtractionResult={setActiveRoster} />;
            case Page.ACTIVITY:
                return <ActivityPage activityLogs={activityLogs} />;
            case Page.SETTINGS:
                return <SettingsPage />;
            default:
                return <Dashboard activeRoster={activeRoster} onSaveRoster={handleSaveRoster} onNewExtractionResult={setActiveRoster} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 font-sans flex text-gray-100">
            {/* Premium background with animated orbs */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                {/* Base gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>

                {/* Animated orbs */}
                <div className="orb orb-indigo w-[600px] h-[600px] -top-[200px] -left-[100px] animate-float"></div>
                <div className="orb orb-purple w-[500px] h-[500px] top-[30%] right-[-150px] animate-float" style={{ animationDelay: '-2s' }}></div>
                <div className="orb orb-cyan w-[400px] h-[400px] bottom-[-100px] left-[30%] animate-float" style={{ animationDelay: '-4s' }}></div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-grid opacity-30"></div>

                {/* Noise texture */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}></div>
            </div>

            <Sidebar
                user={session.user}
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                savedRosters={savedRosters}
                onSelectRoster={handleSelectRoster}
                onNewExtraction={handleNewExtraction}
                onDeleteRoster={initiateDeleteRoster}
                onRenameRoster={handleRenameRoster}
                onSignOut={handleSignOut}
                activeRosterId={activeRosterId}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
            />

            <main className={`flex-1 pl-20 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-72'} transition-all duration-500 ease-out`}>
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {renderPage()}
                </div>
            </main>

            {isDbSetupOpen && <DatabaseSetupModal onClose={() => setIsDbSetupOpen(false)} />}

            <ConfirmationModal
                isOpen={isDeleteModalOpen && rosterToDelete !== null}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setRosterToDelete(null);
                }}
                onConfirm={confirmDeleteRoster}
                title="Permanently Delete Roster?"
                message={<>You are about to delete the <strong className="text-white font-semibold">"{rosterToDelete?.team_name}"</strong> roster from your library.</>}
                warningTitle="Impact on Iconik"
                warningMessage="This action *WILL NOT* affect your Iconik MAM. Any metadata fields or assets created in Iconik using this roster will remain untouched. RosterSync does not have permission to delete data from your MAM."
                confirmText="Yes, Delete Roster"
                icon={Icons.Delete}
                variant="danger"
            />

            {isConflictModalOpen && conflictingRoster && (
                <SaveConflictModal
                    isOpen={isConflictModalOpen}
                    rosterName={conflictingRoster.team_name}
                    onClose={() => {
                        setIsConflictModalOpen(false);
                        setRosterToSave(null);
                        setConflictingRoster(null);
                    }}
                    onMerge={handleConfirmMergeFromConflict}
                    onSaveNew={handleConfirmSaveAsNew}
                />
            )}
        </div>
    );
};

export default App;