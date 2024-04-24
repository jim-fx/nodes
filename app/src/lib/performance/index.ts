import { readable, type Readable } from "svelte/store";

export type PerformanceData = {
  total: Record<string, number>;
  runs: Record<string, number[]>[];
}
export interface PerformanceStore extends Readable<PerformanceData> {
  startRun(): void;
  stopRun(): void;
  addPoint(name: string, value?: number): void;
  get: () => PerformanceData;
}

export function createPerformanceStore(): PerformanceStore {

  let data: PerformanceData = { total: {}, runs: [] };

  let currentRun: Record<string, number[]> | undefined;

  let set: (v: PerformanceData) => void;

  const { subscribe } = readable<PerformanceData>({ total: {}, runs: [] }, (_set) => {
    set = _set;
  });

  function startRun() {
    currentRun = {};
  }

  function stopRun() {
    if (currentRun) {
      // Calculate total
      Object.keys(currentRun).forEach((name) => {
        if (!currentRun?.[name]?.length) return;
        let runTotal = currentRun[name].reduce((a, b) => a + b, 0) / currentRun[name].length;
        if (!data.total[name]) {
          data.total[name] = runTotal;
        } else {
          data.total[name] = (data.total[name] + runTotal) / 2;
        }
      });

      data.runs.push(currentRun);
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

  return {
    subscribe,
    startRun,
    stopRun,
    addPoint,
    get
  }
}

export { default as PerformanceViewer } from "./PerformanceViewer.svelte";
