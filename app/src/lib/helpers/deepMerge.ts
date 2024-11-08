export function isObject(item: Record<string, unknown> | unknown): item is Record<string, unknown> {
  return (typeof item === 'object' && !Array.isArray(item));
}

type Object = Record<string, unknown>;

export function mergeDeep<T extends Object>(target: T, ...sources: Object[]): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source === undefined) return target;
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        if (isObject(target[key])) mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}
