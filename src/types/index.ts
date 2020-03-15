export interface BaseProps {
  store: Object
}

export interface SessionData {
  game: GameData,
  players: Player[],
  rules: Rule[],
}

export interface Player {
  id: string,
  name: string,
}

export interface Rule {
  id: string,
  playerId: string, // ID of the player who created the rule
  displayText: string,
  data: string, // SVG representation (for now...)
}

export interface GameData {
  id: string,
  currentPlayerId: string,
}

export interface ObjWithRuleId extends fabric.Object {
  ruleId: string,
}