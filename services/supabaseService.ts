
import { createClient } from '@supabase/supabase-js';
import type { Session, User, SavedRoster, ExtractionResult, ActivityLog } from '../types';

/**
 * Supabase Configuration
 * We use process.env for compatibility with the environment injection.
 * Fallbacks are provided to ensure the app doesn't crash if Vercel variables aren't set yet.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yfyclefcfivvonleaymd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmeWNsZWZjZml2dm9ubGVheW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODY2MDQsImV4cCI6MjA4MjU2MjYwNH0.NLpd3h1fy603jx0dKXRCM3dw7Rlc082LidARVRsIsTY';

// Log a warning if we are falling back to hardcoded keys
if (!process.env.VITE_SUPABASE_URL) {
    console.warn("RosterSync: Using fallback Supabase URL. Please set VITE_SUPABASE_URL in Vercel settings.");
}

const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
    async signUp(email: string, password: string, name: string, company: string): Promise<{ session: Session | null; error: Error | null; requiresConfirmation: boolean }> {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    company: company,
                },
                emailRedirectTo: redirectTo,
            },
        });
        if (error) return { session: null, error, requiresConfirmation: false };
        const requiresConfirmation = !data.session && !!data.user;
        if (data.session && data.user) {
            return {
                session: {
                    user: { id: data.user.id, email: data.user.email || '' },
                    token: data.session.access_token
                },
                error: null,
                requiresConfirmation: false
            };
        }
        return { session: null, error: null, requiresConfirmation };
    },

    async signIn(email: string, password: string): Promise<{ session: Session | null; error: Error | null }> {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) return { session: null, error };
        if (data.session && data.user) {
            return {
                session: {
                    user: { id: data.session.user.id, email: data.session.user.email || '' },
                    token: data.session.access_token
                },
                error: null
            };
        }
        return { session: null, error: new Error('Sign in failed') };
    },

    async getSession(): Promise<Session | null> {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session && data.session.user) {
            return {
                user: { id: data.session.user.id, email: data.session.user.email || '' },
                token: data.session.access_token
            };
        }
        return null;
    },

    async signOut(): Promise<{ error: Error | null }> {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    async getSavedRosters(userId: string): Promise<{ data: SavedRoster[], error: string | null }> {
        const { data, error } = await supabaseClient
            .from('saved_rosters')
            .select('*')
            .eq('user_id', userId)
            .order('team_name', { ascending: true });
        if (error) return { data: [], error: error.message };
        return { data: data as SavedRoster[], error: null };
    },
    
    async saveRoster(userId: string, teamName: string, sport: string, data: ExtractionResult): Promise<SavedRoster | null> {
        const { data: result, error } = await supabaseClient
            .from('saved_rosters')
            .insert({ user_id: userId, team_name: teamName, sport: sport, player_names: data.players.map(p => p.name), data: data })
            .select().single();
        if (error) return null;
        return result as SavedRoster;
    },

    async updateRoster(rosterId: string, userId: string, updatedData: ExtractionResult): Promise<SavedRoster | null> {
        const { data: result, error } = await supabaseClient
            .from('saved_rosters')
            .update({ team_name: updatedData.teamName, sport: updatedData.sport, player_names: updatedData.players.map(p => p.name), data: updatedData })
            .eq('id', rosterId).eq('user_id', userId).select().single();
        if (error) return null;
        return result as SavedRoster;
    },
    
    async deleteRoster(rosterId: string, userId: string): Promise<{ error: Error | null }> {
        const { error } = await supabaseClient.from('saved_rosters').delete().eq('id', rosterId).eq('user_id', userId);
        return { error };
    },

    async renameRoster(rosterId: string, userId: string, newName: string): Promise<SavedRoster | null> {
        const { data: current, error: fetchError } = await supabaseClient.from('saved_rosters').select('data').eq('id', rosterId).eq('user_id', userId).single();
        if (fetchError || !current) return null;
        const updatedDataObject = { ...current.data, teamName: newName };
        const { data: result, error } = await supabaseClient.from('saved_rosters').update({ team_name: newName, data: updatedDataObject }).eq('id', rosterId).eq('user_id', userId).select().single();
        if (error) return null;
        return result as SavedRoster;
    },
    
    async getActivityLogs(userId: string): Promise<{ data: ActivityLog[], error: string | null }> {
        const { data, error } = await supabaseClient.from('activity_logs').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
        if (error) return { data: [], error: error.message };
        return { data: data as ActivityLog[], error: null };
    },

    async addActivityLog(userId: string, log: Omit<ActivityLog, 'id' | 'timestamp' | 'user_id'>): Promise<ActivityLog | null> {
        const { data, error } = await supabaseClient.from('activity_logs').insert({ ...log, user_id: userId }).select().single();
        if (error) return null;
        return data as ActivityLog;
    },

    async saveDemoRequest(formData: { name: string; email: string; phone: string; company: string; notes: string }): Promise<{ error: Error | null }> {
        const { error } = await supabaseClient
            .from('demo')
            .insert({
                full_name: formData.name,
                work_email: formData.email,
                phone: formData.phone,
                company: formData.company,
                notes: formData.notes
            });

        if (!error) {
            // Trigger Email Notification
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'demo_request', data: formData })
            }).then(async res => {
                if (!res.ok) {
                    const errBody = await res.json();
                    console.error("[Notify] Demo Request Email Failed:", errBody);
                }
            }).catch(e => console.error("[Notify] Demo Request Network Error:", e));
        }

        return { error };
    },

    async saveSupportTicket(formData: { name: string; email: string; message: string }): Promise<{ error: Error | null }> {
        const { error } = await supabaseClient
            .from('support_tickets')
            .insert({ full_name: formData.name, email: formData.email, message: formData.message });
        
        if (!error) {
            // Trigger Email Notification
            fetch('/api/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'support_ticket', data: formData })
            }).then(async res => {
                if (!res.ok) {
                    const errBody = await res.json();
                    console.error("[Notify] Support Ticket Email Failed:", errBody);
                }
            }).catch(e => console.error("[Notify] Support Ticket Network Error:", e));
        }
        return { error };
    }
};

export const supabase = supabaseService;
