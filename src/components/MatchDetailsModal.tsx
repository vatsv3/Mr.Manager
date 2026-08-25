import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Match } from '../types';
import {
  Play,
  Square,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Star,
  Users,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';

interface MatchDetailsModalProps {
  match: Match;
  onClose: () => void;
  onNavigateToRating: () => void;
  onNavigateToPitch: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  onClose,
  onNavigateToRating,
  onNavigateToPitch,
}) => {
  const {
    players,
    isAdmin,
    startRatingWindow,
    stopRatingWindow,
    resumeRatingWindow,
    addGoalEvent,
    removeGoalEvent,
    deleteMatch,
    setSelectedPlayerId,
    computeMatchStats,
  } = useApp();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTeam, setGoalTeam] = useState<'teamA' | 'teamB'>('teamA');
  const [scorerId, setScorerId] = useState<string>('');
  const [assisterId, setAssisterId] = useState<string>('');

  const { calculatedStats, computedMvpId } = computeMatchStats(match);
  const mvpPlayer = players.find(p => p.id === (computedMvpId || match.mvpPlayerId));

  const teamAPlayers = match.teamA.lineup
    .map(s => players.find(p => p.id === s.playerId))
    .filter(Boolean);
  const teamBPlayers = match.teamB.lineup
    .map(s => players.find(p => p.id === s.playerId))
    .filter(Boolean);

  const handleSaveGoal = () => {
    if (!scorerId) return;
    addGoalEvent(match.id, {
      team: goalTeam,
      scorerId,
      assisterId: assisterId || undefined,
    });
    setIsAddingGoal(false);
    setScorerId('');
    setAssisterId('');
  };

  const getRatingBadgeStyle = (rating: number) => {
    if (rating >= 8.0) return 'bg-emerald-400 text-zinc-950 font-bold';
    if (rating >= 7.0) return 'bg-emerald-600 text-white font-bold';
    if (rating >= 6.0) return 'bg-amber-500 text-zinc-950 font-bold';
    if (rating > 0) return 'bg-rose-500 text-white font-bold';
    return 'bg-zinc-800 text-zinc-400 font-semibold';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-xl max-h-[90vh] flex flex-col overflow-y-auto space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {match.format} • {match.status.replace('_', ' ')}
            </span>
            <h3 className="text-sm font-semibold text-zinc-100 mt-1">{match.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Match Date Details */}
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>{match.date}</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
            {match.format} Squad
          </span>
        </div>

        {/* SCOREBOARD DISPLAY */}
        <div className="bg-zinc-950/60 rounded-xl p-3.5 border border-zinc-800/80 text-center">
          <div className="flex items-center justify-between">
            {/* Team A */}
            <div className="flex-1 text-center">
              <div
                className="w-3 h-1 rounded-full mx-auto mb-1"
                style={{ backgroundColor: match.teamA.kitColor }}
              />
              <h4 className="font-medium text-xs text-zinc-300 uppercase truncate px-1">
                {match.teamA.name}
              </h4>
              <span className="text-2xl font-semibold text-zinc-100">
                {match.scoreA}
              </span>
            </div>

            <div className="px-3 text-zinc-600 text-xs font-semibold">VS</div>

            {/* Team B */}
            <div className="flex-1 text-center">
              <div
                className="w-3 h-1 rounded-full mx-auto mb-1"
                style={{ backgroundColor: match.teamB.kitColor }}
              />
              <h4 className="font-medium text-xs text-zinc-300 uppercase truncate px-1">
                {match.teamB.name}
              </h4>
              <span className="text-2xl font-semibold text-zinc-100">
                {match.scoreB}
              </span>
            </div>
          </div>

          {/* Quick Pitch Board Button */}
          <button
            onClick={() => {
              onClose();
              onNavigateToPitch();
            }}
            className="mt-2.5 w-full py-1.5 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 border border-zinc-700/60 transition"
          >
            <Users className="w-3.5 h-3.5 text-zinc-400" /> View Field Board & Player Ratings
          </button>
        </div>

        {/* MOTM Spotlight */}
        {mvpPlayer && (
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img
                src={mvpPlayer.photo}
                alt={mvpPlayer.name}
                className="w-9 h-9 rounded-full object-cover ring-1 ring-amber-500/50"
              />
              <div>
                <span className="text-[9px] font-semibold text-amber-400 uppercase">Match MOTM</span>
                <h4 className="text-xs font-medium text-zinc-100">{mvpPlayer.name}</h4>
                <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
                  <span>Rating: {calculatedStats[mvpPlayer.id]?.avgRating || '9.0'}</span>
                  <span>•</span>
                  <span>{calculatedStats[mvpPlayer.id]?.mvpVotesCount || 1} MOTM votes</span>
                </div>
              </div>
            </div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
        )}

        {/* Rating Window Control */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-zinc-400" />
              <h4 className="text-xs font-medium text-zinc-200">Rating Window</h4>
            </div>
            {match.status === 'RATING_OPEN' && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Voting Live
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            {match.status === 'UPCOMING' && 'Voting has not been opened yet.'}
            {match.status === 'RATING_OPEN' && 'Voting is active! Players can submit ratings and vote MOTM.'}
            {match.status === 'RATING_CLOSED' && 'Ratings are finalized and locked.'}
          </p>

          {/* Rating CTA Button */}
          {match.status === 'RATING_OPEN' && (
            <button
              onClick={() => {
                onClose();
                onNavigateToRating();
              }}
              className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition"
            >
              <Star className="w-3.5 h-3.5" /> Rate Players & Vote MOTM
            </button>
          )}

          {/* ADMIN CONTROLS */}
          {isAdmin && (
            <div className="pt-1.5 border-t border-zinc-800/80 flex flex-wrap gap-2">
              {match.status !== 'RATING_OPEN' && (
                <button
                  onClick={() => startRatingWindow(match.id)}
                  className="flex-1 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-lg flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-zinc-950" /> Start Voting Window
                </button>
              )}

              {match.status === 'RATING_OPEN' && (
                <button
                  onClick={() => stopRatingWindow(match.id)}
                  className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-medium text-xs rounded-lg flex items-center justify-center gap-1"
                >
                  <Square className="w-3 h-3 fill-rose-300" /> Stop & Finalize MOTM
                </button>
              )}

              {match.status === 'RATING_CLOSED' && (
                <button
                  onClick={() => resumeRatingWindow(match.id)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs rounded-lg flex items-center justify-center gap-1 border border-zinc-700"
                >
                  <RefreshCw className="w-3 h-3" /> Re-open Window
                </button>
              )}
            </div>
          )}
        </div>

        {/* GOALS & ASSISTS LIST (No minutes required) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-zinc-400">Goals & Assists</h4>
            {isAdmin && (
              <button
                onClick={() => setIsAddingGoal(!isAddingGoal)}
                className="text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Goal
              </button>
            )}
          </div>

          {/* Goal Logger Form (No Minute Input) */}
          {isAddingGoal && (
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 space-y-2 text-xs">
              <div className="flex rounded bg-zinc-900 p-0.5 text-xs">
                <button
                  onClick={() => setGoalTeam('teamA')}
                  className={`flex-1 py-1 font-medium rounded ${
                    goalTeam === 'teamA' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  {match.teamA.name}
                </button>
                <button
                  onClick={() => setGoalTeam('teamB')}
                  className={`flex-1 py-1 font-medium rounded ${
                    goalTeam === 'teamB' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'
                  }`}
                >
                  {match.teamB.name}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Scorer *</label>
                  <select
                    value={scorerId}
                    onChange={e => setScorerId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded p-1.5 focus:outline-none"
                  >
                    <option value="">Select Scorer</option>
                    {(goalTeam === 'teamA' ? teamAPlayers : teamBPlayers).map(p => (
                      <option key={p!.id} value={p!.id}>
                        {p!.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Assisted By</label>
                  <select
                    value={assisterId}
                    onChange={e => setAssisterId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded p-1.5 focus:outline-none"
                  >
                    <option value="">No Assist (Solo / Pen)</option>
                    {(goalTeam === 'teamA' ? teamAPlayers : teamBPlayers).map(p => (
                      <option key={p!.id} value={p!.id}>
                        {p!.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsAddingGoal(false)}
                  className="text-xs px-2.5 py-1 text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGoal}
                  disabled={!scorerId}
                  className="text-xs px-3 py-1 bg-zinc-100 hover:bg-white disabled:opacity-50 text-zinc-950 font-medium rounded"
                >
                  Record Goal
                </button>
              </div>
            </div>
          )}

          {/* Goal Events List */}
          <div className="space-y-1">
            {match.goals.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-2 bg-zinc-950/40 rounded-lg border border-zinc-800/60">
                No goals recorded for this match.
              </p>
            ) : (
              match.goals.map(g => {
                const scorer = players.find(p => p.id === g.scorerId);
                const assister = players.find(p => p.id === g.assisterId);
                const teamName = g.team === 'teamA' ? match.teamA.name : match.teamB.name;

                return (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-2 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span>⚽</span>
                      <div>
                        <span className="font-medium text-zinc-200">{scorer?.name || 'Unknown'}</span>
                        {assister && (
                          <span className="text-zinc-500 text-[11px]"> (Assist: {assister.name})</span>
                        )}
                        <span className="text-[10px] text-zinc-500 block">
                          {teamName}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => removeGoalEvent(match.id, g.id)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* LINEUP & PLAYER RATINGS (FotMob Clean Design with Team Frames and Stickers) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-300">Squad Lineups & Ratings</h4>
            <span className="text-[10px] text-zinc-500">Tap player for profile</span>
          </div>

          {/* TEAM 1 SQUAD */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.teamA.kitColor }} />
              <span className="text-xs font-semibold text-zinc-300">{match.teamA.name}</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {match.teamA.lineup.map(spot => {
                const player = players.find(p => p.id === spot.playerId);
                if (!player) return null;

                const pStats = calculatedStats[player.id];
                const avgR = pStats?.avgRating || 0;
                const isMvp = (computedMvpId || match.mvpPlayerId) === player.id || pStats?.isMvp;
                const goals = pStats?.goals || 0;
                const assists = pStats?.assists || 0;

                return (
                  <div
                    key={`teamA_${player.id}`}
                    onClick={() => {
                      onClose();
                      setSelectedPlayerId(player.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800/80 cursor-pointer transition"
                    style={{ borderLeft: `3px solid ${match.teamA.kitColor}` }}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                        style={{ border: `2px solid ${match.teamA.kitColor}` }}
                      >
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-medium text-zinc-200 truncate">{player.name}</span>
                          {isMvp && (
                            <span className="text-[9px] font-semibold px-1 rounded bg-amber-400 text-zinc-950 flex-shrink-0">
                              MOTM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <span>{spot.positionCode}</span>
                          {goals > 0 && (
                            <span className="bg-zinc-800 text-zinc-100 font-bold px-1.5 py-0.2 rounded border border-zinc-700/80 text-[9px] flex items-center">
                              ⚽ {goals > 1 ? goals : ''}
                            </span>
                          )}
                          {assists > 0 && (
                            <span className="bg-zinc-800 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-zinc-700/80 text-[9px] flex items-center">
                              👟 {assists > 1 ? assists : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {avgR > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${getRatingBadgeStyle(
                            avgR
                          )}`}
                        >
                          {avgR.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">-</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEAM 2 SQUAD */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center space-x-1.5 px-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.teamB.kitColor }} />
              <span className="text-xs font-semibold text-zinc-300">{match.teamB.name}</span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {match.teamB.lineup.map(spot => {
                const player = players.find(p => p.id === spot.playerId);
                if (!player) return null;

                const pStats = calculatedStats[player.id];
                const avgR = pStats?.avgRating || 0;
                const isMvp = (computedMvpId || match.mvpPlayerId) === player.id || pStats?.isMvp;
                const goals = pStats?.goals || 0;
                const assists = pStats?.assists || 0;

                return (
                  <div
                    key={`teamB_${player.id}`}
                    onClick={() => {
                      onClose();
                      setSelectedPlayerId(player.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/60 border border-zinc-800/80 cursor-pointer transition"
                    style={{ borderLeft: `3px solid ${match.teamB.kitColor}` }}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
                        style={{ border: `2px solid ${match.teamB.kitColor}` }}
                      >
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-medium text-zinc-200 truncate">{player.name}</span>
                          {isMvp && (
                            <span className="text-[9px] font-semibold px-1 rounded bg-amber-400 text-zinc-950 flex-shrink-0">
                              MOTM
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <span>{spot.positionCode}</span>
                          {goals > 0 && (
                            <span className="bg-zinc-800 text-zinc-100 font-bold px-1.5 py-0.2 rounded border border-zinc-700/80 text-[9px] flex items-center">
                              ⚽ {goals > 1 ? goals : ''}
                            </span>
                          )}
                          {assists > 0 && (
                            <span className="bg-zinc-800 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-zinc-700/80 text-[9px] flex items-center">
                              👟 {assists > 1 ? assists : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {avgR > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${getRatingBadgeStyle(
                            avgR
                          )}`}
                        >
                          {avgR.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">-</span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Delete Match Action */}
        <div className="pt-2 border-t border-zinc-800">
          {!showDeleteConfirm ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs font-medium text-rose-400 hover:text-rose-300 py-1 px-2.5 rounded-lg hover:bg-rose-500/10 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Match</span>
              </button>
            </div>
          ) : (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-rose-300 font-semibold">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this match permanently?</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                This will remove the match, scores, lineups, and all submitted player rating logs.
              </p>
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteMatch(match.id);
                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs transition shadow flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
