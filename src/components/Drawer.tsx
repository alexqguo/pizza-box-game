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
import ErrorIcon from '@material-ui/icons/Error';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import useStyles from '../styles';
import { GameType, MessageType } from '../types';
import AddPlayerButton from './AddPlayerButton';
import MessageList from './MessageList';
import PlayerName from './PlayerName';
import { RootStore, StoreContext } from '../stores';
import { LanguageContext } from './Translation'

export default () => {
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { gameStore, playerStore } = store;
  const i18n = useContext(LanguageContext);

  const flip = () => store.setPlayerAsBusy();
  const skipTurn = () => {
    store.createMessage({
      type: MessageType.skip,
      playerIds: [gameStore.game.currentPlayerId],
    });
    store.advanceTurn();
  };
  const panic = () => {
    const localId = gameStore.game.type === GameType.remote ? gameStore.localPlayerId : gameStore.game.currentPlayerId;
    store.createMessage({
      type: MessageType.panic,
      playerIds: [localId, gameStore.game.currentPlayerId],
    });
    store.advanceTurn();
    setIsPanicModalOpen(false);
  };
  const downloadMessages = () => {
    // Should find a better way to do this
    const rawMessages = document.getElementById('message-list')!.innerText;
    const downloadElement: HTMLAnchorElement = document.createElement('a');
    downloadElement.setAttribute('href', `data:text/plain;charset=utf-8,${rawMessages}`);
    downloadElement.setAttribute('download', `messages_${gameStore.game.id}.txt`);
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
  };

  const canFlip = !gameStore.game.isPlayerBusy && 
    (gameStore.game.type === GameType.local || gameStore.localPlayerId === gameStore.game.currentPlayerId);

  // TODO: fix this logic. It's lazy and counts on this only rendering once per turn
  if (canFlip && gameStore.game.id) {
    (document.getElementById('notification-audio') as HTMLAudioElement).play();
  }

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
        {i18n.flip}
      </Button>
      <Divider />

      <Button 
        color="secondary"
        onClick={skipTurn}
        disabled={!canFlip}
      >
        {i18n.skipturn}
      </Button>
      <Divider />

      <List>
        {playerStore.ids.map((id: string) => (
          <PlayerName player={playerStore.players.get(id)!} key={id} />
        ))}
      </List>
      <Divider />

      <MessageList />
      <Divider />

      <AddPlayerButton />
      <Divider />

      {gameStore.game.type === GameType.remote ?  
        <>
          <Button href={`/#${gameStore.game.id}`} rel="noopener" target="_blank">
            {i18n.sharegame}
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
        <IconButton color="default" aria-label="Help" onClick={() => setIsHelpModalOpen(true)}>
          <HelpIcon />
        </IconButton>
        <IconButton color="default" aria-label="Settings" onClick={() => setIsSettingsModalOpen(true)}>
          <SettingsRoundedIcon />
        </IconButton>
        <IconButton aria-label="Panic" onClick={() => setIsPanicModalOpen(true)}>
          <ErrorIcon color="error" />
        </IconButton>

        <Modal className={classes.modal} open={isPanicModalOpen} onClose={() => setIsPanicModalOpen(false)}>
          <div className={classes.modalPaper}>
            <Typography variant="h4">
              {i18n.oops}
            </Typography>
            <Typography paragraph>
              {i18n.oppsExplain}
            </Typography>
            <Typography paragraph>
            
              <strong>{i18n.oppsExplain2}</strong>&nbsp;
              {i18n.oppsExplain3}
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setIsPanicModalOpen(false)}>
              {i18n.takeMeBack}
            </Button>
            &nbsp;
            <Button variant="contained" color="secondary" onClick={() => panic()}>
              {i18n.panic}
            </Button>
          </div>
        </Modal>

        <Modal className={classes.modal} open={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)}>
          <div className={classes.modalPaper}>
            <Typography paragraph>
              {i18n.settings}
            </Typography>
            <Button variant="contained" color="primary" onClick={downloadMessages}>
              {i18n.downloadMessages}
            </Button>
          </div>
        </Modal>

        <Modal className={classes.modal} open={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)}>
          <div className={classes.modalPaper}>
            <Typography paragraph>
              {i18n.rules}
            </Typography>
            <Typography paragraph>
              {i18n.adjustments.line}
              <List disablePadding dense>
                {
                  i18n.adjustments
                    .adjustemntsElements
                    .map((element: string, i: number) => <LI key={i}>{element}</LI> )
                }
              </List>
            </Typography>
            <Typography paragraph>
              {i18n.havefunanddrink}
            </Typography>
          </div>
        </Modal>
      </Box>
    </Drawer>
  ));
}