import { observable, action } from 'mobx';
import { GameData } from '../types';

export default class GameStore {
  @observable game: GameData = {
    id: '',
    currentPlayerId: '',
    isPlayerBusy: false
  };
  
  @action setGame = (game: GameData) => {
    this.game = game;
  }
}