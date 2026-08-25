import React from 'react';
import { useApp } from '../context/AppContext';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { AVAILABLE_TRAITS } from '../data/constants';
import { Star, Award, Shield, Trophy, Activity, Target, Flame, Edit3, ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { currentUser, players, getPlayerAggregatedStats, setEditPlayerId } = useApp();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const targetPlayer = id ? players.find(p => p.id === id) : currentUser;

  if (!targetPlayer) {
    return (
      <div className="p-8 text-center space-y-4 max-w-sm mx-auto">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-200">Player Not Found</h3>
        <p className="text-xs text-zinc-400">The player profile you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/roster')}
          className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 inline-flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Squad Roster
        </button>
      </div>
    );
  }

  const stats = getPlayerAggregatedStats(targetPlayer.id);
  const isSelf = currentUser?.id === targetPlayer.id;

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition py-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Player Profile
        </span>
        {isSelf ? (
          <button
            onClick={() => setEditPlayerId(targetPlayer.id)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Hero Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <PlayerAvatar
            player={targetPlayer}
            size="xl"
            showJerseyNumber={true}
            className="rounded-2xl ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base font-bold text-zinc-100 truncate">{targetPlayer.name}</h2>
              {targetPlayer.isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            {targetPlayer.nickname && (
              <p className="text-xs text-emerald-400 font-medium mt-0.5">"{targetPlayer.nickname}"</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 flex-wrap">
              <span className="font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                {targetPlayer.primaryPosition}
              </span>
              {targetPlayer.jerseyNumber && (
                <span className="font-mono font-bold text-zinc-300">#{targetPlayer.jerseyNumber}</span>
              )}
              <span>• {targetPlayer.preferredFoot || 'Right'} Foot</span>
            </div>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-4 gap-2 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80 text-center">
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Matches</span>
            <span className="text-base font-bold text-zinc-100">
              {stats?.matchesPlayed || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Rating</span>
            <span className="text-base font-bold text-emerald-400 flex items-center justify-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 inline" />
              {stats?.avgRating ? stats.avgRating.toFixed(1) : '—'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">Goals</span>
            <span className="text-base font-bold text-zinc-100 flex items-center justify-center gap-0.5">
              <Target className="w-3.5 h-3.5 text-zinc-400 inline" />
              {stats?.totalGoals || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-400 block font-medium">MOTM</span>
            <span className="text-base font-bold text-amber-400 flex items-center justify-center gap-0.5">
              <Award className="w-3.5 h-3.5 text-amber-400 inline" />
              {stats?.mvpCount || 0}
            </span>
          </div>
        </div>

        {/* Win / Draw / Loss Record */}
        <div className="flex items-center justify-between text-xs bg-zinc-950/40 px-3 py-2 rounded-xl border border-zinc-800/50 text-zinc-400">
          <span>Record: <strong className="text-emerald-400 font-semibold">{stats?.wins || 0}W</strong> - <strong className="text-zinc-300 font-semibold">{stats?.draws || 0}D</strong> - <strong className="text-rose-400 font-semibold">{stats?.losses || 0}L</strong></span>
          <span>Win Rate: <strong className="text-zinc-200 font-bold">{stats?.winRate || 0}%</strong></span>
        </div>

        {/* Playstyles / Traits */}
        {targetPlayer.traits && targetPlayer.traits.length > 0 && (
          <div className="space-y-1.5 pt-1">
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

      {/* Match Ratings History */}
      {stats?.ratingsHistory && stats.ratingsHistory.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Recent Rating History
            </h3>
            <span className="text-[10px] text-zinc-500 font-medium">
              {stats.ratingsHistory.length} match{stats.ratingsHistory.length > 1 ? 'es' : ''}
            </span>
          </div>

          <div className="space-y-2">
            {stats.ratingsHistory.map(hist => (
              <div
                key={hist.matchId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-zinc-200 truncate">{hist.matchTitle}</p>
                  <p className="text-[10px] text-zinc-500">{hist.date}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {hist.isMvp && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                      <Award className="w-3 h-3" /> MVP
                    </span>
                  )}
                  <span className="font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Star className="w-3 h-3 fill-emerald-400" /> {hist.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
