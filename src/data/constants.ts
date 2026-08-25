import { FootballPosition, PositionInfo, PlayerTrait, MatchFormat } from '../types';

export const POSITION_INFO: Record<FootballPosition, PositionInfo> = {
  GK: { code: 'GK', label: 'Goalkeeper', category: 'GK', color: '#eab308' },
  CB: { code: 'CB', label: 'Center Back', category: 'DEF', color: '#3b82f6' },
  LB: { code: 'LB', label: 'Left Back', category: 'DEF', color: '#0ea5e9' },
  RB: { code: 'RB', label: 'Right Back', category: 'DEF', color: '#0ea5e9' },
  LWB: { code: 'LWB', label: 'Left Wing Back', category: 'DEF', color: '#06b6d4' },
  RWB: { code: 'RWB', label: 'Right Wing Back', category: 'DEF', color: '#06b6d4' },
  CDM: { code: 'CDM', label: 'Defensive Midfielder', category: 'MID', color: '#10b981' },
  CM: { code: 'CM', label: 'Central Midfielder', category: 'MID', color: '#10b981' },
  CAM: { code: 'CAM', label: 'Attacking Midfielder', category: 'MID', color: '#8b5cf6' },
  LM: { code: 'LM', label: 'Left Midfielder', category: 'MID', color: '#a855f7' },
  RM: { code: 'RM', label: 'Right Midfielder', category: 'MID', color: '#a855f7' },
  LW: { code: 'LW', label: 'Left Winger', category: 'ATT', color: '#f43f5e' },
  RW: { code: 'RW', label: 'Right Winger', category: 'ATT', color: '#f43f5e' },
  ST: { code: 'ST', label: 'Striker', category: 'ATT', color: '#ef4444' },
  CF: { code: 'CF', label: 'Center Forward', category: 'ATT', color: '#f97316' },
};

export const ALL_POSITIONS: FootballPosition[] = [
  'GK', 'CB', 'LB', 'RB', 'LWB', 'RWB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'
];

export const AVAILABLE_TRAITS: PlayerTrait[] = [
  { id: 'speedster', name: 'Speedster', icon: '⚡', description: 'Explosive pace on the counter & tracking back', category: 'physical' },
  { id: 'playmaker', name: 'Playmaker', icon: '🎯', description: 'Visionary passing, creates key chances', category: 'technical' },
  { id: 'finisher', name: 'Clinical Finisher', icon: '⚽', description: 'Deadly 1v1 conversion inside the box', category: 'technical' },
  { id: 'rock_defender', name: 'Solid Rock', icon: '🛡️', description: 'Unbeatable in ground duels & positioning', category: 'mental' },
  { id: 'box_to_box', name: 'Box-to-Box', icon: '🏃', description: 'Relentless stamina covering both boxes', category: 'physical' },
  { id: 'dribbler', name: 'Maestro Dribbler', icon: '🪄', description: 'Tight space control and skill moves', category: 'technical' },
  { id: 'aerial_threat', name: 'Aerial Threat', icon: '🦅', description: 'Dominant jumping reach on set pieces', category: 'physical' },
  { id: 'ball_winner', name: 'Ball Winner', icon: '🧲', description: 'Aggressive interceptions and pressing', category: 'mental' },
  { id: 'dead_ball', name: 'Free Kick Specialist', icon: '🔮', description: 'Dangerous curling free kicks & corners', category: 'technical' },
  { id: 'long_shot', name: 'Long Range Cannon', icon: '🚀', description: 'Powerful shooting from outside the box', category: 'technical' },
  { id: 'sweeper_gk', name: 'Sweeper Keeper', icon: '🧤', description: 'Rushes off line, excellent distribution', category: 'goalkeeping' },
  { id: 'cat_reflexes', name: 'Cat Reflexes', icon: '🐆', description: 'Acrobatic diving and point-blank stops', category: 'goalkeeping' },
  { id: 'vocal_leader', name: 'Vocal Leader', icon: '📢', description: 'Organizes defensive line and boosts morale', category: 'mental' },
  { id: 'engine', name: 'Endless Engine', icon: '🔋', description: 'Never tires, high-intensity sprint bursts', category: 'physical' },
];

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

export const AVATAR_PRESETS = [DEFAULT_AVATAR];

export interface FormationPreset {
  name: string;
  format: MatchFormat;
  teamA: { positionCode: FootballPosition; x: number; y: number }[];
  teamB: { positionCode: FootballPosition; x: number; y: number }[];
}

export const FORMATION_PRESETS: Record<MatchFormat, FormationPreset[]> = {
  '5v5': [
    {
      name: 'Diamond (1-2-1)',
      format: '5v5',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'CB', x: 50, y: 75 },
        { positionCode: 'LM', x: 22, y: 62 },
        { positionCode: 'RM', x: 78, y: 62 },
        { positionCode: 'ST', x: 50, y: 52 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'CB', x: 50, y: 25 },
        { positionCode: 'LM', x: 78, y: 38 },
        { positionCode: 'RM', x: 22, y: 38 },
        { positionCode: 'ST', x: 50, y: 48 },
      ],
    },
    {
      name: 'Square (2-2)',
      format: '5v5',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'LB', x: 30, y: 74 },
        { positionCode: 'RB', x: 70, y: 74 },
        { positionCode: 'LW', x: 30, y: 56 },
        { positionCode: 'RW', x: 70, y: 56 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'LB', x: 70, y: 26 },
        { positionCode: 'RB', x: 30, y: 26 },
        { positionCode: 'LW', x: 70, y: 44 },
        { positionCode: 'RW', x: 30, y: 44 },
      ],
    },
  ],
  '6v6': [
    {
      name: 'Pyramid (2-1-2)',
      format: '6v6',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'LB', x: 28, y: 75 },
        { positionCode: 'RB', x: 72, y: 75 },
        { positionCode: 'CM', x: 50, y: 64 },
        { positionCode: 'LW', x: 32, y: 53 },
        { positionCode: 'RW', x: 68, y: 53 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'LB', x: 72, y: 25 },
        { positionCode: 'RB', x: 28, y: 25 },
        { positionCode: 'CM', x: 50, y: 36 },
        { positionCode: 'LW', x: 68, y: 47 },
        { positionCode: 'RW', x: 32, y: 47 },
      ],
    },
  ],
  '7v7': [
    {
      name: 'Classic 7s (2-3-1)',
      format: '7v7',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'CB', x: 34, y: 77 },
        { positionCode: 'CB', x: 66, y: 77 },
        { positionCode: 'LM', x: 18, y: 64 },
        { positionCode: 'CM', x: 50, y: 65 },
        { positionCode: 'RM', x: 82, y: 64 },
        { positionCode: 'ST', x: 50, y: 52 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'CB', x: 66, y: 23 },
        { positionCode: 'CB', x: 34, y: 23 },
        { positionCode: 'LM', x: 82, y: 36 },
        { positionCode: 'CM', x: 50, y: 35 },
        { positionCode: 'RM', x: 18, y: 36 },
        { positionCode: 'ST', x: 50, y: 48 },
      ],
    },
    {
      name: 'Solid 7s (3-2-1)',
      format: '7v7',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'LB', x: 20, y: 76 },
        { positionCode: 'CB', x: 50, y: 78 },
        { positionCode: 'RB', x: 80, y: 76 },
        { positionCode: 'CM', x: 36, y: 63 },
        { positionCode: 'CAM', x: 64, y: 63 },
        { positionCode: 'ST', x: 50, y: 52 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'LB', x: 80, y: 24 },
        { positionCode: 'CB', x: 50, y: 22 },
        { positionCode: 'RB', x: 20, y: 24 },
        { positionCode: 'CM', x: 64, y: 37 },
        { positionCode: 'CAM', x: 36, y: 37 },
        { positionCode: 'ST', x: 50, y: 48 },
      ],
    },
  ],
  '8v8': [
    {
      name: 'Balanced 8s (3-3-1)',
      format: '8v8',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'LB', x: 20, y: 78 },
        { positionCode: 'CB', x: 50, y: 80 },
        { positionCode: 'RB', x: 80, y: 78 },
        { positionCode: 'LM', x: 20, y: 64 },
        { positionCode: 'CM', x: 50, y: 66 },
        { positionCode: 'RM', x: 80, y: 64 },
        { positionCode: 'ST', x: 50, y: 52 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'LB', x: 80, y: 22 },
        { positionCode: 'CB', x: 50, y: 20 },
        { positionCode: 'RB', x: 20, y: 22 },
        { positionCode: 'LM', x: 80, y: 36 },
        { positionCode: 'CM', x: 50, y: 34 },
        { positionCode: 'RM', x: 20, y: 36 },
        { positionCode: 'ST', x: 50, y: 48 },
      ],
    },
  ],
  '9v9': [
    {
      name: 'Modern 9s (3-2-3)',
      format: '9v9',
      teamA: [
        { positionCode: 'GK', x: 50, y: 92 },
        { positionCode: 'LB', x: 22, y: 78 },
        { positionCode: 'CB', x: 50, y: 80 },
        { positionCode: 'RB', x: 78, y: 78 },
        { positionCode: 'CDM', x: 38, y: 67 },
        { positionCode: 'CM', x: 62, y: 67 },
        { positionCode: 'LW', x: 20, y: 54 },
        { positionCode: 'ST', x: 50, y: 52 },
        { positionCode: 'RW', x: 80, y: 54 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 8 },
        { positionCode: 'LB', x: 78, y: 22 },
        { positionCode: 'CB', x: 50, y: 20 },
        { positionCode: 'RB', x: 22, y: 22 },
        { positionCode: 'CDM', x: 62, y: 33 },
        { positionCode: 'CM', x: 38, y: 33 },
        { positionCode: 'LW', x: 80, y: 46 },
        { positionCode: 'ST', x: 50, y: 48 },
        { positionCode: 'RW', x: 20, y: 46 },
      ],
    },
  ],
  '11v11': [
    {
      name: 'Standard (4-3-3)',
      format: '11v11',
      teamA: [
        { positionCode: 'GK', x: 50, y: 93 },
        { positionCode: 'LB', x: 15, y: 80 },
        { positionCode: 'CB', x: 38, y: 82 },
        { positionCode: 'CB', x: 62, y: 82 },
        { positionCode: 'RB', x: 85, y: 80 },
        { positionCode: 'CDM', x: 50, y: 71 },
        { positionCode: 'CM', x: 32, y: 64 },
        { positionCode: 'CAM', x: 68, y: 64 },
        { positionCode: 'LW', x: 18, y: 54 },
        { positionCode: 'ST', x: 50, y: 52 },
        { positionCode: 'RW', x: 82, y: 54 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 7 },
        { positionCode: 'LB', x: 85, y: 20 },
        { positionCode: 'CB', x: 62, y: 18 },
        { positionCode: 'CB', x: 38, y: 18 },
        { positionCode: 'RB', x: 15, y: 20 },
        { positionCode: 'CDM', x: 50, y: 29 },
        { positionCode: 'CM', x: 68, y: 36 },
        { positionCode: 'CAM', x: 32, y: 36 },
        { positionCode: 'LW', x: 82, y: 46 },
        { positionCode: 'ST', x: 50, y: 48 },
        { positionCode: 'RW', x: 18, y: 46 },
      ],
    },
    {
      name: 'Defensive (4-2-3-1)',
      format: '11v11',
      teamA: [
        { positionCode: 'GK', x: 50, y: 93 },
        { positionCode: 'LB', x: 16, y: 80 },
        { positionCode: 'CB', x: 38, y: 82 },
        { positionCode: 'CB', x: 62, y: 82 },
        { positionCode: 'RB', x: 84, y: 80 },
        { positionCode: 'CDM', x: 36, y: 71 },
        { positionCode: 'CDM', x: 64, y: 71 },
        { positionCode: 'LM', x: 18, y: 60 },
        { positionCode: 'CAM', x: 50, y: 61 },
        { positionCode: 'RM', x: 82, y: 60 },
        { positionCode: 'ST', x: 50, y: 52 },
      ],
      teamB: [
        { positionCode: 'GK', x: 50, y: 7 },
        { positionCode: 'LB', x: 84, y: 20 },
        { positionCode: 'CB', x: 62, y: 18 },
        { positionCode: 'CB', x: 38, y: 18 },
        { positionCode: 'RB', x: 16, y: 20 },
        { positionCode: 'CDM', x: 64, y: 29 },
        { positionCode: 'CDM', x: 36, y: 29 },
        { positionCode: 'LM', x: 82, y: 40 },
        { positionCode: 'CAM', x: 50, y: 39 },
        { positionCode: 'RM', x: 18, y: 40 },
        { positionCode: 'ST', x: 50, y: 48 },
      ],
    },
  ],
};
