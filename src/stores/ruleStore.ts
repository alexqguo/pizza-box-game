import { observable, action } from 'mobx';
import { Rule } from '../types';
import { getCanvas } from '../components/Canvas';

export default class RuleStore {
  @observable rules: Rule[] = [];

  @action setRules = (rules: Rule[]) => {
    this.rules = rules;

    const canvas = getCanvas();
    // In addition to setting the rules in the store, update the canvas element as well
    rules.forEach((r: Rule) => {
      canvas?.loadFromJSON(r.data, () => {
        // Typescript requires this for some reason
      });
    });
  }
}