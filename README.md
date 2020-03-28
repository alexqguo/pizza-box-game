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
* Proper error states for landing on an existing rule or landing off the board
* Players get colors so that their rules are that color
* Better (or possibly random?) placement of the initial rules
* Theme MUI for consistent primary/secondary colors
* Better collision detection
* End game condition
* Implement better area checking
* Enforce max size of new shape
* Event log
* Fix quarter showing up on top of the new shape
* Fix RootStore typing with TS
  * Becuase it exports the instantiated object and not the class itself we get an error saying that it refers to a value not a type

## Known bugs
* If you leave the screen after you've flipped but before you've submitted your rule, when you rejoin the quarter will be there but you cannot create a rule to continue
  * Maybe keep the currentShape in localStorage

## Future features/changes
* Fix react complaining about doing a state update on an unmounted component when joining a remote game
* Break up some of the larger components
* Add (and remove?) players on the fly
* Any type of shapes not just circles/ovals
* Use a proxy dynamic API caller to update firebase instead of a big mess of one off functions
* Maybe write a framework or library for this type of game which handles common logic such as local/remote game, active players, creating/joining games, etc.
* Error boundary so the whole app doesn't crash
* Allow circles or squares when creating a new shape
* Background image for the canvas
* Customize shape of the canvas
* Max number of players in a game (10?)

## Questions
* What is the end game condition? Should there even be one?
