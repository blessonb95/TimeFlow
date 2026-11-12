import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { useAppStore } from '../store/useAppStore';
import {
  cacheUserProjects,
  getCachedUserProjects,
  isNetworkOnline,
} from '../utils/offlineQueue';

const getActiveUserId = (storeUserId?: string): string => {
  if (storeUserId) return storeUserId;
  try {
    return localStorage.getItem('active_user_id') || 'guest-demo-user';
  } catch {
    return 'guest-demo-user';
  }
};

export const useProjects = (params?: { search?: string; status?: string }) => {
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useQuery({
    queryKey: ['projects', userId, params],
    queryFn: async () => {
      try {
        if (!isNetworkOnline()) {
          throw Object.assign(new Error('Offline'), { isOfflineError: true });
        }
        const data = await projectsApi.list(params);
        if (Array.isArray(data) && (!params?.search && (!params?.status || params.status === 'All'))) {
          await cacheUserProjects(userId, data);
        }
        return data;
      } catch (err: any) {
        const isNetErr = !err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK';
        if (isNetErr) {
          let cached = await getCachedUserProjects(userId);
          if (params?.search) {
            const q = params.search.toLowerCase();
            cached = cached.filter(
              (p: any) =>
                String(p.name || '').toLowerCase().includes(q) ||
                String(p.description || '').toLowerCase().includes(q)
            );
          }
          if (params?.status && params.status !== 'All') {
            const wanted = params.status.toLowerCase();
            cached = cached.filter((p: any) => String(p.status || '').toLowerCase() === wanted);
          }
          return cached;
        }
        throw err;
      }
    },
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
};

export const useProject = (id: string) => {
  const { currentUser } = useAppStore();
  const userId = getActiveUserId(currentUser?.id);

  return useQuery({
    queryKey: ['project', userId, id],
    queryFn: async () => {
      try {
        return await projectsApi.getById(id);
      } catch (err: any) {
        const isNetErr = !err?.response || err?.isOfflineError || err?.code === 'ERR_NETWORK';
        if (isNetErr) {
          const cached = await getCachedUserProjects(userId);
          const match = cached.find((p: any) => p.id === id);
          if (match) return match;
        }
        throw err;
      }
    },
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof projectsApi.update>[1] }) =>
      projectsApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', vars.id] });
    },
  });
};

export const useDeleteProject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
