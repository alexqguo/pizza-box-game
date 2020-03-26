# Pizza box game
Inspired by [this](https://www.reddit.com/r/AskReddit/comments/7m6g6h/drinkers_of_reddit_what_are_some_insanely_good/drs4wil/) Reddit comment.

## Rules
Start with an empty pizza box and each player writes their name on the box and draws a circle around it.

Players take turns flipping a quarter ontot the box. If it lands on someone's name, that person has to drink and the turn ends.

If the quarter lands in an empty area, the player writes a rule in that location and draws a circle around it- as big or as small as they want to. If someone's quarter flip lands in that circle they must perform whatever thtat rule says.

Each player flips their quarter once per round. Keep going until the box is filled with rules.

## Tech
* React, Mobx, MaterialUI, Firebase, Fabric

### Drawing
Options:
* [fabric.js](http://fabricjs.com/)
  * This seems to be the most mature and has all the features I need
* [konva.js](https://konvajs.org/)
* [paper.js](http://paperjs.org/)
* [svg.draw.js](https://github.com/svgdotjs/svg.draw.js) (svg.js extension)
* plenty of others

### State
Game {
  id: string
  currentPlayerId: string
  isPlayerBusy: true
}
Player {
  id: string
  name: string
}
Rule {
  id: string
  displayText: string
  playerId: string
  data: string (JSON)
}

Overall state (in Firebase) will look like this:
{
  game: Game
  players: Player[]
  rules: Rule[]
}

Ideally each rule object contains its own shape data. It will be much easier to manage and organize that way.

## Remaining sequence of work
* Only the current player can actually make the move, all others blocked
  * This is the only difference between local games and fully remote games. In a local game the "current player" can make moves for everyone since they're all sharing the same screen. Need to think about how to approach this. Not a super hard requirement
  * When joining a game you can choose who you are, or say "god", that becomes your localPlayer and can store in the rootStore
  * When starting a game you have to say who you are as well (can also be "god")
* Proper error states for landing on an existing rule or landing off the board
* Players get colors so that their rules are that color
* Better (or possibly random?) placement of the initial rules
* Theme MUI for consistent primary/secondary colors
* Better collision detection
* End game condition?
* Error boundary
* Implement better area checking
* Enforce max size of new shape
* Event log
* Fix RootStore typing with TS
  * Becuase it exports the instantiated object and not the class itself we get an error saying that it refers to a value not a type

## Known bugs
* If you leave the screen after you've flipped but before you've submitted your rule, when you rejoin the quarter will be there but you cannot create a rule to continue
  * Maybe keep the currentShape in localStorage

## Features for MVP
* Game is playable locally and online
  * Can make every game a "remote" game with one player (whoever creates the game perhaps) acting as an admin. For a local game, the admin player can just control everything
  * What happens when the admin leaves the page? Perhaps that's fine, or maybe just make everyone an admin
  * When a user is in the middle of their turn, put a hold on other actions so remote players can't change stuff
* Not restricted to just circles. Can be any shape
  * Need a way to serialize these shapes. SVG may be a better option than canvas

## Future features
* Add (and remove?) players on the fly
* Any type of shapes not just circles/ovals
* Use a proxy dynamic API caller to update firebase instead of a big mess of one off functions
* Maybe write a framework or library for this type of game which handles common logic such as local/remote game, active players, creating/joining games, etc.

## Questions
* What is the end game condition? Should there even be one?
