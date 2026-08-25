import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Match, MatchStatus } from '../types';
import { MatchDetailsModal } from './MatchDetailsModal';
import { CreateMatchModal } from './CreateMatchModal';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  Plus,
  Play,
  Square,
  Trophy,
  Award,
  ChevronRight,
  Shield,
  LayoutGrid,
  Trash2,
} from 'lucide-react';

export const MatchList: React.FC = () => {
  const {
    matches,
    players,
    isAdmin,
    setActiveTab,
    setSelectedMatchId,
    startRatingWindow,
    stopRatingWindow,
    deleteMatch,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'RATING_OPEN' | 'RATING_CLOSED' | 'UPCOMING'>('all');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<Match | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matchIdToDelete, setMatchIdToDelete] = useState<string | null>(null);

  const filteredMatches = matches.filter(m => {
    if (activeFilter === 'all') return true;
    return m.status === activeFilter;
  });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
            Matches
          </h2>
          <p className="text-xs text-zinc-500">Schedules, lineups & rating sessions</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Match
          </button>
        )}
      </div>

      {/* Filter Segmented Control */}
      <div className="flex rounded-lg bg-zinc-900/90 border border-zinc-800 p-0.5 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-1 rounded-md font-medium transition ${
            activeFilter === 'all' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          All ({matches.length})
        </button>
        <button
          onClick={() => setActiveFilter('RATING_OPEN')}
          className={`flex-1 py-1 rounded-md font-medium transition flex items-center justify-center gap-1 ${
            activeFilter === 'RATING_OPEN' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Live
        </button>
        <button
          onClick={() => setActiveFilter('RATING_CLOSED')}
          className={`flex-1 py-1 rounded-md font-medium transition ${
            activeFilter === 'RATING_CLOSED' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Finished
        </button>
        <button
          onClick={() => setActiveFilter('UPCOMING')}
          className={`flex-1 py-1 rounded-md font-medium transition ${
            activeFilter === 'UPCOMING' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Upcoming
        </button>
      </div>

      {/* Match Cards List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs bg-zinc-900/30">
            <p>No matches in this category.</p>
          </div>
        ) : (
          filteredMatches.map(match => {
            const mvp = players.find(p => p.id === match.mvpPlayerId);

            return (
              <div
                key={match.id}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-3.5 space-y-3 transition"
              >
                {/* Header row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                      {match.format}
                    </span>
                    <span className="font-medium text-zinc-200 truncate max-w-[170px]">
                      {match.title}
                    </span>
                  </div>

                  {/* Status chip */}
                  {match.status === 'RATING_OPEN' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Voting Live
                    </span>
                  )}
                  {match.status === 'RATING_CLOSED' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      Finalized
                    </span>
                  )}
                  {match.status === 'UPCOMING' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Scoreboard Preview */}
                <div
                  onClick={() => setSelectedMatchForModal(match)}
                  className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60 flex items-center justify-between cursor-pointer hover:border-zinc-700 transition"
                >
                  {/* Team A */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: match.teamA.kitColor }}
                    />
                    <span className="text-xs font-medium text-zinc-200 truncate">{match.teamA.name}</span>
                  </div>

                  {/* Score */}
                  <div className="px-3 flex items-center space-x-2 text-base font-semibold">
                    <span className="text-zinc-100">{match.scoreA}</span>
                    <span className="text-zinc-600 text-xs">-</span>
                    <span className="text-zinc-100">{match.scoreB}</span>
                  </div>

                  {/* Team B */}
                  <div className="flex items-center space-x-2 flex-1 justify-end min-w-0">
                    <span className="text-xs font-medium text-zinc-200 truncate text-right">{match.teamB.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: match.teamB.kitColor }}
                    />
                  </div>
                </div>

                {/* Match Details Line */}
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{match.date}</span>
                    <span>•</span>
                    <span>{match.format}</span>
                  </div>

                  {mvp && (
                    <div className="flex items-center space-x-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>MOTM: {mvp.name.split(' ')[0]}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMatchId(match.id);
                      setActiveTab('pitch');
                    }}
                    className="flex-1 py-1.5 px-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <LayoutGrid className="w-3 h-3 text-zinc-400" /> Lineup & Tactics
                  </button>

                  {match.status === 'RATING_OPEN' ? (
                    <button
                      onClick={() => {
                        setSelectedMatchId(match.id);
                        setActiveTab('ratings');
                      }}
                      className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      <Star className="w-3 h-3 fill-zinc-950" /> Rate Players
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedMatchForModal(match)}
                      className="flex-1 py-1.5 px-2 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1 transition"
                    >
                      Details & Stats
                    </button>
                  )}

                  {/* Admin Start / Stop rating shortcut */}
                  {isAdmin && match.status !== 'RATING_OPEN' && (
                    <button
                      onClick={() => startRatingWindow(match.id)}
                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition"
                      title="Start Ratings Window"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                    </button>
                  )}

                  {isAdmin && match.status === 'RATING_OPEN' && (
                    <button
                      onClick={() => stopRatingWindow(match.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition"
                      title="Stop Ratings Window"
                    >
                      <Square className="w-3.5 h-3.5 fill-rose-400" />
                    </button>
                  )}

                  {/* Delete Match Button */}
                  <button
                    onClick={() => setMatchIdToDelete(match.id)}
                    className="p-1.5 bg-zinc-800/80 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-lg border border-zinc-700/60 hover:border-rose-500/30 transition"
                    title="Delete Match"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Delete Confirmation */}
                {matchIdToDelete === match.id && (
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-rose-300 font-semibold">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete this match permanently?</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Scores, lineups, and all ratings for this match will be erased.
                    </p>
                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setMatchIdToDelete(null)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteMatch(match.id);
                          setMatchIdToDelete(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition shadow flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedMatchForModal && (
        <MatchDetailsModal
          match={selectedMatchForModal}
          onClose={() => setSelectedMatchForModal(null)}
          onNavigateToRating={() => {
            setSelectedMatchId(selectedMatchForModal.id);
            setActiveTab('ratings');
          }}
          onNavigateToPitch={() => {
            setSelectedMatchId(selectedMatchForModal.id);
            setActiveTab('pitch');
          }}
        />
      )}

      {/* Create Modal */}
      {createModalOpen && <CreateMatchModal onClose={() => setCreateModalOpen(false)} />}
    </div>
  );
};

