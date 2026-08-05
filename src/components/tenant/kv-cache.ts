/**
 * Dependency-free tenant-brand cache backed by native IndexedDB.
 *
 * shared-ui-lib has no Dexie (or any other IndexedDB wrapper) dependency, so this is a small
 * native implementation — just enough to cache-first paint tenant branding and survive offline
 * reloads / weak wifi, matching the shape pos-ui's Dexie-backed `kv-cache.ts` already used
 * (`kvKey` / `getKV` / `setKV`) before this module existed.
 *
 * Host apps that already have a richer cache for OTHER datasets too (pos-ui's Dexie `kvCache`
 * table backs POS settings, tenders, categories, outlet info, recent orders, etc. — not just
 * tenant branding) should NOT be forced onto a second, competing cache implementation just for
 * this module. Instead they can construct a `TenantCacheAdapter` that wraps their own
 * get/set and pass it into `fetchTenantBySlug` / `TenantBrandingProvider`. Apps with no
 * pre-existing cache (inventory-ui, ordering-frontend) can just use `defaultTenantCacheAdapter`.
 */

/** Minimal interface `fetchTenantBySlug` needs from a cache — swap in any backing store. */
export interface TenantCacheAdapter {
  getKV<T = unknown>(key: string): Promise<T | undefined>;
  setKV(key: string, tenantId: string, data: unknown): Promise<void>;
}

/** Namespaces a cache key per dataset + tenant (and outlet, where the dataset is outlet-scoped). */
export function kvKey(dataset: string, tenantId: string, outletId?: string): string {
  return outletId ? `${dataset}:${tenantId}:${outletId}` : `${dataset}:${tenantId}`;
}

const DB_NAME = 'shared-ui-lib-kv-cache';
const STORE_NAME = 'kv';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function nativeGetKV<T = unknown>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result?.data as T | undefined) ?? undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function nativeSetKV(key: string, tenantId: string, data: unknown): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ key, tenant_id: tenantId, data, cached_at: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Cache writes must never break the caller.
  }
}

/** Default cache adapter — native IndexedDB, zero extra dependencies. */
export const defaultTenantCacheAdapter: TenantCacheAdapter = {
  getKV: nativeGetKV,
  setKV: nativeSetKV,
};
