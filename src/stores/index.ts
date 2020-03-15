import { fabric } from 'fabric';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player } from '../types';
import { db } from '../firebase';
import { createId } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';
import { getCanvas } from '../components/Canvas';

class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  ruleStore: RuleStore;
  
  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
    this.ruleStore = new RuleStore();
  }

  /**
   * This basically hydrates the entire game in firebase
   * @param playerNames 
   */
  async createGame(playerNames: string[]) {
    const gameId: string = createId('game');
    const prefix: string = `sessions/${gameId}`;

    const playerData: Player[] = playerNames.map((p: string) => ({
      id: createId('player'),
      name: p
    }));

    // The initial shapes
    const ruleData: Rule[] = playerData.map((p: Player, i: number) => {
      const ruleId: string = createId('rule');
      const circle = new fabric.Circle({
        radius: 36,
        fill: '#ddd',
        originX: 'center',
        originY: 'center',
      });
      
      const text = new fabric.Text(p.name, {
        fontSize: 14,
        fontFamily: 'Roboto',
        originX: 'center',
        originY: 'center',
      });

      const group = new fabric.Group([circle, text], {
        left: 60 * (i + 1),
        top: 60 * (i + 1),
        selectable: false,
        // @ts-ignore Additional property
        ruleId,
      });

      return {
        id: ruleId,
        playerId: p.id,
        displayText: `${p.name} drinks!`,
        // This... can't be right. Why doesn't "selectable" show up normally?
        data: JSON.stringify(group.toJSON(['selectable', 'ruleId'])),
      };
    });

    const gameData: GameData = {
      id: gameId,
      currentPlayerId: playerData[0].id,
    };

    const sessionData: SessionData = {
      game: gameData,
      players: playerData,
      rules: ruleData,
    }

    this.subscribeToGame(gameId);
    await db.ref(`${prefix}`).set(sessionData);
  }

  subscribeToGame(gameId: string) {
    const prefix: string = `sessions/${gameId}`;

    // Subscribe the gameStore to Firebase
    db.ref(`${prefix}/game`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: GameData = snap.val();
      this.gameStore.setGame(value);
    });

    // Subscribe the playerStore to Firebase
    db.ref(`${prefix}/players`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: Player[] = snap.val();
      this.playerStore.setPlayers(value);
    });

    // Subscriibe the ruleStore to Firebase
    db.ref(`${prefix}/rules`).on('value', (snap: firebase.database.DataSnapshot) => {
      const value: Rule[] = snap.val();
      this.ruleStore.setRules(value);
    });
  }
}

const rootStore = new RootStore();

export default rootStore;