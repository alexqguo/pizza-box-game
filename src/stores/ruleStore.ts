import { observable, action } from 'mobx';
import { fabric } from 'fabric';
import { Rule } from '../types';
import { getCanvas } from '../components/Canvas';

/**
 * Hydrates the canvas from a list of objects
 * @param objectsToAdd List of objects representing Fabric objects
 */
export const enlivenObjects = (objectsToAdd: Object[], cb?: Function) => {
  const canvas = getCanvas();

  // @ts-ignore This function works just fine with just the objects and callback
  fabric.util.enlivenObjects(objectsToAdd, (objects: fabric.Object[]) => {
    // We want to set this to false temporarily while we add everything
    // Then we can turn it back on
    const origRenderOnAddRemove = canvas.renderOnAddRemove;
    canvas.renderOnAddRemove = false;
    objects.forEach((o: fabric.Object) => canvas.add(o));
    canvas.renderOnAddRemove = origRenderOnAddRemove;
    canvas.renderAll();
    
    if (cb) {
      cb(objects);
    }
  });
};

export default class RuleStore {
  @observable rules: Map<string, Rule> = new Map();

  @action addRule = (rule: Rule) => {
    this.rules.set(rule.id, rule);
    enlivenObjects([JSON.parse(rule.data)]);
  }

  @action updateRule = (rule: Rule) => {
    /**
     * We shouldn't need to call enlivenObjects here as nothing visual got added.
     * This just exists for updating timesLanded. If we ever DO begin to update the 
     * actual fabric shape data, then just roll everything into addRule.
     */
    this.rules.set(rule.id, rule);
  }
}