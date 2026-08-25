import React from 'react';
import { useApp } from '../context/AppContext';
import { EditPlayerModal } from './EditPlayerModal';

interface PlayerEditModalProps {
  playerId: string;
  onClose: () => void;
}

export const PlayerEditModal: React.FC<PlayerEditModalProps> = ({ playerId, onClose }) => {
  const { players } = useApp();
  const player = players.find(p => p.id === playerId);

  if (!player) return null;

  return <EditPlayerModal player={player} onClose={onClose} />;
};

