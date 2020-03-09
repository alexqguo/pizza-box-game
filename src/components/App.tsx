import React from 'react';
import { CssBaseline } from '@material-ui/core';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Main from './Main';
import useStyles from '../styles';
import GameForm from './GameForm';

function App() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar />
      <Drawer />
      <Main />
      <GameForm />
    </div>
  );
}

export default App;