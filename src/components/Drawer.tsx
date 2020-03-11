import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, ListItem, Divider, Drawer, Box, Button, IconButton } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import HelpIcon from '@material-ui/icons/Help';
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

      <Button onClick={() => {}}>
        Add player
      </Button>
      <Divider />

      <Button href={`/?join=${gameStore.id}`} rel="noopener" target="_blank">
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