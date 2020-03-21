import React, { useContext, useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { TextField, Button, Box } from '@material-ui/core';
import { fabric } from 'fabric';
import Canvas, { getCanvas, doesTargetIntersect } from './Canvas';
import { StoreContext } from './App';
import useStyles from '../styles';
import { createId, serializeGroup } from '../utils';
import { Rule } from '../types';
import rootStore from '../stores';

interface State {
  inputText?: string,
  currentShape?: fabric.Object,
  isIntersecting?: boolean
}

const INITIAL_RADIUS = 10;

// This may need to change to a class component at some point. We'll see
export default () => {
  const classes = useStyles();
  const store = useContext(StoreContext);
  const { gameStore } = store; // Cannot destructure past this point for observer to work
  const [state, setState] = useState<State>({});
  const updateState = (newState: State) => {
    setState({ ...state, ...newState });
  };

  useEffect(() => {
    const canvas = getCanvas();
    const canvasClickHandler = (e: fabric.IEvent) => {
      // TODO - an error message of some sort. Use the Snackbar component
      if (e.target) return; // Can't create shape on top of an existing one

      const { pointer } = e;
      const initialPlacement: [number, number] = pointer && pointer.x && pointer.y ? 
        [pointer.x - INITIAL_RADIUS, pointer.y - INITIAL_RADIUS] : [0, 0];
      const shape = new fabric.Circle({
        left: initialPlacement[0],
        top: initialPlacement[1],
        radius: INITIAL_RADIUS,
        fill: 'blue',
        hasControls: true,
        lockMovementX: true,
        lockMovementY: true,
        centeredScaling: true,
      });

      if (!doesTargetIntersect(shape)) {
        canvas.add(shape);
        updateState({ 
          currentShape: shape,
        });
      }
    };

    canvas.on('object:scaling', (e: fabric.IEvent) => {
      /**
       * Cannot intersect with another shape
       *  https://codepen.io/stephanrusu/pen/vmgeNb
       *  https://github.com/jriecken/sat-js
       *  https://github.com/fabricjs/fabric.js/issues/595
       *  https://github.com/fabricjs/fabric.js/issues/601
       * Should have a max size
       * Cannot place a shape on another shape
       */
      // @ts-ignore The TS interface doesn't have target on transform for some reason
      const targetObj: fabric.Object = e.transform.target;
      if (!targetObj) return;

      const isIntersecting: boolean = doesTargetIntersect(targetObj);
      targetObj.set('fill', isIntersecting ? 'red' : 'blue');
    }); // Consider debouncing

    canvas.on('object:scaled', (e: fabric.IEvent) => {
      // @ts-ignore stupid interface is wrong
      const targetObj: fabric.Object = e.transform.target;
      if (!targetObj) return;
      // TODO: also check area
      const isIntersecting: boolean = doesTargetIntersect(targetObj);
      updateState({ isIntersecting });
    });

    if (gameStore.game.isPlayerBusy && !state.currentShape) {
      // Only allow the user to create a shape if they're busy. This will change later
      canvas.on('mouse:up', canvasClickHandler);
    } else {
      canvas.off('mouse:up');
    }
  });

  const createRule = () => {
    const shape: fabric.Object | undefined = state.currentShape;

    if (shape && state.inputText) {
      shape.selectable = false;
      shape.hasControls = false;
      const ruleId: string = createId('rule');
      // @ts-ignore Adding additional property
      shape.ruleId = ruleId;
      shape.selectable = false;
      shape.hasControls = false;

      const newRule: Rule = {
        id: ruleId,
        playerId: gameStore.game.currentPlayerId,
        displayText: state.inputText,
        data: serializeGroup(shape)
      };
      
      rootStore.createRule(newRule);
      setState({}); // Clear state
    }
  };

  const updateInputText = (target: EventTarget) => {
    updateState({
      inputText: (target as HTMLInputElement).value,
    });
  };

  const canSubmit = !!state.currentShape && !state.isIntersecting && !!state.inputText;

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
      Game: {JSON.stringify(gameStore.game)}<br />
      {'<Main>'} State: {JSON.stringify(state)}
      <Box className={classes.createRuleContainer}>
        <TextField
          label="Rule"
          size="small"
          className={classes.createRuleInput}
          disabled={(!state.currentShape)}
          onChange={({ target }) => { updateInputText(target) }}
          value={state.inputText || ''}
        />
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          className={classes.createRuleButton}
          disabled={!canSubmit}
          onClick={createRule}
        >
          Create
        </Button>
      </Box>
      
      <Canvas />
    </main>
  ));
}