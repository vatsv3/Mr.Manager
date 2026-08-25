import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FootballPosition } from '../types';
import { ALL_POSITIONS, AVAILABLE_TRAITS } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import { Upload, X, Check, Shirt, Image } from 'lucide-react';

interface PlayerSignupModalProps {
  onClose: () => void;
}

export const PlayerSignupModal: React.FC<PlayerSignupModalProps> = ({ onClose }) => {
  const { addPlayer, setCurrentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number>(10);
  const [photoType, setPhotoType] = useState<'jersey' | 'upload'>('jersey');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [primaryPosition, setPrimaryPosition] = useState<FootballPosition>('CAM');
  const [secondaryPositions, setSecondaryPositions] = useState<FootballPosition[]>(['CM', 'LW']);

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
          setUploadedPhotoUrl(reader.result);
          setPhotoType('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalPhoto =
      photoType === 'upload' && uploadedPhotoUrl.trim()
        ? uploadedPhotoUrl.trim()
        : '';

    const created = addPlayer({
      name: name.trim(),
      jerseyNumber: jerseyNumber || undefined,
      photo: finalPhoto,
      primaryPosition,
      secondaryPosition: secondaryPositions[0] || 'CM',
      secondaryPositions,
      traits: [],
    });

    setCurrentUser(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 shadow-xl max-h-[92vh] flex flex-col overflow-y-auto space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Register Player</h3>
            <p className="text-xs text-zinc-500">Create squad profile</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Name & Jersey Number */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Leo Silva"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jersey #</label>
              <input
                type="number"
                min="1"
                max="99"
                value={jerseyNumber}
                onChange={e => setJerseyNumber(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Profile Appearance Options */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-zinc-400 block">Profile Appearance</label>

            <div className="grid grid-cols-2 gap-2">
              {/* Team Jersey Avatar */}
              <button
                type="button"
                onClick={() => setPhotoType('jersey')}
                className={`p-2.5 rounded-lg border flex items-center space-x-2.5 transition text-left ${
                  photoType === 'jersey'
                    ? 'bg-zinc-800 border-emerald-500 text-zinc-100'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                <PlayerAvatar
                  name={name || 'Player'}
                  photo=""
                  primaryPosition={primaryPosition}
                  jerseyNumber={jerseyNumber}
                  size="sm"
                  className="rounded-lg"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block text-zinc-200">Team Jersey</span>
                  <span className="text-[10px] text-zinc-500">Solid color kit</span>
                </div>
              </button>

              {/* Upload Photo */}
              <div
                onClick={() => {
                  setPhotoType('upload');
                  fileInputRef.current?.click();
                }}
                className={`p-2.5 rounded-lg border flex items-center space-x-2.5 transition cursor-pointer ${
                  photoType === 'upload'
                    ? 'bg-zinc-800 border-emerald-500 text-zinc-100'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                {uploadedPhotoUrl ? (
                  <img
                    src={uploadedPhotoUrl}
                    alt="Uploaded"
                    className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-500"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                    <Upload className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-medium block text-zinc-200">
                    {uploadedPhotoUrl ? 'Photo Added' : 'Custom Photo'}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {uploadedPhotoUrl ? 'Click to change' : 'Upload photo'}
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {photoType === 'upload' && (
              <input
                type="url"
                value={uploadedPhotoUrl.startsWith('data:') ? '' : uploadedPhotoUrl}
                onChange={e => setUploadedPhotoUrl(e.target.value)}
                placeholder="Or paste photo URL..."
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none"
              />
            )}
          </div>

          {/* Primary Position Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-400">Primary Position *</label>
              <span className="text-[10px] text-emerald-400 font-semibold">{primaryPosition}</span>
            </div>
            <div className="grid grid-cols-5 gap-1 max-h-24 overflow-y-auto pr-0.5">
              {ALL_POSITIONS.map(pos => {
                const isSelected = primaryPosition === pos;
                return (
                  <button
                    type="button"
                    key={pos}
                    onClick={() => handlePrimaryPositionChange(pos)}
                    className={`py-1 rounded font-medium border text-center transition ${
                      isSelected
                        ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold shadow-sm'
                        : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800/60'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multiple Secondary Positions Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-zinc-400">
                Secondary Positions (Select multiple)
              </label>
              <span className="text-[10px] text-zinc-400">
                {secondaryPositions.length} selected
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 max-h-28 overflow-y-auto pr-0.5">
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

          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
