import { fabric } from 'fabric';
import { shuffle } from 'lodash';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player, Point, GameType } from '../types';
import { db } from '../firebase';
import { createId, serializeObject, playerColors } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';

class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  ruleStore: RuleStore;
  prefix: string = '';
  gameId: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;
  ruleRef: firebase.database.Reference | null = null;
  
  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
    this.ruleStore = new RuleStore();
  }

  /**
   * One of two entry points into a game.
   * @param gameId the game ID to hydrate from
   */
  async restoreGame(gameId: string, localPlayerId: string) {
    this.prefix = `sessions/${gameId}`;
    this.gameId = gameId;
    this.gameStore.setLocalPlayerId(localPlayerId);
    await this.subscribeToGame();
  }

  /**
   * One of two entry points into a game
   * This basically hydrates the entire game in firebase.
   * Also in charge of setting prefix instance var.
   * Should only be called once.
   * @param playerNames 
   * @param localPlayer
   */
  async createGame(playerNames: string[], localPlayer: string, gameType: string) {
    const gameId: string = createId('game');
    this.prefix = `sessions/${gameId}`;
    this.gameId = gameId;

    const shuffledColors = shuffle(playerColors);
    const playerData: Player[] = playerNames.map((name: string, i: number) => {
      const id: string = createId('player');
      let isActive: boolean = false;
      if (name === localPlayer && gameType === GameType.remote) {
        this.gameStore.setLocalPlayerId(id);
        isActive = true;
      }

      return {
        id,
        name,
        color: shuffledColors[i],
        ...(gameType === GameType.remote ? { isActive } : undefined),
      };
    });

    // The initial shapes
    const ruleData: Rule[] = playerData.map((p: Player, i: number) => {
      const ruleId: string = createId('rule');
      const shape = new fabric.Circle({
        radius: 36,
        fill: p.color,
        originX: 'center',
        originY: 'center',
        selectable: false,
        left: 60 * (i + 1),
        top: 60 * (i + 1),
        // @ts-ignore Additional properties
        ruleId, 
        originalFill: p.color
      });

      /**
       * Can create a text object and group here if we want
       * 
       * text = new fabric.Text('text', { ... })
       * group = new fabric.Group([shape, text], { ... })
       */

      return {
        id: ruleId,
        playerId: p.id,
        displayText: `${p.name} drinks!`,
        data: serializeObject(shape),
      };
    });

    const gameData: GameData = {
      id: gameId,
      currentPlayerId: playerData[0].id,
      isPlayerBusy: false,
      quarterLocation: null,
      indicatorLocation: null,
      hasFlipped: false,
      type: gameType,
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
      hasFlipped: false,
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
      hasFlipped: true,
    });
  }

  clearIndicatorLocation() {
    this.gameRef?.update({ indicatorLocation: null });
  }

  getColorForPlayer(playerId: string) {
    let color = '';
    this.playerStore.players.forEach((p: Player) => {
      if (p.id === playerId) color = p.color;
    });
    
    return color;
  }

  /**
   * Hooks the user up to the Firebase instance, preexisting or not.
   * In charge of setting up the DB ref instance vars.
   */
  async subscribeToGame() {
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

    window.addEventListener('unload', async () => {
      if (this.gameStore.localPlayerId) {
        // TODO: firebase has to have a better way to do this
        const playersSnap = await this.playerRef?.once('value');
        if (!playersSnap) return;
        playersSnap.forEach((playerSnap) => {
          if (playerSnap.val().id === this.gameStore.localPlayerId) {
            db.ref(`${this.prefix}/players/${playerSnap.key}`).update({ isActive: false });
          }
        });
      }
    });

    window.location.hash = this.gameId;
  }
}

const rootStore = new RootStore();

export default rootStore;