import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TimeFilter } from '../types';
import { POSITION_INFO } from '../data/constants';
import { PlayerAvatar } from './PlayerAvatar';
import {
  Trophy,
  Star,
  Flame,
  Award,
  Filter,
  Search,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const {
    allPlayerStats,
    timeFilter,
    setTimeFilter,
    setSelectedPlayerId,
  } = useApp();

  const [sortMetric, setSortMetric] = useState<'avgRating' | 'goalContributions' | 'totalGoals' | 'totalAssists' | 'mvpCount'>('avgRating');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedPlayers = [...allPlayerStats]
    .filter(s => {
      if (!searchQuery.trim()) return true;
      return s.player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.player.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortMetric === 'avgRating') {
        if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
        return b.matchesPlayed - a.matchesPlayed;
      }
      if (sortMetric === 'goalContributions') {
        if (b.goalContributions !== a.goalContributions) return b.goalContributions - a.goalContributions;
        return b.avgRating - a.avgRating;
      }
      if (sortMetric === 'totalGoals') {
        return b.totalGoals - a.totalGoals;
      }
      if (sortMetric === 'totalAssists') {
        return b.totalAssists - a.totalAssists;
      }
      if (sortMetric === 'mvpCount') {
        if (b.mvpCount !== a.mvpCount) return b.mvpCount - a.mvpCount;
        return b.avgRating - a.avgRating;
      }
      return 0;
    });

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
            Leaderboard
          </h2>
          <p className="text-xs text-zinc-500">Player rankings & performance stats</p>
        </div>

        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
          {allPlayerStats.length} Players
        </span>
      </div>

      {/* Time Period Filter */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-medium text-zinc-500 tracking-wider">
            Period
          </span>
          <span className="text-xs text-zinc-400">
            {timeFilter === '1m' && 'Last 30 Days'}
            {timeFilter === '2m' && 'Last 60 Days'}
            {timeFilter === '3m' && 'Last 90 Days'}
            {timeFilter === 'all' && 'All Time'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800 text-xs">
          {(['1m', '2m', '3m', 'all'] as TimeFilter[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`py-1 rounded-md font-medium transition text-center ${
                timeFilter === tf
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tf === '1m' && '1M'}
              {tf === '2m' && '2M'}
              {tf === '3m' && '3M'}
              {tf === 'all' && 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Sort Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {[
          { id: 'avgRating' as const, label: 'Avg Rating', icon: Star },
          { id: 'goalContributions' as const, label: 'G+A', icon: Flame },
          { id: 'totalGoals' as const, label: 'Goals', icon: Trophy },
          { id: 'totalAssists' as const, label: 'Assists', icon: TrendingUp },
          { id: 'mvpCount' as const, label: 'MOTMs', icon: Award },
        ].map(metric => {
          const Icon = metric.icon;
          const isSelected = sortMetric === metric.id;
          return (
            <button
              key={metric.id}
              onClick={() => setSortMetric(metric.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
              }`}
            >
              <Icon className={`w-3 h-3 ${isSelected ? 'text-zinc-200' : 'text-zinc-500'}`} />
              <span>{metric.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by name or position..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {/* Top 3 Overview */}
      {sortedPlayers.length >= 3 && !searchQuery && (
        <div className="grid grid-cols-3 gap-2 pt-1 items-end">
          {/* Rank 2 */}
          {(() => {
            const p2 = sortedPlayers[1];
            if (!p2) return null;
            return (
              <div
                onClick={() => setSelectedPlayerId(p2.player.id)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 text-center flex flex-col items-center cursor-pointer hover:border-zinc-700 transition"
              >
                <span className="text-[10px] font-medium text-zinc-400 mb-1">#2</span>
                <PlayerAvatar
                  player={p2.player}
                  size="md"
                  showBadge={true}
                  badgePosition={p2.player.primaryPosition}
                  className="rounded-full ring-1 ring-zinc-700"
                />
                <h4 className="text-xs font-medium text-zinc-200 mt-1 truncate max-w-[80px]">{p2.player.name.split(' ')[0]}</h4>
                <span className="text-xs font-semibold text-zinc-300 mt-0.5">
                  {sortMetric === 'avgRating' && `${p2.avgRating}`}
                  {sortMetric === 'goalContributions' && `${p2.goalContributions} G+A`}
                  {sortMetric === 'totalGoals' && `${p2.totalGoals} G`}
                  {sortMetric === 'totalAssists' && `${p2.totalAssists} A`}
                  {sortMetric === 'mvpCount' && `${p2.mvpCount} MOTM`}
                </span>
              </div>
            );
          })()}

          {/* Rank 1 */}
          {(() => {
            const p1 = sortedPlayers[0];
            if (!p1) return null;
            return (
              <div
                onClick={() => setSelectedPlayerId(p1.player.id)}
                className="bg-zinc-900/90 border border-zinc-700 rounded-xl p-3 text-center flex flex-col items-center cursor-pointer hover:border-zinc-600 transition"
              >
                <span className="text-[10px] font-bold text-amber-400 mb-1">#1 Top</span>
                <PlayerAvatar
                  player={p1.player}
                  size="lg"
                  showBadge={true}
                  badgePosition={p1.player.primaryPosition}
                  className="rounded-full ring-2 ring-zinc-600"
                />
                <h4 className="text-xs font-semibold text-zinc-100 mt-1 truncate max-w-[90px]">{p1.player.name.split(' ')[0]}</h4>
                <span className="text-xs font-bold text-emerald-400 mt-0.5">
                  {sortMetric === 'avgRating' && `${p1.avgRating}`}
                  {sortMetric === 'goalContributions' && `${p1.goalContributions} G+A`}
                  {sortMetric === 'totalGoals' && `${p1.totalGoals} G`}
                  {sortMetric === 'totalAssists' && `${p1.totalAssists} A`}
                  {sortMetric === 'mvpCount' && `${p1.mvpCount} MOTM`}
                </span>
              </div>
            );
          })()}

          {/* Rank 3 */}
          {(() => {
            const p3 = sortedPlayers[2];
            if (!p3) return null;
            return (
              <div
                onClick={() => setSelectedPlayerId(p3.player.id)}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 text-center flex flex-col items-center cursor-pointer hover:border-zinc-700 transition"
              >
                <span className="text-[10px] font-medium text-zinc-400 mb-1">#3</span>
                <PlayerAvatar
                  player={p3.player}
                  size="md"
                  showBadge={true}
                  badgePosition={p3.player.primaryPosition}
                  className="rounded-full ring-1 ring-zinc-700"
                />
                <h4 className="text-xs font-medium text-zinc-200 mt-1 truncate max-w-[80px]">{p3.player.name.split(' ')[0]}</h4>
                <span className="text-xs font-semibold text-zinc-300 mt-0.5">
                  {sortMetric === 'avgRating' && `${p3.avgRating}`}
                  {sortMetric === 'goalContributions' && `${p3.goalContributions} G+A`}
                  {sortMetric === 'totalGoals' && `${p3.totalGoals} G`}
                  {sortMetric === 'totalAssists' && `${p3.totalAssists} A`}
                  {sortMetric === 'mvpCount' && `${p3.mvpCount} MOTM`}
                </span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Leaderboard list */}
      <div className="space-y-1.5">
        {sortedPlayers.map((stats, idx) => {
          const player = stats.player;

          return (
            <div
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className="bg-zinc-900/60 hover:bg-zinc-800/70 border border-zinc-800/80 rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition"
            >
              {/* Left Rank & Avatar */}
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-4 text-center text-xs font-medium text-zinc-500 font-mono">
                  {idx + 1}
                </span>

                <PlayerAvatar
                  player={player}
                  size="sm"
                  showBadge={true}
                  badgePosition={player.primaryPosition}
                  className="rounded-full ring-1 ring-zinc-800"
                />

                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="text-xs font-medium text-zinc-200 truncate">{player.name}</h4>
                    {stats.mvpCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] font-medium text-amber-400 bg-amber-500/10 px-1 rounded">
                        <Award className="w-2.5 h-2.5" /> {stats.mvpCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {stats.matchesPlayed} matches • {stats.totalGoals}G {stats.totalAssists}A
                  </p>
                </div>
              </div>

              {/* Right Key Score */}
              <div className="flex items-center space-x-1.5 pl-2">
                <div className="text-right">
                  <div className="flex items-center space-x-1 justify-end">
                    <span className="text-xs font-semibold text-zinc-100">
                      {stats.avgRating > 0 ? stats.avgRating : '-'}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-500 block">Rating</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

