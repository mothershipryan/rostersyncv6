
export interface User {
    id: string;
    email: string;
}

export interface Session {
    user: User;
    token: string;
}

export interface Player {
    name: string;
    position: string;
}

export interface ExtractionResult {
    teamName: string;
    sport: string;
    players: Player[];
    verifiedSources: string[];
    verificationNotes: string;
    meta?: {
        model: string;
        totalTokens: number;
        promptTokens: number;
        candidatesTokens: number;
        latencyMs: number;
    };
}

export interface SavedRoster {
    id: string;
    user_id: string;
    team_name: string;
    sport: string; 
    player_names: string[];
    data: ExtractionResult;
    created_at: string;
}

export enum Page {
    DASHBOARD = 'Dashboard',
    ACTIVITY = 'Activity',
    SETTINGS = 'Iconik Settings',
}

export interface ActivityLog {
    id: string;
    user_id: string;
    timestamp: string;
    action: 'Extraction' | 'Export' | 'Deletion' | 'Login' | 'Logout' | 'Modification';
    details: string;
    status: 'OK' | 'ERR' | 'WARN';
}
