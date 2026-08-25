import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TacticalPitch } from './components/TacticalPitch';
import { MatchList } from './components/MatchList';
import { RatingWindow } from './components/RatingWindow';
import { Leaderboard } from './components/Leaderboard';
import { LogsAudit } from './components/LogsAudit';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { PlayerSignupModal } from './components/PlayerSignupModal';
import { CreateMatchModal } from './components/CreateMatchModal';
import { SupabaseExportModal } from './components/SupabaseExportModal';
import { AuthLandingView } from './components/AuthLandingView';
import { Database, Smartphone, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab, selectedPlayerId, setSelectedPlayerId } = useApp();

  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  // Only valid authenticated accounts can access the app
  if (!currentUser) {
    return <AuthLandingView />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Main App Container */}
      <div
        className={`w-full mx-auto transition-all duration-200 flex-1 flex flex-col ${
          isPhoneFrame
            ? 'max-w-md my-6 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden min-h-[820px] bg-[#09090b] relative'
            : 'max-w-md'
        }`}
      >
        {/* Header */}
        <Header
          onOpenNewPlayerModal={() => setSignupModalOpen(true)}
          onOpenNewMatchModal={() => setCreateMatchModalOpen(true)}
        />

        {/* Mobile Quick Action Strip */}
        <div className="px-4 pt-2.5 flex items-center justify-between text-xs lg:hidden">
          <button
            onClick={() => setSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-emerald-400 font-medium bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg transition"
          >
            <Database className="w-3 h-3 text-emerald-400" /> Supabase
          </button>
          <button
            onClick={() => setSignupModalOpen(true)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 font-medium bg-zinc-900/60 border border-zinc-800/80 px-2.5 py-1 rounded-lg transition"
          >
            + Register Player
          </button>
        </div>

        {/* Active Tab View */}
        <main className="flex-1">
          {activeTab === 'matches' && <MatchList />}
          {activeTab === 'pitch' && <TacticalPitch />}
          {activeTab === 'ratings' && <RatingWindow />}
          {activeTab === 'stats' && <Leaderboard />}
          {activeTab === 'logs' && <LogsAudit />}
        </main>

        {/* Bottom Mobile Navigation */}
        <BottomNav />
      </div>

      {/* Global Modals */}
      {selectedPlayerId && (
        <PlayerProfileModal
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}

      {signupModalOpen && (
        <PlayerSignupModal onClose={() => setSignupModalOpen(false)} />
      )}

      {createMatchModalOpen && (
        <CreateMatchModal onClose={() => setCreateMatchModalOpen(false)} />
      )}

      {supabaseModalOpen && (
        <SupabaseExportModal onClose={() => setSupabaseModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

