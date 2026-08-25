import { Player, Match, RatingLog } from '../types';

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p_vatsal',
    email: 'vatsv3temp@gmail.com',
    isAdmin: true,
    role: 'admin',
    name: 'Vatsal',
    photo: '',
    primaryPosition: 'GK',
    secondaryPosition: 'CB',
    secondaryPositions: ['CB', 'LB', 'RB', 'CDM'],
    traits: ['deflector', 'rush_out', 'guardian', 'anticipate', 'bullet_pass', 'relentless'],
    jerseyNumber: 1,
    nickname: 'The Wall & Captain',
    preferredFoot: 'Right',
    baseRating: 8.5,
    createdAt: '2026-06-01T10:00:00Z',
  },
];

export const INITIAL_MATCHES: Match[] = [];

export const INITIAL_RATING_LOGS: RatingLog[] = [];

