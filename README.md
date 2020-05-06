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
Core needs
* Canvas integration
* Supports polygons
* Object serialization and deserialization (JSON preferred, SVG okay)
* Collision detection

Options:
* [fabric.js](http://fabricjs.com/)
* [konva.js](https://konvajs.org/)
* [paper.js](http://paperjs.org/)
* [svg.draw.js](https://github.com/svgdotjs/svg.draw.js) (svg.js extension)
* [two.js](https://two.js.org/)
* Others

## Future features/changes
### Functional
* Spectator mode
  * Players can join, but as a spectator player type
  * Game will not include spectators when deciding whose turn it is
  * Spectators can be shown in the player indicator as "Spectators: Player, Other Player, etc."
  * Spectators can choose to join the game for real, if there are less than 8 current players
  * Players who are inactive can become spectators
  * Players can go from active to spectator
* Pick a preset of rules to start your game
  * Possibly remove initial spaces, or have different loadouts/presets
* Tell people how to actually play the game. Needs WAY more instruction
  * This could be a thing in the drawer that has a message telling the player what to do
* Consider different behavior - quarter first appears on its own then the current player has to click it to initiate new shape creation. Will make localStorage unnecessary
  * In theory you can still break the game if you leave the page right after flipping and not having modified your shape at least one time
* Free draw shapes instead of squares
  * During drawing, constantly check isTargetTransparent on the drawing point and as soon as it isn't flag it
  * On draw end, shape needs to surround the quarter and lock movement? 
* Background image for the canvas
* Customize shape of the canvas

### Bugs
* Window unload event to register a user as offline seems to have issues
* The flip indicators can go a bit past the boundaries of the board if you time it correctly
* The shape controls can go past the boundaries of the board and get hidden
  * Probably less of an issue now that you can reposition your shape
* I think you can create a game with an empty player name :/

### Technical improvements
* Dev/Prod modes instead of 'localhost' checks everywhere
* Theme MUI for consistent primary/secondary colors
* Break up some of the larger components
* Use a proxy dynamic API caller to update firebase instead of a big mess of one off functions
  * ...or move all the firebase actions into their respective stores rather than throwing everything into the root store. 
* Maybe write a framework or library for this type of game which handles common logic such as local/remote game, active players, creating/joining games, etc.
* Separate dev/prod firebase db instances