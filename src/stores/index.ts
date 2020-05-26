import { shuffle } from 'lodash';
import GameStore from './gameStore';
import { SessionData, GameData, Rule, Player, Point, GameType, Message, Alert, MessageType, CreateGameOptions } from '../types';
import { db } from '../firebase';
import { createId, playerColors, chooseNewColor } from '../utils';
import PlayerStore from './playerStore';
import RuleStore from './ruleStore';
import MessageStore from './messageStore';

export { StoreContext, StoreProvider } from './context';
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
   * @param options
   */
  async createGame(options: CreateGameOptions) {
    const { playerNames, localPlayer, gameType, quickStart } = options;
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
      type: MessageType.gameStart,
      playerIds: playerData.map((p: Player) => p.id),
    };

    const ruleData: Rule[] = quickStart ? RuleStore.getQuickStartRules() : [];

    const sessionData: SessionData = {
      game: gameData,
      players: playerData,
      rules: ruleData,
      messages: [initialMessage],
    }

    this.subscribeToGame();
    await db.ref(`${this.prefix}`).set(sessionData);
  }

  async createPlayer(name: string) {
    if (!this.playerRef) return;
    const playerId = createId('player');
    const gameType = this.gameStore.game.type;
    const existingColors = this.playerStore.colors;
    const color = chooseNewColor(existingColors);

    await this.playerRef.push().set({
      id: playerId,
      name,
      color,
      ...(gameType === GameType.remote ? { isActive: false } : undefined),
    });
    await this.createMessage({
      type: MessageType.newPlayer,
      playerIds: [playerId]
    });
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

  async createMessage(message: Message) {
    if (this.messageRef) {
      await this.messageRef.push().set(message);
    }
  }

  /**
   * Advances the turn. Not much else
   * TODO: this code is rough and prone to failures. Fix it!
   */
  advanceTurn() {
    window.localStorage.removeItem('localShape');
    const playerIds: string[] = this.playerStore.ids;
    const currentPlayerIdx: number = playerIds.indexOf(this.gameStore.game.currentPlayerId);
    const nextPlayerIdx: number = (currentPlayerIdx + 1) % playerIds.length;
    const nextPlayerId: string = playerIds[nextPlayerIdx];
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
    this.playerRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      this.playerStore.addPlayer(snap.val() as Player);
    });
    this.playerRef.on('child_changed', (snap: firebase.database.DataSnapshot) => {
      this.playerStore.updatePlayer(snap.val() as Player);
    });

    // Subscribe the ruleStore to Firebase
    this.ruleRef = db.ref(`${this.prefix}/rules`);
    this.ruleRef.on('child_added', (snap: firebase.database.DataSnapshot) => {
      this.ruleStore.addRule(snap.val() as Rule);
    });
    this.ruleRef.on('child_changed', (snap: firebase.database.DataSnapshot) => {
      this.ruleStore.updateRule(snap.val() as Rule);
    });

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