import GameStore from './gameStore';
import { GameData, SessionData, Player } from '../types';
import { db } from '../firebase';
import { createId } from '../utils';
import PlayerStore from './playerStore';

class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  
  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
  }

  /**
   * This basically hydrates the entire game in firebase
   * @param playerNames 
   */
  async createGame(playerNames: string[]) {
    const gameId: string = createId('game');
    const prefix: string = `sessions/${gameId}`;

    const gameData: GameData = {
      id: gameId
    };

    const sessionData: SessionData = {
      game: gameData,
      players: playerNames.map((p: string) => ({
        id: createId('player'),
        name: p
      })),
    };

    this.subscribeToGame(gameId);
    await db.ref(`${prefix}`).set(sessionData);
  }

  subscribeToGame(gameId: string) {
    const prefix: string = `sessions/${gameId}`;

    // Subscribe the gameStore to the Firebase DB
    db.ref(`${prefix}/game`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: GameData = snap.val();
      console.log(value);
      this.gameStore.setId(value.id);
    });

    // Subscribe the playerStore to the Firebase DB
    db.ref(`${prefix}/players`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: Player[] = snap.val();
      console.log(value);
      this.playerStore.setPlayers(value);
    });
  }
}

const rootStore = new RootStore();
if (window.location.hostname === 'localhost') (window as any).rootStore = rootStore;

export default rootStore;