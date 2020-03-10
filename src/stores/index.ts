import GameStore from './gameStore';
import { GameStoreData } from '../types';
import { db } from '../firebase';
import { createId } from '../utils';

class RootStore {
  gameStore: GameStore;
  
  constructor() {
    this.gameStore = new GameStore();
  }

  async createGame(playerNames: string[]) {
    const gameId: string = createId('game');
    const gameData: GameStoreData = {
      id: gameId
    };

    db.ref(`games/${gameId}`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: GameStoreData = snap.val();
      this.gameStore.setId(value.id);
    });

    // TODO- do players as well
    await db.ref(`games/${gameId}`).set(gameData);  
  }
}

const rootStore = new RootStore();
export default rootStore;