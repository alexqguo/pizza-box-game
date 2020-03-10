import { observable, action } from 'mobx';
import { Player } from '../types';

export default class PlayerStore {
  @observable players: Player[] = [];

  @action setPlayers = (players: Player[]) => {
    this.players = players;
  }
}