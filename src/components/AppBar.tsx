import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import useStyles from '../styles';

export default () => {
  const classes = useStyles();

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            <span role="img" aria-label="Pizza box game logo">
              🍕🖋🍺
            </span>
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbarOffset} />
    </>
  );
};