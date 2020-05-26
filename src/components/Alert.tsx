import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { Modal, Button, Grid, ExpansionPanel } from '@material-ui/core';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import useStyles from '../styles';
import MessageList from './MessageList';
import { GameType, Alert, AlertType } from '../types';
import { RootStore, StoreContext } from '../stores';
import { LanguageContext } from './Translation'

export default () => {
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const i18n = useContext(LanguageContext);
  const { gameStore, ruleStore, playerStore } = store;

  // Doesn't actually close the modal directly, but sends a firebase update
  const closeModal = async () => {
    await store.clearAlert();
    store.advanceTurn();
  };

  const canCloseModal = gameStore.game.type === GameType.local || gameStore.localPlayerId === gameStore.game.currentPlayerId;

  const getAlertContent = (alert: Alert) => {
    if (!alert) return;
    if (alert.type === AlertType.text) return <>{alert.message}</>;

    const rule = ruleStore.rules.get(alert.ruleId!);
    const name = playerStore.players.get(gameStore.game.currentPlayerId)?.name;
    if (!rule || !name) return;

    // authorName can be empty for a quick start rule. Should come up with a more elegant solution
    const authorName = playerStore.players.get(rule?.playerId)?.name;

    return (
      <>
        {name}: {rule.displayText}
        <div className={classes.timesLanded}>
          { authorName ? <>
            {i18n.createdBy}:&nbsp;
            <strong>{authorName}</strong>.&nbsp;
            </> : null}
          {i18n.timesLanded}: {rule.timesLanded}
        </div>
      </>
    )
  }; 

  return useObserver(() => (
    <Modal open={!!gameStore.game.alert} className={classes.modal}>
      <div className={classes.modalPaper}>
        <Grid container spacing={3}>
          <Grid item xs={8}>
            <p className={classes.alertText}>{getAlertContent(gameStore.game.alert!)}</p>
            
            {canCloseModal ? 
              <Button color="secondary" size="small" onClick={closeModal} variant="contained">
                {i18n.dismiss}
              </Button>
            : null}
          </Grid>

          <Grid item xs={4}>
            <ExpansionPanel>
              <ExpansionPanelSummary>
                 {i18n.history}
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <MessageList />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Grid>
        </Grid>
      </div>
    </Modal>
  ));
}