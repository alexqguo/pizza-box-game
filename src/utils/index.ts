export function createId(prefix?: string) {
  return `${prefix ? prefix + '__' : ''}${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
};

export function serializeObject(obj: fabric.Object) {
  // This... can't be right. Why doesn't "selectable" show up normally?
  return JSON.stringify(obj.toJSON(['selectable', 'ruleId', 'originalFill']));
}

export function randomWithinRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
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
];