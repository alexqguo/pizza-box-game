import React, { useState, useContext } from 'react';
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
import { LanguageContext } from './Translation'

interface Props {
  gameId: string | null,
  closeModal: Function
}

enum GameSearchStatus {
  found = 'found',
  invalid = 'invalid',
  notFound = 'notFound',
}

enum JoinGameComponent {
  findGame = 'findGame',
  playerSelection = 'playerSelection',
  spectatorName = 'spectatorName'
}

interface State {
  gameId: string,
  gameSearchStatus: GameSearchStatus,
  gameType?: GameType,
  players?: Player[],
  selectedPlayerId: string,
  isSpectator: boolean,
  spectatorName: string,
  components: { [key: string]: boolean }
}

const SPECTATOR = 'spectator';

export default ({ gameId, closeModal }: Props) => {
  const classes = useStyles();
  const i18n = useContext(LanguageContext);
  const [state, setState] = useState<State>({
    gameId: gameId || '',
    gameSearchStatus: GameSearchStatus.notFound,
    selectedPlayerId: '',
    isSpectator: false,
    spectatorName: '',
    components: { [JoinGameComponent.findGame]: true, },
  });
  const updateState = (newState: Object) => {
    setState({ ...state, ...newState });
  }


  // These should be the only direct interactions with firebase other than the rootStore
  const getGame = async () => {
    const snap: firebase.database.DataSnapshot = await db.ref(`sessions/${state.gameId}/game`).once('value');
    return snap.val();
  }
  const onInputChange = (value: string) => updateState({ gameId: value });
  const onSpectatorNameChange = (value: string) => updateState({ spectatorName: value });

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
          state.components[JoinGameComponent.playerSelection] = true;
          updateState({
            players,
            gameSearchStatus: GameSearchStatus.found,
            gameType: game.type,
            components: state.components,
          });
        });
      }
    }
  }

  const handleRadioChange = (target: HTMLInputElement) => {
    const value = target.value;
    const isSpectator = value === SPECTATOR;
    state.components[JoinGameComponent.spectatorName] = isSpectator;

    updateState({
      isSpectator,
      selectedPlayerId: value,
      components: state.components,
    });
  }

  const canJoin = () => {
    const { 
      gameSearchStatus,
      gameType,
      selectedPlayerId,
      isSpectator,
      players,
      spectatorName,
    } = state;

    if (gameSearchStatus !== GameSearchStatus.found) return false;
    if (gameType === GameType.local) return true;
    if (!selectedPlayerId || !players || players.length === 0) return false;
    // if spectator and required info present and name unique, return true

    if (isSpectator) {
      const existingPlayer = players.find((p: Player) => p.name === spectatorName);
      return !!spectatorName && !existingPlayer && players.length < 8 && false; // remove once this is ready
    } else {
      const currentSelectedPlayer = players.find((p: Player) => p.id === selectedPlayerId);
      return !currentSelectedPlayer?.isActive;
    }
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
            {state.components[JoinGameComponent.findGame] === true ?
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
                    {i18n.findGame}
                  </Button>
                </Grid>
              </Grid>
            : null}

          {state.components[JoinGameComponent.playerSelection] === true ? 
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={4}>
                <FormLabel component="legend">Who are you playing as?</FormLabel>
                <RadioGroup value={state.selectedPlayerId} onChange={({ target }) => handleRadioChange(target)}>
                  {state.players!.map((p: Player) => (
                    <FormControlLabel value={p.id} key={p.id} 
                      control={<Radio />} label={p.name} disabled={p.isActive} />
                  ))}

                  {state.players!.length < 8 ?
                    <>
                      {i18n.expectating}
                      <FormControlLabel value={SPECTATOR} key={SPECTATOR} 
                        control={<Radio />} label="Spectator" />
                    </>
                  : null}
                </RadioGroup> 
              </Grid>
            </Grid>
          : null}

          {state.components[JoinGameComponent.spectatorName] === true ?
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={4}>
                <TextField
                  label="Name"
                  size="small"
                  fullWidth
                  onChange={({ target }) => onSpectatorNameChange(target.value)}
                  className={classes.gameFormTextField}
                />
              </Grid>
            </Grid>
          : null}
        </div>

        <Button 
          disabled={!canJoin()}
          variant="contained" 
          color="primary" 
          onClick={joinGame}>
          {i18n.joinGame}
        </Button>
      </form>

    </Box>
  );
};