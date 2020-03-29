import React, { useState } from 'react';
import { 
  TextField,
  Button,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  Grid,
} from '@material-ui/core';
import useStyles from '../styles';
import { GameType } from '../types';
import RootStore from '../stores';

interface Props {
  closeModal: Function
}

/**
 * hydrates initial game state once done
 */
export default ({ closeModal }: Props) => {
  const classes = useStyles();
  const [players, setPlayers] = useState<string[]>(['', ''])
  const [gameType, setGameType] = useState<string>('');
  const [localPlayer, setLocalPlayer] = useState<string>('');

  const validateForm = async () => {
    // Begin shitty validation
    /**
     * - Validate form inputs
     * - Hydrate initial game state
     * - Close modal
     */
    const isValid = new Set(players).size === players.length;

    if (isValid) {
      await RootStore.createGame(players, localPlayer, gameType);
      closeModal();
    }
  };

  const isValidName = (name: string) => {
    // TODO: better validation will be needed
    return name !== '';
  };

  const updatePlayerName = (target: EventTarget, i: number) => {
    const inputValue: string = (target as HTMLInputElement).value;
    players[i] = inputValue
    setPlayers([...players]);
  };

  const handleRadioChange = (target: HTMLInputElement) => {
    setGameType(target.value);
  }

  const handleLocalPlayerChange = (target: HTMLInputElement) => {
    setLocalPlayer(target.value);
  }

  const determineSubmissionValidity = () => {
    const isValidGameType: boolean = gameType === GameType.local || gameType === GameType.remote;
    const hasEnoughPlayers: boolean = players.filter((p: string) => isValidName(p)).length >= 2;
    const hasLocalPlayer: boolean = gameType === GameType.remote ? !!localPlayer : true;

    return isValidGameType && hasEnoughPlayers && hasLocalPlayer;
  }

  return (
    <Box>
      <Typography paragraph>
        Welcome to online pizza box game!
        Inspired by <a target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/r/AskReddit/comments/7m6g6h/drinkers_of_reddit_what_are_some_insanely_good/drs4wil/">this Reddit comment</a>.
        Once you start the game, click the help icon in the bottom left corner to see the rules.
      </Typography>


      <form autoComplete="off">
        <div className={classes.formInputs}>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <FormLabel component="legend">Enter the player names</FormLabel>
              {players.map((name: string, i: number) => (
                <TextField
                  label="Name"
                  size="small"
                  fullWidth
                  key={i}
                  onChange={({ target }) => { updatePlayerName(target, i); }}
                  className={classes.gameFormTextField}
                  value={name}
                />
              ))}
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={players.length >= 8}
                onClick={() => setPlayers([...players, ''])}
              >
                + Player
              </Button>
            </Grid>

            <Grid item xs={6}>
              <FormLabel component="legend">Are you playing locally or remotely?</FormLabel>
              <RadioGroup value={gameType} onChange={({ target }) => handleRadioChange(target)}>
                <FormControlLabel value={GameType.local} control={<Radio />} label="Local" />
                <FormControlLabel value={GameType.remote} control={<Radio />} label="Remote" />
              </RadioGroup>

              {gameType === GameType.remote ? 
                <>
                  <FormLabel component="legend">Who are you playing as?</FormLabel>
                  <RadioGroup value={localPlayer} onChange={({ target }) => handleLocalPlayerChange(target)}>
                    {players.filter((n: string) => !!n).map((name: string, i: number) => (
                      <FormControlLabel key={i} value={name} control={<Radio />} label={name} />
                    ))}
                  </RadioGroup>
                  {players.filter((n: string) => !!n).length === 0 ? 'Please enter player names' : null}
                </>
                : null
              }
            </Grid>
          </Grid>
          </div>

        <Button 
          disabled={!determineSubmissionValidity()}
          variant="contained" 
          color="primary" 
          onClick={validateForm}>
          Start game
        </Button>
      </form>
    </Box>
  );
};