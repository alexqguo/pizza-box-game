import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './AppBar';
import Drawer from './Drawer';
import Main from './Main';
import useStyles from '../styles';

function App() {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar />
      <Drawer />
      <Main />
    </div>
  );
}

export default App;