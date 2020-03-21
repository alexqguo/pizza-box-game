export function createId(prefix?: string) {
  return `${prefix ? prefix + '__' : ''}${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
};

export function serializeGroup(obj: fabric.Object) {
  return JSON.stringify(obj.toJSON(['selectable', 'ruleId']));
}

export function randomWithinRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}