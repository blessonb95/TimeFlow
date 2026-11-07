import apiClient from './client';
export const approvalsApi = {
  list: (filter?: string, role?: string, searchName?: string, searchDate?: string) =>
    apiClient.get('/approvals', { params: { filter, role, searchName, searchDate } }).then(r => r.data),
  getDetails: (id: string) => apiClient.get(`/approvals/${id}/details`).then(r => r.data),
  approve: (id: string) => apiClient.put(`/approvals/${id}/approve`).then(r => r.data),
  reject: (id: string, comments?: string) => apiClient.put(`/approvals/${id}/reject`, { comments }).then(r => r.data),
  update: (id: string, data: any) => apiClient.put(`/approvals/${id}/update`, data).then(r => r.data),
  bulkApprove: async (ids: string[]) => {
    try {
      const r = await apiClient.post('/approvals/bulk-approve', { ids });
      return r.data;
    } catch {
      await Promise.all(ids.map((id) => apiClient.put(`/approvals/${id}/approve`)));
      return { approved: ids.length };
    }
  },
  bulkReject: async (ids: string[], comments?: string) => {
    try {
      const r = await apiClient.post('/approvals/bulk-reject', { ids, comments });
      return r.data;
    } catch {
      await Promise.all(ids.map((id) => apiClient.put(`/approvals/${id}/reject`, { comments })));
      return { rejected: ids.length };
    }
  },
};
