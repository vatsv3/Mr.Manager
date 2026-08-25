import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Calendar, LayoutGrid, Star, Trophy, ClipboardList, Users } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeRatingMatches, setActiveTab } = useApp();
  const location = useLocation();

  const tabs = [
    { path: '/matches', tabId: 'matches' as const, label: 'Matches', icon: Calendar },
    { path: '/pitch', tabId: 'pitch' as const, label: 'Tactics', icon: LayoutGrid },
    {
      path: '/ratings',
      tabId: 'ratings' as const,
      label: 'Rate',
      icon: Star,
      badge: activeRatingMatches.length > 0 ? activeRatingMatches.length : undefined,
    },
    { path: '/roster', tabId: 'players' as const, label: 'Roster', icon: Users },
    { path: '/leaderboard', tabId: 'stats' as const, label: 'Rankings', icon: Trophy },
    { path: '/logs', tabId: 'logs' as const, label: 'Logs', icon: ClipboardList },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-t border-zinc-800/80 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive =
            location.pathname === tab.path ||
            (tab.path === '/matches' && location.pathname === '/');

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              onClick={() => setActiveTab(tab.tabId)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition text-center ${
                isActive
                  ? 'text-zinc-100 font-medium'
                  : 'text-zinc-500 hover:text-zinc-300 font-normal'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400 stroke-[2.2]' : 'text-zinc-500 stroke-[1.6]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-emerald-400 text-zinc-950 font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'text-zinc-200 font-medium' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};


