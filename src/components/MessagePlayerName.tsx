import React, { useContext } from 'react';
import { Player } from '../types';
import { RootStore, StoreContext } from '../stores';

interface Props {
  playerId: string
}

export default ({ playerId }: Props) => {
  const store: RootStore = useContext(StoreContext);
  const player: Player = store.playerStore.players.get(playerId)!;

  return (
    <span style={{ color: player.color, fontWeight: 'bold' }}>
      {player.name}
    </span>
  );
}