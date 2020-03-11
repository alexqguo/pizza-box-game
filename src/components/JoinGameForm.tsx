import React from 'react';
import { TextField, Button, Box } from '@material-ui/core';

interface Props {
  gameId: string | null,
}

export default ({ gameId }: Props) => {
  return (
    <Box>
      {gameId ? 
        <>
        Join with {gameId}.
        </>
      : <>Enter a gameId</>}
    </Box>
  );
};