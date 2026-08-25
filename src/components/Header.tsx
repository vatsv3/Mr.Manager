import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, User, ChevronDown, Check, Plus, Star, LogOut } from 'lucide-react';
import { POSITION_INFO } from '../data/constants';

interface HeaderProps {
  onOpenNewPlayerModal: () => void;
  onOpenNewMatchModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewPlayerModal, onOpenNewMatchModal }) => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    players,
    isAdmin,
    setIsAdmin,
    activeRatingMatches,
    setActiveTab,
    setSelectedPlayerId,
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs">
            ⚽
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
                Mr.Manager
              </h1>
              {isAdmin && (
                <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700/60">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-normal">Squad, ratings & MOTM</p>
          </div>
        </div>

        {/* Actions & User Switcher */}
        <div className="flex items-center space-x-2">
          {/* Active Rating Notification */}
          {activeRatingMatches.length > 0 && (
            <button
              onClick={() => setActiveTab('ratings')}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition"
              title="Rating window is active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Rate</span>
            </button>
          )}

          {/* Current User Pill */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 rounded-full pl-1.5 pr-2.5 py-1 transition text-left"
            >
              {currentUser ? (
                <div className="relative">
                  <img
                    src={currentUser.photo}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 text-[7px] font-bold px-0.5 rounded text-white leading-none"
                    style={{ backgroundColor: POSITION_INFO[currentUser.primaryPosition]?.color || '#10b981' }}
                  >
                    {currentUser.primaryPosition}
                  </span>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}

              <div className="max-w-[72px] truncate text-xs font-medium text-zinc-200">
                {currentUser ? currentUser.name.split(' ')[0] : 'Select User'}
              </div>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {/* Dropdown */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 p-2 text-zinc-200">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-zinc-400">Current User</span>
                      <button
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                          isAdmin
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {isAdmin ? 'Admin Mode On' : 'Enable Admin'}
                      </button>
                    </div>
                    {currentUser && (
                      <p className="text-xs text-zinc-300">
                        Ratings submitted as <strong className="text-emerald-400 font-medium">{currentUser.name}</strong>
                      </p>
                    )}
                  </div>

                  {/* Player List */}
                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                    {players.map(player => {
                      const isSelected = currentUser?.id === player.id;
                      const posColor = POSITION_INFO[player.primaryPosition]?.color || '#10b981';
                      return (
                        <button
                          key={player.id}
                          onClick={() => {
                            setCurrentUser(player);
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                            isSelected ? 'bg-zinc-800 text-zinc-100' : 'hover:bg-zinc-800/60 text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <img
                              src={player.photo}
                              alt={player.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="truncate">
                              <p className="font-medium text-zinc-100 truncate">{player.name}</p>
                              <div className="flex items-center space-x-1">
                                <span
                                  className="text-[8px] font-semibold px-1 rounded text-white"
                                  style={{ backgroundColor: posColor }}
                                >
                                  {player.primaryPosition}
                                </span>
                                {player.jerseyNumber && (
                                  <span className="text-[9px] text-zinc-500 font-mono">#{player.jerseyNumber}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="pt-1.5 mt-1 border-t border-zinc-800 space-y-1">
                    {currentUser && (
                      <button
                        onClick={() => {
                          setSelectedPlayerId(currentUser.id);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 transition"
                      >
                        <User className="w-3 h-3" /> View Profile & Stats
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenNewPlayerModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                    >
                      <Plus className="w-3 h-3" /> Register Player
                    </button>

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                    >
                      <LogOut className="w-3 h-3" /> Log Out Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

