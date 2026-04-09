"use client";

import type {
  BaselineConfig,
  MoneyballDatasetSummary,
  MoneyballPercentileSnapshot,
  MoneyballRow,
} from "./types";
import {
  MONEYBALL_DB_NAME,
  MONEYBALL_DB_VERSION,
  STORE_BASELINE,
  STORE_BASELINE_IMPORTS,
  STORE_COMPUTED,
  STORE_CONFIG,
  STORE_PLAYER_VIEW_IMPORT,
} from "./storage-keys";

type ImportRecord = MoneyballDatasetSummary & { rows: MoneyballRow[] };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(MONEYBALL_DB_NAME, MONEYBALL_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_BASELINE_IMPORTS)) {
        db.createObjectStore(STORE_BASELINE_IMPORTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PLAYER_VIEW_IMPORT)) {
        db.createObjectStore(STORE_PLAYER_VIEW_IMPORT, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_BASELINE)) {
        db.createObjectStore(STORE_BASELINE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_COMPUTED)) {
        db.createObjectStore(STORE_COMPUTED, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: "id" });
      }
    };
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
  });
}

async function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  return tx<T[]>(storeName, "readonly", (store) => store.getAll());
}

export const moneyballDb = {
  async saveBaselineImport(record: ImportRecord) {
    await tx(STORE_BASELINE_IMPORTS, "readwrite", (store) => store.put(record));
  },

  async listBaselineImports(): Promise<ImportRecord[]> {
    return getAll<ImportRecord>(STORE_BASELINE_IMPORTS);
  },

  async clearBaselineImports() {
    await tx(STORE_BASELINE_IMPORTS, "readwrite", (store) => store.clear());
  },

  async savePlayerViewImport(record: ImportRecord) {
    await tx(STORE_PLAYER_VIEW_IMPORT, "readwrite", (store) =>
      store.put({ ...record, id: "active-player-view" }),
    );
  },

  async getPlayerViewImport(): Promise<ImportRecord | null> {
    const raw = await tx<ImportRecord | undefined>(
      STORE_PLAYER_VIEW_IMPORT,
      "readonly",
      (store) => store.get("active-player-view"),
    );
    return raw ?? null;
  },

  async clearPlayerViewImport() {
    await tx(STORE_PLAYER_VIEW_IMPORT, "readwrite", (store) => store.clear());
  },

  async saveBaseline(config: BaselineConfig) {
    await tx(STORE_BASELINE, "readwrite", (store) =>
      store.put({ id: "active", ...config }),
    );
  },

  async getBaseline(): Promise<BaselineConfig | null> {
    const raw = await tx<{ id: string } & BaselineConfig | undefined>(
      STORE_BASELINE,
      "readonly",
      (store) => store.get("active"),
    );
    if (!raw) return null;
    return {
      minimumMinutes: raw.minimumMinutes ?? 0,
    };
  },

  async saveComputed(snapshot: MoneyballPercentileSnapshot) {
    await tx(STORE_COMPUTED, "readwrite", (store) => store.put(snapshot));
  },

  async clearComputed() {
    await tx(STORE_COMPUTED, "readwrite", (store) => store.clear());
  },

  async getLatestComputed(): Promise<MoneyballPercentileSnapshot | null> {
    const all = await getAll<MoneyballPercentileSnapshot>(STORE_COMPUTED);
    if (all.length === 0) return null;
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  },

  async saveConfig<T>(id: string, value: T) {
    await tx(STORE_CONFIG, "readwrite", (store) => store.put({ id, value }));
  },

  async loadConfig<T>(id: string): Promise<T | null> {
    const raw = await tx<{ id: string; value: T } | undefined>(
      STORE_CONFIG,
      "readonly",
      (store) => store.get(id),
    );
    return raw?.value ?? null;
  },
};
