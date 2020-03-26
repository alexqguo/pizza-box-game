import React, { useState } from 'react';
import { TextField, Button, Box } from '@material-ui/core';
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

  const onInputChange = (value: string) => {
    setValue(value);
    setCanSubmit(!!value);
  }

  const isValidGameId = (gameId: string | null) => {
    // TODO: check firebase for existing game
    // Game must be a remote type game
    // List all the players who are NOT active, you can join those
    // Needs to update on the fly, can use the store updater for that
    return !!gameId;
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
          <TextField
            label="Game ID"
            size="small"
            fullWidth
            onChange={({ target }) => onInputChange(target.value)}
            className={classes.gameFormTextField}
            defaultValue={gameId}
          />
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