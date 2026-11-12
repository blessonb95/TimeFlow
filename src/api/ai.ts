import apiClient from './client';

export interface AiStatusResponse {
  available: boolean;
  configured: boolean;
  provider: string;
}

export interface DraftTaskPayload {
  notes: string;
  projectName?: string;
}

export interface DraftTaskResponse {
  taskName: string;
  taskDescription: string;
  provider: string;
}

export interface WeeklySummaryEntryPayload {
  projectName: string;
  taskName: string;
  taskDescription?: string;
  hours: number;
  date: string;
  taskStatus?: string;
  isOfflineQueued?: boolean;
}

export interface WeeklySummaryPayload {
  weekStart: string;
  weekEnd: string;
  weekLabel?: string;
  hasUnsyncedEntries?: boolean;
  entries: WeeklySummaryEntryPayload[];
}

export interface WeeklySummaryResponse {
  summary: string;
  provider: string;
  hasUnsyncedEntries: boolean;
}

export interface DashboardEmployeeSummaryFacts {
  completedTasks: Array<{
    id: string;
    taskName: string;
    projectId: string;
    projectName: string;
    hours: number;
    date: string;
    link: string;
  }>;
  timeByProject: Array<{
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
    link: string;
  }>;
  workInProgressAndUpcoming: Array<{
    id: string;
    taskName: string;
    projectId: string;
    projectName: string;
    status: string;
    hours: number;
    date?: string;
    dueDate?: string;
    link: string;
  }>;
  highlights: {
    totalHours: number;
    targetHours: number;
    topProjectName: string | null;
    topProjectHours: number;
    topProjectPercentage: number;
    busiestDay: string | null;
    busiestDayHours: number;
    completedCount: number;
    inProgressCount: number;
    entriesCount: number;
  };
}

export interface DashboardManagerSummaryFacts {
  pendingApprovals: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    projectId?: string;
    projectName: string;
    taskName: string;
    hours: number;
    date: string;
    status: string;
    link: string;
  }>;
  projectProgress: Array<{
    projectId: string;
    projectName: string;
    status: string;
    progress: number;
    weekHours: number;
    loggedHours: number;
    totalHours: number;
    dueDate?: string;
    link: string;
    employees: Array<{
      employeeId: string;
      employeeName: string;
      hours: number;
      tasksCount: number;
      completedCount: number;
      link: string;
    }>;
  }>;
  attentionItems: {
    missingTimesheets: Array<{
      employeeId: string;
      employeeName: string;
      department: string;
      loggedHours: number;
      status: string;
      link: string;
    }>;
    overdueOrAtRisk: Array<{
      id: string;
      title: string;
      projectId?: string;
      projectName: string;
      employeeName?: string;
      reason: string;
      dueDate?: string;
      link: string;
    }>;
  };
  highlights: {
    totalTeamHours: number;
    teamCapacity: number;
    avgUtilization: number;
    pendingApprovalsCount: number;
    pendingApprovalHours: number;
    activeProjectsCount: number;
    missingTimesheetsCount: number;
    overdueOrAtRiskCount: number;
  };
}

export interface DashboardWeeklySummaryResponse {
  role: 'employee' | 'manager';
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  hasData: boolean;
  provider: string;
  generatedAt: string;
  employeeFacts?: DashboardEmployeeSummaryFacts;
  managerFacts?: DashboardManagerSummaryFacts;
  aiSynthesis: {
    headline: string;
    observations: string[];
    suggestions: string[];
  };
}

export interface DashboardChatPayload {
  message: string;
  weekStart?: string;
  role?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface DashboardChatSourceLink {
  label: string;
  url: string;
  count?: number;
  type?: 'approval' | 'project' | 'timesheet' | 'employee';
}

export interface DashboardChatVerifiedFact {
  title: string;
  detail: string;
  link?: string;
}

export interface DashboardChatResponse {
  reply: string;
  shortAnswer: string;
  detailedAnswer?: string;
  sourceLinks: DashboardChatSourceLink[];
  verifiedFacts: DashboardChatVerifiedFact[];
  suggestions: string[];
  hasData: boolean;
  weekLabel: string;
  provider: string;
  generatedAt: string;
}

export const aiApi = {
  getStatus: (): Promise<AiStatusResponse> =>
    apiClient.get('/ai/status').then((r) => r.data),

  draftTask: (payload: DraftTaskPayload): Promise<DraftTaskResponse> =>
    apiClient.post('/ai/draft-task', payload).then((r) => r.data),

  draftWeeklySummary: (payload: WeeklySummaryPayload): Promise<WeeklySummaryResponse> =>
    apiClient.post('/ai/weekly-summary', payload).then((r) => r.data),

  getDashboardWeeklySummary: (params: {
    weekStart?: string;
    role?: string;
  }): Promise<DashboardWeeklySummaryResponse> =>
    apiClient.get('/ai/dashboard-summary', { params }).then((r) => r.data),

  sendDashboardChat: (payload: DashboardChatPayload): Promise<DashboardChatResponse> =>
    apiClient.post('/ai/dashboard-chat', payload).then((r) => r.data),
};

