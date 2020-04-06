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
* Alert when it's your turn
* Message for shape validation
* Timer on people's turns
* Can reposition shape as long as it contains the quarter
* Pick a preset of rules to start your game
* Formatting of messages
  * Show the current player, timestamp, author of rule they landed on
* Possibly remove initial spaces
* Online/offline indicator for players in Drawer
* Dev/Prod modes instead of 'localhost' checks everywhere
* Theme MUI for consistent primary/secondary colors
* Consider different behavior - quarter first appears on its own then the current player has to click it to initiate new shape creation. Will make localStorage unnecessary
  * In theory you can still break the game if you leave the page right after flipping and not having modified your shape at least one time
* Fix RootStore typing with TS
  * Becuase it exports the instantiated object and not the class itself we get an error saying that it refers to a value not a type
* Break up some of the larger components
* Add (and remove?) players on the fly
* Free draw shapes instead of squares
  * During drawing, constantly check isTargetTransparent on the drawing point and as soon as it isn't flag it
  * On draw end, shape needs to surround the quarter
* Use a proxy dynamic API caller to update firebase instead of a big mess of one off functions
* Maybe write a framework or library for this type of game which handles common logic such as local/remote game, active players, creating/joining games, etc.
* Error boundary so the whole app doesn't crash
* Background image for the canvas
* Customize shape of the canvas
* Separate alerts into their own store if the functionality grows

## Questions
* What is the end game condition? Should there even be one?
