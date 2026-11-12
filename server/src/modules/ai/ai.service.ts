import { env } from '../../config/env';
import { query } from '../../config/db';
import { createError } from '../../middleware/errorHandler';

export interface DraftTaskInput {
  notes: string;
  projectName?: string;
}

export interface DraftTaskOutput {
  taskName: string;
  taskDescription: string;
  provider: string;
}

export interface WeeklySummaryEntryInput {
  projectName: string;
  taskName: string;
  taskDescription?: string;
  hours: number;
  date: string;
  taskStatus?: string;
  isOfflineQueued?: boolean;
}

export interface WeeklySummaryInput {
  weekStart: string;
  weekEnd: string;
  weekLabel?: string;
  hasUnsyncedEntries?: boolean;
  entries: WeeklySummaryEntryInput[];
}

export interface WeeklySummaryOutput {
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

export interface DashboardWeeklySummaryOutput {
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

export interface DashboardChatInput {
  message: string;
  weekStart?: string;
  requestedRole?: string;
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

export interface DashboardChatOutput {
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

function stripHtmlTags(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildLocalTaskDraft(notes: string, projectName?: string): { taskName: string; taskDescription: string } {
  const rawLines = notes
    .split(/\r?\n|(?:;\s+)|(?:\s+-\s+)/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean);

  const primaryLine = rawLines[0] || notes.trim();
  const cleanTitleBase = primaryLine
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

  const capitalizedTitle = cleanTitleBase.charAt(0).toUpperCase() + cleanTitleBase.slice(1);
  const maxTitleLen = 78;
  const taskName =
    capitalizedTitle.length > maxTitleLen
      ? `${capitalizedTitle.slice(0, maxTitleLen - 1).trim()}…`
      : capitalizedTitle;

  const bullets: string[] = [];
  if (rawLines.length > 1) {
    rawLines.forEach((line) => {
      const normalized = line.charAt(0).toUpperCase() + line.slice(1).replace(/[.!?]*$/, '.');
      bullets.push(normalized);
    });
  } else {
    const sentences = notes
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length > 1) {
      sentences.forEach((s) => {
        bullets.push(s.charAt(0).toUpperCase() + s.slice(1).replace(/[.!?]*$/, '.'));
      });
    } else {
      bullets.push(`${capitalizedTitle}.`);
      if (projectName) {
        bullets.push(`Aligned implementation and verification details for ${projectName}.`);
      } else {
        bullets.push('Verified behavior and documented key changes.');
      }
    }
  }

  const contextLead = projectName
    ? `<p>Completed work for <strong>${escapeHtml(projectName)}</strong>:</p>`
    : '<p>Key work completed:</p>';

  const listItems = bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('');
  const taskDescription = `${contextLead}<ul>${listItems}</ul>`;

  return { taskName, taskDescription };
}

function buildLocalWeeklySummary(input: WeeklySummaryInput): string {
  const { weekStart, weekEnd, weekLabel, hasUnsyncedEntries, entries } = input;
  const headerRange = weekLabel || `${weekStart} to ${weekEnd}`;
  const totalHours = entries.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
  const unsyncedCount = entries.filter((item) => item.isOfflineQueued).length;

  const byProject = new Map<string, { hours: number; tasks: WeeklySummaryEntryInput[] }>();
  for (const entry of entries) {
    const proj = (entry.projectName || 'Internal Task').trim();
    const existing = byProject.get(proj) || { hours: 0, tasks: [] };
    existing.hours += Number(entry.hours) || 0;
    existing.tasks.push(entry);
    byProject.set(proj, existing);
  }

  const lines: string[] = [];
  lines.push(`Weekly Work Summary (${headerRange})`);
  lines.push('='.repeat(`Weekly Work Summary (${headerRange})`.length));

  if (hasUnsyncedEntries || unsyncedCount > 0) {
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
      const cleanDesc = task.taskDescription ? stripHtmlTags(task.taskDescription) : '';
      const shortDesc =
        cleanDesc && cleanDesc.toLowerCase() !== task.taskName.toLowerCase()
          ? ` — ${cleanDesc.length > 130 ? `${cleanDesc.slice(0, 127)}...` : cleanDesc}`
          : '';
      const syncTag = task.isOfflineQueued ? ' [Waiting to sync]' : '';
      const statusTag = task.taskStatus ? ` (${task.taskStatus})` : '';
      lines.push(`  - [${task.date}] ${task.taskName} (${Number(task.hours).toFixed(1)}h)${statusTag}${syncTag}${shortDesc}`);
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

  return lines.join('\n');
}

async function callExternalAiJson(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!env.ai.apiKey) return null;

  const provider = env.ai.provider.toLowerCase();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    if (provider === 'openai') {
      const baseUrl = env.ai.baseUrl || 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.ai.apiKey}`,
        },
        body: JSON.stringify({
          model: env.ai.model || 'gpt-4o-mini',
          temperature: 0.3,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw createError(`AI provider request failed (${res.status}).`, 502, 'AI_PROVIDER_ERROR');
      }
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return data.choices?.[0]?.message?.content?.trim() || null;
    }

    // Default to Gemini REST API
    const model = env.ai.model || 'gemini-2.5-flash';
    const baseUrl = env.ai.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    const url = `${baseUrl.replace(/\/$/, '')}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.ai.apiKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw createError(`AI provider request failed (${res.status}).`, 502, 'AI_PROVIDER_ERROR');
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } finally {
    clearTimeout(timeout);
  }
}

export const aiService = {
  getStatus() {
    return {
      available: env.ai.enabled,
      configured: Boolean(env.ai.apiKey),
      provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
    };
  },

  async draftTask(input: DraftTaskInput): Promise<DraftTaskOutput> {
    if (!env.ai.enabled) {
      throw createError(
        'AI assistance is currently disabled by server configuration. You can continue logging tasks manually.',
        503,
        'AI_UNAVAILABLE'
      );
    }

    const notes = (input.notes || '').trim();
    if (!notes) {
      throw createError('Please enter rough notes before generating an AI task draft.', 400, 'VALIDATION_ERROR');
    }
    if (notes.length > 2500) {
      throw createError('Rough notes must be 2,500 characters or fewer.', 400, 'VALIDATION_ERROR');
    }

    const projectName = (input.projectName || '').trim().slice(0, 120);

    if (env.ai.apiKey) {
      const systemPrompt = [
        'You are a concise engineering & product timesheet assistant.',
        'Convert the user’s rough task notes into a clear task title and HTML description (<p> and <ul><li> tags only).',
        'Do NOT invent logged hours, dates, ticket numbers, or approval statuses.',
        'Respond strictly with valid JSON matching: {"taskName": "...", "taskDescription": "..."}',
      ].join(' ');

      const userPrompt = JSON.stringify({
        projectName: projectName || undefined,
        roughNotes: notes,
      });

      const raw = await callExternalAiJson(systemPrompt, userPrompt);
      if (raw) {
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        try {
          const parsed = JSON.parse(cleaned) as { taskName?: string; taskDescription?: string };
          if (parsed.taskName && parsed.taskDescription) {
            return {
              taskName: parsed.taskName.trim().slice(0, 120),
              taskDescription: parsed.taskDescription.trim(),
              provider: env.ai.provider,
            };
          }
        } catch {
          // Fall back to deterministic formatter if JSON parsing fails
        }
      }
    }

    const fallback = buildLocalTaskDraft(notes, projectName || undefined);
    return {
      ...fallback,
      provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
    };
  },

  async draftWeeklySummary(input: WeeklySummaryInput): Promise<WeeklySummaryOutput> {
    if (!env.ai.enabled) {
      throw createError(
        'AI summary generation is currently disabled by server configuration.',
        503,
        'AI_UNAVAILABLE'
      );
    }

    if (!Array.isArray(input.entries) || input.entries.length === 0) {
      throw createError(
        'No work logs are available for the selected week to summarize.',
        400,
        'EMPTY_WEEK_LOGS'
      );
    }

    const sanitizedEntries: WeeklySummaryEntryInput[] = input.entries.slice(0, 100).map((e) => ({
      projectName: String(e.projectName || 'Internal Task').slice(0, 120),
      taskName: String(e.taskName || 'Untitled Task').slice(0, 200),
      taskDescription: e.taskDescription ? stripHtmlTags(String(e.taskDescription)).slice(0, 500) : '',
      hours: Number(e.hours) || 0,
      date: String(e.date || '').slice(0, 20),
      taskStatus: e.taskStatus ? String(e.taskStatus).slice(0, 30) : undefined,
      isOfflineQueued: Boolean(e.isOfflineQueued),
    }));

    const hasUnsynced =
      Boolean(input.hasUnsyncedEntries) || sanitizedEntries.some((entry) => entry.isOfflineQueued);

    if (env.ai.apiKey) {
      const systemPrompt = [
        'You are a concise work-log summary assistant.',
        'Draft a clear, editable plain-text weekly work summary grouped by project from the provided entries.',
        'Use only the hours and tasks provided; never invent hours, dates, or productivity scores.',
        hasUnsynced
          ? 'IMPORTANT: Include a clear note at the top stating that some entries are still waiting to sync offline and the summary may be incomplete.'
          : '',
      ]
        .filter(Boolean)
        .join(' ');

      const userPrompt = JSON.stringify({
        weekStart: input.weekStart,
        weekEnd: input.weekEnd,
        weekLabel: input.weekLabel,
        hasUnsyncedEntries: hasUnsynced,
        entries: sanitizedEntries,
      });

      try {
        const raw = await callExternalAiJson(systemPrompt, userPrompt);
        if (raw) {
          return {
            summary: raw.trim(),
            provider: env.ai.provider,
            hasUnsyncedEntries: hasUnsynced,
          };
        }
      } catch {
        // Fall back to local synthesis if external AI provider fails
      }
    }

    const summary = buildLocalWeeklySummary({
      ...input,
      hasUnsyncedEntries: hasUnsynced,
      entries: sanitizedEntries,
    });

    return {
      summary,
      provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
      hasUnsyncedEntries: hasUnsynced,
    };
  },

  async generateDashboardWeeklySummary(
    user: { id: string; role: string },
    options?: { weekStart?: string; requestedRole?: string }
  ): Promise<DashboardWeeklySummaryOutput> {
    if (!env.ai.enabled) {
      throw createError(
        'AI weekly summary is currently disabled by server configuration.',
        503,
        'AI_UNAVAILABLE'
      );
    }

    const { weekStart, weekEnd, weekLabel } = resolveWeekBounds(options?.weekStart);

    // Enforce strict role-based access: an employee can NEVER request manager data.
    const isElevatedUser =
      user.role === 'manager' || user.role === 'admin' || user.role === 'hr' || user.role === 'ceo';
    const effectiveSummaryRole: 'employee' | 'manager' =
      isElevatedUser && options?.requestedRole !== 'employee' ? 'manager' : 'employee';

    if (effectiveSummaryRole === 'employee') {
      return generateEmployeeDashboardSummary(user.id, weekStart, weekEnd, weekLabel);
    }

    return generateManagerDashboardSummary(user.id, user.role, weekStart, weekEnd, weekLabel);
  },

  async dashboardWeeklyChat(
    user: { id: string; role: string },
    input: DashboardChatInput
  ): Promise<DashboardChatOutput> {
    if (!env.ai.enabled) {
      throw createError(
        'AI weekly chat is currently disabled by server configuration.',
        503,
        'AI_UNAVAILABLE'
      );
    }

    const { weekStart, weekEnd, weekLabel } = resolveWeekBounds(input.weekStart);

    // Enforce role-based access: retrieve the verified grounded facts scoped to authorized projects & employees
    const summary = await aiService.generateDashboardWeeklySummary(user, {
      weekStart,
      requestedRole: input.requestedRole,
    });

    return processDashboardManagerChat(summary, input.message, input.history);
  },
};

function resolveWeekBounds(rawDate?: string): {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
} {
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
}

function toIsoDateOnly(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).split('T')[0].slice(0, 10);
}

async function generateEmployeeDashboardSummary(
  userId: string,
  weekStart: string,
  weekEnd: string,
  weekLabel: string
): Promise<DashboardWeeklySummaryOutput> {
  // 1. Query employee's own work logs for the selected week
  const logsRes = await query(
    `SELECT wl.id, wl.project_id, COALESCE(p.name, 'Internal Task') AS project_name,
            wl.task_name, wl.task_description, wl.hours, wl.date, wl.status, wl.task_status
     FROM work_logs wl
     LEFT JOIN projects p ON p.id = wl.project_id
     WHERE wl.user_id = $1 AND wl.date >= $2 AND wl.date <= $3
     ORDER BY wl.date ASC, wl.created_at ASC`,
    [userId, weekStart, weekEnd]
  );

  // 2. Query employee's assigned projects for upcoming/active context
  const projectsRes = await query(
    `SELECT p.id, p.name, p.status, p.progress, p.end_date, p.estimated_hours, p.logged_hours
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = $1 AND p.status != 'Completed'
     ORDER BY p.updated_at DESC`,
    [userId]
  );

  const logs = logsRes.rows as Array<Record<string, unknown>>;
  const assignedProjects = projectsRes.rows as Array<Record<string, unknown>>;

  if (logs.length === 0) {
    return {
      role: 'employee',
      weekStart,
      weekEnd,
      weekLabel,
      hasData: false,
      provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
      generatedAt: new Date().toISOString(),
      aiSynthesis: {
        headline: `No work logs recorded for ${weekLabel}.`,
        observations: [],
        suggestions: [],
      },
    };
  }

  const completedTasks: DashboardEmployeeSummaryFacts['completedTasks'] = [];
  const workInProgressAndUpcoming: DashboardEmployeeSummaryFacts['workInProgressAndUpcoming'] = [];
  const projectMap = new Map<string, { projectId: string; projectName: string; hours: number }>();
  const dayMap = new Map<string, number>();
  let totalHours = 0;

  for (const row of logs) {
    const id = String(row['id'] || '');
    const projectId = String(row['project_id'] || 'internal');
    const projectName = String(row['project_name'] || 'Internal Task');
    const taskName = String(row['task_name'] || 'Untitled Task');
    const hours = Math.round((Number(row['hours']) || 0) * 10) / 10;
    const date = toIsoDateOnly(row['date']);
    const taskStatus = String(row['task_status'] || row['status'] || 'In Progress');

    totalHours = Math.round((totalHours + hours) * 10) / 10;

    const existingProj = projectMap.get(projectId) || { projectId, projectName, hours: 0 };
    existingProj.hours = Math.round((existingProj.hours + hours) * 10) / 10;
    projectMap.set(projectId, existingProj);

    dayMap.set(date, Math.round(((dayMap.get(date) || 0) + hours) * 10) / 10);

    const isDone =
      taskStatus.toLowerCase() === 'completed' ||
      String(row['status'] || '').toLowerCase() === 'approved';

    if (isDone) {
      completedTasks.push({
        id,
        taskName,
        projectId,
        projectName,
        hours,
        date,
        link: '/work-logs',
      });
    } else {
      workInProgressAndUpcoming.push({
        id,
        taskName,
        projectId,
        projectName,
        status: taskStatus === 'Not Started' ? 'Upcoming' : 'In Progress',
        hours,
        date,
        link: '/work-logs',
      });
    }
  }

  // Include active assigned projects that were not yet logged this week as upcoming assigned work
  for (const proj of assignedProjects) {
    const pId = String(proj['id'] || '');
    const pName = String(proj['name'] || '');
    if (!projectMap.has(pId) && workInProgressAndUpcoming.length < 8) {
      const dueStr = proj['end_date']
        ? new Date(String(proj['end_date'])).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined;
      workInProgressAndUpcoming.push({
        id: `proj-upcoming-${pId}`,
        taskName: `Assigned project deliverable (${pName})`,
        projectId: pId,
        projectName: pName,
        status: 'Upcoming Assigned',
        hours: 0,
        dueDate: dueStr,
        link: `/projects/${pId}`,
      });
    }
  }

  const timeByProject: DashboardEmployeeSummaryFacts['timeByProject'] = Array.from(
    projectMap.values()
  )
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
  const highlights: DashboardEmployeeSummaryFacts['highlights'] = {
    totalHours,
    targetHours: 40,
    topProjectName: topProject ? topProject.projectName : null,
    topProjectHours: topProject ? topProject.hours : 0,
    topProjectPercentage: topProject ? topProject.percentage : 0,
    busiestDay,
    busiestDayHours,
    completedCount: completedTasks.length,
    inProgressCount: workInProgressAndUpcoming.length,
    entriesCount: logs.length,
  };

  const employeeFacts: DashboardEmployeeSummaryFacts = {
    completedTasks,
    timeByProject,
    workInProgressAndUpcoming,
    highlights,
  };

  const aiSynthesis = await synthesizeEmployeeSummaryWithAi(weekLabel, employeeFacts);

  return {
    role: 'employee',
    weekStart,
    weekEnd,
    weekLabel,
    hasData: true,
    provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
    generatedAt: new Date().toISOString(),
    employeeFacts,
    aiSynthesis,
  };
}

async function synthesizeEmployeeSummaryWithAi(
  weekLabel: string,
  facts: DashboardEmployeeSummaryFacts
): Promise<{ headline: string; observations: string[]; suggestions: string[] }> {
  const { highlights, timeByProject, completedTasks, workInProgressAndUpcoming } = facts;

  if (env.ai.apiKey) {
    const systemPrompt = [
      'You are an analytical timesheet assistant for TimeFlow.',
      'Given verified employee weekly timesheet facts, return concise, grounded observations and actionable suggestions.',
      'Do NOT invent projects, tasks, hours, or productivity scores.',
      'Respond strictly with valid JSON: {"headline": "...", "observations": ["..."], "suggestions": ["..."]}',
    ].join(' ');

    const userPrompt = JSON.stringify({
      weekLabel,
      highlights,
      timeByProject: timeByProject.slice(0, 6),
      completedTasksCount: completedTasks.length,
      inProgressTasks: workInProgressAndUpcoming.slice(0, 6).map((t) => ({
        taskName: t.taskName,
        projectName: t.projectName,
        status: t.status,
      })),
    });

    try {
      const raw = await callExternalAiJson(systemPrompt, userPrompt);
      if (raw) {
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as {
          headline?: string;
          observations?: string[];
          suggestions?: string[];
        };
        if (
          parsed.headline &&
          Array.isArray(parsed.observations) &&
          Array.isArray(parsed.suggestions)
        ) {
          return {
            headline: parsed.headline.trim(),
            observations: parsed.observations.map((s) => String(s).trim()).filter(Boolean).slice(0, 4),
            suggestions: parsed.suggestions.map((s) => String(s).trim()).filter(Boolean).slice(0, 3),
          };
        }
      }
    } catch {
      // Fall back to deterministic grounded synthesis
    }
  }

  const pctOfTarget = Math.round((highlights.totalHours / highlights.targetHours) * 100);
  const headline =
    highlights.totalHours >= highlights.targetHours
      ? `Reached ${highlights.totalHours.toFixed(1)}h (${pctOfTarget}% of weekly 40h target) across ${timeByProject.length} project${timeByProject.length === 1 ? '' : 's'}.`
      : `Logged ${highlights.totalHours.toFixed(1)}h of your ${highlights.targetHours}h target (${pctOfTarget}%) across ${timeByProject.length} project${timeByProject.length === 1 ? '' : 's'}.`;

  const observations: string[] = [];
  if (highlights.topProjectName) {
    observations.push(
      `Primary focus was ${highlights.topProjectName}, accounting for ${highlights.topProjectHours.toFixed(1)}h (${highlights.topProjectPercentage}% of total logged time).`
    );
  }
  if (highlights.busiestDay) {
    observations.push(
      `Highest single-day output occurred on ${highlights.busiestDay} with ${highlights.busiestDayHours.toFixed(1)}h logged.`
    );
  }
  observations.push(
    `Completed ${completedTasks.length} task${completedTasks.length === 1 ? '' : 's'} and tracked ${workInProgressAndUpcoming.length} active or upcoming item${workInProgressAndUpcoming.length === 1 ? '' : 's'}.`
  );

  const suggestions: string[] = [];
  const remaining = Math.max(0, Math.round((highlights.targetHours - highlights.totalHours) * 10) / 10);
  if (remaining > 0) {
    suggestions.push(
      `${remaining.toFixed(1)}h remain to reach the 40h weekly benchmark before submitting your timesheet.`
    );
  } else {
    suggestions.push(
      'Weekly 40h target is complete — verify task descriptions and submit your timesheet for approval.'
    );
  }
  if (workInProgressAndUpcoming.length > 0) {
    const firstWip = workInProgressAndUpcoming[0];
    suggestions.push(
      `Prioritize wrapping up "${firstWip.taskName}" (${firstWip.projectName}) or updating its status as deliverables progress.`
    );
  }

  return { headline, observations, suggestions };
}

async function generateManagerDashboardSummary(
  managerId: string,
  userRole: string,
  weekStart: string,
  weekEnd: string,
  weekLabel: string
): Promise<DashboardWeeklySummaryOutput> {
  const isOrgWide = userRole === 'admin' || userRole === 'ceo' || userRole === 'hr';

  // 1. Authorized projects
  const projectsSql = isOrgWide
    ? `SELECT p.id, p.name, p.status, p.progress, p.estimated_hours, p.logged_hours, p.end_date
       FROM projects p
       ORDER BY p.updated_at DESC`
    : `SELECT p.id, p.name, p.status, p.progress, p.estimated_hours, p.logged_hours, p.end_date
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE pm.user_id = $1
       ORDER BY p.updated_at DESC`;
  const projectsRes = await query(projectsSql, isOrgWide ? [] : [managerId]);
  const projects = projectsRes.rows as Array<Record<string, unknown>>;

  // 2. Authorized active employees
  const employeesSql = isOrgWide
    ? `SELECT u.id, u.first_name, u.last_name, u.department, u.designation, u.role
       FROM users u
       WHERE u.status = 'Active'
       ORDER BY u.first_name ASC`
    : `SELECT u.id, u.first_name, u.last_name, u.department, u.designation, u.role
       FROM users u
       WHERE u.status = 'Active'
         AND (
           u.id = $1
           OR u.reporting_manager_id = $1
           OR EXISTS (
             SELECT 1 FROM project_members pm1
             JOIN project_members pm2 ON pm1.project_id = pm2.project_id
             WHERE pm1.user_id = u.id AND pm2.user_id = $1
           )
         )
       ORDER BY u.first_name ASC`;
  const employeesRes = await query(employeesSql, isOrgWide ? [] : [managerId]);
  const employees = employeesRes.rows as Array<Record<string, unknown>>;

  // 3. Work logs in the selected week scoped to authorized employees/projects
  const logsSql = isOrgWide
    ? `SELECT wl.id, wl.user_id, u.first_name, u.last_name, u.department,
              wl.project_id, COALESCE(p.name, 'Internal Task') AS project_name,
              wl.task_name, wl.hours, wl.date, wl.status, wl.task_status
       FROM work_logs wl
       JOIN users u ON u.id = wl.user_id
       LEFT JOIN projects p ON p.id = wl.project_id
       WHERE wl.date >= $1 AND wl.date <= $2
       ORDER BY wl.date DESC`
    : `SELECT wl.id, wl.user_id, u.first_name, u.last_name, u.department,
              wl.project_id, COALESCE(p.name, 'Internal Task') AS project_name,
              wl.task_name, wl.hours, wl.date, wl.status, wl.task_status
       FROM work_logs wl
       JOIN users u ON u.id = wl.user_id
       LEFT JOIN projects p ON p.id = wl.project_id
       WHERE wl.date >= $1 AND wl.date <= $2
         AND (
           wl.user_id = $3
           OR u.reporting_manager_id = $3
           OR EXISTS (
             SELECT 1 FROM project_members pm
             WHERE pm.project_id = wl.project_id AND pm.user_id = $3
           )
         )
       ORDER BY wl.date DESC`;
  const logsRes = await query(
    logsSql,
    isOrgWide ? [weekStart, weekEnd] : [weekStart, weekEnd, managerId]
  );
  const weekLogs = logsRes.rows as Array<Record<string, unknown>>;

  if (weekLogs.length === 0) {
    return {
      role: 'manager',
      weekStart,
      weekEnd,
      weekLabel,
      hasData: false,
      provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
      generatedAt: new Date().toISOString(),
      aiSynthesis: {
        headline: `No team work logs or timesheet submissions recorded for ${weekLabel}.`,
        observations: [],
        suggestions: [],
      },
    };
  }

  // Pending approvals in the selected week
  const pendingApprovals: DashboardManagerSummaryFacts['pendingApprovals'] = [];
  let pendingApprovalHours = 0;

  for (const row of weekLogs) {
    const status = String(row['status'] || 'Pending');
    const empId = String(row['user_id'] || '');
    if (status !== 'Approved' && status !== 'Rejected' && status !== 'Draft') {
      const hrs = Math.round((Number(row['hours']) || 0) * 10) / 10;
      pendingApprovalHours = Math.round((pendingApprovalHours + hrs) * 10) / 10;
      const empName =
        `${String(row['first_name'] || '')} ${String(row['last_name'] || '')}`.trim() || 'Team Member';
      pendingApprovals.push({
        id: String(row['id'] || ''),
        employeeId: empId,
        employeeName: empName,
        projectId: row['project_id'] ? String(row['project_id']) : undefined,
        projectName: String(row['project_name'] || 'Internal Task'),
        taskName: String(row['task_name'] || 'Timesheet Entry'),
        hours: hrs,
        date: toIsoDateOnly(row['date']),
        status: status === 'Submitted' ? 'Submitted' : 'Pending',
        link: '/approvals',
      });
    }
  }

  // Group week logs by project & employee
  const projectMetaMap = new Map<string, Record<string, unknown>>();
  for (const p of projects) {
    projectMetaMap.set(String(p['id']), p);
  }

  const projectGroups = new Map<
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

  const employeeWeekHours = new Map<string, number>();

  for (const row of weekLogs) {
    const pId = String(row['project_id'] || 'internal');
    const pName = String(row['project_name'] || 'Internal Task');
    const meta = projectMetaMap.get(pId);
    const hrs = Math.round((Number(row['hours']) || 0) * 10) / 10;
    const empId = String(row['user_id'] || '');
    const empName =
      `${String(row['first_name'] || '')} ${String(row['last_name'] || '')}`.trim() || 'Team Member';

    employeeWeekHours.set(empId, Math.round(((employeeWeekHours.get(empId) || 0) + hrs) * 10) / 10);

    const est = meta ? Number(meta['estimated_hours']) || 0 : 0;
    const logged = meta ? Number(meta['logged_hours']) || 0 : 0;
    const prog = meta ? Number(meta['progress']) || 0 : 0;
    const status = meta ? String(meta['status'] || 'Ongoing') : 'Ongoing';
    const dueDate =
      meta && meta['end_date']
        ? new Date(String(meta['end_date'])).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : undefined;

    let grp = projectGroups.get(pId);
    if (!grp) {
      grp = {
        projectId: pId,
        projectName: pName,
        status,
        progress: prog,
        weekHours: 0,
        loggedHours: logged,
        totalHours: est,
        dueDate,
        employeesMap: new Map(),
      };
      projectGroups.set(pId, grp);
    }
    grp.weekHours = Math.round((grp.weekHours + hrs) * 10) / 10;

    const empGrp = grp.employeesMap.get(empId) || {
      employeeId: empId,
      employeeName: empName,
      hours: 0,
      tasksCount: 0,
      completedCount: 0,
    };
    empGrp.hours = Math.round((empGrp.hours + hrs) * 10) / 10;
    empGrp.tasksCount += 1;
    const tStatus = String(row['task_status'] || row['status'] || '');
    if (tStatus === 'Completed' || String(row['status']) === 'Approved') {
      empGrp.completedCount += 1;
    }
    grp.employeesMap.set(empId, empGrp);
  }

  const projectProgress: DashboardManagerSummaryFacts['projectProgress'] = Array.from(
    projectGroups.values()
  )
    .sort((a, b) => b.weekHours - a.weekHours)
    .map((g) => ({
      projectId: g.projectId,
      projectName: g.projectName,
      status: g.status,
      progress: g.progress,
      weekHours: g.weekHours,
      loggedHours: Math.max(g.loggedHours, g.weekHours),
      totalHours: g.totalHours,
      dueDate: g.dueDate,
      link: g.projectId && g.projectId !== 'internal' ? `/projects/${g.projectId}` : '/projects',
      employees: Array.from(g.employeesMap.values())
        .sort((a, b) => b.hours - a.hours)
        .map((e) => ({
          ...e,
          link: '/employees',
        })),
    }));

  // Missing timesheets & overdue/attention items
  const missingTimesheets: DashboardManagerSummaryFacts['attentionItems']['missingTimesheets'] = [];
  for (const emp of employees) {
    const empId = String(emp['id'] || '');
    const empName =
      `${String(emp['first_name'] || '')} ${String(emp['last_name'] || '')}`.trim() || 'Team Member';
    const dept = String(emp['department'] || 'Engineering');
    const hrs = employeeWeekHours.get(empId) || 0;
    if (hrs === 0) {
      missingTimesheets.push({
        employeeId: empId,
        employeeName: empName,
        department: dept,
        loggedHours: 0,
        status: 'Missing timesheet (0h logged)',
        link: '/approvals',
      });
    } else if (hrs < 32) {
      missingTimesheets.push({
        employeeId: empId,
        employeeName: empName,
        department: dept,
        loggedHours: hrs,
        status: `Partial hours (${hrs.toFixed(1)}h / 40h)`,
        link: '/approvals',
      });
    }
  }

  const overdueOrAtRisk: DashboardManagerSummaryFacts['attentionItems']['overdueOrAtRisk'] = [];
  const todayIso = new Date().toISOString().slice(0, 10);
  for (const p of projects) {
    const pId = String(p['id'] || '');
    const pName = String(p['name'] || '');
    const pStatus = String(p['status'] || '');
    const endDateIso = toIsoDateOnly(p['end_date']);
    const est = Number(p['estimated_hours']) || 0;
    const logged = Number(p['logged_hours']) || 0;

    if (pStatus === 'At Risk' || pStatus === 'Over Budget') {
      overdueOrAtRisk.push({
        id: `proj-risk-${pId}`,
        title: pName,
        projectId: pId,
        projectName: pName,
        reason: `Project status flagged as ${pStatus}`,
        dueDate: endDateIso || undefined,
        link: `/projects/${pId}`,
      });
    } else if (endDateIso && endDateIso < todayIso && pStatus !== 'Completed') {
      overdueOrAtRisk.push({
        id: `proj-overdue-${pId}`,
        title: pName,
        projectId: pId,
        projectName: pName,
        reason: `Past target end date (${endDateIso}) while ${pStatus}`,
        dueDate: endDateIso,
        link: `/projects/${pId}`,
      });
    } else if (est > 0 && logged > est) {
      overdueOrAtRisk.push({
        id: `proj-budget-${pId}`,
        title: pName,
        projectId: pId,
        projectName: pName,
        reason: `Logged hours (${logged}h) exceed budget (${est}h)`,
        dueDate: endDateIso || undefined,
        link: `/projects/${pId}`,
      });
    }
  }

  // Also include any in-progress/not-started tasks from earlier in the week
  for (const row of weekLogs) {
    const tStatus = String(row['task_status'] || '');
    const dateIso = toIsoDateOnly(row['date']);
    if ((tStatus === 'Not Started' || tStatus === 'In Progress') && dateIso < todayIso && overdueOrAtRisk.length < 8) {
      const empName =
        `${String(row['first_name'] || '')} ${String(row['last_name'] || '')}`.trim() || 'Team Member';
      overdueOrAtRisk.push({
        id: `task-attn-${String(row['id'])}`,
        title: String(row['task_name'] || 'Task'),
        projectId: row['project_id'] ? String(row['project_id']) : undefined,
        projectName: String(row['project_name'] || 'Internal Task'),
        employeeName: empName,
        reason: `Task still marked "${tStatus}" from ${dateIso}`,
        dueDate: dateIso,
        link: '/approvals',
      });
    }
  }

  const totalTeamHours = Array.from(employeeWeekHours.values()).reduce(
    (sum, h) => Math.round((sum + h) * 10) / 10,
    0
  );
  const teamCapacity = Math.max(40, employees.length * 40);
  const avgUtilization = Math.min(100, Math.round((totalTeamHours / teamCapacity) * 100));

  const highlights: DashboardManagerSummaryFacts['highlights'] = {
    totalTeamHours,
    teamCapacity,
    avgUtilization,
    pendingApprovalsCount: pendingApprovals.length,
    pendingApprovalHours,
    activeProjectsCount: projectProgress.length,
    missingTimesheetsCount: missingTimesheets.length,
    overdueOrAtRiskCount: overdueOrAtRisk.length,
  };

  const managerFacts: DashboardManagerSummaryFacts = {
    pendingApprovals: pendingApprovals.slice(0, 12),
    projectProgress,
    attentionItems: {
      missingTimesheets: missingTimesheets.slice(0, 10),
      overdueOrAtRisk: overdueOrAtRisk.slice(0, 10),
    },
    highlights,
  };

  const aiSynthesis = await synthesizeManagerSummaryWithAi(weekLabel, managerFacts);

  return {
    role: 'manager',
    weekStart,
    weekEnd,
    weekLabel,
    hasData: true,
    provider: env.ai.apiKey ? env.ai.provider : 'timeflow-assistant',
    generatedAt: new Date().toISOString(),
    managerFacts,
    aiSynthesis,
  };
}

async function synthesizeManagerSummaryWithAi(
  weekLabel: string,
  facts: DashboardManagerSummaryFacts
): Promise<{ headline: string; observations: string[]; suggestions: string[] }> {
  const { highlights, projectProgress, pendingApprovals, attentionItems } = facts;

  if (env.ai.apiKey) {
    const systemPrompt = [
      'You are an analytical engineering & operations management assistant for TimeFlow.',
      'Given verified manager weekly team facts, return concise observations and actionable suggestions.',
      'Do NOT invent employee names, project metrics, or hours.',
      'Respond strictly with valid JSON: {"headline": "...", "observations": ["..."], "suggestions": ["..."]}',
    ].join(' ');

    const userPrompt = JSON.stringify({
      weekLabel,
      highlights,
      topProjects: projectProgress.slice(0, 5).map((p) => ({
        projectName: p.projectName,
        weekHours: p.weekHours,
        progress: p.progress,
        contributors: p.employees.length,
      })),
      pendingApprovalsCount: pendingApprovals.length,
      missingTimesheetsCount: attentionItems.missingTimesheets.length,
      overdueOrAtRiskCount: attentionItems.overdueOrAtRisk.length,
    });

    try {
      const raw = await callExternalAiJson(systemPrompt, userPrompt);
      if (raw) {
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as {
          headline?: string;
          observations?: string[];
          suggestions?: string[];
        };
        if (
          parsed.headline &&
          Array.isArray(parsed.observations) &&
          Array.isArray(parsed.suggestions)
        ) {
          return {
            headline: parsed.headline.trim(),
            observations: parsed.observations.map((s) => String(s).trim()).filter(Boolean).slice(0, 4),
            suggestions: parsed.suggestions.map((s) => String(s).trim()).filter(Boolean).slice(0, 3),
          };
        }
      }
    } catch {
      // Fall back to deterministic grounded synthesis
    }
  }

  const headline = `Team logged ${highlights.totalTeamHours.toFixed(1)}h (${highlights.avgUtilization}% capacity) across ${highlights.activeProjectsCount} active project${highlights.activeProjectsCount === 1 ? '' : 's'}, with ${highlights.pendingApprovalsCount} pending approval${highlights.pendingApprovalsCount === 1 ? '' : 's'}.`;

  const observations: string[] = [];
  if (projectProgress.length > 0) {
    const topProj = projectProgress[0];
    observations.push(
      `${topProj.projectName} led team effort with ${topProj.weekHours.toFixed(1)}h logged across ${topProj.employees.length} team member${topProj.employees.length === 1 ? '' : 's'} (${topProj.progress}% overall completion).`
    );
  }
  if (highlights.pendingApprovalsCount > 0) {
    observations.push(
      `${highlights.pendingApprovalsCount} submission${highlights.pendingApprovalsCount === 1 ? '' : 's'} (${highlights.pendingApprovalHours.toFixed(1)}h total) are awaiting manager review.`
    );
  } else {
    observations.push('All submitted timesheets for this week have been reviewed.');
  }
  if (
    attentionItems.missingTimesheets.length > 0 ||
    attentionItems.overdueOrAtRisk.length > 0
  ) {
    observations.push(
      `${attentionItems.missingTimesheets.length} team member${attentionItems.missingTimesheets.length === 1 ? ' has' : 's have'} missing or partial timesheets and ${attentionItems.overdueOrAtRisk.length} project/task item${attentionItems.overdueOrAtRisk.length === 1 ? ' needs' : 's need'} attention.`
    );
  }

  const suggestions: string[] = [];
  if (highlights.pendingApprovalsCount > 0) {
    suggestions.push(
      `Review and clear the ${highlights.pendingApprovalsCount} pending approval item${highlights.pendingApprovalsCount === 1 ? '' : 's'} in Approvals to keep project burn rates current.`
    );
  }
  if (attentionItems.missingTimesheets.length > 0) {
    const names = attentionItems.missingTimesheets
      .slice(0, 2)
      .map((m) => m.employeeName)
      .join(', ');
    suggestions.push(
      `Follow up with ${names}${attentionItems.missingTimesheets.length > 2 ? ` (+${attentionItems.missingTimesheets.length - 2} more)` : ''} regarding unsubmitted or partial weekly hours.`
    );
  }
  if (attentionItems.overdueOrAtRisk.length > 0) {
    const topRisk = attentionItems.overdueOrAtRisk[0];
    suggestions.push(
      `Inspect ${topRisk.projectName} (${topRisk.reason}) to rebalance scope or timeline if needed.`
    );
  }

  return { headline, observations, suggestions };
}

async function processDashboardManagerChat(
  summary: DashboardWeeklySummaryOutput,
  message: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<DashboardChatOutput> {
  const normMsg = message.trim().toLowerCase();
  const provider = env.ai.apiKey ? env.ai.provider : 'timeflow-assistant';
  const generatedAt = new Date().toISOString();
  const weekLabel = summary.weekLabel;

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
    const shortAnswer = empFacts
      ? `You logged ${empFacts.highlights.totalHours.toFixed(1)}h toward your 40h weekly target across ${empFacts.timeByProject.length} project(s) for ${weekLabel}.`
      : `Weekly activity is available for ${weekLabel}.`;
    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer: empFacts?.highlights.topProjectName
        ? `Your primary project focus was ${empFacts.highlights.topProjectName} with ${empFacts.highlights.topProjectHours}h logged.`
        : undefined,
      sourceLinks: [{ label: 'Open Work Logs', url: '/work-logs', type: 'timesheet' }],
      verifiedFacts: empFacts
        ? [{ title: 'Total Hours', detail: `${empFacts.highlights.totalHours}h logged`, link: '/work-logs' }]
        : [],
      suggestions: summary.aiSynthesis.suggestions,
      hasData: true,
      weekLabel,
      provider,
      generatedAt,
    };
  }

  // 1. Try external AI if configured
  if (env.ai.apiKey) {
    const systemPrompt = [
      'You are TimeFlow analytical assistant for managers.',
      'Answer the manager question conversationally, concisely, and truthfully using ONLY the provided verified database facts.',
      'Never invent employees, hours, projects, or statistics.',
      'Provide a short, direct answer (1-3 sentences) in shortAnswer.',
      'Provide expandable supporting details or bullet points in detailedAnswer.',
      'Include relevant sourceLinks pointing to /approvals, /projects, or /work-logs.',
      'Return strictly valid JSON: {"shortAnswer": "...", "detailedAnswer": "...", "sourceLinks": [{"label": "...", "url": "..."}], "verifiedFacts": [{"title": "...", "detail": "...", "link": "..."}], "suggestions": ["..."]}',
    ].join(' ');

    const userPrompt = JSON.stringify({
      weekLabel,
      message,
      history: history?.slice(-4) || [],
      highlights: facts.highlights,
      pendingApprovals: facts.pendingApprovals.slice(0, 10).map((a) => ({
        employeeName: a.employeeName,
        projectName: a.projectName,
        hours: a.hours,
        date: a.date,
      })),
      projectProgress: facts.projectProgress.slice(0, 6).map((p) => ({
        projectName: p.projectName,
        status: p.status,
        progress: p.progress,
        weekHours: p.weekHours,
        loggedHours: p.loggedHours,
        totalHours: p.totalHours,
      })),
      missingTimesheets: facts.attentionItems.missingTimesheets.slice(0, 8).map((m) => ({
        employeeName: m.employeeName,
        department: m.department,
        loggedHours: m.loggedHours,
      })),
      overdueOrAtRisk: facts.attentionItems.overdueOrAtRisk.slice(0, 6).map((r) => ({
        title: r.title,
        projectName: r.projectName,
        reason: r.reason,
      })),
    });

    try {
      const raw = await callExternalAiJson(systemPrompt, userPrompt);
      if (raw) {
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        const parsed = JSON.parse(cleaned) as {
          shortAnswer?: string;
          detailedAnswer?: string;
          sourceLinks?: Array<{ label: string; url: string; count?: number }>;
          verifiedFacts?: Array<{ title: string; detail: string; link?: string }>;
          suggestions?: string[];
        };
        if (parsed.shortAnswer) {
          return {
            reply: parsed.shortAnswer,
            shortAnswer: parsed.shortAnswer.trim(),
            detailedAnswer: parsed.detailedAnswer?.trim(),
            sourceLinks: (parsed.sourceLinks || []).map((l) => ({
              label: String(l.label || 'View Record'),
              url: String(l.url || '/work-logs'),
              count: typeof l.count === 'number' ? l.count : undefined,
            })),
            verifiedFacts: (parsed.verifiedFacts || []).map((f) => ({
              title: String(f.title || 'Record'),
              detail: String(f.detail || ''),
              link: f.link ? String(f.link) : undefined,
            })),
            suggestions: (parsed.suggestions || summary.aiSynthesis.suggestions || []).map(String),
            hasData: true,
            weekLabel,
            provider,
            generatedAt,
          };
        }
      }
    } catch {
      // Fallback to grounded analytical engine
    }
  }

  // 2. Deterministic Grounded Engine
  const { highlights, pendingApprovals, projectProgress, attentionItems } = facts;

  // Starter 1: "Summarize this week for my team" / general summary
  if (
    normMsg.includes('summarize') ||
    normMsg.includes('summary') ||
    normMsg.includes('overview') ||
    normMsg.includes('team activity') ||
    normMsg.includes('this week')
  ) {
    const shortAnswer = `This week (${weekLabel}), your team logged ${highlights.totalTeamHours.toFixed(1)}h across ${highlights.activeProjectsCount} active project${highlights.activeProjectsCount === 1 ? '' : 's'} (${highlights.avgUtilization}% capacity). You have ${highlights.pendingApprovalsCount} timesheet${highlights.pendingApprovalsCount === 1 ? '' : 's'} awaiting approval and ${highlights.missingTimesheetsCount} missing submission${highlights.missingTimesheetsCount === 1 ? '' : 's'}.`;

    const projectLines = projectProgress
      .slice(0, 4)
      .map(
        (p) =>
          `• ${p.projectName}: ${p.weekHours.toFixed(1)}h this week (${p.progress}% progress, status: ${p.status})`
      );

    const detailedAnswer = [
      `Weekly Capacity: ${highlights.totalTeamHours.toFixed(1)}h logged of ${highlights.teamCapacity}h target (${highlights.avgUtilization}% utilization).`,
      `Pending Reviews: ${highlights.pendingApprovalsCount} submission${highlights.pendingApprovalsCount === 1 ? '' : 's'} totaling ${highlights.pendingApprovalHours.toFixed(1)}h.`,
      `Active Projects:`,
      ...projectLines,
      attentionItems.missingTimesheets.length > 0
        ? `Missing Timesheets: ${attentionItems.missingTimesheets.map((m) => m.employeeName).join(', ')}.`
        : 'All active team members have recorded hours this week.',
    ].join('\n');

    const sourceLinks: DashboardChatSourceLink[] = [
      { label: `Review Approvals (${highlights.pendingApprovalsCount})`, url: '/approvals', count: highlights.pendingApprovalsCount, type: 'approval' },
      { label: `Explore Projects (${highlights.activeProjectsCount})`, url: '/projects', count: highlights.activeProjectsCount, type: 'project' },
      { label: 'View Team Timesheets', url: '/work-logs', type: 'timesheet' },
    ];

    const verifiedFacts: DashboardChatVerifiedFact[] = [
      {
        title: 'Team Logged Time',
        detail: `${highlights.totalTeamHours.toFixed(1)}h / ${highlights.teamCapacity}h (${highlights.avgUtilization}%)`,
        link: '/work-logs',
      },
      {
        title: 'Pending Approvals',
        detail: `${highlights.pendingApprovalsCount} timesheets (${highlights.pendingApprovalHours.toFixed(1)}h)`,
        link: '/approvals',
      },
      {
        title: 'Tracked Projects',
        detail: `${highlights.activeProjectsCount} active projects`,
        link: '/projects',
      },
      {
        title: 'Timesheet Alerts',
        detail: `${highlights.missingTimesheetsCount} missing or partial submissions`,
        link: '/work-logs',
      },
    ];

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer,
      sourceLinks,
      verifiedFacts,
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
        detailedAnswer: 'No pending submissions found for this period. Any new timesheet submissions from your team will appear in Approvals.',
        sourceLinks: [{ label: 'Open Approvals', url: '/approvals', type: 'approval' }],
        verifiedFacts: [{ title: 'Pending Count', detail: '0 pending items', link: '/approvals' }],
        suggestions: ['Review project burn rates or check team work logs for upcoming submissions.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const uniqueEmployees = Array.from(new Set(pendingApprovals.map((a) => a.employeeName)));
    const namesDisplay = uniqueEmployees.slice(0, 3).join(', ') + (uniqueEmployees.length > 3 ? ` +${uniqueEmployees.length - 3} more` : '');
    const shortAnswer = `You have ${pendingApprovals.length} pending timesheet submission${pendingApprovals.length === 1 ? '' : 's'} (${highlights.pendingApprovalHours.toFixed(1)}h total) awaiting your approval from ${namesDisplay}.`;

    const approvalItems = pendingApprovals.map(
      (a) => `• ${a.employeeName} — ${a.hours.toFixed(1)}h on ${a.projectName} (${a.taskName}) [${a.date}]`
    );

    const detailedAnswer = [
      `Awaiting Manager Review (${pendingApprovals.length} item${pendingApprovals.length === 1 ? '' : 's'}, ${highlights.pendingApprovalHours.toFixed(1)}h):`,
      ...approvalItems,
    ].join('\n');

    return {
      reply: shortAnswer,
      shortAnswer,
      detailedAnswer,
      sourceLinks: [
        { label: `Review ${pendingApprovals.length} Pending Approval${pendingApprovals.length === 1 ? '' : 's'}`, url: '/approvals', count: pendingApprovals.length, type: 'approval' },
      ],
      verifiedFacts: pendingApprovals.slice(0, 4).map((a) => ({
        title: a.employeeName,
        detail: `${a.hours}h on ${a.projectName} (${a.taskName})`,
        link: '/approvals',
      })),
      suggestions: ['Approve or reject timesheets promptly to ensure client billing and project burn rates remain accurate.'],
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
        suggestions: ['Maintain regular check-ins with project leads to ensure deadlines remain on track.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const flaggedNames = Array.from(new Set([...atRiskOrOverdue.map((r) => r.projectName), ...atRiskProjects.map((p) => p.projectName)]));
    const shortAnswer = `${flaggedNames.length} project item${flaggedNames.length === 1 ? ' needs' : 's need'} your attention: ${flaggedNames.join(', ')}.`;

    const detailLines: string[] = [];
    for (const item of atRiskOrOverdue) {
      detailLines.push(`• ${item.projectName}: ${item.title} — ${item.reason}${item.dueDate ? ` (Due: ${item.dueDate})` : ''}`);
    }
    for (const p of atRiskProjects) {
      if (!atRiskOrOverdue.some((r) => r.projectName === p.projectName)) {
        detailLines.push(`• ${p.projectName}: Status is ${p.status} with ${p.loggedHours}h logged of ${p.totalHours}h budget (${p.progress}% completed).`);
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
      suggestions: ['Consider reassigning deliverables or adjusting milestones for flagged projects.'],
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
        suggestions: ['Review logged timesheets in Approvals before closing out the payroll period.'],
        hasData: true,
        weekLabel,
        provider,
        generatedAt,
      };
    }

    const missingNames = missing.map((m) => m.employeeName);
    const shortAnswer = `${missing.length} team member${missing.length === 1 ? ' has' : 's have'} missing or incomplete timesheets for ${weekLabel}: ${missingNames.join(', ')}.`;

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

  // Check if asking about a specific person or project by name
  for (const proj of projectProgress) {
    if (normMsg.includes(proj.projectName.toLowerCase())) {
      const shortAnswer = `${proj.projectName} is currently ${proj.status} at ${proj.progress}% completion. Your team logged ${proj.weekHours.toFixed(1)}h on it this week across ${proj.employees.length} contributor${proj.employees.length === 1 ? '' : 's'}.`;
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

  // General or unanswerable / out-of-domain query
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
}


