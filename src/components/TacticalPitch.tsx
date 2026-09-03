import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FootballPosition, MatchFormat } from '../types';
import { POSITION_INFO, ALL_POSITIONS, FORMATION_PRESETS } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import { Move, Plus, UserPlus, Star, X, Award } from 'lucide-react';

export const TacticalPitch: React.FC = () => {
  const {
    matches,
    selectedMatchId,
    setSelectedMatchId,
    players,
    isAdmin,
    updateTacticalLineup,
    updateMatch,
    setSelectedPlayerId,
    computeMatchStats,
  } = useApp();

  const activeMatch = matches.find(m => m.id === selectedMatchId) || matches[0];
  const [selectedTeam, setSelectedTeam] = useState<'both' | 'teamA' | 'teamB'>('both');
  const [draggingPlayer, setDraggingPlayer] = useState<{
    playerId: string;
    team: 'teamA' | 'teamB';
    startX: number;
    startY: number;
  } | null>(null);

  const [activeSpotForEdit, setActiveSpotForEdit] = useState<{
    team: 'teamA' | 'teamB';
    playerId: string;
    positionCode: FootballPosition;
    x: number;
    y: number;
  } | null>(null);

  const [benchOpen, setBenchOpen] = useState(false);
  const [teamForBench, setTeamForBench] = useState<'teamA' | 'teamB'>('teamA');
  const pitchRef = useRef<HTMLDivElement>(null);

  if (!activeMatch) {
    return (
      <div className="p-8 text-center text-zinc-500 text-xs">
        <p>No matches created yet.</p>
      </div>
    );
  }

  // Calculate live or finalized match stats for all players
  const { calculatedStats, computedMvpId } = computeMatchStats(activeMatch);

  // Pointer dragging on pitch
  const handlePitchPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingPlayer || !pitchRef.current || !isAdmin) return;

    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rawX = ((clientX - rect.left) / rect.width) * 100;
    const rawY = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(6, Math.min(94, rawX)));
    const clampedY = Math.round(Math.max(6, Math.min(94, rawY)));

    updateTacticalLineup(
      activeMatch.id,
      draggingPlayer.team,
      draggingPlayer.playerId,
      clampedX,
      clampedY
    );
  };

  const handlePointerUp = () => {
    setDraggingPlayer(null);
  };

  // Bench players
  const teamAPlayerIds = activeMatch.teamA.lineup.map(s => s.playerId);
  const teamBPlayerIds = activeMatch.teamB.lineup.map(s => s.playerId);
  const allAssignedIds = [...teamAPlayerIds, ...teamBPlayerIds];
  const benchPlayers = players.filter(p => !allAssignedIds.includes(p.id));

  // Formation Presets - adjust coordinates of existing players without adding/removing any players
  const handleApplyFormation = (presetName: string) => {
    const presets = FORMATION_PRESETS[activeMatch.format] || FORMATION_PRESETS['7v7'] || [];
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;

    const currentA = [...activeMatch.teamA.lineup];
    const newALineup = currentA.map((existing, idx) => {
      const presetSpot = preset.teamA[idx];
      return {
        ...existing,
        positionCode: presetSpot ? presetSpot.positionCode : existing.positionCode,
        x: presetSpot ? presetSpot.x : existing.x,
        y: presetSpot ? presetSpot.y : existing.y,
      };
    });

    const currentB = [...activeMatch.teamB.lineup];
    const newBLineup = currentB.map((existing, idx) => {
      const presetSpot = preset.teamB[idx];
      return {
        ...existing,
        positionCode: presetSpot ? presetSpot.positionCode : existing.positionCode,
        x: presetSpot ? presetSpot.x : existing.x,
        y: presetSpot ? presetSpot.y : existing.y,
      };
    });

    updateMatch(activeMatch.id, {
      teamA: { ...activeMatch.teamA, lineup: newALineup },
      teamB: { ...activeMatch.teamB, lineup: newBLineup },
    });
  };

  const handleAddPlayerFromBench = (playerId: string, team: 'teamA' | 'teamB') => {
    const defaultPos = players.find(p => p.id === playerId)?.primaryPosition || 'CM';
    const defaultY = team === 'teamA' ? 65 : 35;
    const defaultX = 50;

    updateTacticalLineup(activeMatch.id, team, playerId, defaultX, defaultY, defaultPos);
    setBenchOpen(false);
  };

  const handleRemoveFromLineup = (playerId: string, team: 'teamA' | 'teamB') => {
    const updated = activeMatch[team].lineup.filter(s => s.playerId !== playerId);
    updateMatch(activeMatch.id, {
      [team]: {
        ...activeMatch[team],
        lineup: updated,
      },
    });
    setActiveSpotForEdit(null);
  };

  const formats: MatchFormat[] = ['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'];
  const currentPresets = FORMATION_PRESETS[activeMatch.format] || FORMATION_PRESETS['7v7'] || [];

  // Helper for FotMob rating badge styling
  const getRatingBadgeStyle = (rating: number) => {
    if (rating >= 8.0) return 'bg-emerald-400 text-zinc-950 font-bold';
    if (rating >= 7.0) return 'bg-emerald-600 text-white font-bold';
    if (rating >= 6.0) return 'bg-amber-500 text-zinc-950 font-bold';
    if (rating > 0) return 'bg-rose-500 text-white font-bold';
    return 'bg-zinc-800 text-zinc-300 font-semibold';
  };

  // Helper to render a player token on the pitch
  const renderPlayerToken = (spot: { playerId: string; positionCode: FootballPosition; x: number; y: number }, team: 'teamA' | 'teamB') => {
    const player = players.find(p => p.id === spot.playerId);
    if (!player) return null;

    const isDragging = draggingPlayer?.playerId === player.id;
    const stats = calculatedStats[player.id];
    const rating = stats?.avgRating || 0;
    const isMvp = stats?.isMvp || computedMvpId === player.id;
    const kitColor = team === 'teamA' ? activeMatch.teamA.kitColor : activeMatch.teamB.kitColor;
    const goalsCount = stats?.goals || 0;
    const assistsCount = stats?.assists || 0;

    return (
      <div
        key={`${team}_${player.id}`}
        onPointerDown={e => {
          if (isAdmin) {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setDraggingPlayer({
              playerId: player.id,
              team,
              startX: spot.x,
              startY: spot.y,
            });
          }
        }}
        onClick={() => {
          setActiveSpotForEdit({
            team,
            playerId: player.id,
            positionCode: spot.positionCode,
            x: spot.x,
            y: spot.y,
          });
        }}
        style={{
          left: `${spot.x}%`,
          top: `${spot.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        className={`absolute z-20 flex flex-col items-center cursor-pointer transition-transform ${
          isDragging ? 'scale-110 z-30' : 'hover:scale-105 active:scale-95'
        }`}
      >
        {/* Token: Distinct Team Frame + Photo + Match Rating Badge + Stickers */}
        <div className="relative">
          {/* Circular Photo with distinct Team Colored Frame & Halo */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs overflow-hidden shadow-md bg-zinc-900 transition-all"
            style={{
              border: `2.5px solid ${kitColor}`,
              boxShadow: `0 0 8px ${kitColor}60`,
            }}
          >
            <PlayerAvatar
              player={player}
              size="sm"
              showBadge={false}
              className="w-full h-full rounded-full"
            />
          </div>

          {/* Goal Sticker (Soccer Ball with Count) */}
          {goalsCount > 0 && (
            <div
              className="absolute -top-2 -left-2 bg-zinc-950/95 border border-zinc-700/80 rounded-full px-1 py-0.2 text-[8px] font-bold text-white flex items-center shadow-lg z-30 leading-tight"
              title={`${goalsCount} Goal${goalsCount > 1 ? 's' : ''}`}
            >
              <span>⚽</span>
              {goalsCount > 1 && <span className="ml-0.5 font-mono text-[7px]">{goalsCount}</span>}
            </div>
          )}

          {/* Assist Sticker (Shoe / Foot with Count) */}
          {assistsCount > 0 && (
            <div
              className={`absolute -top-2 ${goalsCount > 0 ? '-right-2' : '-left-2'} bg-zinc-950/95 border border-zinc-700/80 rounded-full px-1 py-0.2 text-[8px] font-bold text-cyan-300 flex items-center shadow-lg z-30 leading-tight`}
              title={`${assistsCount} Assist${assistsCount > 1 ? 's' : ''}`}
            >
              <span>👟</span>
              {assistsCount > 1 && <span className="ml-0.5 font-mono text-[7px]">{assistsCount}</span>}
            </div>
          )}

          {/* FotMob Style Match Rating Badge */}
          {rating > 0 ? (
            <div
              className={`absolute -bottom-1.5 -right-2 px-1 py-0.2 rounded text-[9px] leading-tight flex items-center shadow-md ${getRatingBadgeStyle(
                rating
              )} ${isMvp ? 'ring-1 ring-amber-300' : ''}`}
            >
              {isMvp && <span className="text-[8px] mr-0.5">★</span>}
              <span>{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span
              className="absolute -bottom-1 -right-1 text-[7px] font-bold px-1 rounded-full text-white leading-tight shadow"
              style={{ backgroundColor: POSITION_INFO[spot.positionCode]?.color || '#10b981' }}
            >
              {spot.positionCode}
            </span>
          )}
        </div>

        {/* Player Name Pill with Team Colored Border */}
        <div
          className="mt-1 px-1.5 py-0.5 bg-zinc-950/90 rounded text-[9px] font-medium text-zinc-200 border max-w-[68px] truncate text-center leading-none shadow-sm"
          style={{ borderColor: `${kitColor}90` }}
        >
          {player.name.split(' ')[0]}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 pt-2.5 px-4 max-w-md mx-auto space-y-2.5">
      {/* FotMob Style Match Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2.5">
        {/* Match Select & Score */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <select
              value={activeMatch.id}
              onChange={e => setSelectedMatchId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-600"
            >
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.scoreA}-{m.scoreB}) • {m.status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              {activeMatch.format}
            </span>
          </div>
        </div>

        {/* Score & Teams Banner */}
        <div className="flex items-center justify-between bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/60">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: activeMatch.teamA.kitColor }} />
            <span className="text-xs font-medium text-zinc-200 truncate">{activeMatch.teamA.name}</span>
          </div>

          <div className="text-center px-3">
            <span className="text-sm font-bold text-zinc-100 font-mono">
              {activeMatch.scoreA} - {activeMatch.scoreB}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 min-w-0 justify-end">
            <span className="text-xs font-medium text-zinc-200 truncate">{activeMatch.teamB.name}</span>
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: activeMatch.teamB.kitColor }} />
          </div>
        </div>

        {/* MOTM Banner if calculated */}
        {computedMvpId && (
          <div className="flex items-center justify-between px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs">
            <div className="flex items-center space-x-1.5 text-amber-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Match MOTM: {players.find(p => p.id === computedMvpId)?.name}</span>
            </div>
            <span className="text-[10px] font-bold text-amber-300">
              ★ {calculatedStats[computedMvpId]?.avgRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Pitch View Filter & Squad Actions */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-800/80">
          <div className="flex items-center space-x-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800/80">
            <button
              onClick={() => setSelectedTeam('both')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition ${
                selectedTeam === 'both' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Full Pitch
            </button>
            <button
              onClick={() => setSelectedTeam('teamA')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
                selectedTeam === 'teamA' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeMatch.teamA.kitColor }} />
              {activeMatch.teamA.name.split(' ')[0]}
            </button>
            <button
              onClick={() => setSelectedTeam('teamB')}
              className={`px-2 py-1 text-xs rounded-md font-medium transition flex items-center gap-1 ${
                selectedTeam === 'teamB' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeMatch.teamB.kitColor }} />
              {activeMatch.teamB.name.split(' ')[0]}
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setTeamForBench('teamA');
                setBenchOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
            >
              <UserPlus className="w-3 h-3" /> Squad
            </button>
          )}
        </div>

        {/* Formation Presets (Admin) */}
        {isAdmin && currentPresets.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
            <span className="text-[10px] text-zinc-500 font-medium flex-shrink-0">
              Formations:
            </span>
            {currentPresets.map(preset => (
              <button
                key={preset.name}
                onClick={() => handleApplyFormation(preset.name)}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 flex-shrink-0 transition"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTBALL PITCH (FotMob Minimal Pitch Design) */}
      <div
        ref={pitchRef}
        onPointerMove={handlePitchPointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full aspect-[2/3] max-h-[540px] rounded-2xl overflow-hidden border border-zinc-800/90 select-none touch-none bg-[#0c1813] shadow-inner"
      >
        {/* Subtle Pitch Turf Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col justify-between">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-full flex-1 ${i % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {/* Pitch Vector Lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none stroke-white/40 stroke-[1.2] fill-none"
          viewBox="0 0 100 150"
          preserveAspectRatio="none"
        >
          <rect x="5" y="5" width="90" height="140" rx="1" />
          <line x1="5" y1="75" x2="95" y2="75" />
          <circle cx="50" cy="75" r="14" />
          <circle cx="50" cy="75" r="0.8" className="fill-white/60" />

          {/* Top Penalty Box */}
          <rect x="23" y="5" width="54" height="23" />
          <rect x="35" y="5" width="30" height="8" />
          <path d="M 38 28 A 12 12 0 0 0 62 28" />

          {/* Bottom Penalty Box */}
          <rect x="23" y="122" width="54" height="23" />
          <rect x="35" y="137" width="30" height="8" />
          <path d="M 38 122 A 12 12 0 0 1 62 122" />
        </svg>

        {/* Team B Label (Top) */}
        <div className="absolute top-2.5 left-3 flex items-center space-x-1.5 pointer-events-none bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800/80">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeMatch.teamB.kitColor }} />
          <span className="text-[10px] font-medium text-zinc-300">{activeMatch.teamB.name}</span>
        </div>

        {/* Team A Label (Bottom) */}
        <div className="absolute bottom-2.5 right-3 flex items-center space-x-1.5 pointer-events-none bg-zinc-950/80 px-2 py-0.5 rounded-full border border-zinc-800/80">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeMatch.teamA.kitColor }} />
          <span className="text-[10px] font-medium text-zinc-300">{activeMatch.teamA.name}</span>
        </div>

        {/* TEAM B PLAYERS (Top Half) */}
        {(selectedTeam === 'both' || selectedTeam === 'teamB') &&
          activeMatch.teamB.lineup.map(spot => renderPlayerToken(spot, 'teamB'))}

        {/* TEAM A PLAYERS (Bottom Half) */}
        {(selectedTeam === 'both' || selectedTeam === 'teamA') &&
          activeMatch.teamA.lineup.map(spot => renderPlayerToken(spot, 'teamA'))}
      </div>

      {/* Spot Inspection & Role Details */}
      {activeSpotForEdit && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2.5">
          {(() => {
            const player = players.find(p => p.id === activeSpotForEdit.playerId);
            if (!player) return null;
            const stats = calculatedStats[player.id];

            return (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <PlayerAvatar
                      player={player}
                      size="sm"
                      showBadge={false}
                      className="rounded-full ring-1 ring-zinc-700"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-xs font-semibold text-zinc-100">{player.name}</h4>
                        {stats && stats.avgRating > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] ${getRatingBadgeStyle(
                              stats.avgRating
                            )}`}
                          >
                            ★ {stats.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        {activeMatch[activeSpotForEdit.team].name} • Position: {activeSpotForEdit.positionCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setSelectedPlayerId(player.id)}
                      className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => setActiveSpotForEdit(null)}
                      className="text-xs text-zinc-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Change Role on Field (Admin) */}
                {isAdmin && (
                  <div>
                    <label className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider block mb-1">
                      Assigned Position
                    </label>
                    <div className="grid grid-cols-5 gap-1 max-h-20 overflow-y-auto">
                      {ALL_POSITIONS.map(pos => {
                        const isCurrent = activeSpotForEdit.positionCode === pos;
                        return (
                          <button
                            key={pos}
                            onClick={() => {
                              updateTacticalLineup(
                                activeMatch.id,
                                activeSpotForEdit.team,
                                activeSpotForEdit.playerId,
                                activeSpotForEdit.x,
                                activeSpotForEdit.y,
                                pos
                              );
                              setActiveSpotForEdit(prev => (prev ? { ...prev, positionCode: pos } : null));
                            }}
                            className={`py-1 text-[10px] rounded font-medium transition ${
                              isCurrent
                                ? 'bg-zinc-100 text-zinc-950 font-bold'
                                : 'bg-zinc-950/70 text-zinc-400 hover:bg-zinc-800'
                            }`}
                          >
                            {pos}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bench button */}
                {isAdmin && (
                  <div className="pt-2 border-t border-zinc-800 flex justify-end">
                    <button
                      onClick={() => handleRemoveFromLineup(activeSpotForEdit.playerId, activeSpotForEdit.team)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Move to Bench
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Squad Bench Modal */}
      {benchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Squad Selection</h3>
                <p className="text-xs text-zinc-400">Add players to {activeMatch[teamForBench].name}</p>
              </div>
              <button
                onClick={() => setBenchOpen(false)}
                className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Team Picker */}
            <div className="flex rounded-lg bg-zinc-950 p-0.5 my-3 border border-zinc-800">
              <button
                onClick={() => setTeamForBench('teamA')}
                className={`flex-1 py-1 text-xs font-medium rounded transition ${
                  teamForBench === 'teamA' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {activeMatch.teamA.name}
              </button>
              <button
                onClick={() => setTeamForBench('teamB')}
                className={`flex-1 py-1 text-xs font-medium rounded transition ${
                  teamForBench === 'teamB' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {activeMatch.teamB.name}
              </button>
            </div>

            {/* Bench Players List */}
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">
                Available Players ({benchPlayers.length})
              </span>

              {benchPlayers.length === 0 ? (
                <div className="p-6 text-center text-zinc-500 text-xs">
                  All players are currently on the pitch.
                </div>
              ) : (
                benchPlayers.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80"
                  >
                    <div className="flex items-center space-x-2">
                      <PlayerAvatar
                        player={p}
                        size="xs"
                        showBadge={false}
                        className="rounded-full"
                      />
                      <div>
                        <p className="text-xs font-medium text-zinc-200">{p.name}</p>
                        <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400">
                          <span
                            className="font-semibold px-1 rounded text-white text-[8px]"
                            style={{ backgroundColor: POSITION_INFO[p.primaryPosition]?.color || '#10b981' }}
                          >
                            {p.primaryPosition}
                          </span>
                          <span>Sec: {p.secondaryPosition}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddPlayerFromBench(p.id, teamForBench)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Place
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
