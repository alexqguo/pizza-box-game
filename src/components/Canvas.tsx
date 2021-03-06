import React, { PureComponent } from 'react';
import { fabric } from 'fabric';
import { Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { throttle, clamp } from 'lodash';
import { ObjWithRuleId, Rule, Point, ShapeValidation } from '../types';
import { randomWithinRange } from '../utils';
import RootStore from '../stores';
import { initValidationManager, getValidationManager } from '../validation';

interface State {
  tooltipStr: string | null;
}

interface IntersectionObject extends fabric.Object {
  refreshLast: boolean,
  lastLeft: number,
  lastTop: number,
}

const QUARTER_RADIUS = 6;
const INDICATOR_RADIUS = 110;
const BASE_SPEED = 45;

let canvas: fabric.Canvas;

// Perhaps use a ref for this instead?
export const getCanvas = () => canvas;

export const isPointWithinCanvas = (point: Point) => {
  return point.x > 0 && 
    point.x < canvas.getWidth() &&
    point.y > 0 &&
    point.y < canvas.getHeight();
}

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
    if (targetObj === obj || (obj as any).ignoreIntersection) return;

    if (targetObj.intersectsWithObject(obj)) intersectingObjects.push(obj);
  });

  return intersectingObjects;
}

export const doesTargetIntersect = (targetObj: fabric.Object) => {
  const intersectingObjects: fabric.Object[] = getIntersectingObjects(targetObj);
  return intersectingObjects.length > 0;
}

export const getObjectAtPoint = (point: Point): fabric.Object | null => {
  const fabricPoint = new fabric.Point(point.x, point.y);
  let res: fabric.Object | null = null;
  canvas.forEachObject((obj: fabric.Object) => {
    if ((obj as any).ignoreIntersection) return;
    if (obj.containsPoint(fabricPoint)) res = obj;
  });

  return res;
}

export const createQuarter = (point: Point) => {
  return new fabric.Circle({
    top: point.y - QUARTER_RADIUS,
    left: point.x - QUARTER_RADIUS,
    radius: QUARTER_RADIUS,
    fill: 'gray',
    selectable: false,
    hasControls: false,
    // @ts-ignore TODO
    ignoreIntersection: true,
  });
};

export const createIndicator = (point: Point) => {
  return new fabric.Circle({
    top: point.y - INDICATOR_RADIUS,
    left: point.x - INDICATOR_RADIUS,
    radius: INDICATOR_RADIUS,
    fill: 'rgba(200, 200, 200, 0.5)',
    hasControls: false,
    selectable: false,
    opacity: 0,
    // @ts-ignore TODO
    ignoreIntersection: true,
  });
}

export const fadeIndicator = (obj: fabric.Object) => {
  const fade = (obj: fabric.Object, opacityValue: string, onComplete: Function) => {
    obj.animate('opacity', opacityValue, {
      duration: 1250,
      onChange: canvas.renderAll.bind(canvas),
      onComplete,
    });
  };

  fade(obj, '1', () => { fade(obj, '0', () => {}) });
}

export const flip = async () => {
  return await determineFlipCoords();
}

/**
 * Takes a given x/y point and returns a new one within a small area of it.
 * If that new point is off the board, bring it somewhat closer to reduce (but not eliminate)
 * the possibility of missing the board.
 * Shows a little indicator on the canvas.
 * @param coords 
 */
export const randomizePoint = (coords: Point): Point => {
  let newX = randomWithinRange(coords.x - INDICATOR_RADIUS, coords.x + INDICATOR_RADIUS);
  let newY = randomWithinRange(coords.y - INDICATOR_RADIUS, coords.y + INDICATOR_RADIUS)

  // Since it's rather easy to miss the board, if your randomization causes you to miss, do
  // a slight adjustment of half of the indicator radius
  if (newX < 0) newX += INDICATOR_RADIUS / 2;
  if (newX > canvas.getWidth()) newX -= INDICATOR_RADIUS / 2;
  if (newY < 0) newY += INDICATOR_RADIUS / 2;
  if (newY > canvas.getHeight()) newY -= INDICATOR_RADIUS / 2;

  return { x: newX, y: newY };
}

/**
 * returns [x, y]. that is not clear
 */
const determineFlipCoords = (): Promise<Point> => {
  return new Promise((resolve) => {

    let raf: number;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const coords: number[] = [];
  
    let xSpeed = BASE_SPEED;
    const xIndicator = new fabric.Text('⬇', {
      fontSize: 12,
      top: 0,
      left: 0,
      selectable: false,
      hasControls: false,
    });
    let ySpeed = BASE_SPEED;
    const yIndicator = new fabric.Text('➡', {
      fontSize: 12,
      top: 0,
      left: 0,
      selectable: false,
      hasControls: false,
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
          coords.push(clamp(xIndicator.left!, 0, canvasWidth));
        } else if (coords.length === 1) {
          coords.push(clamp(yIndicator.top!, 0, canvasHeight));
          document.removeEventListener('keydown', keyHandler);
        }
      }
    };
  
    canvas.add(yIndicator, xIndicator);
    window.requestAnimationFrame(render);
    document.addEventListener('keydown', keyHandler);
  });
}

const CustomTooltip = withStyles((theme) => ({
  tooltip: {
    maxWidth: 800,
    fontSize: theme.typography.pxToRem(22),
  },
}))(Tooltip);

export default class Canvas extends PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tooltipStr: '',
    };
  }

  componentDidMount() {
    canvas = new fabric.Canvas('c');
    initValidationManager(canvas);

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

    const objectModifiedHandler = throttle((e: fabric.IEvent) => {
      // @ts-ignore The TS interface doesn't have target on transform for some reason
      const targetObj: fabric.Object = e.transform.target;
      if (!targetObj) return;

      const validation: ShapeValidation = getValidationManager().validate(targetObj);
      targetObj.set('fill', validation.isValid ? (targetObj as any).originalFill : 'red');
    }, 50);

    const objectMovingHandler = (e: fabric.IEvent) => {
      // Definitely did not rip off this code from SO. Nope, definitely did not do that
      const intersectCheck = (activeObject: IntersectionObject) => {
        activeObject.setCoords();
        if (activeObject.refreshLast !== false) activeObject.refreshLast = true;

        if (
          // It's not actually a fabric Point object, but it contains x/y the same so it's compatible
          !activeObject.containsPoint(RootStore.gameStore.game.quarterLocation as fabric.Point)
          && typeof activeObject.lastLeft === 'number'
        ) {
          activeObject.left = activeObject.lastLeft;
          activeObject.top = activeObject.lastTop;
          activeObject.refreshLast = false;
        } else {
          activeObject.refreshLast = true;
        }

        if (activeObject.refreshLast) {
          activeObject.lastLeft = activeObject.left!;
          activeObject.lastTop = activeObject.top!;
        }
      };

      intersectCheck(e.target as IntersectionObject);
      objectModifiedHandler(e);
    };

    canvas.on('object:scaling', objectModifiedHandler);
    canvas.on('object:rotating', objectModifiedHandler);
    canvas.on('object:moving', objectMovingHandler);
  }

  render() {
    return (
      <div>
        <CustomTooltip 
          title={this.state.tooltipStr ? 
            <span>
              {this.state.tooltipStr}
            </span>
            : ''} 
          open={!!this.state.tooltipStr}
          placement="top-start"
        >
          <div>
            {/* DO NOT PUT ANTHING ELSE IN HERE */}
            <canvas id="c" width="1000" height="700" style={{ 
              boxShadow: '0px 0px 5px 0px rgba(100,100,100,0.5)'
            }} />
          </div>
        </CustomTooltip>
      </div>
    );
  }
}