import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, Divider, Drawer, Box, Button, IconButton } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import HelpIcon from '@material-ui/icons/Help';
import useStyles from '../styles';
import { Player } from '../types';
import { StoreContext } from './App';
import PlayerName from './PlayerName';

/**
 * will observe state and bold the name of the player whose turn it is
 */
export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore, playerStore } = store;

  const skipTurn = () => {
    store.advanceTurn();
  };

  const flip = () => {
    store.setPlayerAsBusy();
  };

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

      <Button
        color="primary"
        disabled={gameStore.game.isPlayerBusy}
        onClick={flip}
      >
        Flip
      </Button>
      <Divider />

      <Button 
        color="secondary"
        onClick={skipTurn}
      >
        Skip turn
      </Button>
      <Divider />

      <List>
        {playerStore.players.map((p: Player) => (
          <PlayerName player={p} key={p.id} />
        ))}
      </List>
      <Divider />

      <Button onClick={() => {}}>
        Add player
      </Button>
      <Divider />

      <Button href={`/?join=${gameStore.game.id}`} rel="noopener" target="_blank">
        Share game
      </Button>
      <Divider />

      <Box className={classes.drawerIconButtonBox}>
        <IconButton color="default" aria-label="Github" 
          href="https://github.com/alexqguo" target="_blank" rel="noopener"
        >
          <GitHubIcon />
        </IconButton>
        <IconButton color="default" aria-label="Help">
          <HelpIcon />
        </IconButton>
      </Box>
    </Drawer>
  ));
}