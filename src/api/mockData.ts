import { USERS, PROJECTS, NOTIFICATIONS } from '../data/dummy';
import type { Role } from '../types';
import type { DashboardChatResponse, DashboardChatSourceLink } from './ai';

/**
 * Returns ISO date string (YYYY-MM-DD) for a given offset from Monday of the current week.
 * 0 = Monday, 1 = Tuesday, ..., 4 = Friday.
 */
export const getCurrentWeekDay = (dayIndex: number): string => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(12, 0, 0, 0);

  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIndex);
  return target.toISOString().slice(0, 10);
};

export const getPreviousWeekDay = (dayIndex: number): string => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() + diffToMonday - 7);
  lastMonday.setHours(12, 0, 0, 0);

  const target = new Date(lastMonday);
  target.setDate(lastMonday.getDate() + dayIndex);
  return target.toISOString().slice(0, 10);
};

export const GUEST_USER = {
  id: 'guest-demo-user',
  name: 'Alex Morgan',
  email: 'alex.demo@timeflow.app',
  role: 'manager' as Role,
  department: 'Engineering & Product',
  designation: 'Product Lead (Demo)',
  initials: 'AM',
  color: '#2563eb',
  avatar: '',
  status: 'Active',
};

const createInitialWorkLogs = () => [
  {
    id: 'wl-demo-1',
    userId: 'guest-demo-user',
    projectId: 'p1',
    projectName: 'TimeFlow Core Platform',
    taskName: 'API gateway refactor & token caching',
    taskDescription: 'Optimized the authentication token verification middleware with redis caching layer and reduced latency by 35%.',
    hours: 3.5,
    date: getCurrentWeekDay(0), // Mon
    status: 'Completed',
    taskStatus: 'Completed',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't1', ticketNumber: 'JIRA-324', provider: 'Jira' }],
    linkedTickets: [{ id: 't1', ticketNumber: 'JIRA-324', provider: 'Jira' }],
  },
  {
    id: 'wl-demo-2',
    userId: 'guest-demo-user',
    projectId: 'p2',
    projectName: 'Analytics Dashboard',
    taskName: 'Interactive chart component optimization',
    taskDescription: 'Replaced SVG heavy redraws with canvas-accelerated rendering for the 30-day utilization chart.',
    hours: 4.0,
    date: getCurrentWeekDay(0), // Mon
    status: 'Completed',
    taskStatus: 'Completed',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't2', ticketNumber: 'GH-88', provider: 'GitHub' }],
    linkedTickets: [{ id: 't2', ticketNumber: 'GH-88', provider: 'GitHub' }],
  },
  {
    id: 'wl-demo-3',
    userId: 'guest-demo-user',
    projectId: 'p3',
    projectName: 'Client Portal Redesign',
    taskName: 'Design system tokens and responsive navigation',
    taskDescription: 'Implemented accessibility guidelines (WCAG 2.1 AA) and focus trap management across mobile drawer navigation.',
    hours: 4.5,
    date: getCurrentWeekDay(1), // Tue
    status: 'Completed',
    taskStatus: 'Completed',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't3', ticketNumber: 'LIN-55', provider: 'Linear' }],
    linkedTickets: [{ id: 't3', ticketNumber: 'LIN-55', provider: 'Linear' }],
  },
  {
    id: 'wl-demo-4',
    userId: 'guest-demo-user',
    projectId: 'p1',
    projectName: 'TimeFlow Core Platform',
    taskName: 'Database schema migration & index profiling',
    taskDescription: 'Added composite index on work_logs(user_id, date) to speed up weekly timesheet lookups from 180ms to 8ms.',
    hours: 3.5,
    date: getCurrentWeekDay(1), // Tue
    status: 'Completed',
    taskStatus: 'Completed',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't4', ticketNumber: 'JIRA-325', provider: 'Jira' }],
    linkedTickets: [{ id: 't4', ticketNumber: 'JIRA-325', provider: 'Jira' }],
  },
  {
    id: 'wl-demo-5',
    userId: 'guest-demo-user',
    projectId: 'p2',
    projectName: 'Analytics Dashboard',
    taskName: 'Backend data pipeline aggregation queries',
    taskDescription: 'Created aggregated monthly views for department billable hours breakdown and export to PDF/Excel.',
    hours: 4.0,
    date: getCurrentWeekDay(2), // Wed
    status: 'In Progress',
    taskStatus: 'In Progress',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't5', ticketNumber: 'GH-91', provider: 'GitHub' }],
    linkedTickets: [{ id: 't5', ticketNumber: 'GH-91', provider: 'GitHub' }],
  },
  {
    id: 'wl-demo-6',
    userId: 'guest-demo-user',
    projectId: 'p4',
    projectName: 'Mobile App v3',
    taskName: 'Offline sync queue & conflict resolution',
    taskDescription: 'Configured local indexedDB queue to hold offline time entries and batch-sync upon network reconnection.',
    hours: 3.5,
    date: getCurrentWeekDay(2), // Wed
    status: 'In Progress',
    taskStatus: 'In Progress',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't6', ticketNumber: 'LIN-60', provider: 'Linear' }],
    linkedTickets: [{ id: 't6', ticketNumber: 'LIN-60', provider: 'Linear' }],
  },
  {
    id: 'wl-demo-7',
    userId: 'guest-demo-user',
    projectId: 'p1',
    projectName: 'TimeFlow Core Platform',
    taskName: 'Security audit & password hashing verification',
    taskDescription: 'Reviewed bcrypt salt rounds and verified AES-256 payload encryption across authentication endpoints.',
    hours: 4.0,
    date: getCurrentWeekDay(3), // Thu
    status: 'In Progress',
    taskStatus: 'In Progress',
    timesheetStatus: 'Pending',
    tickets: [],
    linkedTickets: [],
  },
  {
    id: 'wl-demo-8',
    userId: 'guest-demo-user',
    projectId: 'p5',
    projectName: 'Infrastructure Migration',
    taskName: 'Zero-downtime database replication failover test',
    taskDescription: 'Executed test failover on the secondary cloud cluster and validated DNS TTL cutover.',
    hours: 3.5,
    date: getCurrentWeekDay(3), // Thu
    status: 'In Progress',
    taskStatus: 'In Progress',
    timesheetStatus: 'Pending',
    tickets: [{ id: 't7', ticketNumber: 'JIRA-410', provider: 'Jira' }],
    linkedTickets: [{ id: 't7', ticketNumber: 'JIRA-410', provider: 'Jira' }],
  },
  {
    id: 'wl-demo-9',
    userId: 'guest-demo-user',
    projectId: 'p2',
    projectName: 'Analytics Dashboard',
    taskName: 'Sprint demo prep & milestone review',
    taskDescription: 'Compiled product demo for leadership and verified timesheet export functionality.',
    hours: 4.0,
    date: getCurrentWeekDay(4), // Fri
    status: 'Not Started',
    taskStatus: 'Not Started',
    timesheetStatus: 'Pending',
    tickets: [],
    linkedTickets: [],
  },
];

/**
 * Maps any project status (including legacy health labels such as
 * "On Track", "At Risk" or "Over Budget") onto the lifecycle statuses used by
 * the Projects screen filter tabs: Not Started / Ongoing / Completed.
 */
export const toLifecycleStatus = (
  status: string | undefined,
  loggedHours = 0,
  progress = 0,
): 'Not Started' | 'Ongoing' | 'Completed' => {
  const s = String(status || '').trim().toLowerCase();
  if (s === 'completed' || progress >= 100) return 'Completed';
  if (s === 'not started') return 'Not Started';
  if (s === 'ongoing') return 'Ongoing';
  return loggedHours > 0 || progress > 0 ? 'Ongoing' : 'Not Started';
};

const createInitialProjects = () =>
  PROJECTS.map((p) => {
    const memberObjs = (p.teamMembers || []).map((mId) => {
      const user = USERS.find((u) => u.id === mId);
      return user
        ? { id: user.id, name: user.name, initials: user.initials, color: user.color, role: user.role, designation: user.designation }
        : { id: String(mId), name: 'Team Member', initials: 'TM', color: '#2563eb', role: 'employee', designation: 'Software Engineer' };
    });

    return {
      ...p,
      status: toLifecycleStatus(p.status, p.loggedHours, p.progress) as string,
      teamMembers: [
        { id: 'u1', name: 'Arun Singh', initials: 'AS', color: '#9333EA', role: 'manager', designation: 'Engineering Manager' },
        ...memberObjs,
      ],
      managers: [{ id: 'u1', name: 'Arun Singh', initials: 'AS', color: '#9333EA', role: 'manager' }],
      projectType: p.priority === 'Critical' ? 'Internal' : 'Billable',
      type: p.priority === 'Critical' ? 'Internal' : 'Billable',
    };
  });

const createInitialApprovals = () => [
  {
    id: 'appr-1',
    timesheetId: 'ts-1',
    employee: { ...USERS[2], role: USERS[2].role || 'employee' }, // Sarah Chen
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    weekStart: getCurrentWeekDay(0),
    weekEnd: getCurrentWeekDay(4),
    date: getCurrentWeekDay(4),
    submittedDateRaw: getCurrentWeekDay(4),
    projects: ['TimeFlow Core Platform', 'Analytics Dashboard'],
    taskName: 'API gateway refactor & sprint deliverables',
    taskDescription: 'Completed API gateway refactor, caching layer, and dashboard chart optimization.',
    hours: 38.5,
    submittedDate: 'Yesterday at 5:30 PM',
    status: 'Pending',
    comments: 'All weekly sprint tasks finished on schedule. Awaiting manager approval.',
  },
  {
    id: 'appr-2',
    timesheetId: 'ts-2',
    employee: { ...USERS[4], role: USERS[4].role || 'employee' }, // Emma Torres
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    weekStart: getCurrentWeekDay(0),
    weekEnd: getCurrentWeekDay(4),
    date: getCurrentWeekDay(4),
    submittedDateRaw: getCurrentWeekDay(4),
    projects: ['Client Portal Redesign', 'TimeFlow Core Platform'],
    taskName: 'Design system tokens & responsive navigation',
    taskDescription: 'Implemented WCAG 2.1 AA tokens and mobile drawer focus trap management.',
    hours: 36.0,
    submittedDate: 'Today at 9:15 AM',
    status: 'Pending',
    comments: 'Completed responsive navigation and design system tokens.',
  },
  {
    id: 'appr-3',
    timesheetId: 'ts-3',
    employee: { ...USERS[5], role: USERS[5].role || 'employee' }, // Jordan Lee
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    weekStart: getCurrentWeekDay(0),
    weekEnd: getCurrentWeekDay(4),
    date: getCurrentWeekDay(4),
    submittedDateRaw: getCurrentWeekDay(4),
    projects: ['Analytics Dashboard', 'Mobile App v3'],
    taskName: 'End-to-end QA regression & offline sync suite',
    taskDescription: 'Executed automated regression suite across Analytics Dashboard and Mobile App v3.',
    hours: 35.0,
    submittedDate: '2 hours ago',
    status: 'Pending',
    comments: 'QA test suites executed with 98% pass rate.',
  },
  {
    id: 'appr-4',
    timesheetId: 'ts-4',
    employee: { ...USERS[3], role: USERS[3].role || 'employee' }, // Aisha Rahman
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    weekStart: getPreviousWeekDay(0),
    weekEnd: getPreviousWeekDay(4),
    date: getPreviousWeekDay(4),
    submittedDateRaw: getPreviousWeekDay(4),
    projects: ['Infrastructure Migration'],
    taskName: 'Cloud cluster replication & failover validation',
    taskDescription: 'Completed zero-downtime replication failover test on secondary cluster.',
    hours: 40.0,
    submittedDate: 'Last week',
    status: 'Approved',
    comments: 'Infrastructure migration milestones cleared successfully.',
  },
  {
    id: 'appr-5',
    timesheetId: 'ts-5',
    employee: { ...USERS[7], role: USERS[7].role || 'employee' }, // Alex Kim
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    weekStart: getPreviousWeekDay(0),
    weekEnd: getPreviousWeekDay(4),
    date: getPreviousWeekDay(4),
    submittedDateRaw: getPreviousWeekDay(4),
    projects: ['TimeFlow Core Platform', 'Analytics Dashboard'],
    taskName: 'Core platform indexing & query profiling',
    taskDescription: 'Added composite database indexes and profiled weekly timesheet queries.',
    hours: 28.0,
    submittedDate: 'Last week',
    status: 'Approved',
    comments: 'Approved by Engineering Manager.',
  },
  {
    id: 'appr-6',
    timesheetId: 'ts-6',
    employee: { ...USERS[6], role: USERS[6].role || 'employee' }, // Marcus Johnson
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    weekStart: getPreviousWeekDay(0),
    weekEnd: getPreviousWeekDay(4),
    date: getPreviousWeekDay(4),
    submittedDateRaw: getPreviousWeekDay(4),
    projects: ['Client Portal Redesign'],
    taskName: 'Client portal UI components & overtime sprint',
    taskDescription: 'Built client portal dashboard views and custom theming support.',
    hours: 42.0,
    submittedDate: 'Last week',
    status: 'Rejected',
    comments: 'Overtime hours need prior client sign-off before approving.',
  },
];

// ─── Stateful In-Memory Demo Store ────────────────────────────────────────────
let mockWorkLogsState = createInitialWorkLogs();
let mockProjectsState = createInitialProjects();
let mockApprovalsState = createInitialApprovals();
let mockEmployeesState = USERS.map((u) => ({
  ...u,
  projectCount: 2,
  weekHours: u.hoursThisWeek ?? 36,
}));
let mockNotificationsState = NOTIFICATIONS.map((n) => ({ ...n }));
let mockSettingsState: Record<string, unknown> = {
  daily_hours_target: 8,
  timezone: 'Asia/Kolkata',
  week_start_day: 'Monday',
  theme: 'system',
};

export const getMockWorkLogs = () => mockWorkLogsState;

export const addMockWorkLog = (payload: any) => {
  // Idempotency check via clientId
  if (payload.clientId) {
    const existing = mockWorkLogsState.find((w) => w.id === payload.clientId);
    if (existing) {
      return existing;
    }
  }

  const trimmedName = String(payload.taskName || '').trim();
  if (!trimmedName) {
    const err: any = new Error('Task name is required.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const numericHours = Number(payload.hours);
  if (!Number.isFinite(numericHours) || numericHours <= 0 || numericHours > 24) {
    const err: any = new Error('Hours must be between 0.1 and 24.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const isInternal = !payload.projectId || payload.projectId === 'internal';
  const proj = isInternal ? undefined : mockProjectsState.find((p) => p.id === payload.projectId);
  if (!isInternal && !proj) {
    const err: any = new Error('Project is no longer available or was deleted. Please select an active project.');
    err.status = 400;
    err.code = 'PROJECT_UNAVAILABLE';
    throw err;
  }

  const newLog = {
    id: payload.clientId || `wl-demo-${Date.now()}`,
    userId: 'guest-demo-user',
    projectId: payload.projectId || 'internal',
    projectName: proj?.name || 'Internal Task',
    taskName: trimmedName,
    taskDescription: payload.taskDescription || '',
    hours: numericHours,
    date: payload.date || getCurrentWeekDay(0),
    status: payload.taskStatus || payload.status || 'In Progress',
    taskStatus: payload.taskStatus || payload.status || 'In Progress',
    timesheetStatus: 'Pending',
    tickets: (payload.tickets || []).map((t: any, idx: number) => ({
      id: `t-${Date.now()}-${idx}`,
      ticketNumber: typeof t === 'string' ? t : t.ticketNumber,
      provider: 'Jira',
    })),
    linkedTickets: (payload.tickets || []).map((t: any, idx: number) => ({
      id: `t-${Date.now()}-${idx}`,
      ticketNumber: typeof t === 'string' ? t : t.ticketNumber,
      provider: 'Jira',
    })),
  };
  mockWorkLogsState = [newLog, ...mockWorkLogsState];
  if (proj) {
    proj.loggedHours = Math.round(((proj.loggedHours || 0) + newLog.hours) * 10) / 10;
    if (proj.totalHours > 0) {
      proj.progress = Math.min(100, Math.round((proj.loggedHours / proj.totalHours) * 100));
    }
  }
  return newLog;
};

export const updateMockWorkLog = (id: string, payload: any) => {
  mockWorkLogsState = mockWorkLogsState.map((w) => {
    if (w.id !== id) return w;
    const proj = payload.projectId ? mockProjectsState.find((p) => p.id === payload.projectId) : undefined;
    return {
      ...w,
      ...payload,
      projectName: proj ? proj.name : w.projectName,
      hours: payload.hours !== undefined ? Number(payload.hours) : w.hours,
      status: payload.taskStatus || payload.status || w.status,
      taskStatus: payload.taskStatus || payload.status || w.taskStatus,
    };
  });
  return mockWorkLogsState.find((w) => w.id === id) || { id, ...payload };
};

export const deleteMockWorkLog = (id: string) => {
  mockWorkLogsState = mockWorkLogsState.filter((w) => w.id !== id);
  return { success: true, id };
};

export const submitMockWeek = (weekStart?: string) => {
  mockWorkLogsState = mockWorkLogsState.map((w) => ({
    ...w,
    timesheetStatus: w.timesheetStatus === 'Approved' ? 'Approved' : 'Submitted',
  }));
  return {
    success: true,
    weekStart: weekStart || getCurrentWeekDay(0),
    managerName: 'Arun Singh',
  };
};

export const getMockProjects = () =>
  mockProjectsState.map((p) => ({
    ...p,
    tasks: mockWorkLogsState.filter((w) => w.projectId === p.id),
    recentTasks: mockWorkLogsState.filter((w) => w.projectId === p.id),
  }));

export const addMockProject = (payload: any) => {
  const memberIds: string[] = payload.memberIds || [];
  const memberObjs = memberIds.map((mId) => {
    const user = mockEmployeesState.find((u) => u.id === mId);
    return user
      ? { id: user.id, name: user.name, initials: user.initials, color: user.color, role: user.role, designation: user.designation }
      : { id: String(mId), name: 'Team Member', initials: 'TM', color: '#2563eb', role: 'employee', designation: 'Software Engineer' };
  });
  const newProj = {
    id: `proj-demo-${Date.now()}`,
    name: payload.name || 'New Project',
    description: payload.description || '',
    status: payload.status || 'Ongoing',
    priority: payload.priority || 'Medium',
    progress: 0,
    totalHours: Number(payload.estimatedHours) || 120,
    loggedHours: 0,
    dueDate: payload.endDate || getCurrentWeekDay(4),
    endDate: payload.endDate || getCurrentWeekDay(4),
    teamMembers: memberObjs.length > 0 ? memberObjs : [{ id: 'u1', name: 'Arun Singh', initials: 'AS', color: '#9333EA', role: 'manager', designation: 'Engineering Manager' }],
    managers: [{ id: 'u1', name: 'Arun Singh', initials: 'AS', color: '#9333EA', role: 'manager' }],
    projectType: payload.projectType || payload.type || 'Billable',
    type: payload.type || payload.projectType || 'Billable',
  };
  mockProjectsState = [newProj, ...mockProjectsState];
  return newProj;
};

export const updateMockProject = (id: string, payload: any) => {
  mockProjectsState = mockProjectsState.map((p) => {
    if (p.id !== id) return p;
    let updatedMembers = p.teamMembers;
    if (Array.isArray(payload.memberIds)) {
      updatedMembers = payload.memberIds.map((mId: string) => {
        const user = mockEmployeesState.find((u) => u.id === mId);
        return user
          ? { id: user.id, name: user.name, initials: user.initials, color: user.color, role: user.role, designation: user.designation }
          : { id: String(mId), name: 'Team Member', initials: 'TM', color: '#2563eb', role: 'employee', designation: 'Software Engineer' };
      });
    }
    const totalHours = payload.estimatedHours !== undefined ? Number(payload.estimatedHours) : p.totalHours;
    return {
      ...p,
      ...payload,
      totalHours,
      dueDate: payload.endDate || p.dueDate,
      teamMembers: updatedMembers,
      projectType: payload.projectType || payload.type || p.projectType,
      type: payload.type || payload.projectType || p.type,
    };
  });
  return mockProjectsState.find((p) => p.id === id) || { id, ...payload };
};

export const deleteMockProject = (id: string) => {
  mockProjectsState = mockProjectsState.filter((p) => p.id !== id);
  return { success: true, id };
};

export const getMockApprovals = () => mockApprovalsState;

export const updateMockApprovalStatus = (id: string, status: 'Approved' | 'Rejected' | 'Pending' | 'Submitted', comments?: string, extra?: Record<string, unknown>) => {
  mockApprovalsState = mockApprovalsState.map((a) =>
    a.id === id
      ? {
          ...a,
          ...extra,
          status,
          comments: comments !== undefined ? comments : a.comments,
        }
      : a
  );
  return mockApprovalsState.find((a) => a.id === id) || { id, status, comments };
};

export const bulkUpdateMockApprovals = (ids: string[], status: 'Approved' | 'Rejected', comments?: string) => {
  const idSet = new Set(ids.map(String));
  mockApprovalsState = mockApprovalsState.map((a) =>
    idSet.has(String(a.id))
      ? {
          ...a,
          status,
          comments: comments !== undefined ? comments : a.comments,
        }
      : a
  );
  return { success: true, updated: ids.length, status };
};

export const resetMockApprovals = () => {
  mockApprovalsState = createInitialApprovals();
  return mockApprovalsState;
};

export const getMockApprovalDetails = (id: string) => {
  const cleanUserId = id.startsWith('user_') ? id.replace('user_', '') : id;
  const appr =
    mockApprovalsState.find((a) => a.id === id || a.timesheetId === id || a.employee?.id === cleanUserId) ||
    mockApprovalsState[0];
  const emp = appr?.employee || USERS[2];
  const logs = mockWorkLogsState.slice(0, 4).map((l, idx) => ({
    id: `${appr?.id || 'appr'}-log-${idx + 1}`,
    date: getCurrentWeekDay(idx),
    projectName: appr?.projects?.[idx % (appr.projects?.length || 1)] || l.projectName,
    taskName: idx === 0 && appr?.taskName ? appr.taskName : l.taskName,
    taskDescription: idx === 0 && appr?.taskDescription ? appr.taskDescription : l.taskDescription,
    hours: idx === 0 ? Math.max(4, Number(((appr?.hours || 36) - 24).toFixed(1))) : 8.0,
    status: appr?.status || 'Pending',
  }));
  return {
    approval: {
      id: appr?.id || id,
      timesheetId: appr?.timesheetId || id,
      status: appr?.status || 'Pending',
      comments: appr?.comments || '',
      hours: Number(appr?.hours || 38.5),
      weekStart: appr?.weekStart || getCurrentWeekDay(0),
      weekEnd: appr?.weekEnd || getCurrentWeekDay(4),
      submittedDate: appr?.submittedDate || getCurrentWeekDay(4),
      submittedAt: appr?.submittedDate || getCurrentWeekDay(4),
      employee: {
        id: emp.id,
        name: emp.name,
        initials: emp.initials,
        color: emp.color,
        designation: emp.designation,
        department: emp.department,
      },
    },
    logs,
  };
};

export const getMockEmployees = () => mockEmployeesState;

export const addMockEmployee = (payload: any) => {
  const fullName = `${payload.firstName || ''} ${payload.lastName || ''}`.trim() || 'New Member';
  const parts = fullName.split(/\s+/);
  const initials = ((parts[0]?.[0] || 'N') + (parts[1]?.[0] || 'M')).toUpperCase();
  const newEmp = {
    id: `u-demo-${Date.now()}`,
    name: fullName,
    email: payload.email || 'member@timeflow.com',
    role: (payload.role || 'employee') as Role,
    department: payload.department || 'Engineering',
    designation: payload.designation || 'Software Engineer',
    initials,
    color: '#2563eb',
    avatar: '',
    status: 'Active' as const,
    utilization: 85,
    hoursThisWeek: 0,
    weekHours: 0,
    projectCount: 1,
    timesheetStatus: 'Not Started' as const,
  };
  mockEmployeesState = [...mockEmployeesState, newEmp];
  return newEmp;
};

export const updateMockEmployee = (id: string, payload: Record<string, unknown>) => {
  mockEmployeesState = mockEmployeesState.map((u) =>
    u.id === id ? ({ ...u, ...payload } as typeof u) : u
  );
  return mockEmployeesState.find((u) => u.id === id) || { id, ...payload };
};

export const getMockNotifications = () => mockNotificationsState;

export const markMockNotificationRead = (id: string) => {
  mockNotificationsState = mockNotificationsState.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  return { ok: true, id };
};

export const markAllMockNotificationsRead = () => {
  mockNotificationsState = mockNotificationsState.map((n) => ({ ...n, read: true }));
  return { ok: true };
};

export const getMockSettings = () => mockSettingsState;

export const updateMockSettings = (payload: Record<string, unknown>) => {
  mockSettingsState = { ...mockSettingsState, ...payload };
  return mockSettingsState;
};

export const getMockEmployeeDashboard = () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const activeWorkdayIdx = Math.min(4, todayIdx);

  const weekHours = days.map((day, i) => {
    const dateStr = getCurrentWeekDay(i);
    const dayLogs = mockWorkLogsState.filter((w) => String(w.date).split('T')[0] === dateStr);
    const dayTotal = dayLogs.reduce((sum, w) => sum + (Number(w.hours) || 0), 0);
    const dateObj = new Date(dateStr + 'T12:00:00');
    const shortDateLabel = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const taskSummary =
      i === 4 && dayLogs.length === 1 && dayLogs[0]?.id === 'wl-demo-9'
        ? 'Dashboard Analytics Card Refactor (2.5h) • Sprint Retro & Planning (1.5h)'
        : dayLogs.length > 0
          ? dayLogs.map((w) => `${w.taskName} (${w.hours}h)`).join(' • ')
          : 'No tasks logged yet';

    return {
      day,
      fullDay: fullDays[i],
      fullDate: dateStr,
      shortDateLabel,
      date: dateStr.slice(5),
      hours: dayTotal,
      target: 8,
      isToday: i === activeWorkdayIdx,
      taskSummary,
    };
  });

  const weekTotal = Math.round(weekHours.reduce((sum, d) => sum + d.hours, 0) * 10) / 10;
  const activeDayHours = weekHours[activeWorkdayIdx]?.hours ?? 4.0;

  return {
    todayHours: activeDayHours,
    weekTotal,
    weekHours,
    entriesCount: mockWorkLogsState.length,
    weekSubmitted: true,
    activeProjects: mockProjectsState.length,
    projects: getMockProjects().slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      progressMode: 'budget',
      totalHours: p.totalHours,
      loggedHours: p.loggedHours,
      hasBudget: true,
      dueDate: p.dueDate,
    })),
    recentActivity: [
      { id: 'act-1', initials: 'AM', color: '#2563eb', message: 'You logged 4.0h on Analytics Dashboard', time: '2 hours ago' },
      { id: 'act-2', initials: 'AM', color: '#2563eb', message: 'You submitted timesheet for review', time: 'Yesterday' },
      { id: 'act-3', initials: 'AS', color: '#9333EA', message: 'Arun approved your task on Core Platform', time: '2 days ago' },
    ],
  };
};

export const getMockManagerDashboard = () => {
  const statusForUser = (userId: string, fallback: string) => {
    const matching = mockApprovalsState.find((a) => a.employee?.id === userId && a.weekStart === getCurrentWeekDay(0));
    if (matching) return matching.status;
    return fallback;
  };

  const employeeTable = [
    { user: USERS[2], status: 'Active', utilization: 96, projects: 3, primaryProject: 'TimeFlow Core Platform', weekHours: 38.5, timesheetStatus: statusForUser(USERS[2].id, 'Pending') },
    { user: USERS[4], status: 'Active', utilization: 90, projects: 2, primaryProject: 'Client Portal Redesign', weekHours: 36.0, timesheetStatus: statusForUser(USERS[4].id, 'Pending') },
    { user: USERS[5], status: 'Active', utilization: 88, projects: 2, primaryProject: 'Analytics Dashboard', weekHours: 35.0, timesheetStatus: statusForUser(USERS[5].id, 'Pending') },
    { user: USERS[7], status: 'Active', utilization: 80, projects: 3, primaryProject: 'TimeFlow Core Platform', weekHours: 32.0, timesheetStatus: statusForUser(USERS[7].id, 'Approved') },
    { user: USERS[3], status: 'Active', utilization: 100, projects: 1, primaryProject: 'Infrastructure Migration', weekHours: 40.0, timesheetStatus: statusForUser(USERS[3].id, 'Approved') },
    { user: USERS[6], status: 'Active', utilization: 75, projects: 2, primaryProject: 'Mobile App v3', weekHours: 30.0, timesheetStatus: statusForUser(USERS[6].id, 'Approved') },
    { user: USERS[8], status: 'Active', utilization: 85, projects: 2, primaryProject: 'Analytics Dashboard', weekHours: 34.0, timesheetStatus: statusForUser(USERS[8].id, 'Approved') },
  ];

  const pendingApprovals = mockApprovalsState.filter((a) => a.status === 'Pending').length;
  const approvedCount = employeeTable.filter((r) => r.timesheetStatus === 'Approved').length;
  const awaitingSubmissionCount = employeeTable.filter(
    (r) => r.timesheetStatus === 'In Progress' || r.timesheetStatus === 'Not Started' || r.timesheetStatus === 'Draft'
  ).length;

  const projectCards = getMockProjects().slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    priority: p.priority,
    progress: p.progress,
    progressMode: 'budget',
    totalHours: p.totalHours,
    loggedHours: p.loggedHours,
    hasBudget: true,
    dueDate: p.dueDate,
  }));

  const teamHours = employeeTable.reduce((sum, r) => sum + r.weekHours, 0);
  const teamUtilization = Math.round(
    employeeTable.reduce((sum, r) => sum + r.utilization, 0) / Math.max(1, employeeTable.length)
  );

  return {
    weekStart: getCurrentWeekDay(0),
    weekEnd: getCurrentWeekDay(4),
    totalEmployees: employeeTable.length,
    totalDepartments: 5,
    activeProjects: mockProjectsState.length,
    pendingApprovals,
    teamHours,
    teamUtilization,
    teamStatusCounts: {
      'Awaiting submission': awaitingSubmissionCount,
      'Awaiting approval': pendingApprovals,
      Approved: approvedCount,
    },
    stats: {
      total_active_members: employeeTable.length,
      total_departments: 5,
      active_projects: mockProjectsState.length,
      pending_approvals: pendingApprovals,
    },
    monthlyHours: [
      { month: 'Jan', hours: 148 },
      { month: 'Feb', hours: 152 },
      { month: 'Mar', hours: 145 },
      { month: 'Apr', hours: 160 },
      { month: 'May', hours: 158 },
      { month: 'Jun', hours: 165 },
    ],
    deptUtilization: [
      { dept: 'Engineering', utilization: 88, color: '#22C55E' },
      { dept: 'Product', utilization: 94, color: '#22C55E' },
      { dept: 'Design', utilization: 76, color: '#F97316' },
      { dept: 'Infrastructure', utilization: 91, color: '#22C55E' },
      { dept: 'QA', utilization: 82, color: '#F97316' },
    ],
    recentActivity: [
      { id: 'act-m1', initials: 'SC', color: '#2563EB', message: 'Sarah Chen submitted timesheet (38.5h)', time: '10 mins ago' },
      { id: 'act-m2', initials: 'ET', color: '#D97706', message: 'Emma Torres logged 4.5h on Client Portal Redesign', time: '1 hour ago' },
      { id: 'act-m3', initials: 'AK', color: '#0891B2', message: 'Alex Kim completed task on Core Platform', time: '3 hours ago' },
      { id: 'act-m4', initials: 'JL', color: '#059669', message: 'Jordan Lee reported 35h logged this week', time: 'Yesterday' },
    ],
    projects: projectCards,
    assignedProjects: projectCards,
    employeeTable,
  };
};

export const getMockReports = () => ({
  monthlyHours: [
    { month: 'Jan', hours: 640 },
    { month: 'Feb', hours: 710 },
    { month: 'Mar', hours: 685 },
    { month: 'Apr', hours: 745 },
    { month: 'May', hours: 790 },
    { month: 'Jun', hours: 820 },
  ],
  deptUtilization: [
    { dept: 'Engineering', utilization: 88 },
    { dept: 'Product', utilization: 94 },
    { dept: 'Infrastructure', utilization: 91 },
    { dept: 'QA', utilization: 82 },
    { dept: 'Design', utilization: 76 },
  ],
  employeeReport: USERS.slice(2, 9).map((u, i) => ({
    name: u.name,
    initials: u.initials,
    color: u.color,
    department: u.department,
    designation: u.designation,
    totalHours: [38.5, 36, 35, 40, 32, 30, 34][i] || 38,
    projects: [3, 2, 2, 1, 3, 2, 2][i] || 2,
    utilization: [92, 88, 85, 95, 80, 72, 78][i] || 85,
  })),
  projectReport: getMockProjects().map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    budgeted: p.totalHours,
    logged: p.loggedHours,
    utilizationPct: p.progress,
    teamSize: (p.teamMembers || []).length,
  })),
});

export const draftMockAiTask = (payload: { notes?: string; projectName?: string }) => {
  const notes = String(payload.notes || '').trim();
  if (!notes) {
    const err: any = new Error('Please enter rough notes before generating an AI task draft.');
    err.status = 400;
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const rawLines = notes
    .split(/\r?\n|(?:;\s+)|(?:\s+-\s+)/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);

  const primary = rawLines[0] || notes;
  const cleanTitle = primary
    .replace(/^(worked on|fixed|implemented|updated|built|created|investigated|reviewed|tested)\s+/i, (match) => {
      const verb = match.trim().toLowerCase();
      const map: Record<string, string> = {
        'worked on': 'Develop',
        fixed: 'Fix',
        implemented: 'Implement',
        updated: 'Update',
        built: 'Build',
        created: 'Create',
        investigated: 'Investigate',
        reviewed: 'Review',
        tested: 'Verify',
      };
      return `${map[verb] || 'Complete'} `;
    })
    .replace(/[.!?]+$/, '')
    .trim();

  const capitalized = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  const taskName = capitalized.length > 78 ? `${capitalized.slice(0, 77).trim()}…` : capitalized;

  const bullets: string[] = [];
  if (rawLines.length > 1) {
    rawLines.forEach((l) => bullets.push(l.charAt(0).toUpperCase() + l.slice(1).replace(/[.!?]*$/, '.')));
  } else {
    const sentences = notes
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length > 1) {
      sentences.forEach((s) => bullets.push(s.charAt(0).toUpperCase() + s.slice(1).replace(/[.!?]*$/, '.')));
    } else {
      bullets.push(`${capitalized}.`);
      if (payload.projectName) {
        bullets.push(`Aligned implementation and verification details for ${payload.projectName}.`);
      } else {
        bullets.push('Verified behavior and documented key changes.');
      }
    }
  }

  const escape = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const lead = payload.projectName
    ? `<p>Completed work for <strong>${escape(payload.projectName)}</strong>:</p>`
    : '<p>Key work completed:</p>';

  const list = bullets.map((b) => `<li>${escape(b)}</li>`).join('');

  return {
    taskName,
    taskDescription: `${lead}<ul>${list}</ul>`,
    provider: 'timeflow-assistant',
  };
};

export const draftMockAiWeeklySummary = (payload: {
  weekStart?: string;
  weekEnd?: string;
  weekLabel?: string;
  hasUnsyncedEntries?: boolean;
  entries?: Array<{
    projectName: string;
    taskName: string;
    taskDescription?: string;
    hours: number;
    date: string;
    taskStatus?: string;
    isOfflineQueued?: boolean;
  }>;
}) => {
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  if (entries.length === 0) {
    const err: any = new Error('No work logs are available for the selected week to summarize.');
    err.status = 400;
    err.code = 'EMPTY_WEEK_LOGS';
    throw err;
  }

  const stripHtml = (s: string) =>
    s
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const headerRange = payload.weekLabel || `${payload.weekStart} to ${payload.weekEnd}`;
  const totalHours = entries.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
  const unsyncedCount = entries.filter((item) => item.isOfflineQueued).length;
  const hasUnsynced = Boolean(payload.hasUnsyncedEntries) || unsyncedCount > 0;

  const byProject = new Map<string, { hours: number; tasks: typeof entries }>();
  for (const entry of entries) {
    const proj = (entry.projectName || 'Internal Task').trim();
    const group = byProject.get(proj) || { hours: 0, tasks: [] };
    group.hours += Number(entry.hours) || 0;
    group.tasks.push(entry);
    byProject.set(proj, group);
  }

  const lines: string[] = [];
  lines.push(`Weekly Work Summary (${headerRange})`);
  lines.push('='.repeat(`Weekly Work Summary (${headerRange})`.length));

  if (hasUnsynced) {
    lines.push(
      `[Note: Partial / Unsynced Data — ${
        unsyncedCount || 'Some'
      } offline entry(ies) are still waiting to sync with the server. Review before sharing.]`
    );
  }

  lines.push('');
  lines.push(
    `Overview: Logged ${totalHours.toFixed(1)}h across ${byProject.size} project${
      byProject.size === 1 ? '' : 's'
    } and ${entries.length} task entr${entries.length === 1 ? 'y' : 'ies'}.`
  );
  lines.push('');
  lines.push('Highlights by Project:');

  for (const [projectName, group] of byProject.entries()) {
    lines.push(`• ${projectName} (${group.hours.toFixed(1)}h)`);
    group.tasks.forEach((task) => {
      const cleanDesc = task.taskDescription ? stripHtml(task.taskDescription) : '';
      const shortDesc =
        cleanDesc && cleanDesc.toLowerCase() !== task.taskName.toLowerCase()
          ? ` — ${cleanDesc.length > 130 ? `${cleanDesc.slice(0, 127)}...` : cleanDesc}`
          : '';
      const syncTag = task.isOfflineQueued ? ' [Waiting to sync]' : '';
      const statusTag = task.taskStatus ? ` (${task.taskStatus})` : '';
      lines.push(
        `  - [${task.date}] ${task.taskName} (${Number(task.hours).toFixed(1)}h)${statusTag}${syncTag}${shortDesc}`
      );
    });
  }

  lines.push('');
  lines.push('Next Steps / Follow-ups:');
  const inProgress = entries.filter((e) => e.taskStatus === 'in-progress');
  if (inProgress.length > 0) {
    inProgress.forEach((item) => {
      lines.push(`• Continue: ${item.taskName} (${item.projectName || 'Internal Task'})`);
    });
  } else {
    lines.push('• Continue planned sprint deliverables and address any review feedback.');
  }

  return {
    summary: lines.join('\n'),
    provider: 'timeflow-assistant',
    hasUnsyncedEntries: hasUnsynced,
  };
};

const resolveMockWeekBounds = (rawDate?: string) => {
  let base = new Date();
  if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    const parsed = new Date(`${rawDate.trim()}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      base = parsed;
    }
  }
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMonday);
  monday.setHours(12, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(12, 0, 0, 0);

  const weekStart = monday.toISOString().slice(0, 10);
  const weekEnd = sunday.toISOString().slice(0, 10);

  const startStr = monday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const endStr = sunday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    weekStart,
    weekEnd,
    weekLabel: `${startStr} – ${endStr}`,
  };
};

export const getMockDashboardAiWeeklySummary = (payload: {
  weekStart?: string;
  role?: string;
  userId?: string;
}) => {
  const { weekStart, weekEnd, weekLabel } = resolveMockWeekBounds(payload.weekStart);
  const rawRole = String(payload.role || 'employee').toLowerCase();
  const isManagerView =
    rawRole === 'manager' || rawRole === 'ceo' || rawRole === 'hr' || rawRole === 'admin';

  if (!isManagerView) {
    // Employee summary: strictly only the current user's own work logs and assigned projects
    const weekLogs = mockWorkLogsState.filter(
      (w) => w.date >= weekStart && w.date <= weekEnd
    );

    if (weekLogs.length === 0) {
      return {
        role: 'employee' as const,
        weekStart,
        weekEnd,
        weekLabel,
        hasData: false,
        provider: 'timeflow-assistant',
        generatedAt: new Date().toISOString(),
        aiSynthesis: {
          headline: `No work logs recorded for ${weekLabel}.`,
          observations: [],
          suggestions: [],
        },
      };
    }

    const completedTasks: Array<{
      id: string;
      taskName: string;
      projectId: string;
      projectName: string;
      hours: number;
      date: string;
      link: string;
    }> = [];

    const workInProgressAndUpcoming: Array<{
      id: string;
      taskName: string;
      projectId: string;
      projectName: string;
      status: string;
      hours: number;
      date?: string;
      dueDate?: string;
      link: string;
    }> = [];

    const projectMap = new Map<string, { projectId: string; projectName: string; hours: number }>();
    const dayMap = new Map<string, number>();
    let totalHours = 0;

    for (const log of weekLogs) {
      const hrs = Math.round((Number(log.hours) || 0) * 10) / 10;
      totalHours = Math.round((totalHours + hrs) * 10) / 10;

      const pId = String(log.projectId || 'internal');
      const pName = String(log.projectName || 'Internal Task');
      const existing = projectMap.get(pId) || { projectId: pId, projectName: pName, hours: 0 };
      existing.hours = Math.round((existing.hours + hrs) * 10) / 10;
      projectMap.set(pId, existing);

      dayMap.set(log.date, Math.round(((dayMap.get(log.date) || 0) + hrs) * 10) / 10);

      const tStatus = String(log.taskStatus || log.status || 'In Progress');
      if (tStatus.toLowerCase() === 'completed') {
        completedTasks.push({
          id: log.id,
          taskName: log.taskName,
          projectId: pId,
          projectName: pName,
          hours: hrs,
          date: log.date,
          link: '/work-logs',
        });
      } else {
        workInProgressAndUpcoming.push({
          id: log.id,
          taskName: log.taskName,
          projectId: pId,
          projectName: pName,
          status: tStatus === 'Not Started' ? 'Upcoming' : 'In Progress',
          hours: hrs,
          date: log.date,
          link: '/work-logs',
        });
      }
    }

    // Add any assigned ongoing projects not yet logged this week as upcoming assigned work
    for (const proj of mockProjectsState.slice(0, 4)) {
      if (!projectMap.has(proj.id) && proj.status !== 'Completed') {
        workInProgressAndUpcoming.push({
          id: `upcoming-${proj.id}`,
          taskName: `Assigned sprint deliverables (${proj.name})`,
          projectId: proj.id,
          projectName: proj.name,
          status: 'Upcoming Assigned',
          hours: 0,
          dueDate: proj.dueDate,
          link: `/projects/${proj.id}`,
        });
      }
    }

    const timeByProject = Array.from(projectMap.values())
      .sort((a, b) => b.hours - a.hours)
      .map((p) => ({
        projectId: p.projectId,
        projectName: p.projectName,
        hours: p.hours,
        percentage: totalHours > 0 ? Math.round((p.hours / totalHours) * 100) : 0,
        link: p.projectId && p.projectId !== 'internal' ? `/projects/${p.projectId}` : '/projects',
      }));

    let busiestDay: string | null = null;
    let busiestDayHours = 0;
    for (const [d, hrs] of dayMap.entries()) {
      if (hrs > busiestDayHours) {
        busiestDayHours = hrs;
        busiestDay = new Date(`${d}T12:00:00`).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
    }

    const topProject = timeByProject[0] || null;
    const highlights = {
      totalHours,
      targetHours: 40,
      topProjectName: topProject ? topProject.projectName : null,
      topProjectHours: topProject ? topProject.hours : 0,
      topProjectPercentage: topProject ? topProject.percentage : 0,
      busiestDay,
      busiestDayHours,
      completedCount: completedTasks.length,
      inProgressCount: workInProgressAndUpcoming.length,
      entriesCount: weekLogs.length,
    };

    const pct = Math.round((totalHours / 40) * 100);
    const remaining = Math.max(0, Math.round((40 - totalHours) * 10) / 10);

    return {
      role: 'employee' as const,
      weekStart,
      weekEnd,
      weekLabel,
      hasData: true,
      provider: 'timeflow-assistant',
      generatedAt: new Date().toISOString(),
      employeeFacts: {
        completedTasks,
        timeByProject,
        workInProgressAndUpcoming,
        highlights,
      },
      aiSynthesis: {
        headline:
          totalHours >= 40
            ? `Reached ${totalHours.toFixed(1)}h (${pct}% of weekly 40h target) across ${timeByProject.length} project${timeByProject.length === 1 ? '' : 's'}.`
            : `Logged ${totalHours.toFixed(1)}h of your 40h target (${pct}%) across ${timeByProject.length} project${timeByProject.length === 1 ? '' : 's'}.`,
        observations: [
          topProject
            ? `Most time was spent on ${topProject.projectName} with ${topProject.hours.toFixed(1)}h (${topProject.percentage}% of weekly total).`
            : 'Time was distributed evenly across logged tasks.',
          busiestDay
            ? `Peak daily focus was on ${busiestDay} with ${busiestDayHours.toFixed(1)}h logged.`
            : 'Hours were logged consistently across the workweek.',
          `Completed ${completedTasks.length} deliverable${completedTasks.length === 1 ? '' : 's'} with ${workInProgressAndUpcoming.length} work-in-progress or upcoming item${workInProgressAndUpcoming.length === 1 ? '' : 's'} active.`,
        ],
        suggestions: [
          remaining > 0
            ? `${remaining.toFixed(1)}h remain toward the 40h weekly benchmark before submitting your timesheet.`
            : 'Your 40h weekly target is met — review your entries and submit your timesheet for approval.',
          workInProgressAndUpcoming.length > 0
            ? `Focus next on "${workInProgressAndUpcoming[0].taskName}" (${workInProgressAndUpcoming[0].projectName}) to keep sprint milestones on track.`
            : 'All logged tasks for this week are marked Completed.',
        ],
      },
    };
  }

  // Manager / Elevated Summary: grounded in authorized team approvals, projects, and employee logs
  const weekApprovals = mockApprovalsState.filter(
    (a) =>
      a.weekStart === weekStart ||
      (a.date >= weekStart && a.date <= weekEnd)
  );
  const weekOwnLogs = mockWorkLogsState.filter(
    (w) => w.date >= weekStart && w.date <= weekEnd
  );

  if (weekApprovals.length === 0 && weekOwnLogs.length === 0) {
    return {
      role: 'manager' as const,
      weekStart,
      weekEnd,
      weekLabel,
      hasData: false,
      provider: 'timeflow-assistant',
      generatedAt: new Date().toISOString(),
      aiSynthesis: {
        headline: `No team timesheets or work logs recorded for ${weekLabel}.`,
        observations: [],
        suggestions: [],
      },
    };
  }

  const pendingApprovals = weekApprovals
    .filter((a) => a.status === 'Pending' || a.status === 'Submitted')
    .map((a) => {
      const primaryProjName = a.projects?.[0] || 'TimeFlow Core Platform';
      const matchedProj = mockProjectsState.find((p) => p.name === primaryProjName);
      return {
        id: a.id,
        employeeId: a.employee?.id || 'emp',
        employeeName: a.employee?.name || 'Team Member',
        projectId: matchedProj?.id,
        projectName: primaryProjName,
        taskName: a.taskName || 'Weekly Timesheet Submission',
        hours: Number(a.hours) || 0,
        date: a.date || weekStart,
        status: a.status,
        link: '/approvals',
      };
    });

  const pendingApprovalHours = pendingApprovals.reduce(
    (sum, item) => Math.round((sum + item.hours) * 10) / 10,
    0
  );

  // Build project progress grouped by project and employee from weekApprovals + weekOwnLogs
  const projectMap = new Map<
    string,
    {
      projectId: string;
      projectName: string;
      status: string;
      progress: number;
      weekHours: number;
      loggedHours: number;
      totalHours: number;
      dueDate?: string;
      employeesMap: Map<
        string,
        {
          employeeId: string;
          employeeName: string;
          hours: number;
          tasksCount: number;
          completedCount: number;
        }
      >;
    }
  >();

  const employeeHoursMap = new Map<string, number>();

  for (const appr of weekApprovals) {
    const empId = String(appr.employee?.id || 'emp');
    const empName = String(appr.employee?.name || 'Team Member');
    const totalApprHours = Number(appr.hours) || 0;
    employeeHoursMap.set(
      empId,
      Math.round(((employeeHoursMap.get(empId) || 0) + totalApprHours) * 10) / 10
    );

    const projNames = Array.isArray(appr.projects) && appr.projects.length > 0
      ? appr.projects
      : ['TimeFlow Core Platform'];
    const splitHours = Math.round((totalApprHours / projNames.length) * 10) / 10;

    for (const pName of projNames) {
      const matchedProj = mockProjectsState.find((p) => p.name === pName) || mockProjectsState[0];
      const pId = matchedProj?.id || 'p1';
      let grp = projectMap.get(pId);
      if (!grp) {
        grp = {
          projectId: pId,
          projectName: matchedProj?.name || pName,
          status: matchedProj?.status || 'Ongoing',
          progress: matchedProj?.progress || 65,
          weekHours: 0,
          loggedHours: matchedProj?.loggedHours || 120,
          totalHours: matchedProj?.totalHours || 200,
          dueDate: matchedProj?.dueDate,
          employeesMap: new Map(),
        };
        projectMap.set(pId, grp);
      }
      grp.weekHours = Math.round((grp.weekHours + splitHours) * 10) / 10;
      const empEntry = grp.employeesMap.get(empId) || {
        employeeId: empId,
        employeeName: empName,
        hours: 0,
        tasksCount: 0,
        completedCount: 0,
      };
      empEntry.hours = Math.round((empEntry.hours + splitHours) * 10) / 10;
      empEntry.tasksCount += 1;
      if (appr.status === 'Approved') {
        empEntry.completedCount += 1;
      }
      grp.employeesMap.set(empId, empEntry);
    }
  }

  for (const log of weekOwnLogs) {
    const empId = GUEST_USER.id;
    const empName = GUEST_USER.name;
    const hrs = Number(log.hours) || 0;
    employeeHoursMap.set(empId, Math.round(((employeeHoursMap.get(empId) || 0) + hrs) * 10) / 10);

    const matchedProj = mockProjectsState.find((p) => p.id === log.projectId || p.name === log.projectName);
    const pId = matchedProj?.id || log.projectId || 'p1';
    const pName = matchedProj?.name || log.projectName || 'TimeFlow Core Platform';

    let grp = projectMap.get(pId);
    if (!grp) {
      grp = {
        projectId: pId,
        projectName: pName,
        status: matchedProj?.status || 'Ongoing',
        progress: matchedProj?.progress || 70,
        weekHours: 0,
        loggedHours: matchedProj?.loggedHours || 100,
        totalHours: matchedProj?.totalHours || 160,
        dueDate: matchedProj?.dueDate,
        employeesMap: new Map(),
      };
      projectMap.set(pId, grp);
    }
    grp.weekHours = Math.round((grp.weekHours + hrs) * 10) / 10;
    const empEntry = grp.employeesMap.get(empId) || {
      employeeId: empId,
      employeeName: empName,
      hours: 0,
      tasksCount: 0,
      completedCount: 0,
    };
    empEntry.hours = Math.round((empEntry.hours + hrs) * 10) / 10;
    empEntry.tasksCount += 1;
    if (String(log.taskStatus || log.status) === 'Completed') {
      empEntry.completedCount += 1;
    }
    grp.employeesMap.set(empId, empEntry);
  }

  const projectProgress = Array.from(projectMap.values())
    .sort((a, b) => b.weekHours - a.weekHours)
    .map((g) => ({
      projectId: g.projectId,
      projectName: g.projectName,
      status: g.status,
      progress: g.progress,
      weekHours: g.weekHours,
      loggedHours: g.loggedHours,
      totalHours: g.totalHours,
      dueDate: g.dueDate,
      link: `/projects/${g.projectId}`,
      employees: Array.from(g.employeesMap.values())
        .sort((a, b) => b.hours - a.hours)
        .map((e) => ({
          ...e,
          link: '/employees',
        })),
    }));

  // Authorized team members for missing timesheets & attention check
  const authorizedTeam = mockEmployeesState.filter((u) => u.role === 'employee').slice(0, 6);
  const missingTimesheets: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    loggedHours: number;
    status: string;
    link: string;
  }> = [];

  for (const emp of authorizedTeam) {
    const logged = employeeHoursMap.get(emp.id) || 0;
    if (logged === 0) {
      missingTimesheets.push({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department || 'Engineering',
        loggedHours: 0,
        status: 'Missing timesheet (0h submitted)',
        link: '/approvals',
      });
    } else if (logged < 35) {
      missingTimesheets.push({
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department || 'Engineering',
        loggedHours: logged,
        status: `Below target (${logged.toFixed(1)}h / 40h)`,
        link: '/approvals',
      });
    }
  }

  const overdueOrAtRisk: Array<{
    id: string;
    title: string;
    projectId?: string;
    projectName: string;
    employeeName?: string;
    reason: string;
    dueDate?: string;
    link: string;
  }> = [];

  for (const p of mockProjectsState) {
    const origProj = PROJECTS.find((orig) => orig.id === p.id);
    if (
      origProj?.status === 'At Risk' ||
      origProj?.status === 'Over Budget' ||
      (p.totalHours > 0 && p.loggedHours / p.totalHours >= 0.85 && p.status !== 'Completed')
    ) {
      overdueOrAtRisk.push({
        id: `risk-${p.id}`,
        title: p.name,
        projectId: p.id,
        projectName: p.name,
        reason:
          origProj?.status === 'At Risk'
            ? `Flagged as At Risk (${p.loggedHours}h / ${p.totalHours}h budget used)`
            : `High budget burn (${p.progress}% of ${p.totalHours}h budget consumed)`,
        dueDate: p.dueDate,
        link: `/projects/${p.id}`,
      });
    }
  }

  for (const a of weekApprovals) {
    if (a.status === 'Rejected') {
      overdueOrAtRisk.push({
        id: `rej-${a.id}`,
        title: a.taskName || 'Rejected Timesheet',
        projectName: a.projects?.[0] || 'Client Portal Redesign',
        employeeName: a.employee?.name,
        reason: `Timesheet rejected (${a.hours}h) — awaiting revision`,
        dueDate: a.date,
        link: '/approvals',
      });
    }
  }

  const totalTeamHours = Array.from(employeeHoursMap.values()).reduce(
    (sum, h) => Math.round((sum + h) * 10) / 10,
    0
  );
  const teamCapacity = Math.max(40, (authorizedTeam.length + 1) * 40);
  const avgUtilization = Math.min(100, Math.round((totalTeamHours / teamCapacity) * 100));

  const highlights = {
    totalTeamHours,
    teamCapacity,
    avgUtilization,
    pendingApprovalsCount: pendingApprovals.length,
    pendingApprovalHours,
    activeProjectsCount: projectProgress.length,
    missingTimesheetsCount: missingTimesheets.length,
    overdueOrAtRiskCount: overdueOrAtRisk.length,
  };

  const topProj = projectProgress[0];

  return {
    role: 'manager' as const,
    weekStart,
    weekEnd,
    weekLabel,
    hasData: true,
    provider: 'timeflow-assistant',
    generatedAt: new Date().toISOString(),
    managerFacts: {
      pendingApprovals,
      projectProgress,
      attentionItems: {
        missingTimesheets,
        overdueOrAtRisk,
      },
      highlights,
    },
    aiSynthesis: {
      headline: `Team logged ${totalTeamHours.toFixed(1)}h (${avgUtilization}% capacity) across ${projectProgress.length} project${projectProgress.length === 1 ? '' : 's'}, with ${pendingApprovals.length} approval${pendingApprovals.length === 1 ? '' : 's'} awaiting review.`,
      observations: [
        topProj
          ? `${topProj.projectName} accounted for the largest share of team effort this week (${topProj.weekHours.toFixed(1)}h across ${topProj.employees.length} contributor${topProj.employees.length === 1 ? '' : 's'}).`
          : 'Team hours were distributed across active projects.',
        pendingApprovals.length > 0
          ? `${pendingApprovals.length} timesheet submission${pendingApprovals.length === 1 ? '' : 's'} (${pendingApprovalHours.toFixed(1)}h) are pending manager sign-off.`
          : 'All submitted timesheets for this week have been processed.',
        missingTimesheets.length > 0 || overdueOrAtRisk.length > 0
          ? `${missingTimesheets.length} team member${missingTimesheets.length === 1 ? ' has' : 's have'} unsubmitted/partial timesheets and ${overdueOrAtRisk.length} project or task item${overdueOrAtRisk.length === 1 ? ' requires' : 's require'} attention.`
          : 'No overdue tasks or missing timesheets flagged for this period.',
      ],
      suggestions: [
        pendingApprovals.length > 0
          ? `Review the ${pendingApprovals.length} pending approval${pendingApprovals.length === 1 ? '' : 's'} (${pendingApprovalHours.toFixed(1)}h) in Approvals to finalize weekly utilization.`
          : 'Approvals queue is clear for this week.',
        missingTimesheets.length > 0
          ? `Send a reminder to ${missingTimesheets.slice(0, 2).map((m) => m.employeeName).join(' and ')}${missingTimesheets.length > 2 ? ` (+${missingTimesheets.length - 2} more)` : ''} to submit their weekly hours.`
          : 'All assigned team members have logged their weekly hours.',
        overdueOrAtRisk.length > 0
          ? `Check ${overdueOrAtRisk[0].projectName} (${overdueOrAtRisk[0].reason}) to keep delivery on schedule.`
          : 'All active projects are tracking within budget.',
      ],
    },
  };
};

export const getMockDashboardAiChat = (payload: {
  message: string;
  weekStart?: string;
  role?: string;
  userId?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): DashboardChatResponse => {
  const summary = getMockDashboardAiWeeklySummary({
    weekStart: payload.weekStart,
    role: payload.role || 'manager',
    userId: payload.userId,
  });

  const normMsg = payload.message.trim().toLowerCase();
  const weekLabel = summary.weekLabel;
  const generatedAt = new Date().toISOString();
  const provider = 'timeflow-assistant';

  if (!summary.hasData) {
    const shortAnswer = `There is no recorded activity for ${weekLabel}. No timesheets, logged hours, or active project updates were found for this week.`;
    const detailedAnswer = `Your team currently has no work logs, pending timesheet submissions, or project hours logged during ${weekLabel}. You can select another week using the week selector above.`;
    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer,
      sourceLinks: [
        { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
        { label: 'View Team Projects', url: '/projects', type: 'project' },
      ],
      verifiedFacts: [],
      suggestions: ['Try selecting another week in the toolbar to review past or upcoming logs.'],
      hasData: false,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  const facts = summary.managerFacts;
  if (!facts) {
    const empFacts = summary.employeeFacts;
    if (empFacts) {
      const { highlights, completedTasks, timeByProject, workInProgressAndUpcoming } = empFacts;
      const pct = Math.round((highlights.totalHours / 40) * 100);

      // Employee query: tasks
      if (
        normMsg.includes('task') ||
        normMsg.includes('deliverable') ||
        normMsg.includes('logged')
      ) {
        const shortAnswer = `You have logged ${highlights.completedCount} completed task(s) and ${highlights.inProgressCount} active item(s) for ${weekLabel}, totaling ${highlights.totalHours.toFixed(1)}h.`;
        const taskLines = [
          ...completedTasks.slice(0, 4).map((t) => `• [Completed] ${t.taskName} (${t.projectName}) — ${t.hours}h [${t.date}]`),
          ...workInProgressAndUpcoming.slice(0, 4).map((t) => `• [${t.status}] ${t.taskName} (${t.projectName}) — ${t.hours}h logged`),
        ];
        return {
          reply: shortAnswer,
          shortAnswer,
          detailedAnswer: taskLines.length > 0 ? taskLines.join('\n') : 'No individual tasks found for this week.',
          sourceLinks: [
            { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
            { label: 'View Projects', url: '/projects', type: 'project' },
          ],
          verifiedFacts: [
            { title: 'Total Hours', detail: `${highlights.totalHours.toFixed(1)}h logged`, link: '/work-logs' },
            { title: 'Completed Tasks', detail: `${highlights.completedCount} tasks`, link: '/work-logs' },
            { title: 'Active Items', detail: `${highlights.inProgressCount} items`, link: '/work-logs' },
          ],
          suggestions: summary.aiSynthesis.suggestions,
          hasData: true,
          weekLabel,
          provider,
          generatedAt,
        };
      }

      // Employee query: distribution / project
      if (
        normMsg.includes('project') ||
        normMsg.includes('distribut') ||
        normMsg.includes('spend') ||
        normMsg.includes('hour')
      ) {
        const topProj = highlights.topProjectName
          ? `Your top focus was ${highlights.topProjectName} with ${highlights.topProjectHours.toFixed(1)}h (${highlights.topProjectPercentage}%).`
          : '';
        const shortAnswer = `You logged ${highlights.totalHours.toFixed(1)}h across ${timeByProject.length} project(s) for ${weekLabel}. ${topProj}`;
        const projLines = timeByProject.map((p) => `• ${p.projectName}: ${p.hours.toFixed(1)}h (${p.percentage}% of weekly logged time)`);
        return {
          reply: shortAnswer,
          shortAnswer,
          detailedAnswer: projLines.length > 0 ? projLines.join('\n') : undefined,
          sourceLinks: [
            { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
            { label: 'View Projects', url: '/projects', type: 'project' },
          ],
          verifiedFacts: timeByProject.slice(0, 3).map((p) => ({
            title: p.projectName,
            detail: `${p.hours.toFixed(1)}h (${p.percentage}%)`,
            link: p.link,
          })),
          suggestions: summary.aiSynthesis.suggestions,
          hasData: true,
          weekLabel,
          provider,
          generatedAt,
        };
      }

      // Default employee summary
      const shortAnswer = `For ${weekLabel}, you logged ${highlights.totalHours.toFixed(1)}h (${pct}% of your 40h target) across ${timeByProject.length} project(s).`;
      const detailedAnswer = summary.aiSynthesis.observations.join('\n');
      return {
        reply: shortAnswer,
        shortAnswer,
        detailedAnswer,
        sourceLinks: [
          { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
          { label: 'View Projects', url: '/projects', type: 'project' },
        ],
        verifiedFacts: [
          { title: 'Weekly Hours', detail: `${highlights.totalHours.toFixed(1)}h / 40h (${pct}%)`, link: '/work-logs' },
          { title: 'Active Projects', detail: `${timeByProject.length} project(s)`, link: '/projects' },
        ],
        suggestions: summary.aiSynthesis.suggestions,
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const shortAnswer = `Activity is recorded for ${weekLabel}.`;
    return {
      reply: shortAnswer,
      shortAnswer,
      sourceLinks: [{ label: 'View Work Logs', url: '/work-logs', type: 'timesheet' }],
      verifiedFacts: [],
      suggestions: summary.aiSynthesis.suggestions,
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  const { highlights, pendingApprovals, projectProgress, attentionItems } = facts;

  // Starter 1: "Summarize this week for my team"
  if (
    normMsg.includes('summarize') ||
    normMsg.includes('summary') ||
    normMsg.includes('overview') ||
    normMsg.includes('team activity') ||
    normMsg.includes('this week')
  ) {
    const shortAnswer = `This week (${weekLabel}), your team logged ${highlights.totalTeamHours.toFixed(1)}h across ${highlights.activeProjectsCount} active projects with ${highlights.avgUtilization}% average capacity utilization. You have ${highlights.pendingApprovalsCount} timesheet(s) awaiting approval and ${highlights.missingTimesheetsCount} missing submission(s).`;

    const projectLines = projectProgress
      .slice(0, 4)
      .map((p) => `• ${p.projectName}: ${p.weekHours.toFixed(1)}h logged (${p.progress}% done, status: ${p.status})`);

    const detailedAnswer = [
      `Weekly Capacity: ${highlights.totalTeamHours.toFixed(1)}h logged of ${highlights.teamCapacity}h target (${highlights.avgUtilization}% utilization).`,
      `Pending Reviews: ${highlights.pendingApprovalsCount} timesheet submissions (${highlights.pendingApprovalHours.toFixed(1)}h total).`,
      `Active Projects:`,
      ...projectLines,
      attentionItems.missingTimesheets.length > 0
        ? `Missing Timesheets: ${attentionItems.missingTimesheets.map((m) => m.employeeName).join(', ')}.`
        : 'All team members have logged hours this week.',
    ].join('\n');

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer,
      sourceLinks: [
        { label: `Review Approvals (${highlights.pendingApprovalsCount})`, url: '/approvals', count: highlights.pendingApprovalsCount, type: 'approval' },
        { label: `Explore Projects (${highlights.activeProjectsCount})`, url: '/projects', count: highlights.activeProjectsCount, type: 'project' },
        { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
      ],
      verifiedFacts: [
        { title: 'Team Logged Time', detail: `${highlights.totalTeamHours.toFixed(1)}h / ${highlights.teamCapacity}h (${highlights.avgUtilization}%)`, link: '/work-logs' },
        { title: 'Pending Approvals', detail: `${highlights.pendingApprovalsCount} timesheets (${highlights.pendingApprovalHours.toFixed(1)}h)`, link: '/approvals' },
        { title: 'Tracked Projects', detail: `${highlights.activeProjectsCount} projects active`, link: '/projects' },
        { title: 'Timesheet Alerts', detail: `${highlights.missingTimesheetsCount} unsubmitted`, link: '/work-logs' },
      ],
      suggestions: summary.aiSynthesis.suggestions,
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  // Starter 2: "What approvals need my attention?"
  if (
    normMsg.includes('approval') ||
    normMsg.includes('approve') ||
    normMsg.includes('pending')
  ) {
    if (pendingApprovals.length === 0) {
      const shortAnswer = `All timesheets for ${weekLabel} are up to date! You currently have zero pending approvals waiting for review.`;
      return {
        reply: shortAnswer,
        shortAnswer,
        detailedAnswer: 'No pending submissions found for this period in Approvals.',
        sourceLinks: [{ label: 'Open Approvals', url: '/approvals', type: 'approval' }],
        verifiedFacts: [{ title: 'Pending Count', detail: '0 pending items', link: '/approvals' }],
        suggestions: ['Check work logs to view logged hours.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const uniqueEmployees = Array.from(new Set(pendingApprovals.map((a) => a.employeeName)));
    const namesDisplay = uniqueEmployees.slice(0, 3).join(', ') + (uniqueEmployees.length > 3 ? ` +${uniqueEmployees.length - 3} more` : '');
    const shortAnswer = `You have ${pendingApprovals.length} pending timesheet submission(s) totaling ${highlights.pendingApprovalHours.toFixed(1)}h awaiting your approval from ${namesDisplay}.`;

    const approvalItems = pendingApprovals.map(
      (a) => `• ${a.employeeName} — ${a.hours.toFixed(1)}h on ${a.projectName} (${a.taskName}) [${a.date}]`
    );

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer: [
        `Pending Timesheets (${pendingApprovals.length} total, ${highlights.pendingApprovalHours.toFixed(1)}h):`,
        ...approvalItems,
      ].join('\n'),
      sourceLinks: [
        { label: `Review ${pendingApprovals.length} Pending Approval(s)`, url: '/approvals', count: pendingApprovals.length, type: 'approval' },
      ],
      verifiedFacts: pendingApprovals.slice(0, 4).map((a) => ({
        title: a.employeeName,
        detail: `${a.hours}h on ${a.projectName} (${a.taskName})`,
        link: '/approvals',
      })),
      suggestions: ['Approve or reject timesheets promptly to maintain current project costs.'],
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  // Starter 3: "Which projects need attention?"
  if (
    normMsg.includes('project') ||
    normMsg.includes('attention') ||
    normMsg.includes('risk') ||
    normMsg.includes('overdue') ||
    normMsg.includes('delay') ||
    normMsg.includes('budget')
  ) {
    const atRiskOrOverdue = attentionItems.overdueOrAtRisk;
    const atRiskProjects = projectProgress.filter((p) => p.status === 'At Risk' || (p.totalHours > 0 && p.loggedHours > p.totalHours));

    if (atRiskOrOverdue.length === 0 && atRiskProjects.length === 0) {
      const shortAnswer = `All ${projectProgress.length} tracked projects are healthy and on schedule for ${weekLabel}, with no at-risk flags or overdue milestones.`;
      const detailedAnswer = projectProgress
        .map((p) => `• ${p.projectName}: ${p.progress}% completed (${p.weekHours.toFixed(1)}h logged this week, ${p.employees.length} contributors) — Status: ${p.status}`)
        .join('\n');

      return {
        reply: shortAnswer,
        shortAnswer,
        detailedAnswer,
        sourceLinks: [{ label: 'View All Projects', url: '/projects', type: 'project' }],
        verifiedFacts: projectProgress.slice(0, 3).map((p) => ({
          title: p.projectName,
          detail: `${p.progress}% done • ${p.status}`,
          link: p.link,
        })),
        suggestions: ['Maintain regular syncs with project owners.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const flaggedNames = Array.from(new Set([...atRiskOrOverdue.map((r) => r.projectName), ...atRiskProjects.map((p) => p.projectName)]));
    const shortAnswer = `${flaggedNames.length} project item(s) need your attention: ${flaggedNames.join(', ')}.`;

    const detailLines: string[] = [];
    for (const item of atRiskOrOverdue) {
      detailLines.push(`• ${item.projectName}: ${item.title} — ${item.reason}${item.dueDate ? ` (Due: ${item.dueDate})` : ''}`);
    }
    for (const p of atRiskProjects) {
      if (!atRiskOrOverdue.some((r) => r.projectName === p.projectName)) {
        detailLines.push(`• ${p.projectName}: Status is ${p.status} with ${p.loggedHours}h logged of ${p.totalHours}h budget (${p.progress}% done).`);
      }
    }

    const sourceLinks: DashboardChatSourceLink[] = flaggedNames.slice(0, 3).map((name) => {
      const proj = projectProgress.find((p) => p.projectName === name);
      return {
        label: `Inspect ${name}`,
        url: proj ? proj.link : '/projects',
        type: 'project',
      };
    });
    sourceLinks.push({ label: 'All Projects', url: '/projects', type: 'project' });

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer: detailLines.join('\n'),
      sourceLinks,
      verifiedFacts: atRiskOrOverdue.slice(0, 3).map((r) => ({
        title: r.projectName,
        detail: r.reason,
        link: r.link,
      })),
      suggestions: ['Inspect project timelines and rebalance team tasks if necessary.'],
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  // Starter 4: "Who hasn’t submitted their timesheet?"
  if (
    normMsg.includes('who') ||
    normMsg.includes('submitt') ||
    normMsg.includes('missing') ||
    normMsg.includes('timesheet') ||
    normMsg.includes('logged')
  ) {
    const missing = attentionItems.missingTimesheets;

    if (missing.length === 0) {
      const shortAnswer = `Great news! Every active team member has recorded hours and submitted their timesheet for ${weekLabel}.`;
      return {
        reply: shortAnswer,
        shortAnswer,
        detailedAnswer: `All authorized employees have logged hours toward their weekly target during ${weekLabel}. Total team hours: ${highlights.totalTeamHours.toFixed(1)}h.`,
        sourceLinks: [{ label: 'View Team Work Logs', url: '/work-logs', type: 'timesheet' }],
        verifiedFacts: [{ title: 'Submission Rate', detail: '100% of team has logged time', link: '/work-logs' }],
        suggestions: ['Review timesheets in Approvals before closing out the cycle.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const missingNames = missing.map((m) => m.employeeName);
    const shortAnswer = `${missing.length} team member(s) have missing or incomplete timesheets for ${weekLabel}: ${missingNames.join(', ')}.`;

    const detailLines = missing.map(
      (m) => `• ${m.employeeName} (${m.department}) — Logged ${m.loggedHours.toFixed(1)}h of 40h (${m.status})`
    );

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer: detailLines.join('\n'),
      sourceLinks: [{ label: `Review Missing Timesheets (${missing.length})`, url: '/work-logs', count: missing.length, type: 'timesheet' }],
      verifiedFacts: missing.slice(0, 4).map((m) => ({
        title: m.employeeName,
        detail: `${m.department} • ${m.loggedHours}h logged • ${m.status}`,
        link: m.link,
      })),
      suggestions: [`Send a reminder to ${missingNames.slice(0, 2).join(' and ')} to submit their weekly timesheets.`],
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  // Check if asking about a specific project by name
  for (const proj of projectProgress) {
    if (normMsg.includes(proj.projectName.toLowerCase())) {
      const shortAnswer = `${proj.projectName} is currently ${proj.status} at ${proj.progress}% completion. Your team logged ${proj.weekHours.toFixed(1)}h on it this week across ${proj.employees.length} contributor(s).`;
      const detailedAnswer = [
        `Project: ${proj.projectName} (Status: ${proj.status})`,
        `Progress: ${proj.progress}% • Total Logged: ${proj.loggedHours}h / ${proj.totalHours || 'No budget cap'}h`,
        `Week Contributors:`,
        ...proj.employees.map((e) => `• ${e.employeeName}: ${e.hours.toFixed(1)}h (${e.tasksCount} tasks)`),
      ].join('\n');
      return {
        reply: shortAnswer,
        shortAnswer,
        detailedAnswer,
        sourceLinks: [{ label: `Open ${proj.projectName}`, url: proj.link, type: 'project' }],
        verifiedFacts: [{ title: proj.projectName, detail: `${proj.weekHours}h this week • ${proj.progress}% done`, link: proj.link }],
        suggestions: [`Check deliverables on ${proj.projectName} to maintain velocity.`],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }
  }

  // Out of domain
  const shortAnswer = `I don't have records for that in TimeFlow. As your weekly team assistant, I can answer questions about your team's logged hours, pending approvals, project progress, and missing timesheets for ${weekLabel}.`;
  const detailedAnswer = `Available records for ${weekLabel}:\n• Total team hours: ${highlights.totalTeamHours.toFixed(1)}h (${highlights.avgUtilization}% capacity)\n• Active projects: ${highlights.activeProjectsCount}\n• Pending approvals: ${highlights.pendingApprovalsCount}\n• Missing timesheet alerts: ${highlights.missingTimesheetsCount}\n\nTry clicking one of the starter questions above!`;

  return {
    reply: shortAnswer,
    shortAnswer,
    detailedAnswer,
    sourceLinks: [
      { label: 'View Approvals', url: '/approvals', type: 'approval' },
      { label: 'View Projects', url: '/projects', type: 'project' },
      { label: 'View Work Logs', url: '/work-logs', type: 'timesheet' },
    ],
    verifiedFacts: [],
    suggestions: [
      '“Summarize this week for my team”',
      '“What approvals need my attention?”',
      '“Which projects need attention?”',
      '“Who hasn’t submitted their timesheet?”',
    ],
    hasData: true,
    weekLabel,
    provider,
    generatedAt,
  };
};


