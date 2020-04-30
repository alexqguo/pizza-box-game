import React, { useContext } from 'react';
import { useObserver } from 'mobx-react';
import { List, ListItem } from '@material-ui/core';
import { StoreContext } from './App';
import MessageItem from './MessageItem';
import useStyles from '../styles';
import { Message } from '../types';

export const serializeMessageToRawText = (message: Message) => {
  return `this is a ${message.type} message`;
};

export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { messageStore } = store;
  
  return useObserver(() => (
    <List id="message-list" className={classes.messageList}>
      {messageStore.messages.slice().reverse().map((m: Message, i: number) => (
        <ListItem key={i} className={classes.messageListItem}>
          <MessageItem message={m} />
        </ListItem>
      ))}
    </List>
  ));
}