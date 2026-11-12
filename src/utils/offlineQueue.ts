import type { TaskStatus } from '../types';

export type OfflineSyncErrorCode =
  | 'NETWORK'
  | 'VALIDATION'
  | 'AUTH_EXPIRED'
  | 'ACCOUNT_DISABLED'
  | 'PROJECT_UNAVAILABLE'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export type SyncErrorCode = OfflineSyncErrorCode;

export interface OfflineQueuedWorkLog {
  clientId: string;
  id?: string;
  userId: string;
  projectId: string;
  projectName: string;
  projectColor?: string;
  taskName: string;
  taskDescription: string;
  hours: number;
  date: string;
  status: string;
  taskStatus: TaskStatus | string;
  timesheetStatus?: string;
  tickets: { id?: string; ticketNumber: string; ticketUrl?: string; provider?: string }[];
  createdAt: string;
  updatedAt?: string;
  isOfflineQueued?: boolean;
  syncState: 'waiting' | 'syncing' | 'failed';
  syncError?: string;
  syncErrorCode?: OfflineSyncErrorCode;
  retryCount?: number;
  lastAttemptAt?: string;
  lastSyncAttemptAt?: string;
}

export type QueuedWorkLogEntry = OfflineQueuedWorkLog;

const DB_NAME = 'timeflow_offline_db';
const DB_VERSION = 1;
const STORE_QUEUED_LOGS = 'queued_work_logs';
const STORE_CACHED_PROJECTS = 'cached_projects';
const STORE_CACHED_LOGS = 'cached_work_logs';

export const OFFLINE_QUEUE_EVENT = 'timeflow:offline-queue-change';
export const OFFLINE_MODE_EVENT = 'timeflow:network-change';
const SIMULATED_OFFLINE_KEY = 'timeflow_simulated_offline';

export const generateClientId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getSimulatedOffline = (): boolean => {
  try {
    return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const isSimulatedOffline = getSimulatedOffline;

export const setSimulatedOffline = (offline: boolean): void => {
  try {
    if (offline) {
      localStorage.setItem(SIMULATED_OFFLINE_KEY, 'true');
    } else {
      localStorage.removeItem(SIMULATED_OFFLINE_KEY);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(OFFLINE_MODE_EVENT, { detail: { offline } }));
    }
  } catch {
    // ignore storage errors
  }
};

export const isNetworkOnline = (): boolean => {
  if (getSimulatedOffline()) return false;
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

const notifyQueueChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT));
  }
};

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_QUEUED_LOGS)) {
        const store = db.createObjectStore(STORE_QUEUED_LOGS, { keyPath: 'clientId' });
        store.createIndex('by_user', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CACHED_PROJECTS)) {
        db.createObjectStore(STORE_CACHED_PROJECTS, { keyPath: 'userId' });
      }
      if (!db.objectStoreNames.contains(STORE_CACHED_LOGS)) {
        db.createObjectStore(STORE_CACHED_LOGS, { keyPath: 'userId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });

export const getQueuedWorkLogsForUser = async (
  userId: string
): Promise<OfflineQueuedWorkLog[]> => {
  if (!userId) return [];
  try {
    const db = await openDatabase();
    return await new Promise<OfflineQueuedWorkLog[]>((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUED_LOGS, 'readonly');
      const store = tx.objectStore(STORE_QUEUED_LOGS);
      const index = store.index('by_user');
      const req = index.getAll(IDBKeyRange.only(String(userId)));
      req.onsuccess = () => {
        const items = Array.isArray(req.result) ? (req.result as OfflineQueuedWorkLog[]) : [];
        items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};

export const upsertQueuedWorkLog = async (
  entry: OfflineQueuedWorkLog
): Promise<OfflineQueuedWorkLog> => {
  const normalized: OfflineQueuedWorkLog = {
    ...entry,
    id: entry.clientId,
    isOfflineQueued: true,
    timesheetStatus:
      entry.syncState === 'failed'
        ? 'Sync Failed'
        : entry.syncState === 'syncing'
          ? 'Syncing…'
          : 'Waiting to sync',
  };
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUED_LOGS, 'readwrite');
    const store = tx.objectStore(STORE_QUEUED_LOGS);
    const req = store.put(normalized);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
  notifyQueueChanged();
  return normalized;
};

export const updateQueuedWorkLogSyncState = async (
  clientId: string,
  userId: string,
  patch: Partial<
    Pick<
      OfflineQueuedWorkLog,
      'syncState' | 'syncError' | 'syncErrorCode' | 'lastAttemptAt' | 'lastSyncAttemptAt'
    >
  >
): Promise<void> => {
  if (!clientId || !userId) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUED_LOGS, 'readwrite');
    const store = tx.objectStore(STORE_QUEUED_LOGS);
    const getReq = store.get(clientId);
    getReq.onsuccess = () => {
      const existing = getReq.result as OfflineQueuedWorkLog | undefined;
      if (!existing || String(existing.userId) !== String(userId)) {
        resolve();
        return;
      }
      const nextState = patch.syncState ?? existing.syncState;
      const updated: OfflineQueuedWorkLog = {
        ...existing,
        ...patch,
        syncState: nextState,
        timesheetStatus:
          nextState === 'failed'
            ? 'Sync Failed'
            : nextState === 'syncing'
              ? 'Syncing…'
              : 'Waiting to sync',
      };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  notifyQueueChanged();
};

export const removeQueuedWorkLog = async (
  clientId: string,
  userId?: string
): Promise<void> => {
  if (!clientId) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUED_LOGS, 'readwrite');
    const store = tx.objectStore(STORE_QUEUED_LOGS);
    if (!userId) {
      const delReq = store.delete(clientId);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
      return;
    }
    const getReq = store.get(clientId);
    getReq.onsuccess = () => {
      const existing = getReq.result as OfflineQueuedWorkLog | undefined;
      if (!existing || String(existing.userId) !== String(userId)) {
        resolve();
        return;
      }
      const delReq = store.delete(clientId);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
  notifyQueueChanged();
};

export const cacheUserProjects = async (
  userId: string,
  projects: unknown[]
): Promise<void> => {
  if (!userId || !Array.isArray(projects)) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CACHED_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_CACHED_PROJECTS);
      const req = store.put({
        userId: String(userId),
        projects,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore IndexedDB cache write failure
  }
};

export const getCachedUserProjects = async <T = any>(
  userId: string
): Promise<T[]> => {
  if (!userId) return [];
  try {
    const db = await openDatabase();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(STORE_CACHED_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_CACHED_PROJECTS);
      const req = store.get(String(userId));
      req.onsuccess = () => {
        const record = req.result as { projects?: T[] } | undefined;
        resolve(Array.isArray(record?.projects) ? record!.projects : []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};

export const cacheUserWorkLogs = async (
  userId: string,
  logs: unknown[]
): Promise<void> => {
  if (!userId || !Array.isArray(logs)) return;
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CACHED_LOGS, 'readwrite');
      const store = tx.objectStore(STORE_CACHED_LOGS);
      const req = store.put({
        userId: String(userId),
        logs,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // ignore IndexedDB cache write failure
  }
};

export const getCachedUserWorkLogs = async <T = any>(
  userId: string
): Promise<T[]> => {
  if (!userId) return [];
  try {
    const db = await openDatabase();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(STORE_CACHED_LOGS, 'readonly');
      const store = tx.objectStore(STORE_CACHED_LOGS);
      const req = store.get(String(userId));
      req.onsuccess = () => {
        const record = req.result as { logs?: T[] } | undefined;
        resolve(Array.isArray(record?.logs) ? record!.logs : []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
};
