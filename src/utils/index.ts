import { Point } from '../types';

export function createId(prefix?: string) {
  if (window.location.hostname === 'localhost') prefix = `${prefix}-dev`;
  return `${prefix ? prefix + '__' : ''}${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
};

export function serializeObject(obj: fabric.Object) {
  // This... can't be right. Why doesn't "selectable" show up normally?
  return JSON.stringify(
    obj.toJSON([
      'selectable',
      'ruleId',
      'originalFill'
    ])
  );
}

export function randomWithinRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getArea(obj: fabric.Object) {
  switch (obj.type) {
    case 'rect': 
      return obj.getScaledWidth() * obj.getScaledHeight();
    default:
      return 0; // Not implemented yet. Should only be called on a rect
  }
}

export const playerColors = [
  'tomato',
  'violet',
  'turquoise',
  'steelblue',
  'springgreen',
  'tan',
  'midnightblue',
  'yellow',
  'palegoldenrod',
  'indigo',
  'fuchsia',
  'darkseagreen',
  'forestgreen',
  'darkred',
  'crimson',
  'gold',
  // Too light
  // 'azure',
  // 'whitesmoke',
  // Too red
  //
];

const SEPARATOR = 100;
export function getInitialPositions(n: number, canvasHeight: number, canvasWidth: number) {
  const results: Point[] = [];
  const top = canvasHeight / 2;
  let left = canvasWidth / 2;

  results.push({ x: left, y: top });
  for (let i = 1; i < n; i++) {
    const difference = i * SEPARATOR * (i % 2 === 0 ? -1 : 1);
    left = left + difference;
    results.push({ x: left, y: top });
  }

  return results;
}