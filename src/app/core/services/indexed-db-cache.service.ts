import { Injectable } from '@angular/core'
import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'easybuffet-cache-v1'
const DB_VERSION = 1
const STORE = 'entries'

/**
 * @description - Wrapper around IndexedDB for TTL-based key/value entries (org-scoped keys from callers).
 */
export interface TimestampedCacheEntry<T> {
  value: T
  storedAt: number
  ttlMs: number
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDbCacheService {
  private dbPromise: Promise<IDBPDatabase> | null = null

  /**
   * @Function - getDb
   * @description - Opens the versioned database, creating the object store on upgrade
   * @returns - Promise<IDBPDatabase>
   */
  private getDb(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE)
          }
        }
      })
    }
    return this.dbPromise
  }

  /**
   * @Function - isStale
   * @description - True when the entry is older than its TTL
   * @param - entry: TimestampedCacheEntry<T>
   * @returns - boolean
   */
  isStale<T>(entry: TimestampedCacheEntry<T>): boolean {
    return Date.now() - entry.storedAt > entry.ttlMs
  }

  /**
   * @Function - get
   * @description - Reads a timestamped entry or null if missing
   * @param - key: string
   * @returns - Promise<TimestampedCacheEntry<T> | null>
   */
  async get<T>(key: string): Promise<TimestampedCacheEntry<T> | null> {
    const db = await this.getDb()
    const raw = await db.get(STORE, key)
    if (raw == null) {
      return null
    }
    return raw as TimestampedCacheEntry<T>
  }

  /**
   * @Function - set
   * @description - Writes value with TTL metadata
   * @param - key: string
   * @param - value: T
   * @param - ttlMs: number
   * @returns - Promise<void>
   */
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const db = await this.getDb()
    const entry: TimestampedCacheEntry<T> = {
      value,
      storedAt: Date.now(),
      ttlMs
    }
    await db.put(STORE, entry, key)
  }

  /**
   * @Function - delete
   * @description - Removes a single key
   * @param - key: string
   * @returns - Promise<void>
   */
  async delete(key: string): Promise<void> {
    const db = await this.getDb()
    await db.delete(STORE, key)
  }

  /**
   * @Function - deleteByPrefix
   * @description - Removes all string keys starting with the prefix (e.g. org scope)
   * @param - prefix: string
   * @returns - Promise<void>
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    const db = await this.getDb()
    const keys = await db.getAllKeys(STORE)
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    for (const k of keys) {
      if (typeof k === 'string' && k.startsWith(prefix)) {
        store.delete(k)
      }
    }
    await tx.done
  }

  /**
   * @Function - clearAll
   * @description - Clears the entire cache store (e.g. on logout)
   * @returns - Promise<void>
   */
  async clearAll(): Promise<void> {
    const db = await this.getDb()
    await db.clear(STORE)
  }
}
