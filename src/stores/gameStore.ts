import { observable, action } from 'mobx';

export default class GameStore {
  @observable id: string = '';

  @action setId = (id: string) => {
    this.id = id;
  }
}