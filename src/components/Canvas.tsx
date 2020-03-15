import React, { PureComponent } from 'react';
import { fabric } from 'fabric';

let canvas: fabric.Canvas;

// Perhaps use a ref for this instead?
export const getCanvas = () => canvas;

export default class Canvas extends PureComponent {
  componentDidMount() {
    canvas = new fabric.Canvas('c');
  }

  render() {
    return (
      <div>
        <canvas id="c" width="1000" height="700" style={{border: '1px solid gray'}}/>
      </div>
    );
  }
}
