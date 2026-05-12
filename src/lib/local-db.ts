import type { AppSettings, Lead } from "@/types/lead";

type StoredValue<T> = {
  key: string;
  value: T;
};

const DB_NAME = "leadmate-db";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalValue<T>(key: string): Promise<T | undefined> {
  const database = await openDb();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(key);
    request.onsuccess = () => resolve((request.result as StoredValue<T> | undefined)?.value);
    request.onerror = () => reject(request.error);
  });
}

export async function setLocalValue<T>(key: string, value: T): Promise<void> {
  const database = await openDb();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ key, value });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const leadStore = {
  get: () => getLocalValue<Lead[]>("leads"),
  set: (leads: Lead[]) => setLocalValue("leads", leads),
};

export const settingsStore = {
  get: () => getLocalValue<AppSettings>("settings"),
  set: (settings: AppSettings) => setLocalValue("settings", settings),
};
