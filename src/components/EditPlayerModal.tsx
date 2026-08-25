import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Player, FootballPosition } from '../types';
import { ALL_POSITIONS, AVAILABLE_TRAITS } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import { Upload, X, Shield, Star, Trash2, Shirt, Image } from 'lucide-react';

interface EditPlayerModalProps {
  player: Player;
  onClose: () => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({ player, onClose }) => {
  const { updatePlayer, deletePlayer, isAdmin } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(player.name || '');
  const [jerseyNumber, setJerseyNumber] = useState<number | string>(player.jerseyNumber || '');
  const [nickname, setNickname] = useState(player.nickname || '');
  const [preferredFoot, setPreferredFoot] = useState<'Left' | 'Right' | 'Both'>(player.preferredFoot || 'Right');
  const [photo, setPhoto] = useState(
    player.photo && !player.photo.includes('images.unsplash.com/photo-1535713875002-d1d0cf377fde')
      ? player.photo
      : ''
  );
  const [photoMode, setPhotoMode] = useState<'jersey' | 'custom'>(
    player.photo && player.photo.trim().length > 0 && !player.photo.includes('images.unsplash.com/photo-1535713875002-d1d0cf377fde')
      ? 'custom'
      : 'jersey'
  );
  const [primaryPosition, setPrimaryPosition] = useState<FootballPosition>(player.primaryPosition || 'CAM');
  const [secondaryPositions, setSecondaryPositions] = useState<FootballPosition[]>(
    player.secondaryPositions && player.secondaryPositions.length > 0
      ? player.secondaryPositions
      : player.secondaryPosition
      ? [player.secondaryPosition]
      : []
  );
  const [baseRating, setBaseRating] = useState<number | string>(player.baseRating !== undefined ? player.baseRating : '');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(player.traits || []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleTrait = (traitId: string) => {
    setSelectedTraits(prev =>
      prev.includes(traitId) ? prev.filter(t => t !== traitId) : [...prev, traitId]
    );
  };

  const toggleSecondaryPosition = (pos: FootballPosition) => {
    if (pos === primaryPosition) return;
    setSecondaryPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  };

  const handlePrimaryPositionChange = (pos: FootballPosition) => {
    setPrimaryPosition(pos);
    setSecondaryPositions(prev => prev.filter(p => p !== pos));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhoto(reader.result);
          setPhotoMode('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedRating = baseRating === '' ? undefined : Number(baseRating);
    const parsedJersey = jerseyNumber === '' ? undefined : Number(jerseyNumber);
    const finalPhoto = photoMode === 'custom' && photo.trim().length > 0 ? photo.trim() : '';

    updatePlayer(player.id, {
      name: name.trim(),
      jerseyNumber: parsedJersey,
      nickname: nickname.trim() || undefined,
      preferredFoot,
      photo: finalPhoto,
      primaryPosition,
      secondaryPosition: secondaryPositions[0] || undefined,
      secondaryPositions,
      baseRating: parsedRating,
      traits: selectedTraits,
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete ${player.name}'s profile?`)) {
      deletePlayer(player.id);
      onClose();
    }
  };

  if (!isAdmin) {
    return null;
  }

  const effectiveJerseyNumber = jerseyNumber === '' ? undefined : Number(jerseyNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-xl max-h-[92vh] flex flex-col overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Edit Player Profile</h3>
              <p className="text-[11px] text-zinc-500">Admin Control: Assign ratings & FC Mobile playstyles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          {/* Avatar & Photo Options */}
          <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-300">Profile Appearance</label>
              <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setPhotoMode('jersey');
                    setPhoto('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                    photoMode === 'jersey'
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Shirt className="w-3 h-3" /> Team Jersey
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('custom')}
                  className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                    photoMode === 'custom'
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Image className="w-3 h-3" /> Custom Photo
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PlayerAvatar
                name={name || 'Player'}
                photo={photoMode === 'custom' ? photo : ''}
                primaryPosition={primaryPosition}
                jerseyNumber={effectiveJerseyNumber}
                size="lg"
                className="w-14 h-14 ring-2 ring-emerald-500/50 rounded-xl"
              />

              <div className="flex-1 space-y-1.5 min-w-0">
                {photoMode === 'jersey' ? (
                  <p className="text-[11px] text-zinc-400">
                    Displaying solid position jersey (#{effectiveJerseyNumber || '—'} • {primaryPosition})
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={photo}
                      onChange={e => setPhoto(e.target.value)}
                      placeholder="Paste image URL..."
                      className="flex-1 min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1 shrink-0 transition"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name & Jersey & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jersey #</label>
              <input
                type="number"
                min="1"
                max="99"
                value={jerseyNumber}
                onChange={e => setJerseyNumber(e.target.value)}
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Nickname & Foot */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="e.g. The Sniper"
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Preferred Foot</label>
              <select
                value={preferredFoot}
                onChange={e => setPreferredFoot(e.target.value as any)}
                className="w-full bg-zinc-950/70 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Both">Both (Ambidextrous)</option>
              </select>
            </div>
          </div>

          {/* Initial Rating Assignment (Admin Only) */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                Initial Base Rating (Admin Assigned)
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {baseRating !== '' ? `${Number(baseRating).toFixed(1)} / 10` : 'Not Set'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.1"
                value={baseRating === '' ? 6.0 : baseRating}
                onChange={e => setBaseRating(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={baseRating}
                onChange={e => setBaseRating(e.target.value)}
                placeholder="6.5"
                className="w-16 bg-zinc-950 border border-amber-500/30 rounded-lg px-2 py-1 text-center font-mono text-amber-300 text-xs focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-zinc-400">
              This sets the player's initial rating before or alongside dynamic match ratings.
            </p>
          </div>

          {/* Primary Position Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 block">Primary Position</label>
            <div className="grid grid-cols-5 gap-1">
              {ALL_POSITIONS.map(pos => {
                const isSelected = primaryPosition === pos;
                return (
                  <button
                    type="button"
                    key={pos}
                    onClick={() => handlePrimaryPositionChange(pos)}
                    className={`py-1 rounded font-medium border text-center transition ${
                      isSelected
                        ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold shadow-sm'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Positions */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400 block">
              Secondary Positions ({secondaryPositions.length} selected)
            </label>
            <div className="grid grid-cols-5 gap-1">
              {ALL_POSITIONS.map(pos => {
                const isPrimary = primaryPosition === pos;
                const isSelected = secondaryPositions.includes(pos);
                return (
                  <button
                    type="button"
                    key={pos}
                    disabled={isPrimary}
                    onClick={() => toggleSecondaryPosition(pos)}
                    className={`py-1 rounded font-medium border text-center transition ${
                      isPrimary
                        ? 'opacity-30 cursor-not-allowed bg-zinc-950/30 text-zinc-600 border-zinc-800/40'
                        : isSelected
                        ? 'bg-zinc-700 text-zinc-100 border-zinc-500 font-semibold shadow-sm'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assign Level 2 FC Mobile Playstyles */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-emerald-400 block">
                Assign FC Mobile Playstyles (Level 2) — ({selectedTraits.length} assigned)
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {AVAILABLE_TRAITS.map(t => {
                const isChecked = selectedTraits.includes(t.id) || selectedTraits.includes(t.name);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggleTrait(t.id)}
                    className={`p-2 rounded-lg border text-left flex items-center space-x-2 transition ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-200 shadow-sm'
                        : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                    }`}
                  >
                    <img src={t.icon} alt={t.name} className="w-6 h-6 object-contain shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-[11px] truncate leading-tight">{t.name}</p>
                      <span className="text-[9px] text-zinc-500 uppercase">{t.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Save & Delete */}
          <div className="pt-2 flex items-center gap-2 border-t border-zinc-800">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    deletePlayer(player.id);
                    onClose();
                  }}
                  className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="py-2 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="py-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
