import { observable, computed, action } from 'mobx';
import { Player } from '../types';

export default class PlayerStore {
  @observable players: Map<string, Player> = new Map();

  @computed get names(): string[] {
    return Array.from(this.players.values()).map((p: Player) => p.name);
  }

  @computed get ids(): string[] {
    return Array.from(this.players.values()).map((p: Player) => p.id);
  }

  @computed get colors(): string[] {
    return Array.from(this.players.values()).map((p: Player) => p.color);
  }

  @action addPlayer = (player: Player) => {
    this.players.set(player.id, player);
  }

  @action updatePlayer = (player: Player) => {
    // Currently just update the entire object. Maybe in the future we will want more here
    this.players.set(player.id, player);
  }
}