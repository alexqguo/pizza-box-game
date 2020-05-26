import React, { useEffect } from 'react';
import { fabric } from 'fabric';
import { CssBaseline } from '@material-ui/core';
import Alert from './Alert';
import AppBar from './AppBar';
import Drawer from './Drawer';
import Main from './Main';
import useStyles from '../styles';
import WelcomeModal from './WelcomeModal';
import { getCanvas } from './Canvas';
import RootStore, { StoreProvider } from '../stores';
import { LanguageProvider } from './Translation';

export default () => {
  const classes = useStyles();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (window.location.hostname === 'localhost' || urlParams.has('debug')) {
      (window as any).rootStore = RootStore;
      (window as any).c = getCanvas();
      (window as any).fabric = fabric;
    }
  }, []);
  
  return (
    <StoreProvider>
      <LanguageProvider>
        <div className={classes.root} data-testid="asdf">
          <CssBaseline />
          <AppBar />
          <Drawer />
          <Main />
          <WelcomeModal />
          <Alert />
        </div>
      </LanguageProvider>
    </StoreProvider>
  );
};