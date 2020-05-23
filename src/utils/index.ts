import { v4 as uuidv4 } from 'uuid';

export function createId(prefix?: string) {
  if (window.location.hostname === 'localhost') prefix = `${prefix}-dev`;
  return `${prefix ? prefix + '-' : ''}${uuidv4()}`;
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

export function chooseNewColor(existingColors: string[]) {
  const existingColorSet = new Set(existingColors);
  for (let i = 0; i < playerColors.length; i++) {
    const color = playerColors[i];
    if (!existingColorSet.has(color)) return color;
  }

  return 'black';
};

export const playerColors = [
  'greenyellow',
  'lightblue',
  'slategray',
  'pink',
  'steelblue',
  'springgreen',
  'tan',
  'blueviolet',
  'palegoldenrod',
  'indigo',
  'fuchsia',
  'darkseagreen',
  'forestgreen',
  'darkred',
  'orange',
  'lightgray',
  'gold'
];