export interface BaseProps {
  store: Object
}

export interface SessionData {
  game: GameData,
  players: Player[],
}

export interface Player {
  id: string,
  name: string,
}

export interface GameData {
  id: string,
}