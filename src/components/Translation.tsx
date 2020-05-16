import React from 'react';

const stringTranslation = {
    welcome: `Welcome to online pizza box game!<br /> Inspired by`,
    welcome1: `this`,
    welcome2: `this Reddit comment.
    Once you start the game, click the help icon in the bottom left corner to see the rules.`,
    enterName: `Enter the player names`,
    playingHow: `Are you playing locally or remotely?`,
    toolTipPlayingWithFriendsLocal: `Playing with friends in the same room. The game is controlled on this device.`,
    local: `Local`,
    remote: `Remote`,
    playingAs: `Who are you playing as?`,
    toolTipPlayingWithFriendsRemote: `Playing with friends, each on their own computer. The game is shared across devices, and each player takes their turn from their device.`,
    playersName: 'Please enter player names',
    startGame: `Start Game`,
    findGame: `Find game`,
    joinGame: `Join game`,
    expectating: ` Or are you spectating? (this doesn't work yet)`,
    skippedTheirTurn: `skipped their turn.`,
    panickedAndSkipped: `panicked and skipped`,
    panickedAndSkipped1: `'s turn.`,
    missedTheBoard: `missed the board and drinks four!`,
    landedOn: `landed on:`,
    createdNewRule: ` created a new rule:`,
    startedANewGame: ` started a new game!`,
    joinedTheGame: `joined the game!`,

}

// import {LanguageContext} from './Translation'
// const i18n = useContext(LanguageContext);

export const LanguageContext = React.createContext<any>('us_EN');
export const LanguageProvider = ({ children }: any) => {
  return (
    <LanguageContext.Provider value={stringTranslation}>
      {children}
    </LanguageContext.Provider>
  )
};