
import React, { useState } from 'react';
import { Icons } from './icons';

interface DatabaseSetupModalProps {
    onClose: () => void;
}

const SUPABASE_SQL = `-- Copy this into your Supabase SQL Editor

-- Table for user-saved rosters
create table if not exists saved_rosters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  team_name text not null,
  sport text not null,
  player_names text[] not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table saved_rosters enable row level security;

drop policy if exists "Users can create their own rosters" on saved_rosters;
create policy "Users can create their own rosters"
  on saved_rosters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own rosters" on saved_rosters;
create policy "Users can view their own rosters"
  on saved_rosters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own rosters" on saved_rosters;
create policy "Users can update their own rosters"
  on saved_rosters for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own rosters" on saved_rosters;
create policy "Users can delete their own rosters"
  on saved_rosters for delete
  using (auth.uid() = user_id);

-- Table for demo requests from the landing page
create table if not exists demo (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  phone text, -- Storing as text is best practice for phone numbers
  work_email text not null,
  company text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table demo enable row level security;

-- Allow anonymous users (from the landing page) to submit a demo request.
drop policy if exists "Allow anonymous demo request submissions" on demo;
create policy "Allow anonymous demo request submissions"
  on demo for insert
  with check (true);

-- Table for support tickets
create table if not exists support_tickets (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table support_tickets enable row level security;

-- Allow anonymous users to submit support tickets
drop policy if exists "Allow anonymous support ticket submissions" on support_tickets;
create policy "Allow anonymous support ticket submissions"
  on support_tickets for insert
  with check (true);

-- Table for persistent user activity logs
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  "timestamp" timestamp with time zone default timezone('utc'::text, now()) not null,
  action text not null,
  details text not null,
  status text not null
);

alter table activity_logs enable row level security;

drop policy if exists "Users can create their own activity logs" on activity_logs;
create policy "Users can create their own activity logs"
  on activity_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can view their own activity logs" on activity_logs;
create policy "Users can view their own activity logs"
  on activity_logs for select
  using (auth.uid() = user_id);
`;

const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({ onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SUPABASE_SQL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] animate-fade-in p-4" onClick={onClose}>
            <div 
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-in-from-bottom flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="h-14 bg-slate-800 border-b border-white/5 flex items-center justify-between px-6">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary/20 rounded-lg">
                            <Icons.Database className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-white">Database Initialization</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <Icons.Close className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                         <div className="absolute right-4 top-4 z-10">
                            <button 
                                onClick={handleCopy}
                                className={`text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                                    copied
                                    ? 'bg-accent border-accent/20'
                                    : 'bg-white/10 hover:bg-white/20 border-white/5'
                                }`}
                            >
                                {copied ? <Icons.Check className="w-3.5 h-3.5" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied' : 'Copy SQL'}
                            </button>
                        </div>
                        <pre className="p-6 text-[11px] font-mono text-gray-300 leading-relaxed overflow-x-auto custom-scrollbar">
                            <code>{SUPABASE_SQL}</code>
                        </pre>
                    </div>

                    <div className="mt-6 text-center">
                        <a 
                            href="https://supabase.com/dashboard/project/_/sql" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors text-sm font-semibold"
                        >
                            Open Supabase SQL Editor <Icons.ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseSetupModal;
