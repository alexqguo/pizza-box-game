import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import { List,
  Divider,
  Drawer,
  Box,
  Button,
  Modal,
  IconButton,
  Typography,
  ListItem as LI, 
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import HelpIcon from '@material-ui/icons/Help';
import useStyles from '../styles';
import { Player, GameType, Message } from '../types';
import { StoreContext } from './App';
import PlayerName from './PlayerName';

export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { gameStore, playerStore, messageStore } = store;

  const skipTurn = () => {
    // store.createMessage
    const name = store.getPropertyOfPlayer(gameStore.game.currentPlayerId, 'name');
    store.createMessage(`${name} skipped their turn.`);
    store.advanceTurn();
  };
  const flip = () => store.setPlayerAsBusy();

  const canFlip = !gameStore.game.isPlayerBusy && 
    (gameStore.game.type === GameType.local || gameStore.localPlayerId === gameStore.game.currentPlayerId);

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
        disabled={!canFlip}
        onClick={flip}
      >
        Flip
      </Button>
      <Divider />

      <Button 
        color="secondary"
        onClick={skipTurn}
        disabled={!canFlip}
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

      <List className={classes.messageList}>
        {messageStore.messages.reverse().map((m: Message, i: number) => (
          <LI key={i}>{m.displayString}</LI>
        ))}
      </List>
      <Divider />

      <Button onClick={() => {}}>
        Add player
      </Button>
      <Divider />

      {gameStore.game.type === GameType.remote ?  
        <>
          <Button href={`/?join=${gameStore.game.id}`} rel="noopener" target="_blank">
            Share game
          </Button>
          <Divider />
        </>
      : null}

      <Box className={classes.drawerIconButtonBox}>
        <IconButton color="default" aria-label="Github" 
          href="https://github.com/alexqguo" target="_blank" rel="noopener"
        >
          <GitHubIcon />
        </IconButton>
        <IconButton color="default" aria-label="Help" onClick={() => setIsModalOpen(true)}>
          <HelpIcon />
        </IconButton>
        <Modal className={classes.modal} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className={classes.modalPaper}>
            <Typography paragraph>
              The rules are simple: you start off with each player's name drawn on the board.
              Players take turns flipping quarters onto the board. If a quarter lands on an empty space, you write a rule and draw a shape around it.
              If the quarter lands on an existing rule, you must perform that rule.
              If the quarter lands on any of the initial spaces, the player whose space it is must drink.
              Keep going until the board is filled with rules.
            </Typography>
            <Typography paragraph>
              Since this is an online game, a few adjustments have to be made to make the game playable. Here are some things to note:
              <List disablePadding dense>
                <LI>- Once your turn starts you can either flip the quarter by pressing "Flip", or just skip your turn</LI>
                <LI>- When flipping, press the space bar to stop the indicator arrows once at a time</LI>
                <LI>- Once your flip location is determined, a bit of randomization happens to simulate the uncertainty of flipping a quarter</LI>
                <LI>- Be careful to make sure you don't miss the board entirely! The punishment will be severe!</LI>
                <LI>- The shapes are squares/rectangles (for now). Feel free to resize or rotate as you'd like, but not too big!</LI>
                <LI>- Once your shape is to your liking, type in your rule and press "Create"</LI>
                <LI>- Currently the game does not end, you just play forever</LI>
              </List>
            </Typography>
            <Typography paragraph>
              Have fun and drink responsibly! Feel free to open issues on my Github page.
            </Typography>
          </div>
        </Modal>
      </Box>
    </Drawer>
  ));
}