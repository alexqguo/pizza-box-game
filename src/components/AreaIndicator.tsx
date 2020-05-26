import React, { useContext } from 'react';
import { fabric } from 'fabric';
import { useObserver } from 'mobx-react';
import { Tooltip } from '@material-ui/core';
import useStyles from '../styles';
import { RootStore, StoreContext } from '../stores';
import { QUICKSTART_PLAYER_ID } from '../stores/ruleStore';
import { ObjWithRuleId } from '../types';
import { getArea } from '../utils';
import { getCanvas } from './Canvas';

export default () => {
  const classes = useStyles();
  const store: RootStore = useContext(StoreContext);
  const { ruleStore, playerStore } = store;

  const renderIndicator = () => {
    const areas: { [key: string]: number } = {}; // playerId -> total area for that player
    let totalArea = 0;

    getCanvas().getObjects().forEach((obj: fabric.Object) => {
      const { ruleId } = (obj as ObjWithRuleId);
      const playerId = ruleStore.rules.get(ruleId)?.playerId;
      if (!playerId || playerId === QUICKSTART_PLAYER_ID) return;

      if (typeof areas[playerId] === 'undefined') areas[playerId] = 0;
      const area: number = getArea(obj);
      areas[playerId] += area;
      totalArea += area;
    });

    return (
      <div className={classes.areaIndicatorContainer}>
        {Object.entries(areas).map(([key, value]) => {
          const player = playerStore.players.get(key);
          if (!player) return null;

          const name = player.name;
          const percentage = (value / totalArea) * 100;
          const styles = {
            width: `${percentage}%`,
            backgroundColor: player.color,
          };

          return (
            <Tooltip title={`${name} - ${Math.round(percentage)}%`} placement="top" key={key}>
              <span style={styles} className={classes.areaIndicatorItem}></span>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return useObserver(() => ruleStore.rules.size ? renderIndicator() : null);
};