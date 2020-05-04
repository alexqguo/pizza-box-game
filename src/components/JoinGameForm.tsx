import React, { useState } from 'react';
import { 
  TextField,
  Button,
  Box,
  Grid,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@material-ui/core';
import { db } from '../firebase';
import store from '../stores';
import useStyles from '../styles';
import { GameData, GameType, Player } from '../types';

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
  gameType?: GameType,
  players?: Player[],
  selectedPlayerId: string,
}

export default ({ gameId, closeModal }: Props) => {
  const classes = useStyles();
  const [state, setState] = useState<State>({
    gameId: gameId || '',
    gameSearchStatus: GameSearchStatus.notFound,
    selectedPlayerId: ''
  });
  const updateState = (newState: Object) => {
    setState({ ...state, ...newState });
  }

  // These should be the only direct interactions with firebase other than the rootStore
  const getGame = async () => {
    const snap: firebase.database.DataSnapshot = await db.ref(`sessions/${state.gameId}/game`).once('value');
    return snap.val();
  }

  const onInputChange = (value: string) => {
    updateState({
      gameId: value,
    });
  }

  const findGame = async () => {
    if (!state.gameId) return;
    const game: GameData = await getGame();
    const isValidGame = game && game.id && (game.type === GameType.remote || game.type === GameType.local);
    if (!isValidGame) return; // TODO - better error messaging

    if (game.type === GameType.local) {
      updateState({
        gameSearchStatus: GameSearchStatus.found,
        gameType: game.type,
      });
    } else {
      if (state.gameSearchStatus !== GameSearchStatus.found) {
        db.ref(`sessions/${state.gameId}/players`).on('value', (snap: firebase.database.DataSnapshot) => {
          const playersSnap = snap.val();
          // If a new player has been added, firebase uses a map here instead
          const players = Array.isArray(playersSnap) ? playersSnap : Object.values(playersSnap);
          updateState({
            players,
            gameSearchStatus: GameSearchStatus.found,
            gameType: game.type,
          });
        });
      }
    }
  }

  const handleRadioChange = (target: HTMLInputElement) => {
    updateState({
      selectedPlayerId: target.value,
    });
  }

  const canJoin = () => {
    if (state.gameSearchStatus !== GameSearchStatus.found) return false;
    if (state.gameType === GameType.local) return true;
    if (!state.selectedPlayerId || !state.players || state.players.length === 0) return false;

    const currentSelectedPlayer = state.players && state.players
      .find((p: Player) => p.id === state.selectedPlayerId);
    return !currentSelectedPlayer?.isActive;
  }

  const joinGame = async () => {
    // Set the local player to active
    if (state.gameType === GameType.remote) {
      const prefix: string = `sessions/${state.gameId}/players`;
      const players = await db.ref(prefix).once('value');
      let key;

      players?.forEach((playerSnap: firebase.database.DataSnapshot) => {
        const player: Player = playerSnap.val();
        if (player.id === state.selectedPlayerId) key = playerSnap.key;
      });

      if (key) {
        await db.ref(`${prefix}/${key}`).update({ isActive: true });
      }
    }

    store.restoreGame(state.gameId, state.selectedPlayerId);
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

          <Grid container alignItems="center" spacing={3}>
            {state.players ? 
              <Grid item xs={4}>
                <FormLabel component="legend">Who are you playing as?</FormLabel>
                <RadioGroup value={state.selectedPlayerId} onChange={({ target }) => handleRadioChange(target)}>
                  {state.players && state.players.map((p: Player) => (
                    <FormControlLabel value={p.id} key={p.id} 
                      control={<Radio />} label={p.name} disabled={p.isActive} />
                  ))}
                </RadioGroup> 
              </Grid> : null}
          </Grid>
        </div>

        <Button 
          disabled={!canJoin()}
          variant="contained" 
          color="primary" 
          onClick={joinGame}>
          Join game
        </Button>
      </form>

    </Box>
  );
};