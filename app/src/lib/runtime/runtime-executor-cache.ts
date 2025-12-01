import { type SyncCache } from "@nodarium/types";

export class MemoryRuntimeCache implements SyncCache {

  private cache: [string, unknown][] = [];
  size = 50;

  get<T>(key: string): T | undefined {
    return this.cache.find(([k]) => k === key)?.[1] as T;
  }
  set<T>(key: string, value: T): void {
    this.cache.push([key, value]);
    this.cache = this.cache.slice(-this.size);
  }
  clear(): void {
    this.cache = [];
  }

}
