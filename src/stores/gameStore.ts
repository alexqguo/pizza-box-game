import { observable, action } from 'mobx';
import { GameData } from '../types';
import { getCanvas, createQuarter, createIndicator, fadeIndicator } from '../components/Canvas';

export default class GameStore {
  @observable game: GameData = {
    id: '',
    currentPlayerId: '',
    isPlayerBusy: false,
    hasFlipped: false,
    quarterLocation: null,
    indicatorLocation: null,
    type: '',
    alertMessage: '',
  };
  @observable localPlayerId: string = '';
  quarter: fabric.Object | null = null;
  indicator: fabric.Object | null = null;
  
  @action setGame = (game: GameData) => {
    this.game = game;
    this.removeCommonObject(this.quarter);
    this.removeCommonObject(this.indicator);

    if (game.quarterLocation) {
      const quarter: fabric.Object = createQuarter(game.quarterLocation);
      this.quarter = quarter
      getCanvas().add(quarter);
    } else {
      this.quarter = null;
    }

    if (game.indicatorLocation && !this.indicator) {
      const indicator: fabric.Object = createIndicator(game.indicatorLocation);
      this.indicator = indicator;
      getCanvas().add(indicator);
      fadeIndicator(indicator);
    } else {
      this.indicator = null;
    }
  }

  removeCommonObject(obj: fabric.Object | null) {
    if (obj) {
      getCanvas().remove(obj);
    }
  }

  @action setLocalPlayerId = (localPlayerId: string) => {
    this.localPlayerId = localPlayerId;
  }
}