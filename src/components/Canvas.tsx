import React, { PureComponent } from 'react';
import { fabric } from 'fabric';
import { Tooltip } from '@material-ui/core';
import { ObjWithRuleId, Rule } from '../types';
import RootStore from '../stores';

interface State {
  tooltipStr: string | null;
}

let canvas: fabric.Canvas;

// Perhaps use a ref for this instead?
export const getCanvas = () => canvas;

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

export const getArea = (targetObj: fabric.Object) => {
  switch (targetObj.type) {
    case 'circle':
      const radius = (targetObj as fabric.Circle).radius || 0;
      return Math.PI * radius * radius;
    case 'rect':
      const width = targetObj.width || 0;
      const height = targetObj.height || 0;
      return width * height;
    default:
      console.error(`Unknown shape type: ${targetObj.type}`);
      return 0;
  }
}

/**
 * returns [x, y]. that is not clear
 */
export const flip = () => {
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
        resolve(coords);
      }
      
      canvas.renderAll();
      raf = window.requestAnimationFrame(render);
    };
  
    const keyHandler = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.keyCode === 32) {
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
(window as any).f = flip;

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
