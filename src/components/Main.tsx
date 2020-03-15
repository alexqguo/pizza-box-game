import React, { useContext, useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { TextField, Button, Box } from '@material-ui/core';
import { fabric } from 'fabric';
import useStyles from '../styles';
import Canvas, { getCanvas } from './Canvas';
import { StoreContext } from './App';

// This may need to change to a class component at some point. We'll see
export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore } = store;
  const { game } = gameStore;

  useEffect(() => {
    const canvas = getCanvas();
    // const canvasClickHandler = (e: fabric.IEvent) => {
    //   console.log(e);
    //   /**
    //    * Cannot intersect with another shape
    //    *  https://codepen.io/stephanrusu/pen/vmgeNb
    //    *  https://github.com/jriecken/sat-js
    //    *  https://github.com/fabricjs/fabric.js/issues/595
    //    *  https://github.com/fabricjs/fabric.js/issues/601
    //    * Cannot go offscreen
    //    * Should have a max size
    //    */
    //   const initialRadius = 20;
    //   const { pointer } = e;
    //   const initialPlacement: [number, number] = pointer && pointer.x && pointer.y ? 
    //     [pointer.x - initialRadius, pointer.y - initialRadius] : [0, 0];
    //   const shape = new fabric.Circle({
    //     left: initialPlacement[0],
    //     top: initialPlacement[1],
    //     radius: initialRadius,
    //     fill: 'blue',
    //     hasControls: true,
    //     lockMovementX: true,
    //     lockMovementY: true,
    //     centeredScaling: true,
    //     // @ts-ignore Additional property
    //     ruleId: 'asdf',
    //   });

    //   canvas.add(shape);
    //   canvas.off('mouse:up', canvasClickHandler);
    // };
    // canvas.on('mouse:up', canvasClickHandler);
  });

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
      <Box className={classes.createRuleContainer}>
        <TextField
          label="Rule"
          size="small"
          className={classes.createRuleInput}
        />
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          className={classes.createRuleButton}
        >
          Create
        </Button>
      </Box>
      
      <Canvas />
    </main>
  ));
}