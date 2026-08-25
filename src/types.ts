export type PositionCategory = 'GK' | 'DEF' | 'MID' | 'ATT';

export type FootballPosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST'
  | 'CF';

export interface PositionInfo {
  code: FootballPosition;
  label: string;
  category: PositionCategory;
  color: string;
}

export interface PlayerTrait {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'physical' | 'technical' | 'mental' | 'goalkeeping';
}

export interface Player {
  id: string;
  uid?: string; // Firebase Auth User UID
  email?: string; // Authentication account email
  name: string;
  photo: string;
  primaryPosition: FootballPosition;
  secondaryPosition?: FootballPosition; // backward compatibility
  secondaryPositions?: FootballPosition[]; // multiple secondary positions
  traits: string[]; // trait IDs or names
  jerseyNumber?: number;
  nickname?: string;
  preferredFoot?: 'Left' | 'Right' | 'Both';
  createdAt: string;
}

export type MatchFormat = '5v5' | '6v6' | '7v7' | '8v8' | '9v9' | '11v11';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'RATING_OPEN' | 'RATING_CLOSED';

export interface PlayerTacticalSpot {
  playerId: string;
  positionCode: FootballPosition;
  x: number; // 0 to 100 percentage of pitch width
  y: number; // 0 to 100 percentage of pitch height
  isCaptain?: boolean;
}

export interface TeamInfo {
  name: string;
  kitColor: string; // hex or tailwind identifier
  secondaryColor?: string;
  lineup: PlayerTacticalSpot[];
}

export interface GoalEvent {
  id: string;
  minute?: number;
  team: 'teamA' | 'teamB';
  scorerId: string;
  assisterId?: string;
}

export interface RatingLog {
  id: string;
  matchId: string;
  voterId: string;
  voterName: string;
  ratedPlayerId: string;
  ratedPlayerName: string;
  rating: number; // 0 to 10 scale
  mvpVotePlayerId?: string; // Player voted as MVP in this session
  comment?: string;
  createdAt: string;
}

export interface PlayerMatchComputedStats {
  avgRating: number;
  ratingCount: number;
  mvpVotesCount: number;
  goals: number;
  assists: number;
  isMvp: boolean;
  team: 'teamA' | 'teamB';
}

export interface Match {
  id: string;
  title: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm
  venue: string;
  format: MatchFormat;
  teamA: TeamInfo;
  teamB: TeamInfo;
  scoreA: number;
  scoreB: number;
  goals: GoalEvent[];
  status: MatchStatus;
  ratingWindowStartedAt?: string;
  ratingWindowEndedAt?: string;
  mvpPlayerId?: string;
  mvpScore?: number; // Computed score for MVP calculation
  calculatedStats?: Record<string, PlayerMatchComputedStats>;
}

export type TimeFilter = '1m' | '2m' | '3m' | 'all';

export interface PlayerAggregatedStats {
  playerId: string;
  player: Player;
  matchesPlayed: number;
  totalGoals: number;
  totalAssists: number;
  goalContributions: number; // G + A
  avgRating: number;
  mvpCount: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  ratingsHistory: { matchId: string; matchTitle: string; date: string; rating: number; isMvp: boolean }[];
}
