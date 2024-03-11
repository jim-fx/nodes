export function snapToGrid(value: number, gridSize: number = 10) {
  return Math.round(value / gridSize) * gridSize;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function animate(duration: number, callback: (progress: number) => void | false) {
  const start = performance.now();
  const loop = (time: number) => {
    const progress = (time - start) / duration;
    if (progress < 1) {
      const res = callback(progress);
      if (res !== false) {
        requestAnimationFrame(loop);
      }
    } else {
      callback(1);
    }
  }
  requestAnimationFrame(loop);
}
