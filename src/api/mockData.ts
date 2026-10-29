import { USERS, PROJECTS } from '../data/dummy';
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
  color: '#4f46e5',
  avatar: '',
  status: 'Active',
};

export const getMockWorkLogs = () => [
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
    tickets: [],
    linkedTickets: [],
  },
];

export const getMockProjects = () => PROJECTS.map((p) => {
  const memberObjs = (p.teamMembers || []).map((mId) => {
    const user = USERS.find((u) => u.id === mId);
    return user
      ? { id: user.id, name: user.name, initials: user.initials, color: user.color, role: user.role }
      : { id: String(mId), name: 'Team Member', initials: 'TM', color: '#6366f1', role: 'employee' };
  });

  return {
    ...p,
    teamMembers: memberObjs,
    managers: [{ id: 'u1', name: 'Arun Singh', initials: 'AS', color: '#9333EA', role: 'manager' }],
    projectType: p.priority === 'Critical' ? 'Internal' : 'Billable',
    type: p.priority === 'Critical' ? 'Internal' : 'Billable',
    tasks: getMockWorkLogs().filter((w) => w.projectId === p.id),
    recentTasks: getMockWorkLogs().filter((w) => w.projectId === p.id),
  };
});

export const getMockApprovals = () => [
  {
    id: 'appr-1',
    timesheetId: 'ts-1',
    employee: USERS[2], // Sarah Chen
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    projects: ['TimeFlow Core Platform', 'Analytics Dashboard'],
    hours: 38.5,
    submittedDate: 'Yesterday at 5:30 PM',
    status: 'Pending',
    comments: 'All weekly sprint tasks finished on schedule. Awaiting manager approval.',
  },
  {
    id: 'appr-2',
    timesheetId: 'ts-2',
    employee: USERS[4], // Emma Torres
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    projects: ['Client Portal Redesign', 'TimeFlow Core Platform'],
    hours: 36.0,
    submittedDate: 'Today at 9:15 AM',
    status: 'Pending',
    comments: 'Completed responsive navigation and design system tokens.',
  },
  {
    id: 'appr-3',
    timesheetId: 'ts-3',
    employee: USERS[5], // Jordan Lee
    period: `${getCurrentWeekDay(0)} – ${getCurrentWeekDay(4)}`,
    projects: ['Analytics Dashboard', 'Mobile App v3'],
    hours: 35.0,
    submittedDate: '2 hours ago',
    status: 'Pending',
    comments: 'QA test suites executed with 98% pass rate.',
  },
  {
    id: 'appr-4',
    timesheetId: 'ts-4',
    employee: USERS[3], // Aisha Rahman
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    projects: ['Infrastructure Migration'],
    hours: 40.0,
    submittedDate: 'Last week',
    status: 'Approved',
    comments: 'Infrastructure migration milestones cleared successfully.',
  },
  {
    id: 'appr-5',
    timesheetId: 'ts-5',
    employee: USERS[7], // Alex Kim
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    projects: ['TimeFlow Core Platform', 'Analytics Dashboard'],
    hours: 28.0,
    submittedDate: 'Last week',
    status: 'Approved',
    comments: 'Approved by Engineering Manager.',
  },
  {
    id: 'appr-6',
    timesheetId: 'ts-6',
    employee: USERS[6], // Marcus Johnson
    period: `${getPreviousWeekDay(0)} – ${getPreviousWeekDay(4)}`,
    projects: ['Client Portal Redesign'],
    hours: 42.0,
    submittedDate: 'Last week',
    status: 'Rejected',
    comments: 'Overtime hours need prior client sign-off before approving.',
  },
];

export const getMockEmployeeDashboard = () => {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const dailyHours = [7.5, 8.0, 7.5, 7.5, 8.0];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekHours = days.map((day, i) => {
    const isToday = i === todayIdx;
    return {
      day,
      date: getCurrentWeekDay(i).slice(5),
      hours: i <= todayIdx ? dailyHours[i] : (i === 4 ? 4 : 0),
      target: 8,
      isToday,
    };
  });

  const weekTotal = weekHours.reduce((sum, d) => sum + d.hours, 0);

  return {
    todayHours: 7.5,
    weekTotal,
    weekHours,
    activeProjects: 4,
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
      { id: 'act-1', initials: 'AM', color: '#4f46e5', message: 'You logged 4.0h on Analytics Dashboard', time: '2 hours ago' },
      { id: 'act-2', initials: 'AM', color: '#4f46e5', message: 'You submitted timesheet for review', time: 'Yesterday' },
      { id: 'act-3', initials: 'AS', color: '#9333EA', message: 'Arun approved your task on Core Platform', time: '2 days ago' },
    ],
  };
};

export const getMockManagerDashboard = () => ({
  stats: {
    total_active_members: 12,
    total_departments: 5,
    active_projects: 5,
    pending_approvals: 3,
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
  assignedProjects: getMockProjects().slice(0, 3).map((p) => ({
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
  employeeTable: [
    { user: USERS[2], status: 'Active', utilization: 92, projects: 3, weekHours: 38.5, timesheetStatus: 'Pending' },
    { user: USERS[4], status: 'Active', utilization: 88, projects: 2, weekHours: 36.0, timesheetStatus: 'Pending' },
    { user: USERS[5], status: 'Active', utilization: 85, projects: 2, weekHours: 35.0, timesheetStatus: 'Pending' },
    { user: USERS[7], status: 'Active', utilization: 80, projects: 3, weekHours: 32.0, timesheetStatus: 'Approved' },
    { user: USERS[3], status: 'Active', utilization: 95, projects: 1, weekHours: 40.0, timesheetStatus: 'Approved' },
    { user: USERS[6], status: 'Active', utilization: 72, projects: 2, weekHours: 30.0, timesheetStatus: 'In Progress' },
    { user: USERS[8], status: 'Active', utilization: 78, projects: 2, weekHours: 34.0, timesheetStatus: 'Submitted' },
  ],
});

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

