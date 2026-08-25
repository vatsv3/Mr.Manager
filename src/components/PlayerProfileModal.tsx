import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimeFilter } from '../types';
import { POSITION_INFO, AVAILABLE_TRAITS } from '../data/constants';
import { EditPlayerModal } from './EditPlayerModal';
import {
  Star,
  Award,
  Calendar,
  X,
  Trophy,
  Edit3,
} from 'lucide-react';

interface PlayerProfileModalProps {
  playerId: string;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({ playerId, onClose }) => {
  const { getPlayerAggregatedStats, timeFilter, matches, isAdmin } = useApp();

  const [modalTimeFilter, setModalTimeFilter] = useState<TimeFilter>(timeFilter);
  const [isEditing, setIsEditing] = useState(false);
  const stats = getPlayerAggregatedStats(playerId, modalTimeFilter);

  if (!stats) return null;

  const player = stats.player;
  const primaryPos = POSITION_INFO[player.primaryPosition];
  const secondaryList = player.secondaryPositions && player.secondaryPositions.length > 0
    ? player.secondaryPositions
    : player.secondaryPosition
    ? [player.secondaryPosition]
    : [];

  const playerTraitObjs = AVAILABLE_TRAITS.filter(
    t => player.traits.includes(t.id) || player.traits.includes(t.name)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-xl max-h-[92vh] flex flex-col overflow-y-auto space-y-3.5">
          {/* Header with Close & Admin Edit */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-500">
              Player Profile
            </span>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[11px] font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              )}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Player Header Card */}
          <div className="rounded-xl p-3.5 bg-zinc-950/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-700"
                  />
                  {player.jerseyNumber && (
                    <span className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-200 text-[9px] font-mono font-medium px-1 rounded border border-zinc-700">
                      #{player.jerseyNumber}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                    {player.name}
                    {player.preferredFoot && (
                      <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-normal">
                        {player.preferredFoot}
                      </span>
                    )}
                  </h3>
                  {player.nickname && (
                    <p className="text-xs text-zinc-400">"{player.nickname}"</p>
                  )}

                  {/* Primary & Secondary Positions */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: primaryPos?.color || '#10b981' }}
                    >
                      {player.primaryPosition}
                    </span>
                    {secondaryList.map(secPos => (
                      <span
                        key={secPos}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded text-zinc-300 bg-zinc-800 border border-zinc-700"
                      >
                        {secPos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ratings Badges */}
              <div className="flex flex-col items-end gap-1">
                {player.baseRating !== undefined && (
                  <div className="flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-400">
                      {player.baseRating.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-amber-500/80">Base</span>
                  </div>
                )}

                <div className="flex items-center space-x-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                  <Star className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />
                  <span className="text-sm font-semibold text-zinc-100">
                    {stats.avgRating > 0 ? stats.avgRating : '-'}
                  </span>
                  <span className="text-[10px] text-zinc-500">/10</span>
                </div>
                <span className="text-[9px] text-zinc-500">Match Avg</span>
              </div>
            </div>

            {/* FC Mobile Playstyles */}
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider block mb-1.5">
                FC Mobile Playstyles ({playerTraitObjs.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {playerTraitObjs.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No playstyles assigned yet</span>
                ) : (
                  playerTraitObjs.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-zinc-800/80 border border-zinc-700/80 text-xs text-zinc-200"
                    >
                      <img src={t.icon} alt={t.name} className="w-5 h-5 object-contain shrink-0" />
                      <span className="text-[11px] font-medium">{t.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        {/* Time Period Filter */}
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800 text-xs">
            {(['1m', '2m', '3m', 'all'] as TimeFilter[]).map(tf => (
              <button
                key={tf}
                onClick={() => setModalTimeFilter(tf)}
                className={`py-1 rounded font-medium transition text-center ${
                  modalTimeFilter === tf
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tf === '1m' && '1M'}
                {tf === '2m' && '2M'}
                {tf === '3m' && '3M'}
                {tf === 'all' && 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* PROMINENT APPEARANCES, W / D / L & MATCH RECORD STATS */}
        <div className="grid grid-cols-4 gap-1.5 text-center">
          {/* Appearances */}
          <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">Appearances</span>
            <span className="text-base font-bold text-zinc-100">{stats.matchesPlayed}</span>
            <span className="text-[9px] text-zinc-500 block">Matches</span>
          </div>

          {/* Record Breakdown (Wins, Losses, Draws) */}
          <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">Record</span>
            <div className="flex items-center justify-center space-x-1 mt-0.5">
              <span className="text-xs font-bold text-emerald-400">{stats.wins}W</span>
              <span className="text-xs font-bold text-zinc-400">{stats.draws}D</span>
              <span className="text-xs font-bold text-rose-400">{stats.losses}L</span>
            </div>
            <span className="text-[9px] text-zinc-500 block">W / D / L</span>
          </div>

          {/* Win Rate */}
          <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">Win Rate</span>
            <span className="text-base font-bold text-emerald-400">{stats.winRate}%</span>
            <span className="text-[9px] text-zinc-500 block">Success</span>
          </div>

          {/* MOTMs */}
          <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 block">MOTMs</span>
            <span className="text-base font-bold text-amber-400">{stats.mvpCount}</span>
            <span className="text-[9px] text-zinc-500 block">Awards</span>
          </div>
        </div>

        {/* Goals & Assists Breakdown Bar */}
        <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-300 font-medium">Goal Contributions</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-zinc-200 font-bold">
              {stats.goalContributions} <span className="text-zinc-500 text-[10px] font-normal">Total</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              ⚽ {stats.totalGoals} <span className="text-zinc-500 text-[9px]">G</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">
              👟 {stats.totalAssists} <span className="text-zinc-500 text-[9px]">A</span>
            </span>
          </div>
        </div>

        {/* Match History */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <h4 className="font-medium text-zinc-400">
              Match History ({stats.ratingsHistory.length})
            </h4>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {stats.ratingsHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950/40 rounded-lg border border-zinc-800/60 text-center">
                No matches played in selected period.
              </p>
            ) : (
              stats.ratingsHistory.map(entry => {
                const match = matches.find(m => m.id === entry.matchId);
                if (!match) return null;

                const matchStat = match.calculatedStats?.[player.id];
                const goalsInMatch = matchStat?.goals || 0;
                const assistsInMatch = matchStat?.assists || 0;

                // Check match outcome for player
                const inTeamA = match.teamA.lineup.some(s => s.playerId === player.id);
                const inTeamB = match.teamB.lineup.some(s => s.playerId === player.id);
                let outcomeLabel = 'D';
                let outcomeStyle = 'bg-zinc-800 text-zinc-300';
                if (match.scoreA !== match.scoreB) {
                  if ((inTeamA && match.scoreA > match.scoreB) || (inTeamB && match.scoreB > match.scoreA)) {
                    outcomeLabel = 'W';
                    outcomeStyle = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                  } else {
                    outcomeLabel = 'L';
                    outcomeStyle = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                  }
                }

                return (
                  <div
                    key={entry.matchId}
                    className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2.5 space-y-1 text-xs transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${outcomeStyle}`}>
                          {outcomeLabel}
                        </span>
                        <span className="font-medium text-zinc-200 truncate max-w-[180px]">
                          {match.title}
                        </span>
                      </div>
                      {entry.isMvp && (
                        <span className="flex items-center gap-1 font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
                          <Award className="w-3 h-3" /> MOTM
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{match.date}</span>
                        <span>•</span>
                        <span>{match.scoreA} - {match.scoreB}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {goalsInMatch > 0 && (
                          <span className="text-[10px] text-zinc-300">⚽ {goalsInMatch > 1 ? goalsInMatch : ''}</span>
                        )}
                        {assistsInMatch > 0 && (
                          <span className="text-[10px] text-zinc-300">👟 {assistsInMatch > 1 ? assistsInMatch : ''}</span>
                        )}
                        <span className="font-semibold text-zinc-200">
                          {entry.rating.toFixed(1)}
                        </span>
                        <span className="text-[8px] text-zinc-500">/10</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
    {isEditing && (
      <EditPlayerModal
        player={player}
        onClose={() => setIsEditing(false)}
      />
    )}
  </>
);
};
