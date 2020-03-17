export function createId(prefix?: string) {
  return `${prefix ? prefix + '__' : ''}${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
};

export function serializeGroup(obj: fabric.Object) {
  return JSON.stringify(obj.toJSON(['selectable', 'ruleId']));
}

export function getArea(obj: fabric.Object) {
  switch (obj.type) {
    case 'circle':
      const radius = (obj as fabric.Circle).radius || 0;
      return Math.PI * radius * radius;
    case 'rect':
      const width = obj.width || 0;
      const height = obj.height || 0;
      return width * height;
    default:
      console.error(`Unknown shape type: ${obj.type}`);
      return 0;
  }
}