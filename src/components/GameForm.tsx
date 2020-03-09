import React, { useState } from 'react';
import { TextField, Modal, Button, Typography } from '@material-ui/core';
 import useStyles from '../styles';

/**
 * hydrates initial game state once done
 */
export default () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(true);
  const [players, setPlayers] = useState(['a', 'b'])

  const renderPlayers = () => {
    return players.map((name: string) => (
      <TextField
        label="Name"
        size="small"
        fullWidth
        className={classes.gameFormTextField}
      />
    ));
  };

  const validateForm = () => {
    /**
     * - Validate form inputs
     * - Hydrate initial game state
     * - Close modal
     */
    setIsOpen(false);
  }

  return (
    <Modal
      className={classes.modal}
      open={isOpen}
    >
      <div className={classes.modalPaper}>
        <Typography paragraph>
          This is where I'll tell users the rules of the game, and allow them to sign up.
        </Typography>

        <form autoComplete="off">
          <div className={classes.formInputs}>
            {renderPlayers()}

            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => setPlayers([...players, ''])}
            >
              + Player
            </Button>
          </div>

          <Button variant="contained" color="primary" onClick={validateForm}>
            Close modal
          </Button>
        </form>
      </div>
    </Modal>
  );
};