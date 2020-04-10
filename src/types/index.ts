export interface BaseProps {
  store: Object
}

export interface SessionData {
  game: GameData,
  players: Player[],
  rules: Rule[],
  messages: Message[],
}

export interface Player {
  id: string,
  name: string,
  color: string,
  isActive?: boolean,
}

export interface Rule {
  id: string,
  playerId: string, // ID of the player who created the rule
  displayText: string,
  data: string, // SVG representation (for now...)
}

export interface Message {
  displayString: string,
}

export interface GameData {
  id: string,
  currentPlayerId: string,
  isPlayerBusy: boolean,
  quarterLocation: Point | null,
  indicatorLocation: Point | null,
  hasFlipped: boolean,
  type: string,
  alertMessage: string,
}

export interface ShapeValidation {
  isValid: boolean,
  errors: ShapeValidationError[],
}

export interface ShapeValidationError {
  message: string
}

export enum GameType {
  local = 'local',
  remote = 'remote',
}

export interface ObjWithRuleId extends fabric.Object {
  ruleId: string,
}

export interface Point {
  x: number,
  y: number
}