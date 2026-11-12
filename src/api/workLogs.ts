import apiClient from './client';

export interface CreateWorkLogPayload {
  clientId?: string;
  projectId: string;
  taskName: string;
  taskDescription?: string;
  hours: number;
  date: string;
  status: string;
  taskStatus?: string;
  tickets?: { ticketNumber: string; ticketUrl?: string; provider?: string }[];
}

export const workLogsApi = {
  list: (params?: { weekStart?: string; search?: string; page?: number }) =>
    apiClient.get('/work-logs', { params }).then((r) => r.data),

  create: (
    data: CreateWorkLogPayload,
    options?: { isBackgroundSync?: boolean }
  ) =>
    apiClient
      .post('/work-logs', data, {
        headers: options?.isBackgroundSync ? { 'X-Background-Sync': 'true' } : undefined,
      })
      .then((r) => r.data),

  update: (
    id: string,
    data: Partial<{
      projectId: string;
      taskName: string;
      taskDescription: string;
      hours: number;
      date: string;
      status: string;
      taskStatus: string;
    }>
  ) => apiClient.put(`/work-logs/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/work-logs/${id}`).then((r) => r.data),

  submitWeek: (weekStart: string) =>
    apiClient.post('/work-logs/submit-week', { weekStart }).then((r) => r.data),
};
