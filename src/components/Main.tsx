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
    const canvasClickHandler = (obj: fabric.IEvent) => {
      console.log(obj);
      /**
       * Cannot intersect with another shape
       * Cannot go offscreen
       * Should have a max size
       */
      const initialRadius = 20;
      const { pointer } = obj;
      const initialPlacement: [number, number] = pointer && pointer.x && pointer.y ? 
        [pointer.x - initialRadius, pointer.y - initialRadius] : [0, 0];
      const shape = new fabric.Circle({
        left: initialPlacement[0],
        top: initialPlacement[1],
        radius: initialRadius,
        fill: 'blue',
        hasControls: true,
        lockMovementX: true,
        lockMovementY: true,
        centeredScaling: true,
      });

      canvas.add(shape);
      canvas.off('mouse:up', canvasClickHandler);
    };
    canvas.on('mouse:up', canvasClickHandler);
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