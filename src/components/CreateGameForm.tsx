import React, { useState } from 'react';
import { TextField, Button, Typography, Box } from '@material-ui/core';
import useStyles from '../styles';
import RootStore from '../stores';

interface Props {
  closeModal: Function
}

/**
 * hydrates initial game state once done
 */
export default ({ closeModal }: Props) => {
  const classes = useStyles();
  const [players, setPlayers] = useState(['', ''])
  const [canSubmit, setCanSubmit] = useState(false);

  const validateForm = async () => {
    // Begin shitty validation
    /**
     * - Validate form inputs
     * - Hydrate initial game state
     * - Close modal
     */
    const isValid = new Set(players).size === players.length;

    if (isValid) {
      await RootStore.createGame(players);
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

    if (players.filter((p: string) => isValidName(p)).length >= 2) {
      setCanSubmit(true);
    }
  };

  return (
    <Box>
      <Typography paragraph>
        This is where I'll tell users the rules of the game, and allow them to sign up.
      </Typography>

      <form autoComplete="off">
        <div className={classes.formInputs}>
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
            onClick={() => setPlayers([...players, ''])}
          >
            + Player
          </Button>
        </div>

        <Button 
          disabled={!canSubmit}
          variant="contained" 
          color="primary" 
          onClick={validateForm}>
          Start game
        </Button>
      </form>
    </Box>
  );
};