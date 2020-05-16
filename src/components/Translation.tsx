import React from 'react';

const stringTranslation = {
    welcome: `Welcome to online pizza box game!`,
    welcome1: `Inspired by `,
    welcome2: `this Reddit comment.`,
    welcome3: `Once you start the game, click the help icon in the bottom left corner to see the rules.`,
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
    rule: `Rule`,
    game: 'Game',
    state: 'State',
    create: `Create`,
    addPlayer:`Add Player`,
    add: `Add`,
    cancel: `Cancel`,
    oops: `Oops!`,
    panic: `Panic!`,
    player: `+ Player`,
    createdBy: `Created by`,
    dismiss: `Dismiss`,
    history: `Game history`,
    flip: `Flip`,
    skipturn: `Skip turn`,
    sharegame: `Share game`,
    timesLanded: `Times landed`,
    settings: `Game settings!`,
    newGame: `Create new game`,
    joinExistingGame: `Join existing game`,
    adjustments: {
      line:  `Since this is an online game, a few adjustments have to be made to make the game playable. Here are some things to note:`,
      adjustemntsElements: [
        `- Once your turn starts you can either flip the quarter by pressing "Flip", or just skip your turn`,
        `- When flipping, press the space bar to stop the indicator arrows once at a time`,
        `- Once your flip location is determined, a bit of randomization happens to simulate the uncertainty of flipping a quarter`,
        `- Be careful to make sure you don't miss the board entirely! The punishment will be severe!`,
        `- The shapes are squares/rectangles (for now). Feel free to resize or rotate as you'd like, but not too big!`,
        `- Once your shape is to your liking, type in your rule and press "Create"`,
        `- Currently the game does not end, you just play forever`
      ]
    },
    oppsExplain: `Did something go wrong with the game and you got stuck?
                  If so, you can press this "Panic" button to skip the current turn which will hopefully reset the game and allow you to continue.`,
    oppsExplain2: `Only press this if the game is broken!`,
    oppsExplain3: `Otherwise you will interrupt the current player's turn.`,
    takeMeBack: `Take me back to the game`,
    downloadMessage: `Download messages `,
    rules: `The rules are simple: you start off with each player's name drawn on the board.
    Players take turns flipping quarters onto the board. If a quarter lands on an empty space, you write a rule and draw a shape around it.
    If the quarter lands on an existing rule, you must perform that rule.
    If the quarter lands on any of the initial spaces, the player whose space it is must drink.
    Keep going until the board is filled with rules.`,
    havefunanddrink: `Have fun and drink responsibly! Feel free to open issues on my Github page.`
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