import type { User, Project, WorkLog, Timesheet, Approval, Notification, ActivityItem, DeptUtilization } from '../types';

export const USERS: User[] = [
  { id: 'u0', name: 'Blesson S',       email: 'blesson.s@timeflow.com', role: 'admin',    department: 'Management',    designation: 'System Admin',       avatar: '', initials: 'BS', color: '#2563EB' },
  { id: 'u1', name: 'Arun Singh',     email: 'arun.singh@timeflow.io', role: 'manager',  department: 'Product',        designation: 'Project Manager',    avatar: '', initials: 'AS', color: '#9333EA' },
  { id: 'u3', name: 'Sarah Chen',     email: 'sarah.chen@timeflow.io', role: 'employee', department: 'Engineering',  designation: 'Sr. Engineer',       avatar: '', initials: 'SC', color: '#2563EB' },
  { id: 'u2', name: 'Aisha Rahman',   email: 'a.rahman@timeflow.io', role: 'employee', department: 'Infrastructure', designation: 'DevOps Engineer',    avatar: '', initials: 'AR', color: '#EA580C' },
  { id: 'u4', name: 'Emma Torres',    email: 'e.torres@timeflow.io', role: 'employee', department: 'Engineering',   designation: 'Frontend Engineer',  avatar: '', initials: 'ET', color: '#D97706' },
  { id: 'u5', name: 'Jordan Lee',     email: 'j.lee@timeflow.io',    role: 'employee', department: 'QA',            designation: 'QA Engineer',        avatar: '', initials: 'JL', color: '#059669' },
  { id: 'u6', name: 'Marcus Johnson', email: 'marcus@timeflow.io',   role: 'employee', department: 'Design',        designation: 'Product Designer',   avatar: '', initials: 'MJ', color: '#7C3AED' },
  { id: 'u7', name: 'Alex Kim',       email: 'alex.k@timeflow.io',   role: 'employee', department: 'Engineering',   designation: 'Full Stack Engineer',avatar: '', initials: 'AK', color: '#0891B2' },
  { id: 'u8', name: 'Noah Williams',  email: 'n.williams@timeflow.io',role: 'employee', department: 'Engineering',  designation: 'Backend Engineer',   avatar: '', initials: 'NW', color: '#65A30D' },
  { id: 'u9', name: 'Rahul',          email: 'rahul@timeflow.io',     role: 'manager',  department: 'Engineering',  designation: 'Eng. Manager',       avatar: '', initials: 'RA', color: '#2563EB' },
  { id: 'u10', name: 'Kiran Ravikumar',email: 'kiran.r@timeflow.io',  role: 'ceo',      department: 'Executive',    designation: 'Chief Executive Officer', avatar: '', initials: 'KR', color: '#1E1B4B' },
  { id: 'u11', name: 'Reshma',        email: 'reshma@timeflow.io',    role: 'hr',       department: 'Human Resources', designation: 'HR Lead',          avatar: '', initials: 'RE', color: '#DB2777' },
  { id: 'u12', name: 'Nidheesh KK',   email: 'nidheesh.kk@timeflow.io',role: 'manager', department: 'Engineering',  designation: 'Engineering Lead',   avatar: '', initials: 'NK', color: '#059669' },
];

export const CURRENT_EMPLOYEE: User = USERS[2]; // Sarah Chen
export const CURRENT_MANAGER: User = USERS[8];  // Rahul

export const PROJECTS: Project[] = [
  { id: 'p2', name: 'Analytics Dashboard',     description: 'Real-time analytics dashboard with custom reporting, data export, and executive summary views.', status: 'On Track', priority: 'Medium', totalHours: 400,  loggedHours: 356,  dueDate: 'Jul 20, 2026', teamMembers: ['u3','u1','u7'],          progress: 89 },
  { id: 'p1', name: 'TimeFlow Core Platform',  description: 'Core platform rebuild with microservices architecture, new API layer, and performance optimization across all modules.', status: 'On Track', priority: 'High',   totalHours: 1200, loggedHours: 816,  dueDate: 'Sep 30, 2026', teamMembers: ['u3','u7','u5','u4'], progress: 68 },
  { id: 'p5', name: 'Infrastructure Migration', description: 'Migrate on-premise infrastructure to AWS with zero-downtime deployment strategy and full DR setup.', status: 'Over Budget', priority: 'Critical', totalHours: 500,  loggedHours: 275,  dueDate: 'Sep 15, 2026', teamMembers: ['u7','u5','u2'],               progress: 55 },
  { id: 'p3', name: 'Client Portal Redesign',  description: 'Complete redesign of the client-facing portal with new design system, improved UX, and mobile-first approach.', status: 'At Risk',  priority: 'High',   totalHours: 600,  loggedHours: 252,  dueDate: 'Aug 15, 2026', teamMembers: ['u6','u1'],          progress: 42 },
  { id: 'p4', name: 'Mobile App v3',           description: 'Third generation mobile application with offline support, push notifications, and redesigned navigation.', status: 'On Track',  priority: 'Medium',   totalHours: 800,  loggedHours: 96,  dueDate: 'Oct 1, 2026',  teamMembers: ['u6','u5'],          progress: 12 },
];

export const WORK_LOGS: WorkLog[] = [
  { id: 'wl1', userId: 'u3', projectId: 'p1', projectName: 'TimeFlow Core Platform',  taskName: 'API gateway refactor',          linkedTickets: [{ id: 't1', ticketNumber: 'JIRA-324', provider: 'Jira' }],                             hours: 3,   date: '2026-07-10', status: 'Completed'  },
  { id: 'wl2', userId: 'u3', projectId: 'p2', projectName: 'Analytics Dashboard',     taskName: 'Chart component optimization',  linkedTickets: [{ id: 't2', ticketNumber: 'GH-88', provider: 'GitHub' }],                              hours: 2.5, date: '2026-07-10', status: 'In Progress' },
  { id: 'wl3', userId: 'u3', projectId: 'p1', projectName: 'TimeFlow Core Platform',  taskName: 'Database schema updates',       linkedTickets: [{ id: 't3', ticketNumber: 'JIRA-325', provider: 'Jira' }, { id: 't4', ticketNumber: 'LIN-55', provider: 'Linear' }], hours: 4, date: '2026-07-09', status: 'Completed' },
  { id: 'wl4', userId: 'u3', projectId: 'p3', projectName: 'Client Portal Redesign',  taskName: 'Design system components',      linkedTickets: [],                                                                                   hours: 3,   date: '2026-07-09', status: 'In Progress' },
  { id: 'wl5', userId: 'u3', projectId: 'p2', projectName: 'Analytics Dashboard',     taskName: 'Backend data pipeline',         linkedTickets: [{ id: 't5', ticketNumber: 'GH-91', provider: 'GitHub' }],                             hours: 3.5, date: '2026-07-08', status: 'Completed'  },
  { id: 'wl6', userId: 'u3', projectId: 'p1', projectName: 'TimeFlow Core Platform',  taskName: 'Performance testing',           linkedTickets: [],                                                                                   hours: 2,   date: '2026-07-08', status: 'Not Started' },
  { id: 'wl7', userId: 'u3', projectId: 'p3', projectName: 'Client Portal Redesign',  taskName: 'Responsive layout fixes',       linkedTickets: [{ id: 't6', ticketNumber: 'LIN-60', provider: 'Linear' }],                           hours: 2,   date: '2026-07-07', status: 'Completed'  },
];

export const TIMESHEETS: Timesheet[] = [
  { id: 'ts1', userId: 'u3', userName: 'Sarah Chen',     userInitials: 'SC', userColor: '#2563EB', userDesignation: 'Sr. Engineer',       weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 38.5, status: 'Pending',   projects: ['TimeFlow Core Platform', 'Analytics Dashboard'], submittedDate: 'Jul 7, 2026' },
  { id: 'ts2', userId: 'u6', userName: 'Marcus Johnson', userInitials: 'MJ', userColor: '#7C3AED', userDesignation: 'Product Designer',   weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 32,   status: 'Pending',   projects: ['Client Portal Redesign', 'Mobile App v3'],        submittedDate: 'Jul 7, 2026' },
  { id: 'ts3', userId: 'u7', userName: 'Alex Kim',       userInitials: 'AK', userColor: '#0891B2', userDesignation: 'Full Stack Engineer',weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 28,   status: 'Approved',  projects: ['TimeFlow Core Platform', 'Infrastructure Migration'],submittedDate: 'Jul 6, 2026' },
  { id: 'ts4', userId: 'u5', userName: 'Jordan Lee',     userInitials: 'JL', userColor: '#059669', userDesignation: 'QA Engineer',        weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 35,   status: 'Pending',   projects: ['Analytics Dashboard', 'Mobile App v3'],            submittedDate: 'Jul 7, 2026' },
  { id: 'ts5', userId: 'u4', userName: 'Emma Torres',    userInitials: 'ET', userColor: '#D97706', userDesignation: 'Frontend Engineer',  weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 36,   status: 'Approved',  projects: ['TimeFlow Core Platform', 'Client Portal Redesign'],submittedDate: 'Jul 6, 2026' },
  { id: 'ts6', userId: 'u1', userName: 'Arun Singh',     userInitials: 'AS', userColor: '#9333EA', userDesignation: 'Project Manager',    weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 43,   status: 'Rejected',  projects: ['Client Portal Redesign', 'Analytics Dashboard'],   submittedDate: 'Jul 7, 2026' },
  { id: 'ts7', userId: 'u9', userName: 'Rahul',          userInitials: 'RA', userColor: '#2563EB', userDesignation: 'Eng. Manager',       weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 40,   status: 'Submitted', projects: ['TimeFlow Core Platform'],                            submittedDate: 'Jul 7, 2026' },
  { id: 'ts8', userId: 'u11', userName: 'Reshma',        userInitials: 'RE', userColor: '#DB2777', userDesignation: 'HR Lead',          weekStart: 'Jun 30', weekEnd: 'Jul 6', totalHours: 37.5, status: 'Submitted', projects: ['Internal HR Operations'],                       submittedDate: 'Jul 7, 2026' },
];

export const APPROVALS: Approval[] = TIMESHEETS.map(ts => ({
  id: 'a' + ts.id,
  timesheetId: ts.id,
  employee: USERS.find(u => u.id === ts.userId)!,
  period: `${ts.weekStart} – ${ts.weekEnd}`,
  projects: ts.projects,
  hours: ts.totalHours,
  submittedDate: ts.submittedDate,
  status: ts.status === 'Pending' ? 'Pending' : ts.status === 'Approved' ? 'Approved' : 'Rejected',
}));

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'approval',    message: 'Sarah Chen submitted timesheet for Jun 30 – Jul 6', time: '2h ago', read: false },
  { id: 'n2', type: 'approval',    message: 'Marcus Johnson submitted timesheet for Jun 30 – Jul 6', time: '3h ago', read: false },
  { id: 'n3', type: 'submission',  message: 'Alex Kim\'s timesheet has been approved', time: '4h ago', read: true },
  { id: 'n4', type: 'project',     message: 'Client Portal Redesign moved to At Risk', time: 'Yesterday', read: true },
];

export const ACTIVITY: ActivityItem[] = [
  { id: 'a1', userId: 'u3', userInitials: 'SC', userColor: '#2563EB', message: 'Sarah logged 3.5h on eGlobe Core Platform', time: '1h ago' },
  { id: 'a2', userId: 'u7', userInitials: 'AK', userColor: '#0891B2', message: 'Alex submitted timesheet for Jun 30 – Jul 6', time: '4h ago' },
  { id: 'a3', userId: 'u1', userInitials: 'PP', userColor: '#9333EA', message: 'Priya updated Analytics Dashboard to In Review', time: 'Yesterday' },
  { id: 'a4', userId: 'u6', userInitials: 'MJ', userColor: '#7C3AED', message: 'Marcus logged 6h on Client Portal Redesign', time: 'Yesterday' },
];

export const DEPT_UTILIZATION: DeptUtilization[] = [
  { dept: 'Engineering', utilization: 87, color: '#F97316' },
  { dept: 'Design',      utilization: 72, color: '#F97316' },
  { dept: 'Product',     utilization: 95, color: '#22C55E' },
  { dept: 'QA',          utilization: 78, color: '#F97316' },
  { dept: 'Infra',       utilization: 91, color: '#22C55E' },
];

export const MONTHLY_HOURS = [
  { month: 'Feb', hours: 148 },
  { month: 'Mar', hours: 152 },
  { month: 'Apr', hours: 145 },
  { month: 'May', hours: 160 },
  { month: 'Jun', hours: 158 },
  { month: 'Jul', hours: 142 },
];

export const WEEK_HOURS = [
  { day: 'MON', date: 'Jul 7',  hours: 7.5, target: 8 },
  { day: 'TUE', date: 'Jul 8',  hours: 8,   target: 8 },
  { day: 'WED', date: 'Jul 9',  hours: 6.5, target: 8 },
  { day: 'THU', date: 'Jul 10', hours: 5.5, target: 8, isToday: true },
  { day: 'FRI', date: 'Jul 11', hours: 0,   target: 8 },
];

export const EMPLOYEE_TABLE = [
  { user: USERS[0], status: 'Active' as const,    utilization: 95, projects: 3, weekHours: 41,   timesheetStatus: 'Approved'     as const },
  { user: USERS[1], status: 'Active' as const,    utilization: 91, projects: 2, weekHours: 40,   timesheetStatus: 'Approved'     as const },
  { user: USERS[2], status: 'Active' as const,    utilization: 87, projects: 3, weekHours: 38.5, timesheetStatus: 'Submitted'    as const },
  { user: USERS[3], status: 'Active' as const,    utilization: 83, projects: 2, weekHours: 36,   timesheetStatus: 'Approved'     as const },
  { user: USERS[4], status: 'Active' as const,    utilization: 78, projects: 2, weekHours: 35,   timesheetStatus: 'Submitted'    as const },
  { user: USERS[5], status: 'Active' as const,    utilization: 72, projects: 2, weekHours: 32,   timesheetStatus: 'Submitted'    as const },
  { user: USERS[6], status: 'Active' as const,    utilization: 63, projects: 3, weekHours: 28,   timesheetStatus: 'In Progress'  as const },
  { user: USERS[7], status: 'On Leave' as const,  utilization: 45, projects: 1, weekHours: 28,   timesheetStatus: 'Not Started'  as const },
];

export const DEFAULT_HR_USER: User =
  USERS.find((u) => u.role === 'hr') || {
    id: 'u-hr',
    name: 'HR Team',
    email: 'hr@timeflow.io',
    role: 'hr',
    department: 'Human Resources',
    designation: 'HR Lead',
    avatar: '',
    initials: 'HR',
    color: '#2563EB',
  };

export const DEFAULT_MANAGER_USER: User =
  USERS.find((u) => u.id === 'u9') ||
  USERS.find((u) => u.role === 'manager') ||
  CURRENT_MANAGER;

export const PROJECT_HEX_MAP: Record<string, string> = {
  blue: '#2563eb',
  green: '#16a34a',
  purple: '#9333ea',
  orange: '#f97316',
  red: '#ef4444',
};

export interface ProjectExtraMeta {
  b1: string;
  b1Color: string;
  b2: string;
  b2Color: string;
  client: string;
  color: string;
  hex: string;
  status: string;
  priority: string;
}

export const PROJECT_EXTRAS: Record<string, ProjectExtraMeta> = {
  p1: {
    b1: 'Active',
    b1Color: 'green',
    b2: 'High',
    b2Color: 'orange',
    client: 'Internal',
    color: 'blue',
    hex: '#2563eb',
    status: 'Active',
    priority: 'High',
  },
  p2: {
    b1: 'In Review',
    b1Color: 'yellow',
    b2: 'Medium',
    b2Color: 'blue',
    client: 'RetailMax',
    color: 'green',
    hex: '#16a34a',
    status: 'In Review',
    priority: 'Medium',
  },
  p3: {
    b1: 'Active',
    b1Color: 'green',
    b2: 'High',
    b2Color: 'orange',
    client: 'FinTech Corp',
    color: 'purple',
    hex: '#9333ea',
    status: 'Active',
    priority: 'High',
  },
  p4: {
    b1: 'Planning',
    b1Color: 'blue',
    b2: 'Medium',
    b2Color: 'blue',
    client: 'Internal',
    color: 'orange',
    hex: '#f97316',
    status: 'Planning',
    priority: 'Medium',
  },
  p5: {
    b1: 'Active',
    b1Color: 'green',
    b2: 'Critical',
    b2Color: 'red',
    client: 'Internal',
    color: 'red',
    hex: '#ef4444',
    status: 'Active',
    priority: 'Critical',
  },
};

export const getProjectLeadLabel = (project: {
  name?: string;
  managers?: { name: string }[];
}): string => {
  if (project.managers && project.managers.length > 0) {
    return project.managers.map((m) => m.name).join(', ');
  }
  if (project.name?.toLowerCase() === 'internal') {
    return 'Internal Lead';
  }
  return `${DEFAULT_MANAGER_USER.name} (${DEFAULT_MANAGER_USER.designation || 'Engineering Lead'})`;
};

export const getSystemAuditLogs = (adminName: string) => [
  {
    id: 1,
    time: '15:06 PM',
    event: 'MySQL Schema & Table Column Verification',
    user: 'System',
    status: 'Completed',
  },
  {
    id: 2,
    time: '14:44 PM',
    event: 'Admin Session Authenticated via JWT Token',
    user: adminName,
    status: 'Success',
  },
  {
    id: 3,
    time: '12:30 PM',
    event: 'HR Timesheet Reminder Notification Dispatched',
    user: `${DEFAULT_HR_USER.name} (HR)`,
    status: 'Delivered',
  },
  {
    id: 4,
    time: '09:15 AM',
    event: 'Automated Microservice Health Check Passed',
    user: 'System',
    status: 'Optimal',
  },
];

export const buildFallbackEmployeeReport = () =>
  USERS.map((u) => {
    const empRow = EMPLOYEE_TABLE.find((row) => row.user.id === u.id);
    const totalHours = empRow?.weekHours ?? 40;
    return {
      name: u.name,
      initials: u.initials,
      color: u.color,
      department: u.department,
      designation: u.designation,
      totalHours,
      billableHours: Math.round(totalHours * 0.8 * 100) / 100,
      nonBillableHours: Math.round(totalHours * 0.2 * 100) / 100,
      projects: empRow?.projects ?? 2,
      utilization: empRow?.utilization ?? 85,
    };
  });

export const buildFallbackProjectReport = () =>
  PROJECTS.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    budgeted: p.totalHours,
    logged: p.loggedHours,
    utilizationPct: p.progress,
    teamSize: p.teamMembers.length,
  }));

export const buildFallbackDetailedEntries = (params: {
  to: string;
  todayStr: string;
  scope: string;
  role: string;
  currentUser: User;
  empName?: string;
}) => {
  const { to, todayStr, scope, role, currentUser, empName } = params;
  const dummyEntries = WORK_LOGS.map((wl) => {
    const u = USERS.find((user) => user.id === wl.userId) || USERS[2];
    return {
      employeeName: u.name,
      initials: u.initials,
      color: u.color,
      department: u.department || 'Engineering',
      designation: u.designation || 'Engineer',
      date: wl.date,
      projectName: wl.projectName,
      taskName: wl.taskName,
      hours: wl.hours,
      status: wl.status || 'Approved',
    };
  });

  const effectiveScope = role === 'employee' ? 'self' : scope;
  let entries = dummyEntries;
  if (effectiveScope === 'self') {
    entries = entries.filter(
      (e) => e.employeeName.toLowerCase() === currentUser.name.toLowerCase(),
    );
    if (entries.length === 0) {
      entries = [
        {
          employeeName: currentUser.name,
          initials: currentUser.initials || 'ME',
          color: currentUser.color || '#2563eb',
          department: currentUser.department || 'Staff',
          designation: currentUser.designation || 'Employee',
          date: to || todayStr,
          projectName: PROJECTS[1]?.name || 'TimeFlow Core Platform',
          taskName: 'Platform optimization & code review',
          hours: 8,
          status: 'Approved',
        },
      ];
    }
  } else if (effectiveScope === 'employee_single' && empName) {
    entries = entries.filter(
      (e) => e.employeeName.toLowerCase() === empName.toLowerCase(),
    );
    if (entries.length === 0) {
      const empObj = USERS.find(
        (u) => u.name.toLowerCase() === empName.toLowerCase(),
      );
      entries = [
        {
          employeeName: empName,
          initials:
            empObj?.initials ||
            empName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          color: empObj?.color || '#2563eb',
          department: empObj?.department || 'Engineering',
          designation: empObj?.designation || 'Engineer',
          date: to || todayStr,
          projectName: PROJECTS[1]?.name || 'TimeFlow Core Platform',
          taskName: 'Task logs & deliverables',
          hours: 8,
          status: 'Approved',
        },
      ];
    }
  }

  return entries;
};


