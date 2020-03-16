import { observable, action } from 'mobx';
import { fabric } from 'fabric';
import { Rule } from '../types';
import { getCanvas } from '../components/Canvas';

/**
 * Hydrates the canvas from a list of objects
 * @param objectsToAdd List of objects representing Fabric objects
 */
const enlivenObjects = (objectsToAdd: Object[]) => {
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
  });
};

export default class RuleStore {
  @observable rules: Map<string, Rule> = new Map();

  /**
   * TODO: Remove this if it's not used anymore
   */
  @action setRules = (rules: Rule[]) => {
    console.log(rules);
    // TODO: optimize this. Maybe we can only subscribe to rule UPDATES and not wholesale changes
    // Also, this can be done with a reduce
    const objectsToAddToCanvas: Object[] = rules.filter((r: Rule) => !this.rules.has(r.id))
      .map((r: Rule) => JSON.parse(r.data));

    // Update the rules. I guess technically should clear the map too
    rules.forEach((r: Rule) => { this.rules.set(r.id, r) });
    enlivenObjects(objectsToAddToCanvas);
  }

  @action addRule = (rule: Rule) => {
    this.rules.set(rule.id, rule);
    enlivenObjects([JSON.parse(rule.data)]);
  }
}