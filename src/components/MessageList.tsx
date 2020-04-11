import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, ListItem } from '@material-ui/core';
import { StoreContext } from './App';
import useStyles from '../styles';
import { Message } from '../types';

export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { messageStore } = store;
  
  return useObserver(() => (
    <List className={classes.messageList}>
      {messageStore.messages.slice().reverse().map((m: Message, i: number) => (
        <ListItem key={i}>{m.displayString}</ListItem>
      ))}
    </List>
  ));
}