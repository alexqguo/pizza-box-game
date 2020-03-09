import React from 'react';
import { CssBaseline } from '@material-ui/core';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Main from './Main';
import useStyles from '../styles';
import GameModal from './GameModal';

function App() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar />
      <Drawer />
      <Main />
      <GameModal />
    </div>
  );
}

export default App;