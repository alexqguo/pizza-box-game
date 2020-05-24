import { observable, action } from 'mobx';
import { fabric } from 'fabric';
import { shuffle } from 'lodash';
import { Rule, ObjWithRuleId } from '../types';
import { randomWithinRange as rand, createId, serializeObject } from '../utils';
import { getCanvas } from '../components/Canvas';
import rules from '../static/ruleSuggestions.json';

const NUM_QUICK_START_RULES = 10;
const MAX_ATTEMPTS = 25;
export const QUICKSTART_PLAYER_ID = '__QUICKSTART__';

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

  static getQuickStartRules = (): Rule[] => {
    let attempts = 0;
    const quickStartRules: Rule[] = [];
    const shapes: ObjWithRuleId[] = [];
    const canvas = getCanvas();
    const shuffledRuleSuggestions = shuffle(rules);

    while (quickStartRules.length < NUM_QUICK_START_RULES) {
      if (++attempts > MAX_ATTEMPTS) break; // Just give up

      const id = createId('rule');
      const shape = new fabric.Rect({
        width: rand(50, 200),
        height: rand(50, 200),
        fill: 'lightgrey',
        strokeWidth: 0,
        originX: 'center',
        originY: 'center',
        selectable: false,
        top: rand(50, canvas.getHeight() - 50),
        left: rand(50, canvas.getWidth() - 50),
        angle: rand(0, 360),
        // @ts-ignore additional properties
        ruleId: id,
        originalFill: 'lightgrey',
      });

      // Ensure it doesn't intersect with anything else
      const doesIntersect = shapes.some((s: fabric.Object) => s.intersectsWithObject(shape));
      if (!doesIntersect) shapes.push(shape);
    }

    return shapes.map((s: ObjWithRuleId, i: number) => ({
      id: s.ruleId,
      playerId: QUICKSTART_PLAYER_ID,
      displayText: shuffledRuleSuggestions[i],
      data: serializeObject(s),
      timesLanded: 0,
    }));
  }
}