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
  return function(this: any, ...args: any[]) {
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

    let isGrouped = false;

    function s(color: string, ...args: any) {
      return isGrouped ? [...args] : [`[%c${scope.padEnd(maxLength, " ")}]:`, `color: ${color}`, ...args];
    }

    return {
      log: (...args: any[]) => !muted && console.log(...s("#888", ...args)),
      info: (...args: any[]) => !muted && console.info(...s("#888", ...args)),
      warn: (...args: any[]) => !muted && console.warn(...s("#888", ...args)),
      error: (...args: any[]) => console.error(...s("#f88", ...args)),
      group: (...args: any[]) => { if (!muted) { console.groupCollapsed(...s("#888", ...args)); isGrouped = true; } },
      groupEnd: () => { if (!muted) { console.groupEnd(); isGrouped = false } },
      mute() {
        muted = true;
      },
      unmute() {
        muted = false;
      }

    }
  }
})();


export function withSubComponents<A, B extends Record<string, any>>(
  component: A,
  subcomponents: B
): A & B {
  Object.keys(subcomponents).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any)[key] = (subcomponents as any)[key];
  });
  return component as A & B;
}

export function humanizeNumber(number: number): string {
  const suffixes = ["", "K", "M", "B", "T"];
  if (number < 1000) {
    return number.toString();
  }
  const numLength = Math.floor(Math.log10(number)) + 1;
  const baseIndex = Math.floor((numLength - 1) / 3);
  const base = Math.pow(10, baseIndex * 3);
  const rounded = Math.round(number / base * 10) / 10;
  return rounded + suffixes[baseIndex];
}

export function humanizeDuration(durationInMilliseconds: number) {
  const millisecondsPerSecond = 1000;
  const millisecondsPerMinute = 60000;
  const millisecondsPerHour = 3600000;
  const millisecondsPerDay = 86400000;

  let days = Math.floor(durationInMilliseconds / millisecondsPerDay);
  let hours = Math.floor((durationInMilliseconds % millisecondsPerDay) / millisecondsPerHour);
  let minutes = Math.floor((durationInMilliseconds % millisecondsPerHour) / millisecondsPerMinute);
  let seconds = Math.floor((durationInMilliseconds % millisecondsPerMinute) / millisecondsPerSecond);

  let durationString = '';

  if (days > 0) {
    durationString += days + 'd ';
  }
  if (hours > 0) {
    durationString += hours + 'h ';
  }
  if (minutes > 0) {
    durationString += minutes + 'm ';
  }
  if (seconds > 0 || durationString === '') {
    durationString += seconds + 's';
  }

  return durationString.trim();
}
export function debounceAsyncFunction<T extends any[], R>(func: (...args: T) => Promise<R>): (...args: T) => Promise<R> {
  let currentPromise: Promise<R> | null = null;
  let nextArgs: T | null = null;
  let resolveNext: ((result: R) => void) | null = null;

  const debouncedFunction = async (...args: T): Promise<R> => {
    if (currentPromise) {
      // Store the latest arguments and create a new promise to resolve them later
      nextArgs = args;
      return new Promise<R>((resolve) => {
        resolveNext = resolve;
      });
    } else {
      // Execute the function immediately
      try {
        currentPromise = func(...args);
        const result = await currentPromise;
        return result;
      } finally {
        currentPromise = null;
        // If there are stored arguments, call the function again with the latest arguments
        if (nextArgs) {
          const argsToUse = nextArgs;
          const resolver = resolveNext;
          nextArgs = null;
          resolveNext = null;
          resolver!(await debouncedFunction(...argsToUse));
        }
      }
    }
  };

  return debouncedFunction;
}

export function withArgsChangeOnly<T extends any[], R>(func: (...args: T) => R): (...args: T) => R {
  let lastArgs: T | undefined = undefined;
  let lastResult: R;

  return (...args: T): R => {
    // Check if arguments are the same as last call
    if (lastArgs && args.length === lastArgs.length && args.every((val, index) => val === lastArgs?.[index])) {
      return lastResult; // Return cached result if arguments haven't changed
    }

    // Call the function with new arguments
    lastResult = func(...args);
    lastArgs = args; // Update stored arguments
    return lastResult; // Return new result
  };
}

