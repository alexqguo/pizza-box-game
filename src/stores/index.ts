import { fabric } from 'fabric';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player } from '../types';
import { db } from '../firebase';
import { createId, serializeGroup } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';
import { getCanvas } from '../components/Canvas';

class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  ruleStore: RuleStore;
  prefix: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;
  ruleRef: firebase.database.Reference | null = null;
  // TODO - save the refs as instance vars
  
  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
    this.ruleStore = new RuleStore();
  }

  /**
   * This basically hydrates the entire game in firebase.
   * Also in charge of setting prefix instance var.
   * Should only be called once.
   * @param playerNames 
   */
  async createGame(playerNames: string[]) {
    const gameId: string = createId('game');
    this.prefix = `sessions/${gameId}`;

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
        data: serializeGroup(group),
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

    this.subscribeToGame();
    await db.ref(`${this.prefix}`).set(sessionData);
  }

  /**
   * Creates a new rule in the DB and advances the turn
   */
  async createRule(newRule: Rule) {
    // TODO: lists of data need to be done with a push ref. need to refactor a bit
    if (this.ruleRef) {
      await this.ruleRef.push().set(newRule);
    }
  }

  restoreGame(gameId: string) {
    this.prefix = `sessions/${gameId}`;
    this.subscribeToGame();
  }

  /**
   * Hooks the user up to the Firebase instance, preexisting or not.
   * In charge of setting up the DB ref instance vars.
   */
  subscribeToGame() {
    // Subscribe the gameStore to Firebase
    this.gameRef = db.ref(`${this.prefix}/game`);
    this.gameRef.on('value', (snap: firebase.database.DataSnapshot) => {
      const value: GameData = snap.val();
      this.gameStore.setGame(value);
    });

    // Subscribe the playerStore to Firebase
    this.playerRef = db.ref(`${this.prefix}/players`);
    this.playerRef.on('value', (snap: firebase.database.DataSnapshot) => {
      const value: Player[] = snap.val();
      this.playerStore.setPlayers(value);
    });

    // Subscriibe the ruleStore to Firebase
    this.ruleRef = db.ref(`${this.prefix}/rules`);
    this.ruleRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      const value: Rule = snap.val();
      this.ruleStore.addRule(value);
    });
    // TODO: consider a 'child_removed' listener here as well if it ever becomes necessary
  }
}

const rootStore = new RootStore();

export default rootStore;