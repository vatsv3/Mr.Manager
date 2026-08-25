import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Copy, Check, Download, X } from 'lucide-react';

interface SupabaseExportModalProps {
  onClose: () => void;
}

export const SupabaseExportModal: React.FC<SupabaseExportModalProps> = ({ onClose }) => {
  const { players, matches, ratingLogs } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'sql' | 'json' | 'instructions'>('sql');

  const supabaseSql = `-- ==========================================
-- MR.MANAGER SUPABASE DATABASE SCHEMA
-- Execute in Supabase SQL Editor
-- ==========================================

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  jersey_number INT,
  photo TEXT NOT NULL,
  primary_position TEXT NOT NULL,
  secondary_position TEXT NOT NULL,
  traits JSONB DEFAULT '[]'::jsonb,
  preferred_foot TEXT DEFAULT 'Right',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MATCHES TABLE
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  format TEXT NOT NULL, -- '5v5', '7v7', '11v11'
  score_a INT DEFAULT 0,
  score_b INT DEFAULT 0,
  team_a JSONB NOT NULL, -- { name, kitColor, lineup }
  team_b JSONB NOT NULL, -- { name, kitColor, lineup }
  status TEXT DEFAULT 'UPCOMING', -- 'UPCOMING', 'LIVE', 'RATING_OPEN', 'RATING_CLOSED'
  goals JSONB DEFAULT '[]'::jsonb,
  mvp_player_id TEXT REFERENCES public.players(id),
  mvp_score NUMERIC(4,2),
  rating_window_started_at TIMESTAMPTZ,
  rating_window_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RATING LOGS & AUDIT TABLE
CREATE TABLE IF NOT EXISTS public.rating_logs (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL REFERENCES public.players(id),
  voter_name TEXT NOT NULL,
  rated_player_id TEXT NOT NULL REFERENCES public.players(id),
  rated_player_name TEXT NOT NULL,
  rating NUMERIC(3,1) NOT NULL CHECK (rating >= 0 AND rating <= 10),
  mvp_vote_player_id TEXT REFERENCES public.players(id),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_rating CHECK (voter_id <> rated_player_id)
);

-- 4. RLS POLICIES (Row Level Security)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read All" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public Read Matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Read Logs" ON public.rating_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert ratings" ON public.rating_logs FOR INSERT WITH CHECK (true);
`;

  const jsonData = JSON.stringify({ players, matches, ratingLogs }, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mr_manager_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-xl max-h-[92vh] flex flex-col overflow-y-auto space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Supabase & Database</h3>
            <p className="text-xs text-zinc-500">SQL Schema & Data Export</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-zinc-950/60 p-0.5 text-xs border border-zinc-800">
          <button
            onClick={() => setActiveView('sql')}
            className={`flex-1 py-1 rounded font-medium transition ${
              activeView === 'sql' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Supabase SQL
          </button>
          <button
            onClick={() => setActiveView('json')}
            className={`flex-1 py-1 rounded font-medium transition ${
              activeView === 'json' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            JSON Data
          </button>
          <button
            onClick={() => setActiveView('instructions')}
            className={`flex-1 py-1 rounded font-medium transition ${
              activeView === 'instructions' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Setup Guide
          </button>
        </div>

        {/* View 1: SQL Schema */}
        {activeView === 'sql' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">PostgreSQL Schema:</span>
              <button
                onClick={() => handleCopy(supabaseSql)}
                className="flex items-center gap-1 text-zinc-300 hover:text-white font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy SQL'}
              </button>
            </div>
            <pre className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-60">
              {supabaseSql}
            </pre>
          </div>
        )}

        {/* View 2: JSON Backup */}
        {activeView === 'json' && (
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium">JSON Payload:</span>
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-medium"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
            <pre className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-56">
              {jsonData}
            </pre>
          </div>
        )}

        {/* View 3: Deployment instructions */}
        {activeView === 'instructions' && (
          <div className="space-y-2 text-xs text-zinc-300">
            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 space-y-1">
              <h4 className="font-medium text-zinc-200">Supabase Connection</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Execute the provided SQL schema in your Supabase SQL editor to enable persistent cross-device ratings and matches.
              </p>
            </div>

            <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-800 space-y-1">
              <h4 className="font-medium text-zinc-200">Vercel Deployment</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Connect your Git repository on Vercel. Vite preset is auto-detected with <code className="text-zinc-300">npm run build</code>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

