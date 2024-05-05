import type { AsyncCache } from '@nodes/types';
import { openDB, type IDBPDatabase } from 'idb';

export class IndexDBCache implements AsyncCache<ArrayBuffer> {

  size: number = 100;

  db: Promise<IDBPDatabase<ArrayBuffer>>;
  private _cache = new Map<string, ArrayBuffer>();

  constructor(id: string) {
    this.db = openDB<ArrayBuffer>('cache/' + id, 1, {
      upgrade(db) {
        db.createObjectStore('keyval');
      },
    });
  }

  async get(key: string) {
    let res = this._cache.get(key);
    if (!res) {
      res = await (await this.db).get('keyval', key);
    }
    if (res) {
      this._cache.set(key, res);
    }
    return res;
  }
  async set(key: string, value: ArrayBuffer) {
    this._cache.set(key, value);
    const db = await this.db;
    await db.put('keyval', value, key);
  }
  clear() {
    this.db.then(db => db.clear('keyval'));
  }

}
