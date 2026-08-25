import React from 'react';
import { useApp } from '../context/AppContext';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { POSITION_INFO, AVAILABLE_TRAITS } from '../data/constants';
import { Star, Award, Shield, User, Footprints, Calendar, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { currentUser, players, getPlayerAggregatedStats, setEditPlayerId } = useApp();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const targetPlayer = id ? players.find(p => p.id === id) : currentUser;

  if (!targetPlayer) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-sm text-zinc-400">Player not found</p>
        <button
          onClick={() => navigate('/roster')}
          className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Squad Roster
        </button>
      </div>
    );
  }

  const stats = getPlayerAggregatedStats(targetPlayer.id);
  const isSelf = currentUser?.id === targetPlayer.id;

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Player Profile
        </span>
        {isSelf && (
          <button
            onClick={() => setEditPlayerId(targetPlayer.id)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      {/* Main Profile Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <PlayerAvatar
            player={targetPlayer}
            size="xl"
            showJerseyNumber={true}
            className="rounded-2xl ring-2 ring-emerald-500/40"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-zinc-100 truncate">{targetPlayer.name}</h2>
              {targetPlayer.isAdmin && (
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Admin" />
              )}
            </div>
            {targetPlayer.nickname && (
              <p className="text-xs text-emerald-400 font-medium">"{targetPlayer.nickname}"</p>
            )}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
              <span className="font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200">
                {targetPlayer.primaryPosition}
              </span>
              <span>#{targetPlayer.jerseyNumber || '—'}</span>
              <span>• {targetPlayer.preferredFoot || 'Right'} foot</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 text-center">
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Matches</span>
            <span className="text-base font-bold text-zinc-100">
              {stats?.matchesPlayed || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Avg Rating</span>
            <span className="text-base font-bold text-emerald-400 flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 inline" />
              {stats?.avgRating?.toFixed(1) || '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">MOTM Awards</span>
            <span className="text-base font-bold text-amber-400 flex items-center justify-center gap-0.5">
              <Award className="w-3.5 h-3.5 text-amber-400 inline" />
              {stats?.motmCount || 0}
            </span>
          </div>
        </div>

        {/* Playstyles / Traits */}
        {targetPlayer.traits && targetPlayer.traits.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Playstyles & Traits
            </span>
            <div className="flex flex-wrap gap-1.5">
              {targetPlayer.traits.map(traitId => {
                const trait = AVAILABLE_TRAITS.find(t => t.id === traitId);
                return (
                  <span
                    key={traitId}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-200"
                  >
                    {trait?.icon && <img src={trait.icon} alt="" className="w-3.5 h-3.5" />}
                    {trait?.name || traitId}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
