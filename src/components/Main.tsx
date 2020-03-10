import React from 'react';
import { useObserver } from 'mobx-react';
import useStyles from '../styles';
import Canvas from './Canvas';
import { StoreContext } from './App';

// This may need to change to a class component at some point. We'll see
export default () => {
  const store = React.useContext(StoreContext);
  const classes = useStyles();

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
      Hello there! This is the main content of my application.
      The current GameID is {store.gameStore.id || 'blank'}.

      <Canvas />
    </main>
  ));
}