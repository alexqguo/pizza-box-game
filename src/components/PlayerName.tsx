import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { ListItem } from '@material-ui/core';
import { StoreContext } from './App';
import useStyles from '../styles';
import { Player } from '../types';

interface Props {
  player: Player
}

export default ({ player }: Props) => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore } = store;
  const isCurrentPlayer: boolean = player.id === gameStore.game.currentPlayerId;
  let className = '';
  if (isCurrentPlayer) {
    className += `${classes.currentPlayer} `;
    className += gameStore.game.isPlayerBusy ? classes.busyPlayer : classes.idlePlayer;
  }

  return useObserver(() => (
    <ListItem className={className}>
      <span className={classes.playerColor} style={{ background: player.color }}></span>
      {player.name}
    </ListItem>
  ));
}