import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { approvalsApi } from '../api/approvals';
import { useAppStore } from '../store/useAppStore';

export const useApprovals = (filter?: string, searchName?: string, searchDate?: string) => {
  const { role } = useAppStore();
  return useQuery({
    queryKey: ['approvals', filter, role, searchName, searchDate],
    queryFn: () => approvalsApi.list(filter, role, searchName, searchDate),
    placeholderData: (prev) => prev,
  });
};

export const useApprovalDetails = (id?: string | null) =>
  useQuery({
    queryKey: ['approvals', 'details', id],
    queryFn: () => approvalsApi.getDetails(id!),
    enabled: !!id,
    staleTime: 30_000,
  });

export const useApproveTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approvalsApi.approve,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['approvals'] });
      const previousApprovals = qc.getQueriesData({ queryKey: ['approvals'] });
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) => (String(item.id) === String(id) ? { ...item, status: 'Approved' } : item));
      });
      return { previousApprovals };
    },
    onSuccess: (updated, id) => {
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          String(item.id) === String(id) ? { ...item, ...(typeof updated === 'object' ? updated : {}), status: 'Approved' } : item
        );
      });
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
    onError: (_error, _id, context) => {
      context?.previousApprovals.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      return qc.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useRejectTimesheet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) =>
      approvalsApi.reject(id, comments),
    onMutate: async ({ id, comments }) => {
      await qc.cancelQueries({ queryKey: ['approvals'] });
      const previousApprovals = qc.getQueriesData({ queryKey: ['approvals'] });
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          String(item.id) === String(id)
            ? { ...item, status: 'Rejected', comments: comments || item.comments }
            : item
        );
      });
      return { previousApprovals };
    },
    onSuccess: (updated, { id }) => {
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          String(item.id) === String(id) ? { ...item, ...(typeof updated === 'object' ? updated : {}), status: 'Rejected' } : item
        );
      });
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
    onError: (_error, _variables, context) => {
      context?.previousApprovals.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      return qc.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useBulkApprove = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approvalsApi.bulkApprove,
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: ['approvals'] });
      const previousApprovals = qc.getQueriesData({ queryKey: ['approvals'] });
      const idSet = new Set(ids.map(String));
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) => (idSet.has(String(item.id)) ? { ...item, status: 'Approved' } : item));
      });
      return { previousApprovals };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
    onError: (_error, _ids, context) => {
      context?.previousApprovals.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      return qc.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};

export const useBulkReject = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, comments }: { ids: string[]; comments?: string }) =>
      approvalsApi.bulkReject(ids, comments),
    onMutate: async ({ ids, comments }) => {
      await qc.cancelQueries({ queryKey: ['approvals'] });
      const previousApprovals = qc.getQueriesData({ queryKey: ['approvals'] });
      const idSet = new Set(ids.map(String));
      qc.setQueriesData({ queryKey: ['approvals'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((item) =>
          idSet.has(String(item.id))
            ? { ...item, status: 'Rejected', comments: comments || item.comments }
            : item
        );
      });
      return { previousApprovals };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['approvals'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
    onError: (_error, _variables, context) => {
      context?.previousApprovals.forEach(([queryKey, data]) => qc.setQueryData(queryKey, data));
      return qc.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};
