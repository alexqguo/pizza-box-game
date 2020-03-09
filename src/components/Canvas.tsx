import React from 'react';
import { fabric } from 'fabric';
import useStyles from '../styles';

const canvas = new fabric.Canvas('c');

export default () => {
  const classes = useStyles();

  return (
    <div>
      <canvas id="c" className={classes.canvas} width="600" height="600" />
    </div>
  );
};