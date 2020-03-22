import React, { PureComponent } from 'react';
import { fabric } from 'fabric';
import { Tooltip } from '@material-ui/core';
import { ObjWithRuleId, Rule, Point } from '../types';
import { randomWithinRange } from '../utils';
import RootStore from '../stores';

interface State {
  tooltipStr: string | null;
}

let canvas: fabric.Canvas;

// Perhaps use a ref for this instead?
export const getCanvas = () => canvas;

/**
 * For true intersection. FabricJS only supports bounding boxes without customization
 *  https://codepen.io/stephanrusu/pen/vmgeNb
 *  https://github.com/jriecken/sat-js
 *  https://github.com/fabricjs/fabric.js/issues/595
 *  https://github.com/fabricjs/fabric.js/issues/601
 * Should have a max size
 */
export const getIntersectingObjects = (targetObj: fabric.Object) => {
  const intersectingObjects: fabric.Object[] = [];
  canvas.forEachObject((obj: fabric.Object) => {
    if (targetObj === obj) return;
    if (targetObj.intersectsWithObject(obj)) intersectingObjects.push(obj);
  });

  return intersectingObjects;
}

export const doesTargetIntersect = (targetObj: fabric.Object) => {
  return getIntersectingObjects(targetObj).length > 0;
}

export const getObjectAtPoint = (point: Point): fabric.Object | null => {
  const fabricPoint = new fabric.Point(point.x, point.y);
  let res: fabric.Object | null = null;
  canvas.forEachObject((obj: fabric.Object) => {
    if (obj.containsPoint(fabricPoint)) res = obj;
  });

  return res;
}

export const flip = async () => {
  const coords: Point = await determineFlipCoords();
  return await randomizePoint(coords);
}
(window as any).f = flip;

/**
 * Takes a given x/y point and returns a new one within a small area of it.
 * Shows a little indicator on the canvas
 * @param coords 
 */
const randomizePoint = (coords: Point): Promise<Point> => {
  const radius = 100;
  const fade = (obj: fabric.Object, opacityValue: string, onComplete: Function) => {
    obj.animate('opacity', opacityValue, {
      duration: 1250,
      onChange: canvas.renderAll.bind(canvas),
      onComplete,
    });
  }
  return new Promise((resolve) => {
    const indicator = new fabric.Circle({
      top: coords.y - radius,
      left: coords.x - radius,
      radius,
      fill: 'rgba(200, 200, 200, 0.5)',
      opacity: 0
    });

    canvas.add(indicator);
    fade(indicator, '1', () => {
      fade(indicator, '0', () => {
        canvas.remove(indicator);
        resolve({
          x: randomWithinRange(coords.x - radius, coords.x + radius),
          y: randomWithinRange(coords.y - radius, coords.y + radius),
        });
      })
    });
  });
}

/**
 * returns [x, y]. that is not clear
 */
const determineFlipCoords = (): Promise<Point> => {
  return new Promise((resolve) => {

    let raf: number;
    const baseSpeed = 50;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const coords: number[] = [];
  
    let xSpeed = baseSpeed;
    const xIndicator = new fabric.Text('⬇', {
      fontSize: 12,
      top: 0,
      left: 0,
    });
    let ySpeed = baseSpeed;
    const yIndicator = new fabric.Text('➡', {
      fontSize: 12,
      top: 0,
      left: 0,
    });
  
    const render = () => {
      if (typeof xIndicator.left === 'undefined' || typeof xIndicator.width === 'undefined'
        || typeof yIndicator.top === 'undefined' || typeof yIndicator.height === 'undefined') return;
  
      // First we get X
      if (coords.length === 0) {
        xSpeed = (xIndicator.left + xIndicator.width > canvasWidth || xIndicator.left < 0) ? -xSpeed : xSpeed;
        xIndicator.left += xSpeed;
      // Then we get Y
      } else if (coords.length === 1) {
        ySpeed = (yIndicator.top + yIndicator.height > canvasHeight || yIndicator.top < 0) ? -ySpeed : ySpeed;
        yIndicator.top += ySpeed;
      // Then we're done!
      } else {
        window.cancelAnimationFrame(raf);
        canvas.remove(yIndicator, xIndicator);
        resolve({ x: coords[0], y: coords[1] });
      }

      canvas.renderAll();
      raf = window.requestAnimationFrame(render);
    };
  
    const keyHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 32) {
        e.preventDefault();
        // Really these should be the middle, not top/left, but no one will notice
        if (coords.length === 0) {
          coords.push(xIndicator.left || 0);
        } else if (coords.length === 1) {
          coords.push(yIndicator.top || 0);
          document.removeEventListener('keydown', keyHandler);
        }
      }
    };
  
    canvas.add(yIndicator, xIndicator);
    window.requestAnimationFrame(render);
    document.addEventListener('keydown', keyHandler);
  });
}

export default class Canvas extends PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tooltipStr: '',
    };
  }

  componentDidMount() {
    canvas = new fabric.Canvas('c');
    canvas.on('mouse:over', (e: fabric.IEvent) => {
      if (e.target) {
        const ruleId: string = (e.target as ObjWithRuleId).ruleId;
        const rule: Rule | undefined = RootStore.ruleStore.rules.get(ruleId);
        this.setState({
          tooltipStr: rule ? rule.displayText : null,
        });
      }
    });
  
    canvas.on('mouse:out', (e: fabric.IEvent) => {
      this.setState({
        tooltipStr: null
      });
    });

    canvas.on('object:scaling', (e: fabric.IEvent) => {
      // @ts-ignore The TS interface doesn't have target on transform for some reason
      const targetObj: fabric.Object = e.transform.target;
      if (!targetObj) return;

      const isIntersecting: boolean = doesTargetIntersect(targetObj);
      targetObj.set('fill', isIntersecting ? 'red' : 'blue');
    }); // Consider debouncing
  }

  render() {
    return (
      <div>
        <Tooltip 
          title={this.state.tooltipStr || ''} 
          open={!!this.state.tooltipStr}
          placement="top"
        >
          <div>
            {/* DO NOT PUT ANTHING ELSE IN HERE */}
            <canvas id="c" width="1000" height="700" style={{ border: '1px solid gray' }} />
          </div>
        </Tooltip>
      </div>
    );
  }
}
