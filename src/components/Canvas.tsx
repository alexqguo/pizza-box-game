import React, { PureComponent } from 'react';
import { fabric } from 'fabric';
import { ObjWithRuleId, Rule } from '../types';
import RootStore from '../stores';

interface State {
  tooltipStr: string | null;
}

let canvas: fabric.Canvas;

// Perhaps use a ref for this instead?
export const getCanvas = () => canvas;

export default class Canvas extends PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      tooltipStr: null,
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
        {this.state.tooltipStr ? this.state.tooltipStr : null}
        <div> {/* DO NOT PUT ANTHING ELSE IN HERE */}
          <canvas id="c" width="1000" height="700" style={{border: '1px solid gray'}}/>
        </div>
      </div>
    );
  }
}
