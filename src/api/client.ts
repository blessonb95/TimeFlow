import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAppStore } from '../store/useAppStore';
import { clearStoredAuthToken, getStoredAuthToken } from '../utils/authTokenStorage';
import {
  GUEST_USER,
  getMockProjects,
  getMockWorkLogs,
  getMockApprovals,
  getMockEmployeeDashboard,
  getMockManagerDashboard,
  getMockReports,
} from './mockData';
import { USERS, NOTIFICATIONS } from '../data/dummy';

const BASE_URL = import.meta.env.MODE === 'vercel'
  ? '/api'
  : import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Guest / Demo Mode Mock Adapter ──────────────────────────────────────────
const mockGuestAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  const url = (config.url || '').replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  const params = config.params || {};
  let data: any = { status: 'ok' };

  if (url.includes('/auth/me')) {
    data = GUEST_USER;
  } else if (url.includes('/dashboard/employee')) {
    data = getMockEmployeeDashboard();
  } else if (url.includes('/dashboard/manager')) {
    data = getMockManagerDashboard();
  } else if (url.includes('/work-logs')) {
    if (method === 'get') {
      let list = getMockWorkLogs();
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
    } else {
      data = { id: `wl-demo-${Date.now()}`, message: 'Saved successfully in demo mode' };
    }
  } else if (url.includes('/projects')) {
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const projectId = parts[parts.length - 1];
    let allProjects = getMockProjects();

    if (parts.length > 1 && projectId && projectId !== 'projects') {
      data = allProjects.find((p) => p.id === projectId) || allProjects[0];
    } else if (method === 'get') {
      if (params.search) {
        const q = String(params.search).toLowerCase();
        allProjects = allProjects.filter(
          (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== 'All') {
        allProjects = allProjects.filter(
          (p) => p.status.toLowerCase() === String(params.status).toLowerCase()
        );
      }
      data = allProjects;
    } else {
      data = { id: `proj-demo-${Date.now()}`, message: 'Project saved in demo mode' };
    }
  } else if (url.includes('/approvals')) {
    if (url.includes('/details/')) {
      const appr = getMockApprovals()[0];
      data = {
        ...appr,
        timesheet: {
          id: appr.timesheetId,
          weekStart: appr.period.split(' – ')[0] || 'Mon',
          weekEnd: appr.period.split(' – ')[1] || 'Fri',
          totalHours: appr.hours,
          status: appr.status,
          user: appr.employee,
          tasks: getMockWorkLogs(),
        },
      };
    } else if (method === 'get') {
      let list = getMockApprovals();
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
  } else if (url.includes('/reports')) {
    if (url.includes('/detailed')) {
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
  } else if (url.includes('/employees') || url.includes('/users')) {
    let list = [...USERS];
    if (params.search) {
      const q = String(params.search).toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (params.department && params.department !== 'All') {
      list = list.filter((u) => u.department.toLowerCase() === String(params.department).toLowerCase());
    }
    data = list;
  } else if (url.includes('/notifications')) {
    data = NOTIFICATIONS;
  } else if (url.includes('/settings')) {
    data = {
      daily_hours_target: 8,
      timezone: 'Asia/Kolkata',
      week_start_day: 'Monday',
      theme: 'system',
    };
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
  const token = getStoredAuthToken();
  const isGuest = token === 'demo-guest-token' || localStorage.getItem('is_guest') === 'true';

  if (isGuest) {
    config.adapter = mockGuestAdapter as any;
    return config;
  }

  if (token) {
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
      const isGuest = getStoredAuthToken() === 'demo-guest-token' || localStorage.getItem('is_guest') === 'true';
      if (!isGuest) {
        clearStoredAuthToken();
        const loginUrl = (import.meta.env.BASE_URL || '/') + 'login';
        const cleanLoginUrl = loginUrl.replace('//', '/');
        if (!window.location.pathname.endsWith('/login')) {
          window.location.href = cleanLoginUrl;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
