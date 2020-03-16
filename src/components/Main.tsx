import React, { useContext, useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { TextField, Button, Box } from '@material-ui/core';
import { fabric } from 'fabric';
import Canvas, { getCanvas } from './Canvas';
import { StoreContext } from './App';
import useStyles from '../styles';
import { createId, serializeGroup } from '../utils';
import { Rule } from '../types';
import rootStore from '../stores';

interface State {
  inputText?: string,
  currentShape?: fabric.Object,
}

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
      /**
       * Cannot intersect with another shape
       *  https://codepen.io/stephanrusu/pen/vmgeNb
       *  https://github.com/jriecken/sat-js
       *  https://github.com/fabricjs/fabric.js/issues/595
       *  https://github.com/fabricjs/fabric.js/issues/601
       * Cannot go offscreen
       * Should have a max size
       * Cannot place a shape on another shape
       */
      const initialRadius = 20;
      const { pointer } = e;
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
        // @ts-ignore Additional property
        ruleId: 'asdf',
      });

      canvas.add(shape);
      updateState({ 
        currentShape: shape,
      });
    };

    if (state.currentShape) {
      canvas.off('mouse:up');
    } else {
      canvas.on('mouse:up', canvasClickHandler);
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
      // TODO: 

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

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
      Game: {JSON.stringify(gameStore.game)}<br />
      State: {JSON.stringify(state)}
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
          disabled={(!state.currentShape)}
          onClick={createRule}
        >
          Create
        </Button>
      </Box>
      
      <Canvas />
    </main>
  ));
}