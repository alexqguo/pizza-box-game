import React, { useContext, useState } from 'react';
import { useObserver } from 'mobx-react';
import { Modal, Button, Grid, TextField } from '@material-ui/core';
import { StoreContext } from './App';
import { RootStore } from '../stores';
import useStyles from '../styles';
import { LanguageContext } from './Translation'

export default () => {
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const existingPlayerNames = new Set(store.playerStore.names);
  const isValidName = (name: string) => !!name && !existingPlayerNames.has(name);
  const canSubmit = isValidName(playerName);
  const i18n = useContext(LanguageContext);

  const onInputChange = (value: string) => setPlayerName(value);
  const cancel = () => {
    setPlayerName('');
    setIsModalOpen(false);
  };
  const add = () => {
    store.createPlayer(playerName);
    cancel();
  };

  return useObserver(() => (
    <>
      <Button
        disabled={store.playerStore.players.size >= 8}
        onClick={() => setIsModalOpen(true)}
      >{i18n.addPlayer}
      </Button>

      <Modal className={classes.modal} open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={classes.modalPaper}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Player name"
                size="small"
                fullWidth
                onChange={({ target }) => onInputChange(target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Button size="small"
                variant="contained"
                color="primary"
                disabled={!canSubmit}
                onClick={() => add()}>
                {i18n.add}
              </Button>&nbsp;
              <Button size="small"
                variant="contained"
                onClick={() => cancel()}>
                {i18n.cancel}
              </Button>
            </Grid>
          </Grid>
        </div>
      </Modal>
    </>
  ));
};