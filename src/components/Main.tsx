import React from 'react';
import useStyles from '../styles';

// This may need to change to a class component at some point. We'll see
export default () => {
  const classes = useStyles();

  return (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
      Hello there! This is the main content of my application.
    </main>
  );
}