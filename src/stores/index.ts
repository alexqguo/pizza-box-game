import { fabric } from 'fabric';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player, Point } from '../types';
import { db } from '../firebase';
import { createId, serializeGroup } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';

class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  ruleStore: RuleStore;
  prefix: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;
  ruleRef: firebase.database.Reference | null = null;
  
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
      isPlayerBusy: false,
      quarterLocation: null,
      indicatorLocation: null,
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
    if (this.ruleRef) {
      await this.ruleRef.push().set(newRule);
    }

    this.advanceTurn();
  }

  /**
   * Advances the turn. Not much else
   * TODO: this code is rough and prone to failures. Fix it!
   */
  advanceTurn() {
    const playerIds: string[] = this.playerStore.players.map((p: Player) => p.id);
    const currentPlayerIdx: number = playerIds.indexOf(this.gameStore.game.currentPlayerId);
    const nextPlayerIdx: number = (currentPlayerIdx + 1) % playerIds.length;
    const nextPlayerId: string = this.playerStore.players[nextPlayerIdx].id;
    this.gameRef?.update({
      currentPlayerId: nextPlayerId,
      isPlayerBusy: false,
      quarterLocation: null,
      indicatorLocation: null,
    });
  }

  /**
   * Sets the player as busy.
   */
  setPlayerAsBusy() {
    this.gameRef?.update({
      isPlayerBusy: true,
    });
  }

  setQuarterLocation(loc: Point) {
    this.gameRef?.update({
      quarterLocation: loc,
    });
  }

  setIndicatorLocation(loc: Point) {
    this.gameRef?.update({
      indicatorLocation: loc,
    });
  }

  /**
   * Doesn't do much.
   * @param gameId the game ID to hydrate from
   */
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