import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MatchFormat, FootballPosition, Player, PlayerAggregatedStats } from '../types';
import { FORMATION_PRESETS, POSITION_INFO } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import { X, Users, Shuffle, RotateCcw, Check, Sparkles, Scale, Award, Info, CheckSquare, Square } from 'lucide-react';

interface CreateMatchModalProps {
  onClose: () => void;
}

// Role categorizer
const getRoleCategory = (pos: FootballPosition): 'GK' | 'DEF' | 'MID' | 'FWD' => {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MID';
  return 'FWD';
};

// Check if player can play a role (primary or secondary)
const canPlayRole = (player: Player, role: 'GK' | 'DEF' | 'MID' | 'FWD'): boolean => {
  if (getRoleCategory(player.primaryPosition) === role) return true;
  if (player.secondaryPositions?.some(p => getRoleCategory(p) === role)) return true;
  if (player.secondaryPosition && getRoleCategory(player.secondaryPosition) === role) return true;
  return false;
};

export const CreateMatchModal: React.FC<CreateMatchModalProps> = ({ onClose }) => {
  const { createMatch, players, getPlayerAggregatedStats } = useApp();

  const [title, setTitle] = useState('Turf Derby Match');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [format, setFormat] = useState<MatchFormat>('7v7');

  const [teamAName, setTeamAName] = useState('Black Vipers');
  const [teamAKit, setTeamAKit] = useState('#1e293b'); // Dark Navy/Charcoal
  const [teamBName, setTeamBName] = useState('Neon Strikers');
  const [teamBKit, setTeamBKit] = useState('#10b981'); // Emerald Green

  const neededPerTeam = parseInt(format.split('v')[0], 10) || 7;
  const totalPlayersNeeded = neededPerTeam * 2;

  // Selected pool for the match (attendance)
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>(() => {
    return players.slice(0, totalPlayersNeeded).map(p => p.id);
  });

  // Dynamic player assignments: Record<playerId, 'teamA' | 'teamB' | 'none'>
  const [assignments, setAssignments] = useState<Record<string, 'teamA' | 'teamB' | 'none'>>(() => {
    const initial: Record<string, 'teamA' | 'teamB' | 'none'> = {};
    players.forEach((p, idx) => {
      if (idx < neededPerTeam) {
        initial[p.id] = 'teamA';
      } else if (idx < totalPlayersNeeded) {
        initial[p.id] = 'teamB';
      } else {
        initial[p.id] = 'none';
      }
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'squads' | 'settings'>('squads');
  const [balanceReport, setBalanceReport] = useState<{
    ratingA: number;
    ratingB: number;
    delta: number;
    rolesA: Record<string, number>;
    rolesB: Record<string, number>;
  } | null>(null);

  const teamAPlayers = useMemo(
    () => players.filter(p => assignments[p.id] === 'teamA'),
    [players, assignments]
  );

  const teamBPlayers = useMemo(
    () => players.filter(p => assignments[p.id] === 'teamB'),
    [players, assignments]
  );

  const assignPlayer = (playerId: string, target: 'teamA' | 'teamB' | 'none') => {
    setAssignments(prev => ({
      ...prev,
      [playerId]: target,
    }));
  };

  const togglePoolPlayer = (playerId: string) => {
    setSelectedPoolIds(prev => {
      const next = prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId];
      
      // If removed from pool, also remove assignment
      if (prev.includes(playerId)) {
        setAssignments(curr => ({ ...curr, [playerId]: 'none' }));
      }
      return next;
    });
  };

  const selectAllPlayers = () => {
    setSelectedPoolIds(players.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPoolIds([]);
    resetAssignments();
  };

  // Helper to compute a player's power index based on past ratings & stats
  const getPlayerPower = (player: Player) => {
    const stats: PlayerAggregatedStats | null = getPlayerAggregatedStats(player.id);
    const avgRating = stats && stats.avgRating > 0 ? stats.avgRating : 6.8;
    const winRate = stats && stats.matchesPlayed > 0 ? stats.winRate : 50;
    const goalsAssists = stats ? stats.totalGoals + stats.totalAssists : 0;
    const matches = stats && stats.matchesPlayed > 0 ? stats.matchesPlayed : 1;
    const gPerMatch = goalsAssists / matches;

    // Composite Power: 70% Average Rating + 15% Win Rate bonus + 15% Goal Contribution bonus
    const compositePower = avgRating + ((winRate - 50) / 100) * 0.8 + Math.min(1.0, gPerMatch * 0.3);
    return {
      player,
      stats,
      avgRating,
      compositePower: Number(compositePower.toFixed(2)),
      primaryRole: getRoleCategory(player.primaryPosition),
    };
  };

  // ⚡ SMART BALANCED TEAM MAKER ALGORITHM
  const makeBalancedTeams = () => {
    // 1. Determine candidate players to draft from
    let pool: Player[] = [];
    if (selectedPoolIds.length >= 2) {
      pool = players.filter(p => selectedPoolIds.includes(p.id));
    } else {
      // If no pool checked, use all currently active players
      pool = [...players];
    }

    // If pool is larger than needed, take top/selected up to totalPlayersNeeded
    if (pool.length > totalPlayersNeeded) {
      pool = pool.slice(0, totalPlayersNeeded);
    }

    // Compute player power scores
    const scoredPlayers = pool.map(getPlayerPower);

    // Group players by their primary role (with secondary fallbacks)
    const gks = scoredPlayers.filter(p => p.primaryRole === 'GK');
    const defs = scoredPlayers.filter(p => p.primaryRole === 'DEF');
    const fwds = scoredPlayers.filter(p => p.primaryRole === 'FWD');
    const mids = scoredPlayers.filter(p => p.primaryRole === 'MID');

    // Sort each bucket by compositePower descending
    gks.sort((a, b) => b.compositePower - a.compositePower);
    defs.sort((a, b) => b.compositePower - a.compositePower);
    fwds.sort((a, b) => b.compositePower - a.compositePower);
    mids.sort((a, b) => b.compositePower - a.compositePower);

    const teamA: Player[] = [];
    const teamB: Player[] = [];

    // Helper for snake drafting a positional bucket
    const snakeDraftBucket = (bucket: typeof scoredPlayers) => {
      bucket.forEach((item, index) => {
        // Calculate current total power of both teams to guide assignment
        const powerA = teamA.reduce((sum, p) => sum + getPlayerPower(p).compositePower, 0);
        const powerB = teamB.reduce((sum, p) => sum + getPlayerPower(p).compositePower, 0);

        if (teamA.length < neededPerTeam && teamB.length < neededPerTeam) {
          if (powerA <= powerB) {
            teamA.push(item.player);
          } else {
            teamB.push(item.player);
          }
        } else if (teamA.length < neededPerTeam) {
          teamA.push(item.player);
        } else {
          teamB.push(item.player);
        }
      });
    };

    // Distribute roles strategically:
    // 1. Goalkeepers first
    snakeDraftBucket(gks);
    // 2. Defenders second
    snakeDraftBucket(defs);
    // 3. Forwards third
    snakeDraftBucket(fwds);
    // 4. Midfielders last
    snakeDraftBucket(mids);

    // 2-Opt Optimization Pass: Look for same-role swaps between Team A and Team B that reduce delta
    let bestDelta = Math.abs(
      teamA.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / (teamA.length || 1) -
      teamB.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / (teamB.length || 1)
    );

    for (let i = 0; i < teamA.length; i++) {
      for (let j = 0; j < teamB.length; j++) {
        const pA = teamA[i];
        const pB = teamB[j];
        const roleA = getRoleCategory(pA.primaryPosition);
        const roleB = getRoleCategory(pB.primaryPosition);

        // Allow swap if same role or flexible secondary position
        if (roleA === roleB || (canPlayRole(pA, roleB) && canPlayRole(pB, roleA))) {
          const testA = [...teamA];
          const testB = [...teamB];
          testA[i] = pB;
          testB[j] = pA;

          const avgA = testA.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / testA.length;
          const avgB = testB.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / testB.length;
          const delta = Math.abs(avgA - avgB);

          if (delta < bestDelta) {
            bestDelta = delta;
            teamA[i] = pB;
            teamB[j] = pA;
          }
        }
      }
    }

    // Apply assignments
    const newAss: Record<string, 'teamA' | 'teamB' | 'none'> = {};
    players.forEach(p => {
      newAss[p.id] = 'none';
    });
    teamA.forEach(p => {
      newAss[p.id] = 'teamA';
    });
    teamB.forEach(p => {
      newAss[p.id] = 'teamB';
    });

    setAssignments(newAss);

    // Calculate report statistics
    const avgA = teamA.length ? Number((teamA.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / teamA.length).toFixed(1)) : 0;
    const avgB = teamB.length ? Number((teamB.reduce((s, p) => s + getPlayerPower(p).avgRating, 0) / teamB.length).toFixed(1)) : 0;
    
    const countRoles = (team: Player[]) => {
      const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
      team.forEach(p => {
        counts[getRoleCategory(p.primaryPosition)] = (counts[getRoleCategory(p.primaryPosition)] || 0) + 1;
      });
      return counts;
    };

    setBalanceReport({
      ratingA: avgA,
      ratingB: avgB,
      delta: Number(Math.abs(avgA - avgB).toFixed(1)),
      rolesA: countRoles(teamA),
      rolesB: countRoles(teamB),
    });
  };

  const autoDraftSquads = () => {
    const pool = selectedPoolIds.length >= totalPlayersNeeded
      ? players.filter(p => selectedPoolIds.includes(p.id))
      : [...players];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const newAss: Record<string, 'teamA' | 'teamB' | 'none'> = {};

    players.forEach(p => {
      newAss[p.id] = 'none';
    });

    shuffled.forEach((p, idx) => {
      if (idx < neededPerTeam) {
        newAss[p.id] = 'teamA';
      } else if (idx < totalPlayersNeeded) {
        newAss[p.id] = 'teamB';
      }
    });

    setAssignments(newAss);
    setBalanceReport(null);
  };

  const resetAssignments = () => {
    const cleared: Record<string, 'teamA' | 'teamB' | 'none'> = {};
    players.forEach(p => {
      cleared[p.id] = 'none';
    });
    setAssignments(cleared);
    setBalanceReport(null);
  };

  // Helper to map squad to formation slots intelligently by position
  const mapSquadToFormation = (teamSquad: Player[], slots: { positionCode: FootballPosition; x: number; y: number }[]) => {
    const availablePlayers = [...teamSquad];
    const lineup: { playerId: string; positionCode: FootballPosition; x: number; y: number }[] = [];

    slots.forEach(slot => {
      const slotRole = getRoleCategory(slot.positionCode);
      
      // 1. Exact primary position match
      let matchIdx = availablePlayers.findIndex(p => p.primaryPosition === slot.positionCode);
      
      // 2. Same role category match (e.g. DEF for CB/LB)
      if (matchIdx === -1) {
        matchIdx = availablePlayers.findIndex(p => getRoleCategory(p.primaryPosition) === slotRole);
      }

      // 3. Secondary position match
      if (matchIdx === -1) {
        matchIdx = availablePlayers.findIndex(p => canPlayRole(p, slotRole));
      }

      // 4. Fallback: first available
      if (matchIdx === -1 && availablePlayers.length > 0) {
        matchIdx = 0;
      }

      if (matchIdx !== -1) {
        const chosen = availablePlayers.splice(matchIdx, 1)[0];
        lineup.push({
          playerId: chosen.id,
          positionCode: slot.positionCode,
          x: slot.x,
          y: slot.y,
        });
      } else {
        lineup.push({
          playerId: players[0]?.id || 'p1',
          positionCode: slot.positionCode,
          x: slot.x,
          y: slot.y,
        });
      }
    });

    return lineup;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const preset = FORMATION_PRESETS[format]?.[0];
    const lineupA = mapSquadToFormation(teamAPlayers, preset ? preset.teamA : []);
    const lineupB = mapSquadToFormation(teamBPlayers, preset ? preset.teamB : []);

    createMatch({
      title: title.trim() || 'Friendly Turf Match',
      date,
      time: '',
      venue: '',
      format,
      scoreA: 0,
      scoreB: 0,
      teamA: {
        name: teamAName.trim() || 'Team 1',
        kitColor: teamAKit,
        lineup: lineupA,
      },
      teamB: {
        name: teamBName.trim() || 'Team 2',
        kitColor: teamBKit,
        lineup: lineupB,
      },
    });

    onClose();
  };

  const formats: MatchFormat[] = ['5v5', '6v6', '7v7', '8v8', '9v9', '11v11'];

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 shadow-2xl max-h-[92vh] flex flex-col overflow-y-auto space-y-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-semibold text-zinc-100">Create Match & Team Maker</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                {format}
              </span>
            </div>
            <p className="text-xs text-zinc-500">Pick players & create most balanced squads</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Squad Assignment vs Match Details */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('squads')}
            className={`py-1.5 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'squads'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Squads & Team Maker ({teamAPlayers.length + teamBPlayers.length}/{totalPlayersNeeded})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 rounded-md font-medium transition flex items-center justify-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Match & Format</span>
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3 text-xs">
          {/* TAB 1: SQUAD SELECTION & BALANCED TEAM MAKER */}
          {activeTab === 'squads' && (
            <div className="space-y-3">
              {/* PRIMARY ACTION: BALANCED TEAM MAKER BUTTON */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-amber-950/40 border border-emerald-500/30 rounded-2xl p-3 shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-100">Smart Balanced Team Maker</h4>
                      <p className="text-[10px] text-zinc-400">Equalizes past ratings, win-rates & role positions</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={makeBalancedTeams}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-xs rounded-xl transition shadow-md flex items-center space-x-1.5 active:scale-95"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Balance Teams</span>
                  </button>
                </div>

                {/* Live Balance Report if generated */}
                {balanceReport && (
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-2 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-zinc-200 font-medium">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Award className="w-3.5 h-3.5" /> Balance Analysis:
                      </span>
                      <span className="text-zinc-400">
                        Rating Delta: <strong className="text-zinc-100">{balanceReport.delta} pts</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                      <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-center text-zinc-300">
                          <span className="font-semibold text-emerald-400">{teamAName}</span>
                          <span className="font-mono font-bold">⭐ {balanceReport.ratingA}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {balanceReport.rolesA.GK} GK • {balanceReport.rolesA.DEF} DEF • {balanceReport.rolesA.MID} MID • {balanceReport.rolesA.FWD} FWD
                        </p>
                      </div>

                      <div className="bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800">
                        <div className="flex justify-between items-center text-zinc-300">
                          <span className="font-semibold text-emerald-400">{teamBName}</span>
                          <span className="font-mono font-bold">⭐ {balanceReport.ratingB}</span>
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {balanceReport.rolesB.GK} GK • {balanceReport.rolesB.DEF} DEF • {balanceReport.rolesB.MID} MID • {balanceReport.rolesB.FWD} FWD
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Squad Status Cards (Team 1 vs Team 2) */}
              <div className="grid grid-cols-2 gap-2">
                {/* Team 1 Card */}
                <div
                  className="p-2.5 rounded-xl border space-y-1 bg-zinc-950/70"
                  style={{ borderColor: teamAKit + '80' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: teamAKit }} />
                      <span className="font-semibold text-zinc-200 truncate">{teamAName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      teamAPlayers.length === neededPerTeam ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {teamAPlayers.length}/{neededPerTeam}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 min-h-[30px]">
                    {teamAPlayers.length === 0 ? (
                      <span className="text-[10px] text-zinc-600 italic">No players assigned</span>
                    ) : (
                      teamAPlayers.map(p => {
                        const stats = getPlayerAggregatedStats(p.id);
                        return (
                          <span
                            key={p.id}
                            onClick={() => assignPlayer(p.id, 'none')}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 hover:bg-rose-900/50 text-zinc-200 border border-zinc-700 flex items-center space-x-1 cursor-pointer transition"
                            title="Click to remove from Team 1"
                          >
                            <span>{p.name.split(' ')[0]}</span>
                            {stats && stats.avgRating > 0 && (
                              <span className="text-[8px] text-emerald-400 font-mono">⭐{stats.avgRating}</span>
                            )}
                            <span className="text-zinc-500 hover:text-rose-400 text-[9px]">×</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Team 2 Card */}
                <div
                  className="p-2.5 rounded-xl border space-y-1 bg-zinc-950/70"
                  style={{ borderColor: teamBKit + '80' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: teamBKit }} />
                      <span className="font-semibold text-zinc-200 truncate">{teamBName}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      teamBPlayers.length === neededPerTeam ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {teamBPlayers.length}/{neededPerTeam}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1 min-h-[30px]">
                    {teamBPlayers.length === 0 ? (
                      <span className="text-[10px] text-zinc-600 italic">No players assigned</span>
                    ) : (
                      teamBPlayers.map(p => {
                        const stats = getPlayerAggregatedStats(p.id);
                        return (
                          <span
                            key={p.id}
                            onClick={() => assignPlayer(p.id, 'none')}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 hover:bg-rose-900/50 text-zinc-200 border border-zinc-700 flex items-center space-x-1 cursor-pointer transition"
                            title="Click to remove from Team 2"
                          >
                            <span>{p.name.split(' ')[0]}</span>
                            {stats && stats.avgRating > 0 && (
                              <span className="text-[8px] text-emerald-400 font-mono">⭐{stats.avgRating}</span>
                            )}
                            <span className="text-zinc-500 hover:text-rose-400 text-[9px]">×</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Pool Selection Strip & Utilities */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-1 text-[11px] text-zinc-400">
                  <span>Selected Pool:</span>
                  <strong className="text-zinc-200">{selectedPoolIds.length}</strong>
                  <span>/ {totalPlayersNeeded} needed</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={selectAllPlayers}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700 transition"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={autoDraftSquads}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1 transition"
                    title="Randomized Draft"
                  >
                    <Shuffle className="w-2.5 h-2.5" /> Random
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-[10px] text-zinc-400 hover:text-rose-400 p-1 rounded transition"
                    title="Clear Selection"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div>
                <input
                  type="text"
                  placeholder="Search players by name, primary/secondary position..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Player Pool List with Attendance Checkbox & 3-Way Team Toggles */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                {filteredPlayers.map(player => {
                  const currentTeam = assignments[player.id] || 'none';
                  const inPool = selectedPoolIds.includes(player.id);
                  const posColor = POSITION_INFO[player.primaryPosition]?.color || '#10b981';
                  const stats = getPlayerAggregatedStats(player.id);

                  return (
                    <div
                      key={player.id}
                      className={`p-2 rounded-xl border flex items-center justify-between space-x-2 transition ${
                        inPool ? 'bg-zinc-950/90 border-zinc-800' : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                      }`}
                    >
                      {/* Checkbox + Player Info */}
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => togglePoolPlayer(player.id)}
                          className="text-zinc-500 hover:text-emerald-400 transition flex-shrink-0"
                          title={inPool ? 'Remove from Match Pool' : 'Include in Match Pool'}
                        >
                          {inPool ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600" />
                          )}
                        </button>

                        <PlayerAvatar
                          player={player}
                          size="sm"
                          showBadge={false}
                          className="rounded-full ring-1 ring-zinc-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-medium text-zinc-200 truncate">{player.name}</span>
                            {player.jerseyNumber && (
                              <span className="text-[10px] text-zinc-500 font-mono">#{player.jerseyNumber}</span>
                            )}
                            {stats && stats.avgRating > 0 && (
                              <span className="text-[9px] text-amber-400 font-mono font-semibold">
                                ⭐{stats.avgRating}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span
                              className="text-[8px] font-semibold px-1 rounded text-white"
                              style={{ backgroundColor: posColor }}
                            >
                              {player.primaryPosition}
                            </span>
                            {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                              <span className="text-[8px] text-zinc-500 truncate">
                                +{player.secondaryPositions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3-Way Assignment Selector */}
                      <div className="flex items-center space-x-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 flex-shrink-0">
                        {/* Team 1 Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!inPool) togglePoolPlayer(player.id);
                            assignPlayer(player.id, currentTeam === 'teamA' ? 'none' : 'teamA');
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center space-x-1 ${
                            currentTeam === 'teamA'
                              ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamAKit }} />
                          <span>T1</span>
                        </button>

                        {/* Bench / Unassigned */}
                        <button
                          type="button"
                          onClick={() => assignPlayer(player.id, 'none')}
                          className={`px-1.5 py-1 rounded text-[10px] transition ${
                            currentTeam === 'none'
                              ? 'text-zinc-500 font-medium'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                          title="Bench"
                        >
                          —
                        </button>

                        {/* Team 2 Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!inPool) togglePoolPlayer(player.id);
                            assignPlayer(player.id, currentTeam === 'teamB' ? 'none' : 'teamB');
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition flex items-center space-x-1 ${
                            currentTeam === 'teamB'
                              ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teamBKit }} />
                          <span>T2</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MATCH SETTINGS & SQUAD FORMAT */}
          {activeTab === 'settings' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">Match Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:border-zinc-600 focus:outline-none"
                    placeholder="e.g. Sunday Derby"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2 py-1.5 text-zinc-100 focus:border-zinc-600 focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Squad Format</label>
                <div className="grid grid-cols-6 gap-1">
                  {formats.map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => {
                        setFormat(f);
                        setBalanceReport(null);
                      }}
                      className={`py-1.5 rounded-lg font-medium border text-center transition ${
                        format === f
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                          : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team 1 Details */}
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <h4 className="font-medium text-zinc-300">Team 1 Details</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={teamAName}
                    onChange={e => setTeamAName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1 text-zinc-100 focus:outline-none focus:border-zinc-600"
                    placeholder="Team 1 Name"
                  />
                  <input
                    type="color"
                    value={teamAKit}
                    onChange={e => setTeamAKit(e.target.value)}
                    className="w-8 h-7 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                    title="Kit Color"
                  />
                </div>
              </div>

              {/* Team 2 Details */}
              <div className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800 space-y-1.5">
                <h4 className="font-medium text-zinc-300">Team 2 Details</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={teamBName}
                    onChange={e => setTeamBName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1 text-zinc-100 focus:outline-none focus:border-zinc-600"
                    placeholder="Team 2 Name"
                  />
                  <input
                    type="color"
                    value={teamBKit}
                    onChange={e => setTeamBKit(e.target.value)}
                    className="w-8 h-7 rounded bg-zinc-900 border border-zinc-800 cursor-pointer p-0.5"
                    title="Kit Color"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Match ({teamAPlayers.length} vs {teamBPlayers.length})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
