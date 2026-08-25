import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MatchesPage } from './pages/MatchesPage';
import { TacticsPage } from './pages/TacticsPage';
import { RatingsPage } from './pages/RatingsPage';
import { RosterPage } from './pages/RosterPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LogsPage } from './pages/LogsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PlayerEditModal } from './components/PlayerEditModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { PlayerSignupModal } from './components/PlayerSignupModal';
import { CreateMatchModal } from './components/CreateMatchModal';
import { AuthLandingView } from './components/AuthLandingView';

// Route sync helper to keep activeTab synchronized with URL
const RouteSync: React.FC = () => {
  const location = useLocation();
  const { setActiveTab } = useApp();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/matches') || path === '/') {
      setActiveTab('matches');
    } else if (path.startsWith('/pitch') || path.startsWith('/tactics')) {
      setActiveTab('pitch');
    } else if (path.startsWith('/ratings') || path.startsWith('/rate')) {
      setActiveTab('ratings');
    } else if (path.startsWith('/roster') || path.startsWith('/players')) {
      setActiveTab('players');
    } else if (path.startsWith('/leaderboard') || path.startsWith('/stats') || path.startsWith('/rankings')) {
      setActiveTab('stats');
    } else if (path.startsWith('/logs') || path.startsWith('/audit')) {
      setActiveTab('logs');
    }
  }, [location.pathname, setActiveTab]);

  return null;
};

const MainLayout: React.FC = () => {
  const { currentUser, selectedPlayerId, setSelectedPlayerId, editPlayerId, setEditPlayerId } = useApp();

  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [createMatchModalOpen, setCreateMatchModalOpen] = useState(false);

  // Only valid authenticated accounts can access the app
  if (!currentUser) {
    return <AuthLandingView />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <RouteSync />
      {/* Main App Container */}
      <div className="w-full mx-auto flex-1 flex flex-col max-w-md pb-16">
        {/* Header */}
        <Header
          onOpenNewPlayerModal={() => setSignupModalOpen(true)}
          onOpenNewMatchModal={() => setCreateMatchModalOpen(true)}
        />

        {/* Dedicated Web Pages via React Router */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/matches" replace />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/pitch" element={<TacticsPage />} />
            <Route path="/tactics" element={<Navigate to="/pitch" replace />} />
            <Route path="/ratings" element={<RatingsPage />} />
            <Route path="/rate" element={<Navigate to="/ratings" replace />} />
            <Route path="/roster" element={<RosterPage />} />
            <Route path="/players" element={<Navigate to="/roster" replace />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/stats" element={<Navigate to="/leaderboard" replace />} />
            <Route path="/rankings" element={<Navigate to="/leaderboard" replace />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
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

      {editPlayerId && (
        <PlayerEditModal
          playerId={editPlayerId}
          onClose={() => setEditPlayerId(null)}
        />
      )}

      {signupModalOpen && (
        <PlayerSignupModal onClose={() => setSignupModalOpen(false)} />
      )}

      {createMatchModalOpen && (
        <CreateMatchModal onClose={() => setCreateMatchModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
