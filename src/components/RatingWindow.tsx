import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { POSITION_INFO } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import {
  Star,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Send,
  UserCheck,
  Shield,
  Minus,
  Plus,
  Users,
} from 'lucide-react';

export const RatingWindow: React.FC = () => {
  const {
    matches,
    selectedMatchId,
    setSelectedMatchId,
    players,
    currentUser,
    ratingLogs,
    isAdmin,
    startRatingWindow,
    stopRatingWindow,
    resumeRatingWindow,
    submitMatchRatings,
    setSelectedPlayerId,
  } = useApp();

  const activeRatingMatch =
    matches.find(m => m.id === selectedMatchId) ||
    matches.find(m => m.status === 'RATING_OPEN') ||
    matches[0];

  const [localRatings, setLocalRatings] = useState<Record<string, number>>({});
  const [selectedMvpId, setSelectedMvpId] = useState<string>('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<'all' | 'teamA' | 'teamB'>('all');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const participants = activeRatingMatch
    ? [
        ...activeRatingMatch.teamA.lineup.map(s => ({
          ...s,
          teamKey: 'teamA' as const,
          teamName: activeRatingMatch.teamA.name,
          kitColor: activeRatingMatch.teamA.kitColor,
        })),
        ...activeRatingMatch.teamB.lineup.map(s => ({
          ...s,
          teamKey: 'teamB' as const,
          teamName: activeRatingMatch.teamB.name,
          kitColor: activeRatingMatch.teamB.kitColor,
        })),
      ]
    : [];

  const userLogsForMatch =
    currentUser && activeRatingMatch
      ? ratingLogs.filter(l => l.matchId === activeRatingMatch.id && l.voterId === currentUser.id)
      : [];

  useEffect(() => {
    if (!activeRatingMatch || !currentUser) return;

    const initial: Record<string, number> = {};
    let initialMvp = '';

    participants.forEach(spot => {
      if (spot.playerId === currentUser.id) return;

      const existingLog = userLogsForMatch.find(l => l.ratedPlayerId === spot.playerId);
      initial[spot.playerId] = existingLog ? existingLog.rating : 7.0;

      if (existingLog?.mvpVotePlayerId) {
        initialMvp = existingLog.mvpVotePlayerId;
      }
    });

    setLocalRatings(initial);
    setSelectedMvpId(initialMvp);
    setSubmittedSuccess(false);
  }, [activeRatingMatch?.id, currentUser?.id]);

  if (!activeRatingMatch) {
    return (
      <div className="p-6 text-center text-zinc-500 text-xs">
        No matches available for rating.
      </div>
    );
  }

  const handleRatingChange = (playerId: string, val: number) => {
    const clamped = Math.max(1, Math.min(10, Math.round(val * 10) / 10));
    setLocalRatings(prev => ({
      ...prev,
      [playerId]: clamped,
    }));
  };

  const handleStepRating = (playerId: string, step: number) => {
    const current = localRatings[playerId] ?? 7.0;
    handleRatingChange(playerId, current + step);
  };

  const handleSubmitAll = () => {
    if (!currentUser) return;

    const payload = Object.entries(localRatings).map(([ratedPlayerId, ratingVal]) => ({
      ratedPlayerId,
      rating: ratingVal,
      comment: undefined,
    }));

    submitMatchRatings(activeRatingMatch.id, payload, selectedMvpId || undefined);
    setSubmittedSuccess(true);
    setTimeout(() => setSubmittedSuccess(false), 4000);
  };

  const isWindowOpen = activeRatingMatch.status === 'RATING_OPEN';
  const hasAlreadyVoted = userLogsForMatch.length > 0;
  const isParticipant = currentUser ? participants.some(p => p.playerId === currentUser.id) : false;
  const ratingTargets = participants.filter(s => s.playerId !== currentUser?.id);

  // Filtered by selected team tab
  const filteredTargets = ratingTargets.filter(s => {
    if (selectedTeamFilter === 'teamA') return s.teamKey === 'teamA';
    if (selectedTeamFilter === 'teamB') return s.teamKey === 'teamB';
    return true;
  });

  const teamATargets = ratingTargets.filter(s => s.teamKey === 'teamA');
  const teamBTargets = ratingTargets.filter(s => s.teamKey === 'teamB');

  // Rating color helper
  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return '#10b981'; // bright green
    if (rating >= 7.0) return '#059669'; // emerald
    if (rating >= 6.0) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getRatingBadgeStyle = (rating: number) => {
    if (rating >= 8.5) return 'bg-emerald-400 text-zinc-950 font-bold';
    if (rating >= 7.0) return 'bg-emerald-600 text-white font-bold';
    if (rating >= 6.0) return 'bg-amber-500 text-zinc-950 font-bold';
    return 'bg-rose-500 text-white font-bold';
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-3.5">
      {/* Top Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
              Rate Players
            </h2>
            <p className="text-xs text-zinc-500">Score performance 1–10 & vote match MOTM</p>
          </div>

          {/* Status Badge */}
          {isWindowOpen ? (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Voting Live
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Closed
            </span>
          )}
        </div>

        {/* Select Match */}
        <div>
          <label className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider block mb-1">
            Match
          </label>
          <select
            value={activeRatingMatch.id}
            onChange={e => setSelectedMatchId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600"
          >
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.scoreA}-{m.scoreB}) • {m.status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Admin Window Toggle */}
        {isAdmin && (
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-zinc-400" /> Admin Control:
            </span>

            {activeRatingMatch.status !== 'RATING_OPEN' ? (
              <button
                onClick={() => startRatingWindow(activeRatingMatch.id)}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-md flex items-center gap-1 transition"
              >
                <Play className="w-3 h-3 fill-zinc-950" /> Open Voting
              </button>
            ) : (
              <button
                onClick={() => stopRatingWindow(activeRatingMatch.id)}
                className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-medium text-xs rounded-md flex items-center gap-1 transition"
              >
                <Square className="w-3 h-3 fill-rose-400" /> Close & Finalize
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Status Notice */}
      {!currentUser ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p>Select a player profile from the top header to submit your peer ratings.</p>
        </div>
      ) : !isParticipant && !isAdmin ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400 flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p>Only players who participated in this match can submit ratings.</p>
        </div>
      ) : hasAlreadyVoted ? (
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-400 flex flex-col items-center justify-center space-y-2 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
          <p className="font-semibold text-emerald-300">Ratings Submitted Successfully!</p>
          <p className="text-[10px] text-emerald-500/80">Thank you for voting. You can only vote once per match.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <img src={currentUser.photo} alt={currentUser.name} className="w-6 h-6 rounded-full object-cover" />
            <div>
              <p className="font-medium text-zinc-200">Voting as {currentUser.name}</p>
              <p className="text-[10px] text-zinc-500">
                Ready to submit
              </p>
            </div>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {ratingTargets.length} total
          </span>
        </div>
      )}

      {/* Rule Notice */}
      <div className="border border-zinc-800/60 rounded-lg px-2.5 py-1.5 flex items-center space-x-2 text-[11px] text-zinc-400 bg-zinc-950/40">
        <UserCheck className="w-3 h-3 text-zinc-400 flex-shrink-0" />
        <span>Self-rating is excluded automatically.</span>
      </div>

      {/* Team Selection Option (Tab Filters) */}
      {isWindowOpen && currentUser && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedTeamFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
              selectedTeamFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All ({ratingTargets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeamFilter('teamA')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 truncate ${
              selectedTeamFilter === 'teamA'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeRatingMatch.teamA.kitColor }}
            />
            <span className="truncate">{activeRatingMatch.teamA.name}</span>
            <span className="text-[10px] text-zinc-500">({teamATargets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTeamFilter('teamB')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 truncate ${
              selectedTeamFilter === 'teamB'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeRatingMatch.teamB.kitColor }}
            />
            <span className="truncate">{activeRatingMatch.teamB.name}</span>
            <span className="text-[10px] text-zinc-500">({teamBTargets.length})</span>
          </button>
        </div>
      )}

      {/* Window Closed Notice */}
      {!isWindowOpen && (
        <div className="border border-zinc-800/80 rounded-xl p-6 text-center space-y-2 bg-zinc-900/30">
          <Award className="w-6 h-6 text-zinc-500 mx-auto" />
          <h3 className="text-xs font-semibold text-zinc-200">Rating Window is Closed</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Ratings for this match have either ended or not started yet.
          </p>
          {isAdmin && (
            <button
              onClick={() => resumeRatingWindow(activeRatingMatch.id)}
              className="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs rounded-md inline-flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Re-open Voting
            </button>
          )}
        </div>
      )}

      {/* Submitted Success Banner */}
      {submittedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-medium">Ratings and MOTM vote recorded successfully.</p>
          </div>
        </div>
      )}

      {/* RATING CARDS */}
      {isWindowOpen && currentUser && isParticipant && !hasAlreadyVoted && (
        <div className="space-y-3">
          {filteredTargets.map(spot => {
            const player = players.find(p => p.id === spot.playerId);
            if (!player) return null;

            const currentRating = localRatings[player.id] ?? 7.0;
            const isMvpSelected = selectedMvpId === player.id;
            const posColor = POSITION_INFO[spot.positionCode]?.color || '#10b981';
            const progressPercent = Math.max(0, Math.min(100, ((currentRating - 1) / 9) * 100));
            const ratingColor = getRatingColor(currentRating);

            return (
              <div
                key={player.id}
                className={`bg-zinc-900/70 border rounded-xl p-3.5 space-y-3 transition ${
                  isMvpSelected
                    ? 'border-amber-500/40 bg-zinc-900/90'
                    : 'border-zinc-800/80'
                }`}
              >
                {/* Player header */}
                <div className="flex items-center justify-between">
                  <div
                    onClick={() => setSelectedPlayerId(player.id)}
                    className="flex items-center space-x-2.5 cursor-pointer"
                  >
                    <PlayerAvatar
                      player={player}
                      size="sm"
                      showBadge={true}
                      badgePosition={spot.positionCode}
                      className="rounded-full ring-1 ring-zinc-700"
                    />

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-semibold text-zinc-100">{player.name}</h4>
                        {player.jerseyNumber && (
                          <span className="text-[10px] text-zinc-500 font-mono">#{player.jerseyNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: spot.kitColor }}
                        />
                        <p className="text-[10px] text-zinc-500">{spot.teamName}</p>
                      </div>
                    </div>
                  </div>

                  {/* MOTM Vote Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedMvpId(isMvpSelected ? '' : player.id)}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      isMvpSelected
                        ? 'bg-amber-400 text-zinc-950 font-semibold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Award className={`w-3 h-3 ${isMvpSelected ? 'fill-zinc-950' : 'text-zinc-400'}`} />
                    <span>{isMvpSelected ? 'MOTM' : 'Vote MOTM'}</span>
                  </button>
                </div>

                {/* ACCURATELY ALIGNED RATING BAR CONTROLLER */}
                <div className="bg-zinc-950/90 p-3 rounded-lg border border-zinc-800/80 space-y-2.5">
                  {/* Rating Header with Score & Steppers */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-medium">Rating</span>

                    <div className="flex items-center space-x-2">
                      {/* Step Down */}
                      <button
                        type="button"
                        onClick={() => handleStepRating(player.id, -0.5)}
                        disabled={currentRating <= 1}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      {/* Score Badge */}
                      <div
                        className={`px-2 py-0.5 rounded text-xs leading-none flex items-center space-x-1 shadow-sm ${getRatingBadgeStyle(
                          currentRating
                        )}`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold">{currentRating.toFixed(1)}</span>
                        <span className="text-[9px] opacity-75">/ 10</span>
                      </div>

                      {/* Step Up */}
                      <button
                        type="button"
                        onClick={() => handleStepRating(player.id, 0.5)}
                        disabled={currentRating >= 10}
                        className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Range Slider Container with Synchronized Track Fill */}
                  <div className="relative pt-1 pb-1">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={currentRating}
                      onChange={e => handleRatingChange(player.id, parseFloat(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, ${ratingColor} 0%, ${ratingColor} ${progressPercent}%, #27272a ${progressPercent}%, #27272a 100%)`,
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                    />

                    {/* Perfectly Synchronized 1-10 Tick Numbers */}
                    <div className="relative w-full h-4 mt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                        const isCurrentInt = Math.round(currentRating) === val;
                        const leftPercent = ((val - 1) / 9) * 100;

                        return (
                          <button
                            type="button"
                            key={val}
                            onClick={() => handleRatingChange(player.id, val)}
                            style={{
                              left: `${leftPercent}%`,
                              transform: 'translateX(-50%)',
                            }}
                            className={`absolute top-0 text-[10px] font-mono transition-colors ${
                              isCurrentInt
                                ? 'text-zinc-100 font-bold'
                                : 'text-zinc-600 hover:text-zinc-300'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="pt-2 sticky bottom-20 z-30">
            <button
              onClick={handleSubmitAll}
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Ratings ({ratingTargets.length} Players)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
