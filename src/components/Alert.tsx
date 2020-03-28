import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Modal, Button } from '@material-ui/core';
import useStyles from '../styles';
import { StoreContext } from './App';
import { GameType } from '../types';

export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore } = store;

  // Doesn't actually close the modal directly, but sends a firebase update
  const closeModal = async () => {
    await store.clearAlertMessage();
    store.advanceTurn();
  };

  const canCloseModal = gameStore.game.type === GameType.local || gameStore.localPlayerId === gameStore.game.currentPlayerId;

  return useObserver(() => (
    <Modal open={!!gameStore.game.alertMessage} className={classes.modal}>
      <div className={classes.modalPaper}>
        <p className={classes.alertText}>{gameStore.game.alertMessage}</p>

        {canCloseModal ? 
          <Button color="secondary" size="small" onClick={closeModal} variant="contained">
            Dismiss
          </Button>
        : null}
      </div>
    </Modal>
  ));
}