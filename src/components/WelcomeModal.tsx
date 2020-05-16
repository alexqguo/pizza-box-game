import React, { useState, useContext } from 'react';
import { Modal, Tab, Tabs, Box } from '@material-ui/core';
import useStyles from '../styles';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';
import { LanguageContext } from './Translation'

const createGameTab = 0;
const joinGameTab = 1;

export default () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(true);
  const existingGameId = window.location.hash.substring(1);
  const [currentTab, setCurrentTab] = useState(existingGameId ? joinGameTab : createGameTab);
  const i18n = useContext(LanguageContext);

  const onTabChange = (event: any, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Modal className={classes.modal} open={isOpen}>
      <div className={classes.modalPaper}>
        <Tabs value={currentTab} onChange={onTabChange} className={classes.gameModalTabs}>
          <Tab label={i18n.newGame} />
          <Tab label={i18n.joinExistingGame} />
        </Tabs>

        <Box hidden={createGameTab !== currentTab}>
          <CreateGameForm closeModal={() => setIsOpen(false)}/>
        </Box>

        <Box hidden={joinGameTab !== currentTab}>
          <JoinGameForm gameId={existingGameId} closeModal={() => setIsOpen(false)} />
        </Box>
      </div>
    </Modal>
  );
};