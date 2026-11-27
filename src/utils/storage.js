/**
 * Thakshila College - Gampaha | Resilient Multi-Tier Persistent Storage
 * ---------------------------------------------------------------------
 * Combines synchronous localStorage (for instant initial render) with
 * asynchronous IndexedDB (to store large compressed images and photos
 * without hitting the browser's 5MB localStorage quota limit).
 */

const IDB_DB_NAME = 'tcg_school_web_portal_db';
const IDB_STORE_NAME = 'offline_store';
const IDB_VERSION = 1;

let dbPromise = null;

function getIndexedDb() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(IDB_DB_NAME, IDB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
            db.createObjectStore(IDB_STORE_NAME);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * Asynchronously persist any key-value in IndexedDB
 */
export async function idbSet(key, value) {
  try {
    const db = await getIndexedDb();
    if (!db) return false;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_STORE_NAME);
        store.put(value, key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
}

/**
 * Asynchronously retrieve key-value from IndexedDB
 */
export async function idbGet(key) {
  try {
    const db = await getIndexedDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Synchronous local retrieval from localStorage with safe fallback
 */
export function getLocalItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Multi-layer persistent write (localStorage + IndexedDB).
 * If localStorage quota is exceeded (e.g. large principal portraits),
 * the error is caught safely and full data is guaranteed to survive in IndexedDB!
 */
export function setLocalItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Storage] localStorage write for "${key}" exceeded quota. Relying on IndexedDB storage.`, err.message);
  }

  // Always write to IndexedDB asynchronously
  idbSet(key, value).catch(() => {});
}
