import React, { useContext } from 'react';
import { Player } from '../types';
import { StoreContext } from './App';
import { RootStore } from '../stores';

interface Props {
  playerId: string
}

export default ({ playerId }: Props) => {
  const store: RootStore = useContext(StoreContext);
  const player: Player = store.getPlayer(playerId)!;

  return (
    <span style={{ color: player.color, fontWeight: 'bold' }}>
      {player.name}
    </span>
  );
}