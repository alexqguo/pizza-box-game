import { fabric } from 'fabric';
import { shuffle } from 'lodash';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player, Point, GameType, Message, Alert } from '../types';
import { db } from '../firebase';
import { createId, serializeObject, playerColors, getInitialPositions } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';
import MessageStore from './messageStore';
import { getCanvas } from '../components/Canvas';

export class RootStore {
  gameStore: GameStore;
  playerStore: PlayerStore;
  ruleStore: RuleStore;
  messageStore: MessageStore;
  prefix: string = '';
  gameId: string = '';
  gameRef: firebase.database.Reference | null = null;
  playerRef: firebase.database.Reference | null = null;
  ruleRef: firebase.database.Reference | null = null;
  messageRef: firebase.database.Reference | null = null;
  
  constructor() {
    this.gameStore = new GameStore();
    this.playerStore = new PlayerStore();
    this.ruleStore = new RuleStore();
    this.messageStore = new MessageStore();
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
    const canvas: fabric.Canvas = getCanvas();
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
    const initialPositions: Point[] = getInitialPositions(
      playerNames.length, canvas.getHeight(), canvas.getWidth());
    const ruleData: Rule[] = playerData.map((p: Player, i: number) => {
      const ruleId: string = createId('rule');
      const shape = new fabric.Rect({
        width: 60,
        height: 60,
        fill: p.color,
        strokeWidth: 0,
        originX: 'center',
        originY: 'center',
        selectable: false,
        left: initialPositions[i].x,
        top: initialPositions[i].y,
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
        timesLanded: 0,
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
      alert: null,
    };

    const initialMessage: Message = {
      displayString: `${playerNames.join(', ')} started the game.`
    };

    const sessionData: SessionData = {
      game: gameData,
      players: playerData,
      rules: ruleData,
      messages: [initialMessage],
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

  async createMessage(message: string) {
    if (this.messageRef) {
      await this.messageRef.push().set({
        displayString: message
      });
    }
  }

  /**
   * Advances the turn. Not much else
   * TODO: this code is rough and prone to failures. Fix it!
   */
  advanceTurn() {
    window.localStorage.removeItem('localShape');
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

  async setQuarterLocation(loc: Point) {
    await this.gameRef?.update({
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

  async setAlert(alert: Alert) {
    await this.gameRef?.update({ alert });
  }

  async clearAlert() {
    await this.gameRef?.update({ alert: null });
  }
  
  async addCountForRule(ruleId: string) {
    const ruleSnap = await this.ruleRef?.orderByChild('id').equalTo(ruleId).once('value');
    const [key, rule] = Object.entries(ruleSnap!.val())[0];
    db.ref(`${this.prefix}/rules/${key}`).update({ timesLanded: (rule as Rule).timesLanded + 1 });
  }

  // TODO: enforce propName
  getPropertyOfPlayer(playerId: string, propName: string) {
    let value = '';
    this.playerStore.players.forEach((p: Player) => {
      if (p.id === playerId) {
        value = (p as any)[propName];
      }
    });
    
    return value;
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

    // Subscribe the ruleStore to Firebase
    this.ruleRef = db.ref(`${this.prefix}/rules`);
    this.ruleRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      this.ruleStore.addRule(snap.val() as Rule);
    });
    this.ruleRef.on('child_changed', (snap: firebase.database.DataSnapshot) => {
      this.ruleStore.updateRule(snap.val() as Rule);
    });
    // TODO: consider a 'child_removed' listener here as well if it ever becomes necessary

    this.messageRef = db.ref(`${this.prefix}/messages`);
    this.messageRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      this.messageStore.addMessage(snap.val());
    });

    if (window.location.hostname !== 'localhost') {
      // Don't do this for localhost. Why did I put this here?
      window.addEventListener('beforeunload', (e: Event) => {
        e.preventDefault();
        e.returnValue = true;
      });
    }
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