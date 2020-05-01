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