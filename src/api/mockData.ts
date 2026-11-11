import { USERS, PROJECTS, NOTIFICATIONS } from '../data/dummy';
import type { Role } from '../types';

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
  weekHours: u.hoursThisWeek || 36,
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
  const proj = mockProjectsState.find((p) => p.id === payload.projectId);
  const newLog = {
    id: `wl-demo-${Date.now()}`,
    userId: 'guest-demo-user',
    projectId: payload.projectId || 'p1',
    projectName: proj?.name || (payload.projectId === 'internal' ? 'Internal' : 'TimeFlow Core Platform'),
    taskName: payload.taskName || 'Work Log Task',
    taskDescription: payload.taskDescription || '',
    hours: Number(payload.hours) || 1,
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
