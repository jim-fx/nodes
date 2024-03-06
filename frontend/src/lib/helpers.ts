export function snapToGrid(value: number, gridSize: number = 10) {
  return Math.round(value / gridSize) * gridSize;
  }
