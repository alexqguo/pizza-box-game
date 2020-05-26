import React, { useContext } from 'react';
import MessagePlayerName from './MessagePlayerName';
import { Message, MessageType, } from '../types';
import { RootStore, StoreContext } from '../stores';
import { LanguageContext } from './Translation'

interface Props {
  message: Message
}

export default ({ message }: Props) => {
  const store: RootStore = useContext(StoreContext);
  const i18n = useContext(LanguageContext);

  const getContent = (message: Message) => {
    switch (message.type) {
      case MessageType.skip:
        return <><MessagePlayerName playerId={message.playerIds[0]} /> {i18n.skippedTheirTurn} </>;
      case MessageType.panic:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> {i18n.panickedAndSkipped}&nbsp;
            <MessagePlayerName playerId={message.playerIds[1]} />{i18n.panickedAndSkipped1}
          </>
        );
      case MessageType.missBoard:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> {i18n.missedTheBoard}!
          </>
        );
      case MessageType.rule:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> {i18n.landedOn}&nbsp;
            <strong>{store.ruleStore.rules.get(message.ruleId!)!.displayText}</strong>
          </>
        );
      case MessageType.createRule:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> {i18n.createdNewRule}&nbsp;
            <strong>{store.ruleStore.rules.get(message.ruleId!)!.displayText}</strong>
          </>
        );
      case MessageType.gameStart:
        return (
          <>
            {message.playerIds
              .map<React.ReactNode>((playerId: string) => <MessagePlayerName key={playerId} playerId={playerId} />)
              .reduce((prev, curr) => [prev, ', ', curr])} {i18n.startedANewGame}
          </>
        );
      case MessageType.newPlayer:
        return (
          <>
            <MessagePlayerName playerId={message.playerIds[0]} /> {i18n.joinedTheGame}
          </>
        );
      default: throw new Error('Unrecognized message type');
    }
  }

  return (
    <>{getContent(message)}</>
  )
}