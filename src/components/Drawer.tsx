import React from 'react';
import { List, ListItem, Divider, Drawer } from '@material-ui/core';
import useStyles from '../styles';

/**
 * will observe state and bold the name of the player whose turn it is
 */
export default () => {
  const classes = useStyles();
  const players = ['Player One', 'Player Two', 'Player Three'];

  return (
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
        {players.map((playerName, i) => (
          <ListItem key={playerName} className={i === 0 ? classes.activePlayer : ''}>
            {playerName}
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}