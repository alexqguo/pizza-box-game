import { observable, action } from 'mobx';
import { Player } from '../types';

export default class PlayerStore {
  @observable players: Player[] = [];

  @action addPlayer = (player: Player) => {
    this.players.push(player);
  }
}