import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { FootballPosition } from '../types';
import { ALL_POSITIONS, AVAILABLE_TRAITS, DEFAULT_AVATAR, POSITION_INFO } from '../data/constants';
import { Shield, User, Plus, Search, Check, Upload, ArrowRight, Sparkles, LogIn } from 'lucide-react';

interface AuthLandingViewProps {
  onGuestContinue?: () => void;
}

export const AuthLandingView: React.FC<AuthLandingViewProps> = ({ onGuestContinue }) => {
  const { players, setCurrentUser, addPlayer } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(players[0]?.id || '');
  const [rememberMe, setRememberMe] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Signup form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState<number>(10);
  const [photoType, setPhotoType] = useState<'default' | 'upload'>('default');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  const [primaryPosition, setPrimaryPosition] = useState<FootballPosition>('CAM');
  const [secondaryPositions, setSecondaryPositions] = useState<FootballPosition[]>(['CM', 'LW']);
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['playmaker', 'dribbler']);

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
          setUploadedPhotoUrl(reader.result);
          setPhotoType('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const player = players.find(p => p.id === selectedPlayerId);
    if (player) {
      if (rememberMe) {
        try {
          localStorage.setItem('pitchsquad_current_user_v1', JSON.stringify(player));
        } catch (err) {
          console.error(err);
        }
      } else {
        localStorage.removeItem('pitchsquad_current_user_v1');
      }
      setCurrentUser(player);
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalPhoto =
      photoType === 'upload' && uploadedPhotoUrl.trim()
        ? uploadedPhotoUrl.trim()
        : DEFAULT_AVATAR;

    const created = addPlayer({
      name: name.trim(),
      jerseyNumber: jerseyNumber || undefined,
      photo: finalPhoto,
      primaryPosition,
      secondaryPosition: secondaryPositions[0] || 'CM',
      secondaryPositions,
      traits: selectedTraits,
    });

    if (rememberMe) {
      try {
        localStorage.setItem('pitchsquad_current_user_v1', JSON.stringify(created));
      } catch (err) {
        console.error(err);
      }
    } else {
      localStorage.removeItem('pitchsquad_current_user_v1');
    }

    setCurrentUser(created);
  };

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
        {/* Header / Brand Banner */}
        <div className="text-center space-y-1.5 pb-2 border-b border-zinc-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 text-2xl shadow-inner mb-1">
            ⚽
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">
            PitchSquad
          </h1>
          <p className="text-xs text-zinc-400">
            Turf Squad Tactics, Balanced Teams & Peer Ratings
          </p>
        </div>

        {/* Tab Switcher (Log In vs Sign Up) */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              authMode === 'login'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`py-2 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
              authMode === 'signup'
                ? 'bg-zinc-800 text-zinc-100 font-semibold shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Sign Up Player</span>
          </button>
        </div>

        {/* 1. LOGIN TAB: Select Player Account */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Select your squad profile
                </label>
                <span className="text-[11px] text-zinc-500">
                  {players.length} registered players
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search your name or position..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              {/* Player Selector List */}
              <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                {filteredPlayers.map(player => {
                  const isSelected = selectedPlayerId === player.id;
                  const posColor = POSITION_INFO[player.primaryPosition]?.color || '#10b981';

                  return (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayerId(player.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-zinc-800/90 border-zinc-600 text-zinc-100 shadow-sm'
                          : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={player.photo}
                          alt={player.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-xs text-zinc-100 truncate">
                              {player.name}
                            </span>
                            {player.jerseyNumber && (
                              <span className="text-[10px] text-zinc-500 font-mono">
                                #{player.jerseyNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span
                              className="text-[9px] font-semibold px-1 rounded text-white"
                              style={{ backgroundColor: posColor }}
                            >
                              {player.primaryPosition}
                            </span>
                            {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                              <span className="text-[9px] text-zinc-500 truncate">
                                +{player.secondaryPositions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <span>Remember login on this device</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={!selectedPlayerId}
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>Continue into PitchSquad</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onGuestContinue && (
                <button
                  type="button"
                  onClick={onGuestContinue}
                  className="w-full py-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition text-center"
                >
                  Explore as Guest / Preview
                </button>
              )}
            </div>
          </form>
        )}

        {/* 2. SIGNUP TAB: Register New Player (NO NICKNAME) */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-0.5">
            {/* Name & Jersey Number */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Marcus Rashford"
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

            {/* Profile Photo Options */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 block">Profile Photo</label>

              <div className="grid grid-cols-2 gap-2">
                {/* Default Avatar */}
                <button
                  type="button"
                  onClick={() => setPhotoType('default')}
                  className={`p-2 rounded-lg border flex items-center space-x-2 transition text-left ${
                    photoType === 'default'
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                  }`}
                >
                  <img
                    src={DEFAULT_AVATAR}
                    alt="Default"
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium block text-zinc-200">Default Icon</span>
                  </div>
                </button>

                {/* Upload Photo */}
                <div
                  onClick={() => {
                    setPhotoType('upload');
                    fileInputRef.current?.click();
                  }}
                  className={`p-2 rounded-lg border flex items-center space-x-2 transition cursor-pointer ${
                    photoType === 'upload'
                      ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                  }`}
                >
                  {uploadedPhotoUrl ? (
                    <img
                      src={uploadedPhotoUrl}
                      alt="Uploaded"
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-500"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium block text-zinc-200">
                      {uploadedPhotoUrl ? 'Selected' : 'Upload File'}
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
            </div>

            {/* Primary Position Selection */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-zinc-400">Primary Position *</label>
                <span className="text-[10px] text-emerald-400 font-semibold">{primaryPosition}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 max-h-20 overflow-y-auto pr-0.5">
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
                  Secondary Positions (Multiple)
                </label>
                <span className="text-[10px] text-zinc-400">
                  {secondaryPositions.length} selected
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 max-h-20 overflow-y-auto pr-0.5">
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

            {/* Football Traits Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400 block">
                Traits ({selectedTraits.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-0.5">
                {AVAILABLE_TRAITS.map(t => {
                  const isChecked = selectedTraits.includes(t.id);
                  return (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => toggleTrait(t.id)}
                      className={`p-1.5 rounded-lg border text-left flex items-center space-x-1.5 transition ${
                        isChecked
                          ? 'bg-zinc-800 border-zinc-600 text-zinc-100'
                          : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40'
                      }`}
                    >
                      <span className="text-xs">{t.icon}</span>
                      <div className="truncate">
                        <p className="font-medium text-[11px] truncate leading-tight">{t.name}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                />
                <span>Remember login on this device</span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
              >
                <span>Register & Enter Squad</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
