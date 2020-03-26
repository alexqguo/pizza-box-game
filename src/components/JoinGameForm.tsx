import React, { useState } from 'react';
import { TextField, Button, Box, Grid } from '@material-ui/core';
import { db } from '../firebase';
import store from '../stores';
import useStyles from '../styles';

interface Props {
  gameId: string | null,
  closeModal: Function
}

export default ({ gameId, closeModal }: Props) => {
  const classes = useStyles();
  const [value, setValue] = useState(gameId);
  const [canSubmit, setCanSubmit] = useState(!!gameId);

  // These should be the only direct interactions with firebase other than the rootStore
  const getGame = async (gameId: string) => {
    const snap: firebase.database.DataSnapshot = await db.ref(`sessions/${gameId}`).once('value');
    console.log(snap.val());
  }

  const onInputChange = (value: string) => {
    setValue(value);
    setCanSubmit(!!value);
  }

  const isValidGameId = (gameId: string | null) => {
    // TODO: check firebase for existing game
    // If it's a remote game:
    // List all the players who are NOT active, you can join those
    // Needs to update on the fly, can use the store updater for that or just local updates in the component
    // If it's a local game:
    // Just join immediately

    getGame(gameId || '');
    // return !!gameId;
    return false;
  }

  const submitForm = () => {
    if (value && isValidGameId(value)) {
      store.restoreGame(value);
      closeModal();
    }
  }

  return (
    <Box>
      <form autoComplete="off">
        <div className={classes.formInputs}>
          <Grid container>
            <Grid item xs={4}>
              <TextField
                label="Game ID"
                size="small"
                fullWidth
                onChange={({ target }) => onInputChange(target.value)}
                className={classes.gameFormTextField}
                defaultValue={gameId}
              />
            </Grid>
          </Grid>
        </div>

        <Button 
          disabled={!canSubmit}
          variant="contained" 
          color="primary" 
          onClick={submitForm}>
          Join game
        </Button>
      </form>

    </Box>
  );
};