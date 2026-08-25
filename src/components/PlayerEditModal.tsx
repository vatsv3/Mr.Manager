import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FootballPosition } from '../types';
import { ALL_POSITIONS, AVAILABLE_TRAITS } from '../data/constants';
import { X, Save } from 'lucide-react';

interface PlayerEditModalProps {
  playerId: string;
  onClose: () => void;
}

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({ playerId, onClose }) => {
  const { players, updatePlayer } = useApp();
  const player = players.find(p => p.id === playerId);

  const [name, setName] = useState('');
  const [baseRating, setBaseRating] = useState<number>(75);
  const [primaryPosition, setPrimaryPosition] = useState<FootballPosition>('CAM');
  const [secondaryPositions, setSecondaryPositions] = useState<FootballPosition[]>([]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [jerseyNumber, setJerseyNumber] = useState<number>(10);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setBaseRating(player.baseRating || 75);
      setPrimaryPosition(player.primaryPosition || 'CAM');
      setSecondaryPositions(player.secondaryPositions || (player.secondaryPosition ? [player.secondaryPosition] : []));
      setSelectedTraits(player.traits || []);
      setJerseyNumber(player.jerseyNumber || 10);
    }
  }, [player]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updatePlayer(playerId, {
      name: name.trim(),
      baseRating,
      primaryPosition,
      secondaryPositions,
      traits: selectedTraits,
      jerseyNumber,
    });
    
    onClose();
  };

  if (!player) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] sm:h-[85vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">Edit Player Profile</h2>
            <p className="text-xs text-emerald-400">Admin Mode</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <form id="editPlayerForm" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1">Player Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Base Rating (OVR)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={baseRating}
                    onChange={(e) => setBaseRating(Number(e.target.value))}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-amber-400 font-bold placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Kit Number</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(Number(e.target.value))}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
              </div>
            </div>

            {/* Positions */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-2">Primary Position</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_POSITIONS.map(pos => (
                    <button
                      key={`primary-${pos}`}
                      type="button"
                      onClick={() => handlePrimaryPositionChange(pos)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition ${
                        primaryPosition === pos
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-2">Secondary Positions</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_POSITIONS.map(pos => {
                    const isPrimary = primaryPosition === pos;
                    const isSelected = secondaryPositions.includes(pos);
                    return (
                      <button
                        key={`secondary-${pos}`}
                        type="button"
                        onClick={() => toggleSecondaryPosition(pos)}
                        disabled={isPrimary}
                        className={`px-2 py-1 text-[10px] font-medium rounded-md border transition ${
                          isPrimary
                            ? 'opacity-30 cursor-not-allowed bg-zinc-900 border-zinc-800'
                            : isSelected
                            ? 'bg-zinc-800 border-zinc-500 text-zinc-200'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                      >
                        {pos}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Playstyles / Traits */}
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <label className="text-xs font-medium text-zinc-400 block mb-1 flex items-center justify-between">
                <span>Assign Playstyles</span>
                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded-full">{selectedTraits.length} selected</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_TRAITS.map(t => {
                  const isChecked = selectedTraits.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleTrait(t.id)}
                      className={`p-2 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <img src={t.icon} alt={t.name} className="w-5 h-5 object-contain" />
                      <div className="truncate">
                        <p className={`font-semibold text-[11px] truncate leading-tight ${isChecked ? 'text-emerald-300' : 'text-zinc-300'}`}>{t.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 shrink-0">
          <button
            type="submit"
            form="editPlayerForm"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>

      </div>
    </div>
  );
};
