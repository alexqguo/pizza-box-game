import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, ListItem, Divider, Drawer } from '@material-ui/core';
import useStyles from '../styles';
import { Player } from '../types';
import { StoreContext } from './App';

/**
 * will observe state and bold the name of the player whose turn it is
 */
export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);

  return useObserver(() => (
    <Drawer 
      variant="permanent" 
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper
      }}
    >
      <div className={classes.toolbarOffset} />
      <Divider />
      <List>
        {store.playerStore.players.map((p: Player, i: number) => (
          <ListItem key={p.id} className={i === 0 ? classes.activePlayer : ''}>
            {p.name}
          </ListItem>
        ))}
      </List>
    </Drawer>
  ));
}