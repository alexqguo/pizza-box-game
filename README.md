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
* Can reposition shape as long as it contains the quarter
  * A bit tricky since this needs to be checked on movement, scaling and rotation (can possibly avoid rotation issues if you use the quarter as the rotate point)
  * Or, allow players to reposition freely and just validate at the end whether or not the quarter is contained
  * Would also be good to make it so that shapes cannot extend past the edge of the canvas as part of this change
* Tell people how to actually play the game. Needs WAY more instruction
  * This could be a thing in the drawer that has a message telling the player what to do
* Pick a preset of rules to start your game
  * Possibly remove initial spaces, or have different loadouts/presets
* Formatting of messages
  * Show the current player, timestamp, author of rule they landed on
* Consider different behavior - quarter first appears on its own then the current player has to click it to initiate new shape creation. Will make localStorage unnecessary
  * In theory you can still break the game if you leave the page right after flipping and not having modified your shape at least one time
* Add (and remove?) players on the fly
* Free draw shapes instead of squares
  * During drawing, constantly check isTargetTransparent on the drawing point and as soon as it isn't flag it
  * On draw end, shape needs to surround the quarter
* Background image for the canvas
* Customize shape of the canvas

### Bugs
* Window unload event to register a user as offline seems to have issues
* You can move a shape loaded from localstorage, also validation will not run initially
* The flip indicators can go a bit past the boundaries of the board if you time it correctly
* The shape controls can go past the boundaries of the board and get hidden

### Technical improvements
* Dev/Prod modes instead of 'localhost' checks everywhere
* Theme MUI for consistent primary/secondary colors
* Fix RootStore typing with TS
  * Becuase it exports the instantiated object and not the class itself we get an error saying that it refers to a value not a type
  * UPDATE: this has already been fixed in Main.tsx, just need to make the fix everywhere else
* Break up some of the larger components
* Use a proxy dynamic API caller to update firebase instead of a big mess of one off functions
* Maybe write a framework or library for this type of game which handles common logic such as local/remote game, active players, creating/joining games, etc.
* Error boundary so the whole app doesn't crash