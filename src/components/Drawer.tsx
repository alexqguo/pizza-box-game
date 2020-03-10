import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, ListItem, Divider, Drawer, Button } from '@material-ui/core';
import useStyles from '../styles';
import { Player } from '../types';
import { StoreContext } from './App';

/**
 * will observe state and bold the name of the player whose turn it is
 */
export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore, playerStore } = store;

  const getContents = () => {
    // Assumes that the games is active and the store is populated

    return (
      <>
        <div className={classes.toolbarOffset} />
        <Divider />

        <Button color="primary" disabled>Flip</Button>
        <Divider />

        <Button color="secondary" disabled>Skip turn</Button>
        <Divider />

        <List>
          {playerStore.players.map((p: Player, i: number) => (
            <ListItem key={p.id} className={i === 0 ? classes.activePlayer : ''}>
              {p.name}
            </ListItem>
          ))}
        </List>
        <Divider />

        <Button href={`/?join=${gameStore.gameId}`} rel="noopener" target="_blank">
          Share game
        </Button>
        <Divider />
      </>
    );
  }

  return useObserver(() => (
    <Drawer 
      variant="permanent" 
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper
      }}
    >
      {!!gameStore.id ? getContents() : null}
    </Drawer>
  ));
}