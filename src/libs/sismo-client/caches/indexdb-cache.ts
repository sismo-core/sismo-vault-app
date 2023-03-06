import { Cache } from "./cache";
import { openDB, IDBPDatabase } from "idb";
import * as Sentry from "@sentry/react";

const EXPIRATION_DURATION = 1000 * 60 * 60 * 24 * 100;

export class IndexDbCache extends Cache {
  private localCache: Map<string, string>;
  private dbPromise: Promise<IDBPDatabase<unknown>>;

  constructor() {
    super();
    this.localCache = new Map();
    if (!window) {
      console.error("IndexedDB only available in browsers");
      return;
    }
    if (!("indexedDB" in window)) {
      console.error("This browser doesn't support IndexedDB");
      return;
    }
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBPDatabase<unknown>> {
    const db = await openDB("cache", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("keyValue")) {
          db.createObjectStore("keyValue");
        }
        if (!db.objectStoreNames.contains("expiration")) {
          db.createObjectStore("expiration");
        }
      },
    });
    await this.cleanDB(db);
    return db;
  }

  private async cleanDB(db: IDBPDatabase) {
    if (this.dbPromise) {
      try {
        const [allValues, allKeys] = await Promise.all([
          db.getAll("expiration"),
          db.getAllKeys("expiration"),
        ]);
        const expiredKeys = [];
        for (let [index, expiration] of allValues.entries()) {
          if (expiration < Date.now()) {
            expiredKeys.push(allKeys[index]);
          }
        }
        const deletePromises = [];
        for (let expiredKey of expiredKeys) {
          deletePromises.push(db.delete("keyValue", expiredKey));
          deletePromises.push(db.delete("expiration", expiredKey));
        }
        await Promise.all(deletePromises);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    }
  }

  private async updateExpirationDate(key: string) {
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        const res = await db.put(
          "expiration",
          Date.now() + EXPIRATION_DURATION,
          key
        );
        return res;
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    }
  }

  public async get(key: string): Promise<any> {
    if (this.localCache.has(key)) return this.localCache.get(key);
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        const res = await db.get("keyValue", key);
        this.localCache.set(key, res);
        this.updateExpirationDate(key);
        return res;
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    }
    return this.localCache.get(key);
  }

  public async set(key: string, value: any): Promise<void> {
    this.localCache.set(key, value);
    if (this.dbPromise) {
      try {
        const db = await this.dbPromise;
        await db.put("keyValue", value, key);
        this.updateExpirationDate(key);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    }
  }
}
