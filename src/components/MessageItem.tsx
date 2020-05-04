import React, { useContext } from 'react';
import { StoreContext } from './App';
import MessagePlayerName from './MessagePlayerName';
import { Message, MessageType, } from '../types';
import { RootStore } from '../stores';

interface Props {
  message: Message
}

export default ({ message }: Props) => {
  const store: RootStore = useContext(StoreContext);

  const getContent = (message: Message) => {
    switch (message.type) {
      case MessageType.skip:
        return <><MessagePlayerName playerId={message.playerIds[0]} /> skipped their turn.</>;
      case MessageType.panic:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> panicked and skipped&nbsp;
            <MessagePlayerName playerId={message.playerIds[1]} />'s turn.
          </>
        );
      case MessageType.missBoard:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> missed the board and drinks four!
          </>
        );
      case MessageType.rule:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> landed on:&nbsp;
            <strong>{store.ruleStore.rules.get(message.ruleId!)!.displayText}</strong>
          </>
        );
      case MessageType.createRule:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> created a new rule:&nbsp;
            <strong>{store.ruleStore.rules.get(message.ruleId!)!.displayText}</strong>
          </>
        );
      case MessageType.gameStart:
        return (
          <>
            {message.playerIds
              .map<React.ReactNode>((playerId: string) => <MessagePlayerName key={playerId} playerId={playerId} />)
              .reduce((prev, curr) => [prev, ', ', curr])} started a new game!
          </>
        );
      case MessageType.newPlayer:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> joined the game!
          </>
        );
      default: throw new Error('Unrecognized message type');
    }
  }

  return (
    <>{getContent(message)}</>
  )
}