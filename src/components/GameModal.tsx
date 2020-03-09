import React, { useState } from 'react';
import { Modal, Tab, Tabs, Box } from '@material-ui/core';
import useStyles from '../styles';
import CreateGameForm from './CreateGameForm';
import JoinGameForm from './JoinGameForm';

export default () => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  const onTabChange = (event: any, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Modal className={classes.modal} open={isOpen}>
      <div className={classes.modalPaper}>
        <Tabs value={currentTab} onChange={onTabChange} className={classes.gameModalTabs}>
          <Tab label="Create new game" />
          <Tab label="Join existing game" />
        </Tabs>

        <Box hidden={0 !== currentTab}>
          <CreateGameForm closeModal={() => setIsOpen(false)}/>
        </Box>

        <Box hidden={1 !== currentTab}>
          <JoinGameForm />
        </Box>
      </div>
    </Modal>
  );
};