import React, { useContext, useEffect, useReducer } from 'react';
import { useObserver } from 'mobx-react';
import { TextField, Button, Box, Typography } from '@material-ui/core';
import { fabric } from 'fabric';
import Canvas, {
  getCanvas,
  getIntersectingObjects,
  flip,
  getObjectAtPoint,
  randomizePoint,
  isPointWithinCanvas,
} from './Canvas';
import { StoreContext } from './App';
import useStyles from '../styles';
import { createId, serializeObject } from '../utils';
import { Rule, Point, GameType, ObjWithRuleId, ShapeValidation } from '../types';
import { RootStore } from '../stores';
import { getValidationManager } from '../validation';
import { enlivenObjects } from '../stores/ruleStore';

interface State {
  inputText?: string,
  currentShape?: fabric.Object,
  validation?: ShapeValidation,
  existingShape?: fabric.Object,
}

interface Dispatch {
  type: string,
  newState?: Object
}

const INITIAL_RADIUS = 10;

const reducer = (state: State, action: Dispatch) => {
  switch (action.type) {
    case 'clear':
      return {};
    case 'merge':
      return { ...state, ...action.newState };
    default:
      return {};
  }
};

// This may need to change to a class component at some point. We'll see
export default () => {
  const canvas = getCanvas();
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const { gameStore, ruleStore } = store; // Cannot destructure past this point for observer to work
  const [state, dispatch] = useReducer(reducer, {});
  const isCurrentPlayer = gameStore.game.type === GameType.local || gameStore.localPlayerId === gameStore.game.currentPlayerId;

  const newShapeHandler = async (pointer: Point) => {
    const existingShape: fabric.Object | null = getObjectAtPoint(pointer);
    if (existingShape) {
      dispatch({
        type: 'merge',
        newState: { existingShape }
      });
      store.setQuarterLocation(pointer);
      return;
    };

    const initialPlacement: [number, number] = [pointer.x - INITIAL_RADIUS, pointer.y - INITIAL_RADIUS];
    const playerColor = store.getPropertyOfPlayer(gameStore.game.currentPlayerId, 'color');
    const shape = new fabric.Rect({
      left: initialPlacement[0],
      top: initialPlacement[1],
      width: INITIAL_RADIUS * 2,
      height: INITIAL_RADIUS * 2,
      strokeWidth: 0,
      fill: playerColor,
      hasControls: true,
      lockMovementX: true,
      lockMovementY: true,
      centeredScaling: true,
      // @ts-ignore
      originalFill: playerColor,
    });

    const intersectingShapes = getIntersectingObjects(shape);
    if (intersectingShapes.length) {
      handleExistingShape(intersectingShapes[0]);
    } else {
      await store.setQuarterLocation(pointer);
      canvas.add(shape);
      dispatch({ type: 'merge', newState: { currentShape: shape }});
    }
  };

  const scaledHandler = (e: fabric.IEvent) => {
    // @ts-ignore stupid interface is wrong
    const targetObj: fabric.Object = e.transform.target;
    if (!targetObj) return;
    const validation: ShapeValidation = getValidationManager().validate(targetObj);

    dispatch({ type: 'merge', newState: {
      validation,
    }});
  };

  const handleExistingShape = (shape: fabric.Object) => {
    const name = store.getPropertyOfPlayer(gameStore.game.currentPlayerId, 'name');
    const ruleText = ruleStore.rules
      .get((shape as ObjWithRuleId).ruleId)!
      .displayText;
    const message = `${name} -- ${ruleText}`;
    store.createMessage(message);
    store.setAlertMessage(message);
    dispatch({ type: 'clear' });
  };

  const modifiedHandler = (e: fabric.IEvent) => {
    // @ts-ignore stupid interface is wrong
    const targetObj: fabric.Object = e.transform.target;
    if (!targetObj) return;

    if ((targetObj as any).originalFill && isCurrentPlayer) {
      window.localStorage.setItem('localShape', serializeObject(targetObj));
    }
  };

  useEffect(() => {
    const canvas = getCanvas();
    canvas.on('object:scaled', scaledHandler);
    canvas.on('object:modified', modifiedHandler);
  }, []);

  const createRule = async () => {
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
        data: serializeObject(shape)
      };
      
      const name = store.getPropertyOfPlayer(gameStore.game.currentPlayerId, 'name');
      await store.createMessage(`${name} created a new rule: ${state.inputText}`);
      await store.createRule(newRule);
      dispatch({ type: 'clear' }); // Clear state
    }
  };

  const updateInputText = (target: EventTarget) => {
    dispatch({
      type: 'merge',
      newState: { inputText: (target as HTMLInputElement).value },
    });
  };

  const localShape = window.localStorage.getItem('localShape');
  const canSubmit = !!state.currentShape && !!state.inputText &&
    state.validation && state.validation.isValid;

  if (gameStore.game.isPlayerBusy && !gameStore.game.hasFlipped && isCurrentPlayer) {
    flip().then((point: Point) => {
      store.setIndicatorLocation(point);

      setTimeout(() => {
        const quarterLocation: Point = randomizePoint(point);
        
        if (isPointWithinCanvas(quarterLocation)) {
          newShapeHandler(quarterLocation);
        } else {
          const name = store.getPropertyOfPlayer(gameStore.game.currentPlayerId, 'name');
          const message = `${name} missed the board and drinks four!`;
          store.createMessage(message)
          store.setAlertMessage(message);
        }

        store.clearIndicatorLocation();
      }, 2500);
    });
  } else if (state.existingShape) {
    handleExistingShape(state.existingShape);
  } else if (localShape && gameStore.game.quarterLocation && !state.currentShape && isCurrentPlayer) {
    const existingShape = JSON.parse(localShape);
    enlivenObjects([existingShape], (objects: fabric.Object[]) => {
      dispatch({
        type: 'merge',
        newState: { currentShape: objects[0] }
      });
    });
  }

  return useObserver(() => (
    <main className={classes.main}>
      <div className={classes.toolbarOffset} />
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

        <div className={classes.validationErrors}>
          {state.validation && state.validation.errors.map(e => e.message).join(', ')}
          &nbsp;
        </div>
      </Box>
      
      <Canvas />

      <Typography variant="caption" display="block" gutterBottom>
        {gameStore.game.id}
      </Typography>

      {window.location.hostname === 'localhost' ? 
        <>
          Game: {JSON.stringify(gameStore.game)}<br />
          {'<Main>'} State: {JSON.stringify(state)}
        </> : null}
    </main>
  ));
}