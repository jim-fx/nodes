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

export function createNodePath({
  depth = 8,
  height = 20,
  y = 50,
  cornerTop = 0,
  cornerBottom = 0,
  leftBump = false,
  rightBump = false,
  aspectRatio = 1,
} = {}) {
  return `M0,${cornerTop}
      ${cornerTop
      ? ` V${cornerTop}
              Q0,0 ${cornerTop * aspectRatio},0
              H${100 - cornerTop * aspectRatio}
              Q100,0  100,${cornerTop}
            `
      : ` V0
              H100
            `
    }
      V${y - height / 2}
      ${rightBump
      ? ` C${100 - depth},${y - height / 2} ${100 - depth},${y + height / 2} 100,${y + height / 2}`
      : ` H100`
    }
      ${cornerBottom
      ? ` V${100 - cornerBottom}
              Q100,100 ${100 - cornerBottom * aspectRatio},100
              H${cornerBottom * aspectRatio}
              Q0,100  0,${100 - cornerBottom}
            `
      : `${leftBump ? `V100 H0` : `V100`}`
    }
      ${leftBump
      ? ` V${y + height / 2} C${depth},${y + height / 2} ${depth},${y - height / 2} 0,${y - height / 2}`
      : ` H0`
    }
      Z`.replace(/\s+/g, " ");
}

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export const clone: <T>(v: T) => T = "structedClone" in globalThis ? globalThis.structuredClone : (obj) => JSON.parse(JSON.stringify(obj));

export const createLogger = (() => {
  let maxLength = 5;
  return (scope: string) => {
    maxLength = Math.max(maxLength, scope.length);
    let muted = false;
    return {
      log: (...args: any[]) => !muted && console.log(`[%c${scope.padEnd(maxLength, " ")}]:`, "color: #888", ...args),
      info: (...args: any[]) => !muted && console.info(`[%c${scope.padEnd(maxLength, " ")}]:`, "color: #888", ...args),
      warn: (...args: any[]) => !muted && console.warn(`[%c${scope.padEnd(maxLength, " ")}]:`, "color: #888", ...args),
      error: (...args: any[]) => console.error(`[%c${scope.padEnd(maxLength, " ")}]:`, "color: #f88", ...args),
      mute() {
        muted = true;
      },
      unmute() {
        muted = false;
      }

    }
  }
})();

