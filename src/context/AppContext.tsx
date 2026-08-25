import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Player,
  Match,
  RatingLog,
  TimeFilter,
  PlayerAggregatedStats,
  PlayerMatchComputedStats,
  FootballPosition,
  GoalEvent,
  MatchFormat,
} from '../types';
import { INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_RATING_LOGS } from '../data/mockData';
import confetti from 'canvas-confetti';
import {
  seedFirestoreIfEmpty,
  subscribeToPlayers,
  subscribeToMatches,
  subscribeToRatingLogs,
  syncPlayerToFirestore,
  deletePlayerFromFirestore,
  syncMatchToFirestore,
  deleteMatchFromFirestore,
  syncRatingLogToFirestore,
  deleteRatingLogFromFirestore,
} from '../lib/firestoreService';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AppContextType {
  players: Player[];
  matches: Match[];
  ratingLogs: RatingLog[];
  currentUser: Player | null;
  isAdmin: boolean;
  activeTab: 'matches' | 'pitch' | 'ratings' | 'stats' | 'logs' | 'players';
  selectedMatchId: string | null;
  selectedPlayerId: string | null;
  editPlayerId: string | null;
  timeFilter: TimeFilter;
  
  // Actions
  setCurrentUser: (player: Player | null) => void;
  logout: () => Promise<void>;
  setIsAdmin: (isAdmin: boolean) => void;
  setActiveTab: (tab: 'matches' | 'pitch' | 'ratings' | 'stats' | 'logs' | 'players') => void;
  setSelectedMatchId: (id: string | null) => void;
  setSelectedPlayerId: (id: string | null) => void;
  setEditPlayerId: (id: string | null) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  
  // Player CRUD
  addPlayer: (playerData: Omit<Player, 'id' | 'createdAt'>) => Player;
  updatePlayer: (id: string, playerData: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  
  // Match Management & Tactics
  createMatch: (matchData: Omit<Match, 'id' | 'goals' | 'status' | 'calculatedStats'>) => Match;
  updateMatch: (id: string, matchData: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  updateTacticalLineup: (matchId: string, team: 'teamA' | 'teamB', playerId: string, x: number, y: number, positionCode?: FootballPosition) => void;
  setFormationPreset: (matchId: string, format: MatchFormat, presetName: string) => void;
  
  // Score & Goals
  addGoalEvent: (matchId: string, goal: Omit<GoalEvent, 'id'>) => void;
  removeGoalEvent: (matchId: string, goalId: string) => void;
  updateScoreline: (matchId: string, scoreA: number, scoreB: number) => void;
  
  // Ratings & MVP Window
  startRatingWindow: (matchId: string) => void;
  stopRatingWindow: (matchId: string) => void;
  resumeRatingWindow: (matchId: string) => void;
  submitMatchRatings: (matchId: string, ratings: { ratedPlayerId: string; rating: number; comment?: string }[], mvpVotePlayerId?: string) => void;
  deleteRatingLog: (logId: string) => void;
  
  // Stats helpers
  computeMatchStats: (match: Match, logs?: RatingLog[]) => { calculatedStats: Record<string, PlayerMatchComputedStats>; computedMvpId?: string; computedMvpScore?: number };
  getPlayerAggregatedStats: (playerId: string, filter?: TimeFilter) => PlayerAggregatedStats | null;
  allPlayerStats: PlayerAggregatedStats[];
  activeRatingMatches: Match[];
  recentLogs: RatingLog[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PLAYERS = 'mrmanager_players_v2';
const LOCAL_STORAGE_MATCHES = 'mrmanager_matches_v2';
const LOCAL_STORAGE_LOGS = 'mrmanager_logs_v2';
const LOCAL_STORAGE_USER = 'mrmanager_current_user_v2';
const LOCAL_STORAGE_ADMIN = 'mrmanager_is_admin_v2';

// Clear legacy mock storage keys if present
try {
  ['pitchsquad_players_v1', 'pitchsquad_matches_v1', 'pitchsquad_logs_v1'].forEach(k => {
    localStorage.removeItem(k);
  });
} catch {}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PLAYERS);
      const parsed: Player[] = saved ? JSON.parse(saved) : INITIAL_PLAYERS;
      // Filter out any legacy p1..p12 mock players
      const realAccounts = parsed.filter(p => !p.id.match(/^p[1-9]$|^p1[0-2]$/));
      // Ensure Vatsal (vatsv3temp@gmail.com) is present
      const hasVatsal = realAccounts.some(p => p.email?.toLowerCase() === 'vatsv3temp@gmail.com' || p.id === 'p_vatsal');
      if (!hasVatsal) {
        return [INITIAL_PLAYERS[0], ...realAccounts];
      }
      return realAccounts.length > 0 ? realAccounts : INITIAL_PLAYERS;
    } catch {
      return INITIAL_PLAYERS;
    }
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MATCHES);
      const parsed: Match[] = saved ? JSON.parse(saved) : INITIAL_MATCHES;
      return parsed.filter(m => !['m1', 'm2', 'm3'].includes(m.id));
    } catch {
      return INITIAL_MATCHES;
    }
  });

  const [ratingLogs, setRatingLogs] = useState<RatingLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOGS);
      const parsed: RatingLog[] = saved ? JSON.parse(saved) : INITIAL_RATING_LOGS;
      return parsed.filter(l => !l.id.startsWith('log'));
    } catch {
      return INITIAL_RATING_LOGS;
    }
  });

  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && !parsed.id.match(/^p[1-9]$|^p1[0-2]$/)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ADMIN);
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState<'matches' | 'pitch' | 'ratings' | 'stats' | 'logs' | 'players'>('matches');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(matches[0]?.id || null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [editPlayerId, setEditPlayerId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Initialize Firestore listeners & initial seeding
  useEffect(() => {
    // Seed sample data to Firestore if completely empty
    seedFirestoreIfEmpty();

    const unsubPlayers = subscribeToPlayers(remotePlayers => {
      if (remotePlayers && remotePlayers.length > 0) {
        setPlayers(remotePlayers);
      }
    });

    const unsubMatches = subscribeToMatches(remoteMatches => {
      if (remoteMatches && remoteMatches.length > 0) {
        setMatches(remoteMatches);
      }
    });

    const unsubLogs = subscribeToRatingLogs(remoteLogs => {
      setRatingLogs(remoteLogs || []);
    });

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubLogs();
    };
  }, []);

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error('Failed saving players to localStorage', e);
    }
  }, [players]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MATCHES, JSON.stringify(matches));
    } catch (e) {
      console.error('Failed saving matches to localStorage', e);
    }
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGS, JSON.stringify(ratingLogs));
    } catch (e) {
      console.error('Failed saving rating logs to localStorage', e);
    }
  }, [ratingLogs]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_STORAGE_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER);
      }
    } catch (e) {
      console.error('Failed saving current user to localStorage', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ADMIN, JSON.stringify(isAdmin));
    } catch (e) {
      console.error('Failed saving admin status to localStorage', e);
    }
  }, [isAdmin]);

  // Recalculate match statistics dynamically based on ratingLogs and goal events
  const computeMatchStats = (match: Match, logs: RatingLog[]): { calculatedStats: Record<string, PlayerMatchComputedStats>; computedMvpId?: string; computedMvpScore?: number } => {
    const matchLogs = logs.filter(l => l.matchId === match.id);
    const calculatedStats: Record<string, PlayerMatchComputedStats> = {};

    const allMatchSpots = [
      ...match.teamA.lineup.map(spot => ({ ...spot, team: 'teamA' as const })),
      ...match.teamB.lineup.map(spot => ({ ...spot, team: 'teamB' as const })),
    ];

    // Total distinct voters who voted MVP in this match
    const distinctMvpVoters = new Set<string>();
    const mvpVotesByPlayer: Record<string, number> = {};

    matchLogs.forEach(l => {
      if (l.mvpVotePlayerId) {
        distinctMvpVoters.add(l.voterId);
        mvpVotesByPlayer[l.mvpVotePlayerId] = (mvpVotesByPlayer[l.mvpVotePlayerId] || 0) + 1;
      }
    });

    allMatchSpots.forEach(spot => {
      const playerLogs = matchLogs.filter(l => l.ratedPlayerId === spot.playerId);
      const ratingCount = playerLogs.length;
      const sumRatings = playerLogs.reduce((acc, curr) => acc + curr.rating, 0);
      const avgRating = ratingCount > 0 ? Number((sumRatings / ratingCount).toFixed(1)) : 0;

      const goals = match.goals.filter(g => g.scorerId === spot.playerId).length;
      const assists = match.goals.filter(g => g.assisterId === spot.playerId).length;
      const mvpVotesCount = mvpVotesByPlayer[spot.playerId] || 0;

      calculatedStats[spot.playerId] = {
        avgRating,
        ratingCount,
        mvpVotesCount,
        goals,
        assists,
        isMvp: false,
        team: spot.team,
      };
    });

    // MVP Computation: Strictly NOT considering G & A as mandated:
    // "MVP will be selected after the ratting periods off... while giving the rattings ask for mvp according to that user and accordingly that voting and rattings give MVP when admin ends the window do not consider G and A for MVP calculations"
    let highestMvpIndex = -1;
    let computedMvpId: string | undefined = undefined;
    let computedMvpScore: number | undefined = undefined;

    allMatchSpots.forEach(spot => {
      const pStats = calculatedStats[spot.playerId];
      if (!pStats) return;

      const avgR = pStats.avgRating; // 0 to 10
      const totalMvpVotersCount = Math.max(distinctMvpVoters.size, 1);
      const mvpVoteRatio = pStats.mvpVotesCount / totalMvpVotersCount; // 0 to 1
      const mvpVoteScore = mvpVoteRatio * 10; // scaled 0 to 10

      // Combined formula (70% peer rating average + 30% peer MVP votes share)
      const mvpIndex = (avgR * 0.70) + (mvpVoteScore * 0.30);

      if (mvpIndex > highestMvpIndex && avgR > 0) {
        highestMvpIndex = mvpIndex;
        computedMvpId = spot.playerId;
        computedMvpScore = Number(mvpIndex.toFixed(2));
      }
    });

    if (computedMvpId && calculatedStats[computedMvpId]) {
      calculatedStats[computedMvpId].isMvp = true;
    }

    return { calculatedStats, computedMvpId, computedMvpScore };
  };

  // Helper: Filter matches by time
  const isMatchInTimeRange = (matchDate: string, filter: TimeFilter): boolean => {
    if (filter === 'all') return true;
    const matchTime = new Date(matchDate).getTime();
    const now = new Date().getTime();
    const diffDays = (now - matchTime) / (1000 * 60 * 60 * 24);

    if (filter === '1m') return diffDays <= 30;
    if (filter === '2m') return diffDays <= 60;
    if (filter === '3m') return diffDays <= 90;
    return true;
  };

  // Calculate Aggregated Player Stats with time filters
  const getPlayerAggregatedStats = (playerId: string, filter: TimeFilter = 'all'): PlayerAggregatedStats | null => {
    const player = players.find(p => p.id === playerId);
    if (!player) return null;

    let matchesPlayed = 0;
    let totalGoals = 0;
    let totalAssists = 0;
    let mvpCount = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    const ratingsHistory: { matchId: string; matchTitle: string; date: string; rating: number; isMvp: boolean }[] = [];
    const collectedRatings: number[] = [];

    matches.forEach(m => {
      if (!isMatchInTimeRange(m.date, filter)) return;

      const inTeamA = m.teamA.lineup.some(s => s.playerId === playerId);
      const inTeamB = m.teamB.lineup.some(s => s.playerId === playerId);

      if (!inTeamA && !inTeamB) return;

      matchesPlayed++;

      // Compute stats for match
      const { calculatedStats, computedMvpId } = computeMatchStats(m, ratingLogs);
      const pStats = calculatedStats[playerId];

      if (pStats) {
        totalGoals += pStats.goals;
        totalAssists += pStats.assists;

        if (pStats.avgRating > 0) {
          collectedRatings.push(pStats.avgRating);
          const isMvp = m.status === 'RATING_CLOSED' ? m.mvpPlayerId === playerId : computedMvpId === playerId;
          if (isMvp) mvpCount++;

          ratingsHistory.push({
            matchId: m.id,
            matchTitle: m.title,
            date: m.date,
            rating: pStats.avgRating,
            isMvp,
          });
        }
      }

      // Match result (W / D / L)
      if (m.scoreA === m.scoreB) {
        draws++;
      } else if (inTeamA && m.scoreA > m.scoreB) {
        wins++;
      } else if (inTeamB && m.scoreB > m.scoreA) {
        wins++;
      } else {
        losses++;
      }
    });

    const avgRating = collectedRatings.length > 0
      ? Number((collectedRatings.reduce((a, b) => a + b, 0) / collectedRatings.length).toFixed(2))
      : 0;

    const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

    return {
      playerId,
      player,
      matchesPlayed,
      totalGoals,
      totalAssists,
      goalContributions: totalGoals + totalAssists,
      avgRating,
      mvpCount,
      wins,
      draws,
      losses,
      winRate,
      ratingsHistory: ratingsHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  };

  // All players leaderboard
  const allPlayerStats = useMemo(() => {
    return players
      .map(p => getPlayerAggregatedStats(p.id, timeFilter))
      .filter((s): s is PlayerAggregatedStats => s !== null);
  }, [players, matches, ratingLogs, timeFilter]);

  // Player CRUD
  const addPlayer = (playerData: Omit<Player, 'id' | 'createdAt'>): Player => {
    const newPlayer: Player = {
      ...playerData,
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlayers(prev => [newPlayer, ...prev]);
    syncPlayerToFirestore(newPlayer);
    return newPlayer;
  };

  const updatePlayer = (id: string, playerData: Partial<Player>) => {
    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const merged: Player = { ...p, ...playerData };
          return merged;
        }
        return p;
      });
      const target = updated.find(p => p.id === id);
      if (target) {
        syncPlayerToFirestore(target);
      }
      try {
        localStorage.setItem(LOCAL_STORAGE_PLAYERS, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save players to localStorage:', e);
      }
      return updated;
    });
    if (currentUser?.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...playerData } : null));
    }
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setRatingLogs(prev => prev.filter(l => l.voterId !== id && l.ratedPlayerId !== id));
    deletePlayerFromFirestore(id);
    if (currentUser?.id === id) {
      const remaining = players.filter(p => p.id !== id);
      setCurrentUser(remaining[0] || null);
    }
  };

  // Match Management
  const createMatch = (matchData: Omit<Match, 'id' | 'goals' | 'status' | 'calculatedStats'>): Match => {
    const newMatch: Match = {
      ...matchData,
      id: `m_${Date.now()}`,
      goals: [],
      status: 'UPCOMING',
      scoreA: 0,
      scoreB: 0,
    };
    setMatches(prev => [newMatch, ...prev]);
    setSelectedMatchId(newMatch.id);
    syncMatchToFirestore(newMatch);
    return newMatch;
  };

  const updateMatch = (id: string, matchData: Partial<Match>) => {
    setMatches(prev => {
      const updated = prev.map(m => (m.id === id ? { ...m, ...matchData } : m));
      const target = updated.find(m => m.id === id);
      if (target) {
        syncMatchToFirestore(target);
      }
      return updated;
    });
  };

  const deleteMatch = (id: string) => {
    setMatches(prev => {
      const remaining = prev.filter(m => m.id !== id);
      setSelectedMatchId(prevSelected => {
        if (prevSelected === id) {
          return remaining[0]?.id || null;
        }
        return prevSelected;
      });
      return remaining;
    });
    deleteMatchFromFirestore(id);
    setRatingLogs(prev => prev.filter(l => l.matchId !== id));
  };

  // Move player freely on pitch
  const updateTacticalLineup = (
    matchId: string,
    team: 'teamA' | 'teamB',
    playerId: string,
    x: number,
    y: number,
    positionCode?: FootballPosition
  ) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        const currentLineup = [...m[team].lineup];
        const existingIdx = currentLineup.findIndex(s => s.playerId === playerId);

        if (existingIdx >= 0) {
          currentLineup[existingIdx] = {
            ...currentLineup[existingIdx],
            x: Math.max(5, Math.min(95, x)),
            y: Math.max(5, Math.min(95, y)),
            positionCode: positionCode || currentLineup[existingIdx].positionCode,
          };
        } else {
          currentLineup.push({
            playerId,
            positionCode: positionCode || 'CM',
            x: Math.max(5, Math.min(95, x)),
            y: Math.max(5, Math.min(95, y)),
          });
        }

        return {
          ...m,
          [team]: {
            ...m[team],
            lineup: currentLineup,
          },
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  const setFormationPreset = (matchId: string, format: MatchFormat, presetName: string) => {
    // formation preset logic
    setMatches(prev =>
      prev.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          format,
        };
      })
    );
  };

  // Score and Goals
  const addGoalEvent = (matchId: string, goalData: Omit<GoalEvent, 'id'>) => {
    const goal: GoalEvent = {
      ...goalData,
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };

    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        const updatedGoals = [...m.goals, goal];
        const newScoreA = updatedGoals.filter(g => g.team === 'teamA').length;
        const newScoreB = updatedGoals.filter(g => g.team === 'teamB').length;
        return {
          ...m,
          goals: updatedGoals,
          scoreA: newScoreA,
          scoreB: newScoreB,
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  const removeGoalEvent = (matchId: string, goalId: string) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        const updatedGoals = m.goals.filter(g => g.id !== goalId);
        const newScoreA = updatedGoals.filter(g => g.team === 'teamA').length;
        const newScoreB = updatedGoals.filter(g => g.team === 'teamB').length;
        return {
          ...m,
          goals: updatedGoals,
          scoreA: newScoreA,
          scoreB: newScoreB,
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  const updateScoreline = (matchId: string, scoreA: number, scoreB: number) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        return { ...m, scoreA, scoreB };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  // Rating window workflows
  const startRatingWindow = (matchId: string) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          status: 'RATING_OPEN' as const,
          ratingWindowStartedAt: new Date().toISOString(),
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  const stopRatingWindow = (matchId: string) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        const { calculatedStats, computedMvpId, computedMvpScore } = computeMatchStats(m, ratingLogs);

        // Confetti celebration when ratings finalize!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore if canvas-confetti unsupported
        }

        return {
          ...m,
          status: 'RATING_CLOSED' as const,
          ratingWindowEndedAt: new Date().toISOString(),
          mvpPlayerId: computedMvpId,
          mvpScore: computedMvpScore,
          calculatedStats,
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  const resumeRatingWindow = (matchId: string) => {
    setMatches(prev => {
      const updated = prev.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          status: 'RATING_OPEN' as const,
        };
      });
      const target = updated.find(m => m.id === matchId);
      if (target) syncMatchToFirestore(target);
      return updated;
    });
  };

  // Submit match ratings
  const submitMatchRatings = (
    matchId: string,
    ratings: { ratedPlayerId: string; rating: number; comment?: string }[],
    mvpVotePlayerId?: string
  ) => {
    if (!currentUser) return;

    const newLogs: RatingLog[] = [];
    const timestamp = new Date().toISOString();

    ratings.forEach(r => {
      // STRICT CONSTRAINT: Cannot rate oneself
      if (r.ratedPlayerId === currentUser.id) return;

      const ratedP = players.find(p => p.id === r.ratedPlayerId);
      const newLog: RatingLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        matchId,
        voterId: currentUser.id,
        voterName: currentUser.name,
        ratedPlayerId: r.ratedPlayerId,
        ratedPlayerName: ratedP?.name || 'Player',
        rating: Math.max(0, Math.min(10, Number(r.rating.toFixed(1)))),
        mvpVotePlayerId: mvpVotePlayerId === r.ratedPlayerId ? mvpVotePlayerId : undefined,
        comment: r.comment,
        createdAt: timestamp,
      };
      newLogs.push(newLog);
      syncRatingLogToFirestore(newLog);
    });

    setRatingLogs(prev => [...prev, ...newLogs]);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {
      // confetti
    }
  };

  // Delete a specific rating log entry (Admin power with real-time recalculation)
  const deleteRatingLog = (logId: string) => {
    setRatingLogs(prev => prev.filter(l => l.id !== logId));
    deleteRatingLogFromFirestore(logId);
  };

  const activeRatingMatches = useMemo(() => {
    return matches.filter(m => m.status === 'RATING_OPEN');
  }, [matches]);

  const recentLogs = useMemo(() => {
    return [...ratingLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ratingLogs]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout warning:', e);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER);
    } catch {}
  };

  const setCurrentUserHandler = (user: Player | null) => {
    setCurrentUser(user);
    if (user) {
      if (user.email?.toLowerCase() === 'vatsv3temp@gmail.com' || user.id === 'p_vatsal' || user.isAdmin || user.role === 'admin') {
        setIsAdmin(true);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        players,
        matches,
        ratingLogs,
        currentUser,
        isAdmin,
        activeTab,
        selectedMatchId,
        selectedPlayerId,
        editPlayerId,
        timeFilter,

        setCurrentUser: setCurrentUserHandler,
        logout,
        setIsAdmin,
        setActiveTab,
        setSelectedMatchId,
        setSelectedPlayerId,
        setEditPlayerId,
        setTimeFilter,

        addPlayer,
        updatePlayer,
        deletePlayer,

        createMatch,
        updateMatch,
        deleteMatch,
        updateTacticalLineup,
        setFormationPreset,

        addGoalEvent,
        removeGoalEvent,
        updateScoreline,

        startRatingWindow,
        stopRatingWindow,
        resumeRatingWindow,
        submitMatchRatings,
        deleteRatingLog,

        computeMatchStats: (m: Match, logs?: RatingLog[]) => computeMatchStats(m, logs || ratingLogs),
        getPlayerAggregatedStats,
        allPlayerStats,
        activeRatingMatches,
        recentLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
