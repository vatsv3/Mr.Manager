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
  { id: 'finesse_expert', name: 'Finesse Expert', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_POWER_FINESSE_2.png', description: 'Finesse Expert Playstyle', category: 'technical' },
  { id: 'clinical_finisher', name: 'Clinical Finisher', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_CLINICAL_FINISHER_2.png', description: 'Clinical Finisher Playstyle', category: 'technical' },
  { id: 'power_shot', name: 'Power Shot', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_POWER_SHOT_2.png', description: 'Power Shot Playstyle', category: 'technical' },
  { id: 'penalty_expert', name: 'Penalty Expert', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_PENALTY_EXPERT_2.png', description: 'Penalty Expert Playstyle', category: 'technical' },
  { id: 'chip_shot', name: 'Chip Shot', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_CHIP_MASTER_2.png', description: 'Chip Shot Playstyle', category: 'technical' },
  { id: 'tiki_taka', name: 'Tiki Taka', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_TIKI_TAKA_2.png', description: 'Tiki Taka Playstyle', category: 'technical' },
  { id: 'bullet_pass', name: 'Bullet Pass', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_BULLET_PASS_2.png', description: 'Bullet Pass Playstyle', category: 'technical' },
  { id: 'whipped_cross', name: 'Whipped Cross', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_WHIPPED_CROSSER_2.png', description: 'Whipped Cross Playstyle', category: 'technical' },
  { id: 'rapid', name: 'Rapid', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_SPEED_DRIBBLER_2.png', description: 'Rapid Playstyle', category: 'physical' },
  { id: 'trickster', name: 'Trickster', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_TRICKSTER_2.png', description: 'Trickster Playstyle', category: 'technical' },
  { id: 'anticipate', name: 'Anticipate', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_STAND_TACKLE_MASTER_2.png', description: 'Anticipate Playstyle', category: 'mental' },
  { id: 'guardian', name: 'Guardian', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_HARD_TACKLE_MASTER_2.png', description: 'Guardian Playstyle', category: 'mental' },
  { id: 'accelerator', name: 'Accelerator', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_ACCELERATOR_2.png', description: 'Accelerator Playstyle', category: 'physical' },
  { id: 'relentless', name: 'Relentless', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_RELENTLESS_STAMINA_2.png', description: 'Relentless Playstyle', category: 'physical' },
  { id: 'bruiser', name: 'Bruiser', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_INTIMIDATOR_2.png', description: 'Bruiser Playstyle', category: 'mental' },
  { id: 'precision_header', name: 'Precision Header', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_AERIAL_MASTER_2.png', description: 'Precision Header Playstyle', category: 'physical' },
  { id: 'deflector', name: 'Deflector', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_DEFLECTOR_2.png', description: 'Deflector Playstyle', category: 'goalkeeping' },
  { id: 'rush_out', name: 'Rush Out', icon: 'https://img.fifamobileguide.com/fcmobile/26/playstyles/playstyle_256_PLAYSTYLE_SUPER_RUSH_2.png', description: 'Rush Out Playstyle', category: 'goalkeeping' },
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
