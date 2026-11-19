import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workLogsApi, type CreateWorkLogPayload } from '../api/workLogs';
import { useAppStore } from '../store/useAppStore';
import {
  cacheUserWorkLogs,
  enqueueWorkLogMutation,
  generateClientId,
  getCachedUserProjects,
  getCachedUserWorkLogs,
  getQueuedMutationsForUser,
  getQueuedWorkLogsForUser,
  isNetworkOnline,
  upsertQueuedWorkLog,
  type QueuedWorkLogEntry,
  type WorkLogUpdatePatch,
} from '../utils/offlineQueue';

const getActiveUserId = (storeUserId?: string): string => {
  if (storeUserId) return storeUserId;
  try {
    return localStorage.getItem('active_user_id') || 'guest-demo-user';
  } catch {
    return 'guest-demo-user';
  }
};

function mapQueuedToWorkLogItem(entry: QueuedWorkLogEntry) {
  const statusLabel =
    entry.syncState === 'failed'
      ? 'Sync Failed'
      : entry.syncState === 'syncing'
      ? 'Syncing…'
      : 'Waiting to sync';

  return {
    id: entry.clientId,
    clientId: entry.clientId,
    userId: entry.userId,
    projectId: entry.projectId,
    projectName: entry.projectName || 'Internal Task',
    projectColor: entry.projectColor || '#2563EB',
    taskName: entry.taskName,
    taskDescription: entry.taskDescription || '',
    hours: entry.hours,
    date: entry.date,
    status: entry.taskStatus || entry.status || 'in-progress',
    taskStatus: entry.taskStatus || entry.status || 'in-progress',
    timesheetStatus: statusLabel,
    isOfflineQueued: true,
    syncState: entry.syncState,
    syncError: entry.syncError,
    syncErrorCode: entry.syncErrorCode,
    linkedTickets: (entry.tickets || []).map((t, idx) => ({
      id: `${entry.clientId}-t-${idx}`,
      ticketNumber: t.ticketNumber,
      provider: t.provider || 'Jira',
    })),
    tickets: (entry.tickets || []).map((t, idx) => ({
      id: `${entry.clientId}-t-${idx}`,
      ticketNumber: t.ticketNumber,
      provider: t.provider || 'Jira',
    })),
  };
}

export const useWorkLogs = (params?: { weekStart?: string; search?: string }) => {
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useQuery({
    queryKey: ['workLogs', userId, params],
    queryFn: async () => {
      let baseLogs: any[] = [];
      try {
        if (!isNetworkOnline()) {
          throw Object.assign(new Error('Offline'), { isOfflineError: true });
        }
        const serverData = await workLogsApi.list(params);
        baseLogs = Array.isArray(serverData)
          ? serverData
          : Array.isArray(serverData?.data)
          ? serverData.data
          : [];
        if (!params?.search && !params?.weekStart) {
          await cacheUserWorkLogs(userId, baseLogs);
        }
      } catch (err: any) {
        const isNetErr = !err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK';
        if (isNetErr) {
          baseLogs = await getCachedUserWorkLogs(userId);
        } else {
          throw err;
        }
      }

      // Overlay offline edits/deletes of logs that already exist on the server
      const mutations = await getQueuedMutationsForUser(userId);
      if (mutations.length > 0) {
        const byId = new Map(mutations.map((m) => [String(m.workLogId), m]));
        const needsProjects = mutations.some((m) => m.patch?.projectId);
        const cachedProjects = needsProjects ? await getCachedUserProjects(userId) : [];
        baseLogs = baseLogs.flatMap((log: any) => {
          const m = byId.get(String(log.id));
          if (!m) return [log];
          const sync = {
            pendingMutation: m.op,
            syncState: m.syncState,
            syncError: m.syncError,
            syncErrorCode: m.syncErrorCode,
          };
          if (m.op === 'delete') {
            // Hide while waiting/syncing; keep visible with the error if the delete was rejected
            return m.syncState === 'failed' ? [{ ...log, ...sync }] : [];
          }
          const patch = m.patch || {};
          const project = patch.projectId
            ? cachedProjects.find((p: any) => p.id === patch.projectId)
            : undefined;
          return [
            {
              ...log,
              ...patch,
              taskStatus: patch.taskStatus ?? log.taskStatus,
              ...(project
                ? { projectName: project.name, projectColor: project.color || log.projectColor }
                : {}),
              ...sync,
            },
          ];
        });
      }

      const queued = await getQueuedWorkLogsForUser(userId);
      const serverIds = new Set(baseLogs.map((item: any) => String(item.id)));
      const mappedQueued = queued
        .filter((q) => !serverIds.has(q.clientId))
        .map(mapQueuedToWorkLogItem);

      let merged = [...mappedQueued, ...baseLogs];

      if (params?.search) {
        const q = params.search.toLowerCase();
        merged = merged.filter(
          (w: any) =>
            String(w.taskName || '').toLowerCase().includes(q) ||
            String(w.projectName || '').toLowerCase().includes(q) ||
            String(w.taskDescription || '').toLowerCase().includes(q)
        );
      }

      return merged;
    },
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
};

export interface CreateWorkLogWithOfflineInput extends CreateWorkLogPayload {
  projectName?: string;
  projectColor?: string;
}

export const useCreateWorkLog = () => {
  const qc = useQueryClient();
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useMutation({
    mutationFn: async (input: CreateWorkLogWithOfflineInput) => {
      const clientId = input.clientId || generateClientId();
      const payload: CreateWorkLogPayload = {
        clientId,
        projectId: input.projectId,
        taskName: input.taskName,
        taskDescription: input.taskDescription,
        hours: input.hours,
        date: input.date,
        status: input.status,
        taskStatus: input.taskStatus,
        tickets: input.tickets,
      };

      const queueLocally = async () => {
        let resolvedProjectName = input.projectName || '';
        let resolvedProjectColor = input.projectColor || '#2563EB';
        if (!resolvedProjectName) {
          if (!input.projectId || input.projectId === 'internal') {
            resolvedProjectName = 'Internal Task';
          } else {
            const cachedProjects = await getCachedUserProjects(userId);
            const match = cachedProjects.find((p: any) => p.id === input.projectId);
            resolvedProjectName = match?.name || 'Project Task';
            resolvedProjectColor = match?.color || '#2563EB';
          }
        }

        const nowIso = new Date().toISOString();
        const entry: QueuedWorkLogEntry = {
          clientId,
          userId,
          projectId: input.projectId || 'internal',
          projectName: resolvedProjectName,
          projectColor: resolvedProjectColor,
          taskName: input.taskName,
          taskDescription: input.taskDescription || '',
          hours: Number(input.hours) || 0,
          date: input.date,
          status: input.status || 'in-progress',
          taskStatus: input.taskStatus || input.status || 'in-progress',
          tickets: input.tickets || [],
          createdAt: nowIso,
          updatedAt: nowIso,
          syncState: 'waiting',
          retryCount: 0,
        };

        await upsertQueuedWorkLog(entry);
        return { ...mapQueuedToWorkLogItem(entry), queuedOffline: true };
      };

      if (!isNetworkOnline()) {
        return queueLocally();
      }

      try {
        const saved = await workLogsApi.create(payload);
        return { ...saved, queuedOffline: false };
      } catch (err: any) {
        const isNetErr = !err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK';
        if (isNetErr) {
          return queueLocally();
        }
        throw err;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workLogs'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

const isNetworkFailure = (err: any) =>
  !err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK';

const invalidateWorkLogQueries = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['workLogs'] });
  qc.invalidateQueries({ queryKey: ['projects'] });
  qc.invalidateQueries({ queryKey: ['project'] });
  qc.invalidateQueries({ queryKey: ['dashboard'] });
  qc.invalidateQueries({ queryKey: ['reports'] });
};

export const useUpdateWorkLog = () => {
  const qc = useQueryClient();
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkLogUpdatePatch }) => {
      // Offline (or connection drops mid-request): keep the edit on the device and sync later
      if (!isNetworkOnline()) {
        await enqueueWorkLogMutation(userId, id, 'update', data);
        return { id, ...data, queuedOffline: true };
      }
      try {
        const saved = await workLogsApi.update(id, data);
        return { ...saved, queuedOffline: false };
      } catch (err: any) {
        if (isNetworkFailure(err)) {
          await enqueueWorkLogMutation(userId, id, 'update', data);
          return { id, ...data, queuedOffline: true };
        }
        throw err;
      }
    },
    onSuccess: () => invalidateWorkLogQueries(qc),
  });
};

export const useDeleteWorkLog = () => {
  const qc = useQueryClient();
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isNetworkOnline()) {
        await enqueueWorkLogMutation(userId, id, 'delete');
        return { id, queuedOffline: true };
      }
      try {
        const res = await workLogsApi.delete(id);
        return { ...(res || {}), id, queuedOffline: false };
      } catch (err: any) {
        if (isNetworkFailure(err)) {
          await enqueueWorkLogMutation(userId, id, 'delete');
          return { id, queuedOffline: true };
        }
        throw err;
      }
    },
    onSuccess: () => invalidateWorkLogQueries(qc),
  });
};

export const useSubmitWeek = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workLogsApi.submitWeek,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workLogs'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
