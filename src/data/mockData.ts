import { Player, Match, RatingLog } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p_vatsal',
    email: 'vatsv3temp@gmail.com',
    isAdmin: true,
    role: 'admin',
    name: 'Vatsal',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    primaryPosition: 'GK',
    secondaryPosition: 'CB',
    secondaryPositions: ['CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM'],
    traits: ['free_kick', 'long_shot', 'sweeper_gk', 'cat_reflexes', 'vocal_leader', 'engine'],
    jerseyNumber: 1,
    nickname: 'The Wall & Captain',
    preferredFoot: 'Right',
    createdAt: '2026-06-01T10:00:00Z',
  },
];

export const INITIAL_MATCHES: Match[] = [];

export const INITIAL_RATING_LOGS: RatingLog[] = [];
