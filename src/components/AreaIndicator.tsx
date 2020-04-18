import React, { useContext } from 'react';
import { fabric } from 'fabric';
import { useObserver } from 'mobx-react';
import useStyles from '../styles';
import { RootStore } from '../stores';
import { Rule, ObjWithRuleId } from '../types';
import { getArea } from '../utils';
import { getCanvas } from './Canvas';
import { StoreContext } from './App';

export default () => {
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const { ruleStore } = store; // Cannot destructure past this point for observer to work

  const renderIndicator = () => {
    const areas: { [key: string]: number } = {}; // playerId -> total area for that player
    let totalArea = 0;

    getCanvas().getObjects().forEach((obj: fabric.Object) => {
      const { ruleId } = (obj as ObjWithRuleId);
      const playerId = ruleStore.rules.get(ruleId)?.playerId;
      if (!playerId) return;

      if (typeof areas[playerId] === 'undefined') areas[playerId] = 0;
      const area: number = getArea(obj);
      areas[playerId] += area;
      totalArea += area;
    });

    return (
      <div className={classes.areaIndicatorContainer}>
        {Object.entries(areas).map(([key, value]) => {
          const styles = {
            width: `${(value / totalArea) * 100}%`,
            backgroundColor: store.getPropertyOfPlayer(key, 'color'),
          };

          return <span style={styles} className={classes.areaIndicatorItem}></span>
        })}
      </div>
    );
  };

  return useObserver(() => ruleStore.rules.size ? renderIndicator() : null);
};