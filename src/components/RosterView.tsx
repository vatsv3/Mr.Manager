import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { POSITION_INFO, AVAILABLE_TRAITS } from '../data/constants';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { EditPlayerModal } from './EditPlayerModal';
import { Search, Shield, Star, Trash2, Edit3, UserPlus, Trophy } from 'lucide-react';

export const RosterView: React.FC = () => {
  const { players, currentUser, isAdmin, setSelectedPlayerId, deletePlayer } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => {
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.nickname && p.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.jerseyNumber && p.jerseyNumber.toString() === searchQuery.trim());
        const matchesPos = positionFilter === 'ALL' || p.primaryPosition === positionFilter;
        return matchesQuery && matchesPos;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, searchQuery, positionFilter]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePlayer(id);
    setDeletingPlayerId(null);
  };

  const handleEdit = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    setEditingPlayer(player);
  };

  return (
    <div className="p-4 space-y-3.5 max-h-[85vh] overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Squad Roster</h2>
          <p className="text-xs text-zinc-400">
            {players.length} Registered Players • Tap any card to view full profile
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by player name, nickname, jersey #..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Position Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {['ALL', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'].map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                positionFilter === pos
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Players List Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-8 text-center space-y-2">
          <p className="text-sm font-medium text-zinc-400">No players found</p>
          <p className="text-xs text-zinc-500">Try adjusting your search query or position filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filteredPlayers.map(player => {
            const isCurrentUser = currentUser?.id === player.id;
            const posColor = POSITION_INFO[player.primaryPosition]?.color || '#10b981';
            const playerTraits = AVAILABLE_TRAITS.filter(
              t => player.traits.includes(t.id) || player.traits.includes(t.name)
            );

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className="bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 p-3 rounded-2xl transition cursor-pointer flex flex-col justify-between group relative shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar
                      player={player}
                      size="lg"
                      showBadge={true}
                      badgePosition={player.primaryPosition}
                      className={`rounded-xl shrink-0 ring-2 ${
                        isCurrentUser ? 'ring-emerald-500' : 'ring-zinc-700/80'
                      }`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-zinc-100 truncate">
                          {player.name}
                        </h3>
                        {player.isAdmin && (
                          <span className="flex items-center bg-amber-500/10 text-amber-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/20">
                            <Shield className="w-2.5 h-2.5 mr-0.5" /> ADMIN
                          </span>
                        )}
                      </div>
                      {player.nickname && (
                        <p className="text-[11px] text-zinc-400 truncate">"{player.nickname}"</p>
                      )}

                      {/* Position & Playstyles */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: posColor }}
                        >
                          {player.primaryPosition}
                        </span>
                        {player.preferredFoot && (
                          <span className="text-[10px] text-zinc-400 bg-zinc-800/90 border border-zinc-700/60 px-1.5 py-0.5 rounded">
                            {player.preferredFoot}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ratings Display */}
                  <div className="flex flex-col items-end shrink-0">
                    {player.baseRating !== undefined && (
                      <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-bold font-mono">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{player.baseRating.toFixed(1)}</span>
                        <span className="text-[9px] text-amber-500/70 font-normal">Base</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* FC Mobile Playstyles Row */}
                {playerTraits.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {playerTraits.map(t => (
                      <div
                        key={t.id}
                        title={t.name}
                        className="flex items-center gap-1 bg-zinc-950/70 border border-zinc-800 px-1.5 py-0.5 rounded-md text-[10px] text-zinc-300 whitespace-nowrap shrink-0"
                      >
                        <img src={t.icon} alt={t.name} className="w-4 h-4 object-contain" />
                        <span>{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin Quick Control Bar */}
                {isAdmin && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                    <button
                      onClick={e => handleEdit(e, player)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-400" /> Edit Profile
                    </button>
                    {deletingPlayerId === player.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => handleDelete(e, player.id)}
                          className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Confirm
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setDeletingPlayerId(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDeletingPlayerId(player.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <EditPlayerModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
    </div>
  );
};
