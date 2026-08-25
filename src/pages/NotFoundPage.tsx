import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="p-8 text-center space-y-4 max-w-sm mx-auto my-12">
      <div className="text-4xl">⚽</div>
      <h2 className="text-base font-bold text-zinc-100">Page Not Found</h2>
      <p className="text-xs text-zinc-400">
        The requested page does not exist or has moved.
      </p>
      <Link
        to="/matches"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
      >
        <Calendar className="w-3.5 h-3.5" /> Return to Matches
      </Link>
    </div>
  );
};
