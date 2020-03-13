import React, { PureComponent } from 'react';
import { fabric } from 'fabric';

window.fabric = fabric;
let canvas: fabric.Canvas;

export const getCanvas = () => canvas;

export default class Canvas extends PureComponent {
  componentDidMount() {
    canvas = new fabric.Canvas('c');
    (window as any).c = canvas;
  }

  render() {
    console.log('Rendering the Canvas')
    return (
      <div>
        <canvas id="c" width="1000" height="700" style={{border: '1px solid gray'}}/>
      </div>
    );
  }
}
