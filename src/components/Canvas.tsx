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
          <div> {/* DO NOT PUT ANTHING ELSE IN HERE */}
            <canvas id="c" width="1000" height="700" style={{border: '1px solid gray'}}/>
          </div>
        </Tooltip>
      </div>
    );
  }
}
