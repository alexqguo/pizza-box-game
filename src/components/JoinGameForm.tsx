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

enum GameSearchStatus {
  found = 'found',
  invalid = 'invalid',
  notFound = 'notFound',
}

interface State {
  gameId: string,
  gameSearchStatus: GameSearchStatus,
  canJoin?: boolean,
}

export default ({ gameId, closeModal }: Props) => {
  const classes = useStyles();
  const [state, setState] = useState<State>({
    gameId: gameId || '',
    gameSearchStatus: GameSearchStatus.notFound,
  });
  const updateState = (newState: Object) => {
    setState({ ...state, ...newState });
  }

  // These should be the only direct interactions with firebase other than the rootStore
  const getGame = async (gameId: string) => {
    const snap: firebase.database.DataSnapshot = await db.ref(`sessions/${gameId}/game`).once('value');
    return snap.val();
  }

  const onInputChange = (value: string) => {
    updateState({
      gameId: value,
    });
  }

  const findGame = async () => {
    if (!state.gameId) return;
    const game: GameData = await getGame(state.gameId);
    const isValidGame = game && game.id && (game.type === GameType.remote || game.type === GameType.local);
    if (!isValidGame) return; // TODO - better error messaging

    if (game.type === GameType.local) {
      updateState({
        canJoin: true,
        gameSearchStatus: GameSearchStatus.found,
      });
    } else {
      // If it's a remote game:
      // List all the players who are NOT active, you can join those
      // Needs to update on the fly, can use the store updater for that or just local updates in the component
      // If it's a local game:
      // Just join immediately
    }
  }

  const joinGame = () => {
    store.restoreGame(state.gameId);
    closeModal();
  }

  return (
    <Box>
      <form autoComplete="off">
        <div className={classes.formInputs}>
          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={4}>
              <TextField
                label="Game ID"
                size="small"
                fullWidth
                onChange={({ target }) => onInputChange(target.value)}
                className={classes.gameFormTextField}
                disabled={state.gameSearchStatus === GameSearchStatus.found}
                defaultValue={gameId}
              />
            </Grid>
            <Grid item xs={2}>
              <Button size="small"
                variant="contained"
                color="primary"
                disabled={!state.gameId || state.gameSearchStatus === GameSearchStatus.found}
                onClick={findGame}>
                Find game
              </Button>
            </Grid>
          </Grid>
        </div>

        <Button 
          disabled={!state.canJoin}
          variant="contained" 
          color="primary" 
          onClick={joinGame}>
          Join game
        </Button>
      </form>

    </Box>
  );
};