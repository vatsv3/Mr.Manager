import React, { useState } from 'react';
import { FootballPosition } from '../types';
import { POSITION_INFO } from '../data/constants';

interface PlayerAvatarProps {
  player?: {
    name?: string;
    photo?: string;
    primaryPosition?: FootballPosition;
    jerseyNumber?: number;
    preferredFoot?: string;
  } | null;
  name?: string;
  photo?: string;
  primaryPosition?: FootballPosition;
  jerseyNumber?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  team?: 'teamA' | 'teamB';
  showJerseyNumber?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  name: propName,
  photo: propPhoto,
  primaryPosition: propPos,
  jerseyNumber: propJersey,
  size = 'md',
  className = '',
  team,
  showJerseyNumber = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const name = player?.name || propName || 'Player';
  const rawPhoto = (player?.photo !== undefined ? player.photo : propPhoto) || '';
  const position = (player?.primaryPosition || propPos || 'CAM') as FootballPosition;
  const jerseyNumber = player?.jerseyNumber !== undefined ? player.jerseyNumber : propJersey;

  // Filter out empty or placeholder unsplash avatars that users didn't explicitly upload
  const isCustomPhoto =
    Boolean(rawPhoto) &&
    rawPhoto.trim().length > 0 &&
    !rawPhoto.includes('images.unsplash.com/photo-1535713875002-d1d0cf377fde') &&
    !imgError;

  // Derive initials (e.g. Vatsal -> V or Vatsal Vaghani -> VV)
  const initials = name
    .trim()
    .split(/\s+/)
    .map(n => n[0]?.toUpperCase() || '')
    .slice(0, 2)
    .join('') || 'FC';

  // Position / Team styling
  const posCategory = POSITION_INFO[position]?.category || 'MID';
  
  // Kit background styling
  let kitBg = 'from-emerald-600 to-teal-800 border-emerald-400/40 text-emerald-100';
  let badgeColor = '#10b981';

  if (team === 'teamA') {
    kitBg = 'from-emerald-600 to-emerald-800 border-emerald-400/50 text-emerald-100';
    badgeColor = '#10b981';
  } else if (team === 'teamB') {
    kitBg = 'from-sky-600 to-blue-800 border-sky-400/50 text-sky-100';
    badgeColor = '#0284c7';
  } else {
    switch (posCategory) {
      case 'GK':
        kitBg = 'from-amber-500 to-amber-700 border-amber-400/50 text-zinc-950';
        badgeColor = '#f59e0b';
        break;
      case 'DEF':
        kitBg = 'from-blue-600 to-indigo-800 border-blue-400/50 text-white';
        badgeColor = '#3b82f6';
        break;
      case 'MID':
        kitBg = 'from-emerald-600 to-teal-800 border-emerald-400/50 text-white';
        badgeColor = '#10b981';
        break;
      case 'ATT':
        kitBg = 'from-rose-600 to-red-800 border-rose-400/50 text-white';
        badgeColor = '#ef4444';
        break;
    }
  }

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px] rounded-lg',
    sm: 'w-8 h-8 text-[11px] rounded-xl',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl',
    xl: 'w-16 h-16 text-base rounded-2xl',
  };

  const currentSizeClass = className.includes('w-') ? '' : sizeClasses[size];

  if (isCustomPhoto) {
    return (
      <img
        src={rawPhoto}
        alt={name}
        onError={() => setImgError(true)}
        className={`object-cover select-none shrink-0 ${currentSizeClass} ${className}`}
      />
    );
  }

  // Jersey / Solid Color Representation
  return (
    <div
      title={`${name} (#${jerseyNumber || '—'} - ${position})`}
      className={`relative select-none shrink-0 flex flex-col items-center justify-center font-bold bg-gradient-to-br shadow-inner border overflow-hidden ${kitBg} ${currentSizeClass} ${className}`}
      style={{
        textShadow: posCategory === 'GK' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
      }}
    >
      {/* Jersey V-Neck / Collar Graphic */}
      <div className="absolute -top-1 w-3/5 h-2 bg-black/25 rounded-b-md border-b border-white/20 pointer-events-none" />

      {/* Subtle Kit Texture Line */}
      <div className="absolute inset-y-0 w-[1px] bg-white/10 left-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Content: Jersey Number or Initials */}
      <div className="relative z-10 flex flex-col items-center justify-center leading-none mt-0.5">
        {showJerseyNumber && jerseyNumber !== undefined ? (
          <span className="font-mono tracking-tight font-black">
            {jerseyNumber}
          </span>
        ) : (
          <span className="tracking-wider uppercase font-extrabold text-[0.85em]">
            {initials}
          </span>
        )}
      </div>

      {/* Mini Position Tag indicator on bottom if large enough */}
      {(size === 'lg' || size === 'xl') && (
        <span
          className="absolute bottom-0.5 text-[8px] font-black uppercase px-1 rounded-sm bg-black/40 text-white/90"
        >
          {position}
        </span>
      )}
    </div>
  );
};
