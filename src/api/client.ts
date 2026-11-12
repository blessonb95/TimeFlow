import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAppStore } from '../store/useAppStore';
import { clearStoredAuthToken, getStoredAuthToken } from '../utils/authTokenStorage';
import { isNetworkOnline } from '../utils/offlineQueue';
import {
  GUEST_USER,
  getMockProjects,
  addMockProject,
  updateMockProject,
  deleteMockProject,
  getMockWorkLogs,
  addMockWorkLog,
  updateMockWorkLog,
  deleteMockWorkLog,
  submitMockWeek,
  getMockApprovals,
  getMockApprovalDetails,
  updateMockApprovalStatus,
  bulkUpdateMockApprovals,
  getMockEmployees,
  addMockEmployee,
  updateMockEmployee,
  getMockNotifications,
  markMockNotificationRead,
  markAllMockNotificationsRead,
  getMockSettings,
  updateMockSettings,
  getMockEmployeeDashboard,
  getMockManagerDashboard,
  getMockReports,
  toLifecycleStatus,
  draftMockAiTask,
  draftMockAiWeeklySummary,
  getMockDashboardAiWeeklySummary,
  getMockDashboardAiChat,
} from './mockData';

const BASE_URL = import.meta.env.MODE === 'vercel'
  ? '/api'
  : import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const parseBody = (raw: unknown): Record<string, any> => {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') return raw as Record<string, any>;
  return {};
};

// ─── Guest / Demo Mode Mock Adapter ──────────────────────────────────────────
const mockGuestAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  if (!isNetworkOnline()) {
    const netErr: any = new Error('Network unavailable');
    netErr.code = 'ERR_NETWORK';
    netErr.isOfflineError = true;
    netErr.config = config;
    throw netErr;
  }

  const url = (config.url || '').replace(/^\/api/, '');
  const cleanUrl = url.split('?')[0];
  const parts = cleanUrl.split('/').filter(Boolean);
  const method = (config.method || 'get').toLowerCase();
  const params = config.params || {};
  const body = parseBody(config.data);
  let data: any = { status: 'ok' };

  try {

  if (cleanUrl.includes('/auth/me')) {
    data = GUEST_USER;
  } else if (cleanUrl.includes('/dashboard/employee')) {
    data = getMockEmployeeDashboard();
  } else if (cleanUrl.includes('/dashboard/manager')) {
    data = getMockManagerDashboard();
  } else if (cleanUrl.includes('/work-logs')) {
    if (cleanUrl.includes('/submit-week')) {
      data = submitMockWeek(body.weekStart);
    } else if (method === 'get') {
      let list = [...getMockWorkLogs()];
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(
          (w) =>
            w.taskName.toLowerCase().includes(q) ||
            w.projectName.toLowerCase().includes(q) ||
            (w.taskDescription && w.taskDescription.toLowerCase().includes(q))
        );
      }
      data = list;
    } else if (method === 'post') {
      data = addMockWorkLog(body);
    } else if (method === 'put' || method === 'patch') {
      const id = parts[parts.length - 1];
      data = updateMockWorkLog(id, body);
    } else if (method === 'delete') {
      const id = parts[parts.length - 1];
      data = deleteMockWorkLog(id);
    }
  } else if (cleanUrl.includes('/projects')) {
    const projectId = parts.length > 1 && parts[0] === 'projects' ? parts[1] : undefined;
    let allProjects = getMockProjects();

    if (method === 'get') {
      if (projectId) {
        data = allProjects.find((p) => p.id === projectId) || allProjects[0];
      } else {
        if (params.search) {
          const q = String(params.search).toLowerCase();
          allProjects = allProjects.filter(
            (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
          );
        }
        if (params.status && params.status !== 'All') {
          const wanted = String(params.status).toLowerCase();
          allProjects = allProjects.filter(
            (p) => toLifecycleStatus(p.status, p.loggedHours, p.progress).toLowerCase() === wanted
          );
        }
        data = allProjects;
      }
    } else if (method === 'post') {
      data = addMockProject(body);
    } else if (method === 'put' || method === 'patch') {
      data = updateMockProject(projectId || parts[parts.length - 1], body);
    } else if (method === 'delete') {
      data = deleteMockProject(projectId || parts[parts.length - 1]);
    }
  } else if (cleanUrl.includes('/approvals')) {
    if (cleanUrl.includes('/details')) {
      // Matches both /approvals/:id/details and /approvals/details/:id
      const approvalId = parts[parts.length - 1] === 'details' ? parts[parts.length - 2] : parts[parts.length - 1];
      data = getMockApprovalDetails(approvalId);
    } else if (cleanUrl.includes('/bulk-approve')) {
      const ids = Array.isArray(body.ids) ? body.ids : [];
      data = bulkUpdateMockApprovals(ids, 'Approved');
    } else if (cleanUrl.includes('/bulk-reject')) {
      const ids = Array.isArray(body.ids) ? body.ids : [];
      data = bulkUpdateMockApprovals(ids, 'Rejected', body.comments);
    } else if (cleanUrl.endsWith('/approve')) {
      const approvalId = parts[parts.length - 2];
      data = updateMockApprovalStatus(approvalId, 'Approved');
    } else if (cleanUrl.endsWith('/reject')) {
      const approvalId = parts[parts.length - 2];
      data = updateMockApprovalStatus(approvalId, 'Rejected', body.comments);
    } else if (cleanUrl.endsWith('/update')) {
      const approvalId = parts[parts.length - 2];
      data = updateMockApprovalStatus(
        approvalId,
        body.status || 'Submitted',
        body.comments,
        {
          taskName: body.taskName,
          taskDescription: body.taskDescription,
          hours: body.hours !== undefined ? Number(body.hours) : undefined,
          date: body.date,
        }
      );
    } else if (method === 'get') {
      let list = [...getMockApprovals()];
      if (params.filter && params.filter !== 'All') {
        list = list.filter((a) => a.status.toLowerCase() === String(params.filter).toLowerCase());
      }
      if (params.searchName) {
        const q = String(params.searchName).toLowerCase();
        list = list.filter((a) => a.employee.name.toLowerCase().includes(q));
      }
      data = list;
    } else {
      data = { success: true, message: 'Status updated in demo mode' };
    }
  } else if (cleanUrl.includes('/reports')) {
    if (cleanUrl.includes('/detailed')) {
      data = getMockWorkLogs().map((w) => ({
        employeeName: GUEST_USER.name,
        initials: GUEST_USER.initials,
        color: GUEST_USER.color,
        department: GUEST_USER.department,
        designation: GUEST_USER.designation,
        date: w.date,
        projectName: w.projectName,
        taskName: w.taskName,
        hours: w.hours,
        status: w.status,
      }));
    } else {
      data = getMockReports();
    }
  } else if (cleanUrl.includes('/invites')) {
    if (cleanUrl.includes('/validate')) {
      data = {
        email: 'colleague@timeflow.com',
        role: 'employee',
        department: 'Engineering',
        invitedBy: GUEST_USER.name,
      };
    } else if (cleanUrl.includes('/accept')) {
      const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim() || body.username || 'New Member';
      addMockEmployee({
        name: fullName,
        email: 'colleague@timeflow.com',
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Engineer',
      });
      data = { status: 'ok', message: 'Account created in demo mode' };
    } else {
      const token = `demo-invite-${Date.now()}`;
      const base = typeof window !== 'undefined' ? window.location.origin + (import.meta.env.BASE_URL || '/') : '/';
      data = {
        token,
        inviteUrl: `${base.replace(/\/$/, '')}/invite?token=${token}`,
        expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      };
    }
  } else if (cleanUrl.includes('/employees') || cleanUrl.includes('/users')) {
    if (method === 'get') {
      let list = [...getMockEmployees()];
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
      }
      if (params.department && params.department !== 'All') {
        list = list.filter((u) => u.department.toLowerCase() === String(params.department).toLowerCase());
      }
      data = list;
    } else if (method === 'post') {
      data = addMockEmployee(body);
    } else if (method === 'put' || method === 'patch') {
      const userId = parts[parts.length - 1];
      data = updateMockEmployee(userId, body);
    }
  } else if (cleanUrl.includes('/notifications')) {
    if (cleanUrl.includes('/mark-all-read')) {
      data = markAllMockNotificationsRead();
    } else if (cleanUrl.endsWith('/read')) {
      const notifId = parts[parts.length - 2];
      data = markMockNotificationRead(notifId);
    } else if (method === 'get') {
      data = getMockNotifications();
    } else {
      data = { ok: true };
    }
  } else if (cleanUrl.includes('/settings')) {
    if (method === 'put' || method === 'post' || method === 'patch') {
      data = updateMockSettings(body);
    } else {
      data = getMockSettings();
    }
  } else if (cleanUrl.includes('/ai')) {
    if (cleanUrl.includes('/status')) {
      data = { available: true, configured: true, provider: 'timeflow-assistant' };
    } else if (cleanUrl.includes('/draft-task')) {
      data = draftMockAiTask({
        notes: typeof body.notes === 'string' ? body.notes : '',
        projectName: typeof body.projectName === 'string' ? body.projectName : undefined,
      });
    } else if (cleanUrl.includes('/weekly-summary')) {
      data = draftMockAiWeeklySummary({
        weekStart: typeof body.weekStart === 'string' ? body.weekStart : '',
        weekEnd: typeof body.weekEnd === 'string' ? body.weekEnd : '',
        weekLabel: typeof body.weekLabel === 'string' ? body.weekLabel : undefined,
        hasUnsyncedEntries: Boolean(body.hasUnsyncedEntries),
        entries: Array.isArray(body.entries) ? body.entries : [],
      });
    } else if (cleanUrl.includes('/dashboard-summary')) {
      const storeState = useAppStore.getState();
      const activeRole =
        typeof params.role === 'string'
          ? params.role
          : typeof body.role === 'string'
            ? body.role
            : storeState.role || 'employee';
      const weekStartParam =
        typeof params.weekStart === 'string'
          ? params.weekStart
          : typeof body.weekStart === 'string'
            ? body.weekStart
            : undefined;
      data = getMockDashboardAiWeeklySummary({
        weekStart: weekStartParam,
        role: activeRole,
        userId: storeState.currentUser?.id,
      });
    } else if (cleanUrl.includes('/dashboard-chat')) {
      const storeState = useAppStore.getState();
      const activeRole =
        typeof params.role === 'string'
          ? params.role
          : typeof body.role === 'string'
            ? body.role
            : storeState.role || 'manager';
      const weekStartParam =
        typeof params.weekStart === 'string'
          ? params.weekStart
          : typeof body.weekStart === 'string'
            ? body.weekStart
            : undefined;
      data = getMockDashboardAiChat({
        message: typeof body.message === 'string' ? body.message : '',
        weekStart: weekStartParam,
        role: activeRole,
        userId: storeState.currentUser?.id,
        history: Array.isArray(body.history) ? body.history : undefined,
      });
    }
  }

  } catch (err: any) {
    const status = err?.status || 400;
    const axiosErr: any = new Error(err?.message || 'Request failed');
    axiosErr.config = config;
    axiosErr.response = {
      status,
      statusText: 'Bad Request',
      data: {
        error: err?.message || 'Request failed',
        code: err?.code || 'VALIDATION_ERROR',
      },
      headers: {},
      config,
    };
    throw axiosErr;
  }

  // Artificial short delay to feel realistic and snappy
  await new Promise((res) => setTimeout(res, 60));

  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};

// ─── Request interceptor: attach JWT & handle Demo Mode ───────────────────────
apiClient.interceptors.request.use((config) => {
  if (!isNetworkOnline()) {
    const netErr: any = new Error('Network unavailable');
    netErr.code = 'ERR_NETWORK';
    netErr.isOfflineError = true;
    netErr.config = config;
    return Promise.reject(netErr);
  }

  const url = config.url || '';
  const isAuthEndpoint =
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/check-username');

  const body = parseBody(config.data);
  const inviteToken = String(config.params?.token || body?.token || '');
  const isDemoInvite = url.includes('/invites') && inviteToken.startsWith('demo-invite-');

  const token = getStoredAuthToken();
  const isGuest =
    isDemoInvite ||
    (!isAuthEndpoint &&
      (token === 'demo-guest-token' || localStorage.getItem('is_guest') === 'true'));

  if (isGuest) {
    config.adapter = mockGuestAdapter as any;
    return config;
  }

  if (token && token !== 'demo-guest-token') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  try {
    const store = useAppStore.getState();
    if (store.currentUser?.email) {
      config.headers['X-Active-Email'] = store.currentUser.email;
    }
    if (store.role) {
      config.headers['X-Active-Role'] = store.role;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// ─── Response interceptor: handle 401 ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      const isBackgroundSync = error.config?.headers?.['X-Background-Sync'] === 'true';
      const isAuthRequest =
        reqUrl.includes('/auth/login') ||
        reqUrl.includes('/auth/register');
      const isGuest = getStoredAuthToken() === 'demo-guest-token' || localStorage.getItem('is_guest') === 'true';
      if (!isGuest && !isAuthRequest && !isBackgroundSync) {
        clearStoredAuthToken();
        const loginUrl = (import.meta.env.BASE_URL || '/') + 'login';
        const cleanLoginUrl = loginUrl.replace('//', '/');
        const currentPath = window.location.pathname.replace(/\/+$/, '');
        if (!currentPath.endsWith('/login')) {
          window.location.href = cleanLoginUrl;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
