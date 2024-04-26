import { readable, type Readable } from "svelte/store";

export type PerformanceData = Record<string, number[]>[];

export interface PerformanceStore extends Readable<PerformanceData> {
  startRun(): void;
  stopRun(): void;
  addPoint(name: string, value?: number): void;
  mergeData(data: PerformanceData[number]): void;
  get: () => PerformanceData;
}

export function createPerformanceStore(): PerformanceStore {

  let data: PerformanceData = [];

  let currentRun: Record<string, number[]> | undefined;

  let set: (v: PerformanceData) => void;

  const { subscribe } = readable<PerformanceData>([], (_set) => {
    set = _set;
  });

  function startRun() {
    currentRun = {};
  }

  function stopRun() {
    if (currentRun) {
      data.push(currentRun);
      data = data.slice(-100);
      currentRun = undefined;
      if (set) set(data);
    }
  }

  function addPoint(name: string, value: number) {
    if (!currentRun) return;
    currentRun[name] = currentRun[name] || [];
    currentRun[name].push(value);
  }

  function get() {
    return data;
  }

  function mergeData(newData: PerformanceData[number]) {

    let r = currentRun;
    if (!r) return;

    Object.keys(newData).forEach((name) => {
      if (name in r) {
        r[name].push(...newData[name]);
      } else {
        r[name] = newData[name];
      }
    });
  }

  return {
    subscribe,
    startRun,
    stopRun,
    addPoint,
    mergeData,
    get
  }
}
