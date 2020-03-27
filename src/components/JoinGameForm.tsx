import React, { useState } from 'react';
import { TextField, Button, Box, Grid } from '@material-ui/core';
import { db } from '../firebase';
import store from '../stores';
import useStyles from '../styles';
import { GameData, GameType } from '../types';

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
    const snap: firebase.database.DataSnapshot = await db.ref(`sessions/${gameId}/game`).once('value');
    return snap.val();
  }

  const onInputChange = (value: string) => {
    setValue(value);
    setCanSubmit(!!value);
  }

  const submitForm = async () => {
    if (!value) return;
    const game: GameData = await getGame(value);

    console.log(game)
    const isValidGame = game && game.id && (game.type === GameType.remote || game.type === GameType.local);
    if (!isValidGame) return; // TODO - better error messaging

    if (game.type === GameType.local) {
      store.restoreGame(value);
      closeModal();
    } else {
      // If it's a remote game:
      // List all the players who are NOT active, you can join those
      // Needs to update on the fly, can use the store updater for that or just local updates in the component
      // If it's a local game:
      // Just join immediately
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