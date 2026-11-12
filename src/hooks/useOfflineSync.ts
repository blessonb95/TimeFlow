import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { workLogsApi } from '../api/workLogs';
import {
  getQueuedWorkLogsForUser,
  getSimulatedOffline,
  isNetworkOnline,
  removeQueuedWorkLog,
  setSimulatedOffline,
  upsertQueuedWorkLog,
  type OfflineSyncErrorCode,
  type QueuedWorkLogEntry,
} from '../utils/offlineQueue';

const activeSyncPromises = new Map<string, Promise<{ synced: number; failed: number }>>();

function classifySyncError(err: any): {
  isTransientNetworkError: boolean;
  code: OfflineSyncErrorCode;
  message: string;
} {
  if (!err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK') {
    return {
      isTransientNetworkError: true,
      code: 'NETWORK',
      message: 'Network connection lost while syncing. Will retry automatically when back online.',
    };
  }

  const status = Number(err.response.status);
  const serverCode = String(err.response.data?.code || '');
  const serverMsg = String(err.response.data?.error || err.response.data?.message || '');

  if (status === 401) {
    return {
      isTransientNetworkError: false,
      code: 'AUTH_EXPIRED',
      message:
        serverMsg ||
        'Your authentication session has expired. Please sign in again to sync your queued work logs.',
    };
  }

  if (status === 403) {
    return {
      isTransientNetworkError: false,
      code: 'ACCOUNT_DISABLED',
      message:
        serverMsg ||
        'Your account is disabled or lacks permission to log time on this project. Contact your administrator.',
    };
  }

  if (serverCode === 'PROJECT_UNAVAILABLE' || /project.*(unavailable|deleted|not found)/i.test(serverMsg)) {
    return {
      isTransientNetworkError: false,
      code: 'PROJECT_UNAVAILABLE',
      message:
        serverMsg ||
        'The selected project was deleted or is no longer available. Edit this entry and choose an active project.',
    };
  }

  if (status === 400 || status === 422) {
    return {
      isTransientNetworkError: false,
      code: 'VALIDATION',
      message:
        serverMsg ||
        'Validation failed on the server. Please edit this entry to fix any invalid fields and retry.',
    };
  }

  return {
    isTransientNetworkError: false,
    code: 'UNKNOWN',
    message: serverMsg || `Sync failed (${status}). Click Retry to try again.`,
  };
}

export function useOfflineSync() {
  const { currentUser } = useAppStore();
  const userId = currentUser?.id || localStorage.getItem('active_user_id') || 'guest-demo-user';
  const qc = useQueryClient();

  const [isOnline, setIsOnline] = useState<boolean>(() => isNetworkOnline());
  const [simulatedOffline, setSimulatedOfflineState] = useState<boolean>(() => getSimulatedOffline());
  const [queuedLogs, setQueuedLogs] = useState<QueuedWorkLogEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedCount, setLastSyncedCount] = useState<number>(0);

  const refreshQueue = useCallback(async () => {
    if (!userId) {
      setQueuedLogs([]);
      return [];
    }
    const items = await getQueuedWorkLogsForUser(userId);
    setQueuedLogs(items);
    return items;
  }, [userId]);

  const syncEntries = useCallback(
    async (options?: { includeFailed?: boolean; targetClientId?: string }) => {
      if (!userId || !isNetworkOnline()) {
        return { synced: 0, failed: 0 };
      }

      const existingPromise = activeSyncPromises.get(userId);
      if (existingPromise && !options?.targetClientId) {
        return existingPromise;
      }

      const run = (async () => {
        const allUserEntries = await getQueuedWorkLogsForUser(userId);
        const candidates = allUserEntries.filter((entry) => {
          if (options?.targetClientId) {
            return entry.clientId === options.targetClientId;
          }
          if (options?.includeFailed) {
            return entry.syncState === 'waiting' || entry.syncState === 'failed';
          }
          return entry.syncState === 'waiting';
        });

        if (candidates.length === 0) {
          return { synced: 0, failed: 0 };
        }

        setIsSyncing(true);
        let synced = 0;
        let failed = 0;

        // Sync oldest first so chronological order is preserved
        const ordered = [...candidates].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

        for (const entry of ordered) {
          if (!isNetworkOnline()) break;

          await upsertQueuedWorkLog({
            ...entry,
            syncState: 'syncing',
            lastSyncAttemptAt: new Date().toISOString(),
          });

          try {
            const confirmed = await workLogsApi.create(
              {
                clientId: entry.clientId,
                projectId: entry.projectId,
                taskName: entry.taskName,
                taskDescription: entry.taskDescription,
                hours: entry.hours,
                date: entry.date,
                status: entry.status,
                taskStatus: entry.taskStatus,
                tickets: entry.tickets,
              },
              { isBackgroundSync: true }
            );

            // Remove from IndexedDB ONLY after server confirmation
            if (confirmed && confirmed.id) {
              await removeQueuedWorkLog(entry.clientId);
              synced += 1;
            }
          } catch (err: any) {
            const diagnosis = classifySyncError(err);
            await upsertQueuedWorkLog({
              ...entry,
              syncState: diagnosis.isTransientNetworkError ? 'waiting' : 'failed',
              syncError: diagnosis.isTransientNetworkError ? undefined : diagnosis.message,
              syncErrorCode: diagnosis.isTransientNetworkError ? undefined : diagnosis.code,
              retryCount: (entry.retryCount || 0) + 1,
              lastSyncAttemptAt: new Date().toISOString(),
            });
            if (!diagnosis.isTransientNetworkError) {
              failed += 1;
            }
          }
        }

        setIsSyncing(false);
        await refreshQueue();

        if (synced > 0) {
          setLastSyncedCount(synced);
          qc.invalidateQueries({ queryKey: ['workLogs'] });
          qc.invalidateQueries({ queryKey: ['projects'] });
          qc.invalidateQueries({ queryKey: ['project'] });
          qc.invalidateQueries({ queryKey: ['dashboard'] });
          qc.invalidateQueries({ queryKey: ['reports'] });
        }

        return { synced, failed };
      })();

      activeSyncPromises.set(userId, run);
      try {
        return await run;
      } finally {
        activeSyncPromises.delete(userId);
      }
    },
    [qc, refreshQueue, userId]
  );

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    const handleNetworkChange = () => {
      const online = isNetworkOnline();
      setIsOnline(online);
      setSimulatedOfflineState(getSimulatedOffline());
      if (online) {
        syncEntries({ includeFailed: false });
      }
    };

    const handleQueueChange = () => {
      refreshQueue();
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('timeflow:network-change', handleNetworkChange);
    window.addEventListener('timeflow:offline-queue-change', handleQueueChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('timeflow:network-change', handleNetworkChange);
      window.removeEventListener('timeflow:offline-queue-change', handleQueueChange);
    };
  }, [refreshQueue, syncEntries]);

  // Trigger initial sync check if online and waiting entries exist
  useEffect(() => {
    if (isOnline && queuedLogs.some((item) => item.syncState === 'waiting') && !isSyncing) {
      syncEntries({ includeFailed: false });
    }
  }, [isOnline, isSyncing, queuedLogs, syncEntries]);

  const syncNow = useCallback(async () => {
    return syncEntries({ includeFailed: true });
  }, [syncEntries]);

  const retryEntry = useCallback(
    async (clientId: string) => {
      return syncEntries({ includeFailed: true, targetClientId: clientId });
    },
    [syncEntries]
  );

  const discardEntry = useCallback(
    async (clientId: string) => {
      await removeQueuedWorkLog(clientId);
      await refreshQueue();
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
    [qc, refreshQueue]
  );

  const toggleSimulatedOffline = useCallback(
    (forceValue?: boolean) => {
      const next = typeof forceValue === 'boolean' ? forceValue : !getSimulatedOffline();
      setSimulatedOffline(next);
      setSimulatedOfflineState(next);
      setIsOnline(isNetworkOnline());
    },
    []
  );

  const waitingCount = queuedLogs.filter(
    (item) => item.syncState === 'waiting' || item.syncState === 'syncing'
  ).length;
  const failedCount = queuedLogs.filter((item) => item.syncState === 'failed').length;

  return {
    isOnline,
    simulatedOffline,
    toggleSimulatedOffline,
    queuedLogs,
    waitingCount,
    failedCount,
    totalUnsyncedCount: queuedLogs.length,
    isSyncing,
    lastSyncedCount,
    clearLastSyncedCount: () => setLastSyncedCount(0),
    syncNow,
    retryEntry,
    discardEntry,
    refreshQueue,
  };
}

