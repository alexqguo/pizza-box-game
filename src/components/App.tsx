import React, { useEffect } from 'react';
import { CssBaseline } from '@material-ui/core';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Main from './Main';
import useStyles from '../styles';
import GameModal from './GameModal';
import { getCanvas } from './Canvas';
import RootStore from '../stores';

export const StoreContext = React.createContext<any>(null);
const StoreProvider = ({ children }: any) => {
  return (
    <StoreContext.Provider value={RootStore}>
      {children}
    </StoreContext.Provider>
  )
};

export default () => {
  const classes = useStyles();

  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      (window as any).rootStore = RootStore;
      (window as any).c = getCanvas();
    }
  });
  
  return (
    <StoreProvider>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar />
        <Drawer />
        <Main />
        <GameModal />
      </div>
    </StoreProvider>
  );
};