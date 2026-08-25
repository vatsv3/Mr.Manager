import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RatingLog } from '../types';
import {
  ClipboardList,
  Trash2,
  Search,
  Star,
  Award,
  Shield,
  Clock,
} from 'lucide-react';

export const LogsAudit: React.FC = () => {
  const {
    ratingLogs,
    deleteRatingLog,
    isAdmin,
    matches,
    players,
    setSelectedPlayerId,
  } = useApp();

  const [selectedMatchFilter, setSelectedMatchFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = ratingLogs.filter(log => {
    if (selectedMatchFilter !== 'all' && log.matchId !== selectedMatchFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = log.voterName.toLowerCase().includes(q) ||
        log.ratedPlayerName.toLowerCase().includes(q) ||
        (log.comment && log.comment.toLowerCase().includes(q));
      if (!matchName) return false;
    }
    return true;
  });

  const handleDelete = (log: RatingLog) => {
    if (!isAdmin) return;
    deleteRatingLog(log.id);
    setDeletedNotice(`Rating by ${log.voterName} for ${log.ratedPlayerName} deleted.`);
    setTimeout(() => setDeletedNotice(null), 3000);
  };

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight">
            Audit Logs
          </h2>
          <p className="text-xs text-zinc-500">Live rating submission records</p>
        </div>

        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800">
          {ratingLogs.length} Logs
        </span>
      </div>

      {/* Admin Notice */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-400 flex items-start space-x-2.5">
        <Shield className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400">
          {isAdmin
            ? 'Admin Mode: Click delete icon to remove invalid rating logs. Player averages recalculate instantly.'
            : 'All peer submissions are transparently logged.'}
        </p>
      </div>

      {/* Deleted Feedback Toast */}
      {deletedNotice && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 text-xs text-rose-300 flex items-center space-x-2">
          <Trash2 className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>{deletedNotice}</span>
        </div>
      )}

      {/* Search & Match Filter Controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search voter, player, or note..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div>
          <select
            value={selectedMatchFilter}
            onChange={e => setSelectedMatchFilter(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-medium focus:outline-none focus:border-zinc-600"
          >
            <option value="all">All Matches ({ratingLogs.length} entries)</option>
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500 text-xs bg-zinc-900/30">
            <ClipboardList className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
            <p>No rating log entries found.</p>
          </div>
        ) : (
          filteredLogs.map(log => {
            const match = matches.find(m => m.id === log.matchId);
            const rated = players.find(p => p.id === log.ratedPlayerId);

            return (
              <div
                key={log.id}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 space-y-2 text-xs transition"
              >
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 truncate max-w-[200px]">
                    {match ? match.title : 'Match Log'}
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(log)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 transition"
                        title="Delete this rating entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rating Relationship */}
                <div className="flex items-center justify-between bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/60">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-zinc-500 text-[11px]">From</span>
                    <span className="font-medium text-zinc-300">{log.voterName}</span>
                    <span className="text-zinc-600 text-xs">→</span>
                    <button
                      onClick={() => rated && setSelectedPlayerId(rated.id)}
                      className="font-medium text-zinc-100 hover:underline"
                    >
                      {log.ratedPlayerName}
                    </button>
                  </div>

                  {/* Rating Score Badge */}
                  <div className="flex items-center space-x-1 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/60">
                    <Star className="w-3 h-3 text-zinc-300 fill-zinc-300" />
                    <span className="font-semibold text-zinc-100 text-xs">
                      {log.rating.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-zinc-500">/10</span>
                  </div>
                </div>

                {/* MOTM or Comment */}
                <div className="flex items-center justify-between text-[11px]">
                  {log.comment ? (
                    <p className="text-zinc-400 italic truncate max-w-[220px]">
                      "{log.comment}"
                    </p>
                  ) : (
                    <span className="text-zinc-600 italic">No notes</span>
                  )}

                  {log.mvpVotePlayerId && (
                    <span className="flex items-center gap-1 font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px]">
                      <Award className="w-3 h-3" /> MOTM Vote
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

