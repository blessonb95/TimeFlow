import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { Badge, statusVariant } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Avatar } from '../components/ui/Avatar';
import { Pagination } from '../components/ui/Pagination';
import { EditProjectModal } from '../components/ui/EditProjectModal';
import { LogTaskDrawer } from '../components/ui/LogTaskDrawer';
import { TimesheetReviewModal } from '../components/ui/TimesheetReviewModal';
import { formatDisplayDate } from '../utils/date';
import { useAppStore } from '../store/useAppStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TableSkeleton, Skeleton } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { PROJECT_EXTRAS, DEFAULT_MANAGER_USER, getProjectLeadLabel } from '../data/dummy';

type TaskStatus = 'Completed' | 'In Progress' | 'Todo' | 'Not Started';
type TaskPriority = 'High' | 'Medium' | 'Low' | 'Critical';

const PRIORITY_META: Record<string, { label: string; bg: string; color: string }> = {
  Critical: { label: 'Critical', bg: '#fee2e2', color: '#991b1b' },
  High:     { label: 'High',     bg: '#fff3e0', color: '#e65100' },
  Medium:   { label: 'Medium',   bg: '#e8f5e9', color: '#2e7d32' },
  Low:      { label: 'Low',      bg: '#f3f4f6', color: '#6b7280' },
};

type TaskFilter = 'all' | 'In Progress' | 'Todo' | 'Completed' | 'Not Started';

export const ProjectDetail: React.FC = () => {
  const { role, currentUser } = useAppStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'team' | 'activity'>('overview');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
  const [taskPage, setTaskPage] = useState(1);
  const taskPageSize = 10;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTaskLog, setEditingTaskLog] = useState<any | null>(null);
  const [isReadOnlyDrawer, setIsReadOnlyDrawer] = useState(false);
  const [selectedMemberLogId, setSelectedMemberLogId] = useState<string | null>(null);

  const { data: project, isLoading, isFetching, isError, refetch } = useProject(id || '');

  if (isLoading) {
    return (
      <div className="page-inner page-inner--fade">
        <Skeleton width="140px" height="1.25rem" className="proj-detail__skeleton-back" />
        <div className="skeleton-card proj-detail__skeleton-card">
          <div className="proj-detail__skeleton-row">
            <Skeleton width="3rem" height="3rem" borderRadius="0.75rem" />
            <div className="proj-detail__skeleton-info">
              <Skeleton width="280px" height="1.75rem" className="proj-detail__skeleton-title" />
              <Skeleton width="180px" height="1rem" />
            </div>
          </div>
          <Skeleton width="100%" height="0.5rem" borderRadius="9999px" />
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="page-inner">
        <EmptyState
          icon={isError ? 'error' : 'projects'}
          title={isError ? 'Unable to load project' : 'Project not found'}
          subtitle={
            isError
              ? "We couldn't fetch this project's details. Check your connection and try again."
              : 'The requested project could not be found or may have been removed.'
          }
          action={
            isError
              ? { label: isFetching ? 'Retrying…' : 'Try again', onClick: () => void refetch() }
              : { label: 'Back to Projects', onClick: () => navigate('/projects') }
          }
        />
      </div>
    );
  }

  const handleOpenTaskDrawer = (t: any) => {
    setEditingTaskLog({
      ...t,
      projectId: t.projectId || project?.id,
      projectName: t.projectName || project?.name,
    });
    setIsReadOnlyDrawer(false);
    setShowDrawer(true);
  };

  const members = project.teamMembers || [];
  const tasks = project.tasks || project.recentTasks || [];

  const meta = PROJECT_EXTRAS[project.id];
  const ex = {
    client: meta?.client || 'TimeFlow Client',
    color: meta?.hex || '#2563eb',
    status: meta?.status || project.status || 'Active',
    priority: meta?.priority || project.priority || 'High',
  };

  const remaining = Math.max(0, (project.totalHours || 0) - (project.loggedHours || 0));
  const daysLeft = Math.round(remaining / 8);

  const completedTasksCount = tasks.filter((t: any) => (t.taskStatus || t.status) === 'Completed').length;
  const inProgressTasksCount = tasks.filter((t: any) => (t.taskStatus || t.status) === 'In Progress').length;
  const todoTasksCount = tasks.filter((t: any) => (t.taskStatus || t.status) === 'Todo' || (t.taskStatus || t.status) === 'Not Started').length;
  const totalTasks = tasks.length || 1;

  const tabs = ['Overview', 'Tasks', 'Team'];
  const tabKeys = ['overview', 'tasks', 'team'] as const;

  return (
    <div className="page-inner">
      {/* Breadcrumb */}
      <div className="proj-detail__breadcrumb">
        <button type="button" className="proj-detail__back" onClick={() => navigate('/projects')}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 12L6 8l4-4"/></svg>
          Back
        </button>
        <button type="button" className="proj-detail__breadcrumb-sep" onClick={() => navigate('/projects')}>Projects</button>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="proj-detail__breadcrumb-chevron"><path d="M6 12l4-4-4-4"/></svg>
        <span className="proj-detail__breadcrumb-current">Detail</span>
      </div>

      {/* Project Header Card */}
      <div className="proj-detail__header-card">
        <div className="proj-detail__header-top">
          <div className="proj-detail__header-left">
            <div className="proj-detail__icon" style={{ background: `${ex.color}20`, color: ex.color }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
                <path d="M1.5 4.5A1.5 1.5 0 013 3h3.5l1.5 1.5H13A1.5 1.5 0 0114.5 6v6A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12V4.5z"/>
              </svg>
            </div>
            <div>
              <h1 className="proj-detail__title">{project.name}</h1>
              <div className="proj-detail__meta">
                <span className="proj-detail__client">{ex.client}</span>
                <span className="proj-detail__dot">·</span>
                <span>Due {project.dueDate || 'N/A'}</span>
                <span className="proj-detail__dot">·</span>
                <span className="proj-detail__days-left">{daysLeft} days left</span>
              </div>
            </div>
          </div>
          <div className="proj-detail__header-badges">
            <Badge variant={project.status === 'On Track' ? 'green' : project.status === 'At Risk' ? 'orange' : 'red'} dot>{project.status}</Badge>
            <Badge variant={project.priority === 'High' || project.priority === 'Critical' ? 'orange' : 'blue'}>{project.priority || 'Medium'}</Badge>
            { (role === 'manager' || role === 'admin') && (
              <button
                type="button"
                className="btn btn--ghost btn--sm proj-detail__edit-btn"
                onClick={() => setShowEditModal(true)}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 2a2 2 0 0 1 2 2l-8 8-4 1 1-4 8-8z" />
                </svg>
                Edit
              </button>
            )}
          </div>
        </div>

        <p className="proj-detail__desc">{project.description || 'No description provided.'}</p>

        <div className="proj-detail__lead-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
          </svg>
          <div>
            <span className="proj-detail__lead-banner-label">Project Manager(s): </span>
            <span className="proj-detail__lead-banner-value">
              {getProjectLeadLabel(project)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="proj-detail__stats">
          <div className="proj-detail__stat">
            <div className="proj-detail__stat-label">PROGRESS</div>
            <div className="proj-detail__stat-value">{project.progress}%</div>
          </div>
          <div className="proj-detail__stat-divider"/>
          <div className="proj-detail__stat">
            <div className="proj-detail__stat-label">LOGGED</div>
            <div className="proj-detail__stat-value">{project.loggedHours}h</div>
          </div>
          <div className="proj-detail__stat-divider"/>
          <div className="proj-detail__stat">
            <div className="proj-detail__stat-label">BUDGET</div>
            <div className="proj-detail__stat-value">{project.totalHours > 0 ? `${project.totalHours}h` : 'No budget'}</div>
          </div>
          <div className="proj-detail__stat-divider"/>
          <div className="proj-detail__stat">
            <div className="proj-detail__stat-label">REMAINING</div>
            <div className="proj-detail__stat-value">{project.totalHours > 0 ? `${remaining}h` : 'Ongoing'}</div>
          </div>
        </div>
        <ProgressBar value={project.progress} color={ex.color === '#3b82f6' ? 'blue' : ex.color === '#22c55e' ? 'green' : ex.color === '#9333ea' ? 'purple' : ex.color === '#f97316' ? 'orange' : 'red'} thickness="thick" />
      </div>

      {/* Sub-tabs */}
      <div className="proj-detail__tabs" role="group" aria-label="Project detail views">
        {tabs.map((t, i) => (
          <button
            type="button"
            key={t}
            aria-label={`${t}${t === 'Tasks' ? `, ${tasks.length} tasks` : ''}`}
            aria-pressed={activeTab === tabKeys[i]}
            className={`proj-detail__tab${activeTab === tabKeys[i] ? ' proj-detail__tab--active' : ''}`}
            onClick={() => setActiveTab(tabKeys[i])}
          >
            {t}
            {t === 'Tasks' && <span className="proj-detail__tab-count">{tasks.length}</span>}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="proj-detail__overview-grid">
          {/* Budget vs Logged chart */}
          <div className="proj-detail__chart-card">
            <div className="proj-detail__chart-title">
              {project.totalHours > 0 ? 'Budget vs Logged Hours' : 'Logged Timesheet Hours'}
            </div>
            {project.totalHours > 0 ? (
              <svg width="100%" viewBox="0 0 450 160" preserveAspectRatio="none" className="proj-detail__budget-svg">
                {[0, Math.round(project.totalHours * 0.25), Math.round(project.totalHours * 0.5), Math.round(project.totalHours * 0.75), project.totalHours || 100].map((v, i) => {
                  const maxBudget = project.totalHours || 100;
                  const y = 15 + (1 - v / maxBudget) * 115;
                  return <g key={i}><line x1="45" y1={y} x2="435" y2={y} stroke="#f0f0f0" strokeWidth="1"/><text x="38" y={y + 3.5} textAnchor="end" fontSize="9.5" fill="#6b7280">{v}</text></g>;
                })}
                {/* Logged bar */}
                {(() => {
                  const maxBudget = project.totalHours || 100;
                  const rawLh = ((project.loggedHours || 0) / maxBudget) * 115;
                  const lH = project.loggedHours > 0 ? Math.max(6, Math.min(115, rawLh)) : 0;
                  const rH = Math.min(115, (remaining / maxBudget) * 115);
                  return <>
                    <rect x="130" y={130 - lH} width="60" height={lH} rx="4" fill={ex.color}/>
                    <text x="160" y="148" textAnchor="middle" fontSize="10" fill="#4b5563" fontWeight="500">Logged</text>
                    <rect x="290" y={130 - rH} width="60" height={rH} rx="4" fill="#e5e7eb"/>
                    <text x="320" y="148" textAnchor="middle" fontSize="10" fill="#4b5563" fontWeight="500">Remaining</text>
                  </>;
                })()}
              </svg>
            ) : (
              <div className="proj-detail__no-budget-card">
                <div className="proj-detail__no-budget-val">
                  {project.loggedHours}h
                </div>
                <div className="proj-detail__no-budget-sub">
                  Total time accumulated from timesheets and work logs.
                </div>
                <div className="proj-detail__no-budget-pill">
                  No budget limit set for this project
                </div>
              </div>
            )}
          </div>

          {/* Task Distribution */}
          <div className="proj-detail__chart-card">
            <div className="proj-detail__chart-title">Task Distribution</div>
            <div className="proj-detail__task-dist">
              {[
                { label: 'Completed',   count: completedTasksCount,  color: '#22c55e', barColor: '#22c55e' },
                { label: 'In Progress', count: inProgressTasksCount, color: '#3b82f6', barColor: '#3b82f6' },
                { label: 'Todo',        count: todoTasksCount,       color: '#6b7280', barColor: '#d1d5db' },
              ].map(item => (
                <div key={item.label} className="proj-detail__dist-row">
                  <div className="proj-detail__dist-dot" style={{ background: item.color }}/>
                  <span className="proj-detail__dist-label">{item.label}</span>
                  <span className="proj-detail__dist-count">{item.count}</span>
                  <div className="proj-detail__dist-bar-track">
                    <div className="proj-detail__dist-bar-fill" style={{ width: `${(item.count / totalTasks) * 100}%`, background: item.barColor }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TASKS TAB ── */}
      {activeTab === 'tasks' && (() => {
        const getTaskProgress = (t: any) => {
          const s = (t.taskStatus || t.status || 'In Progress') as string;
          return s === 'Approved' || s === 'Rejected' || s === 'Submitted' || s === 'Pending' ? 'In Progress' : s;
        };

        const filtered = taskFilter === 'all'
          ? tasks
          : tasks.filter((t: any) => {
              const p = getTaskProgress(t);
              if (taskFilter === 'Todo') return p === 'Todo' || p === 'Not Started';
              return p === taskFilter;
            });

        const counts: Record<string, number> = {
          all: tasks.length,
          'In Progress': tasks.filter((t: any) => getTaskProgress(t) === 'In Progress').length,
          Todo: tasks.filter((t: any) => { const p = getTaskProgress(t); return p === 'Todo' || p === 'Not Started'; }).length,
          Completed: tasks.filter((t: any) => getTaskProgress(t) === 'Completed').length,
        };
        const paginatedTasks = filtered.slice((taskPage - 1) * taskPageSize, taskPage * taskPageSize);
        return (
          <div className="task-panel">
            {isFetching && !isLoading && (
              <div className="wl-panel__updating-bar">
                <LoadingSpinner inline size="sm" /> Updating task list…
              </div>
            )}
            {/* Filter toolbar */}
            <div className="task-panel__toolbar">
              <div className="task-panel__filters">
                {(['all', 'In Progress', 'Todo', 'Completed'] as const).map(f => (
                  <button
                    type="button"
                    key={f}
                    className={`task-panel__filter-btn${taskFilter === f ? ' task-panel__filter-btn--active' : ''}`}
                    onClick={() => { setTaskFilter(f as TaskFilter); setTaskPage(1); }}
                  >
                    {f === 'all' ? 'All' : f}
                    <span className="task-panel__filter-count">{counts[f] || 0}</span>
                  </button>
                ))}
              </div>
              <button type="button" className="task-panel__add-btn" onClick={() => setShowDrawer(true)}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M8 3v10M3 8h10"/>
                </svg>
                Log task
              </button>
            </div>

            {/* Column headers */}
            <div role="table" aria-label="Project tasks">
            <div role="rowgroup">
            <div className="task-panel__header" role="row">
              <div className="task-panel__col task-panel__col--task" role="columnheader">TASK</div>
              <div className="task-panel__col task-panel__col--assignee" role="columnheader">ASSIGNEE</div>
              <div className="task-panel__col task-panel__col--priority" role="columnheader">PRIORITY</div>
              <div className="task-panel__col task-panel__col--approval" role="columnheader">APPROVAL</div>
              <div className="task-panel__col task-panel__col--progress" role="columnheader">PROGRESS</div>
              <div className="task-panel__col task-panel__col--est" role="columnheader">HOURS</div>
              <div className="task-panel__col task-panel__col--due" role="columnheader">DATE</div>
              <div className="task-panel__col task-panel__col--view" role="columnheader">VIEW</div>
            </div>
            </div>

            {/* Task rows */}
            <div className="task-panel__list" role="rowgroup">
              {paginatedTasks.map((t: { id: string; taskName: string; status: string; hours: number; date: string; priority?: string; assignee?: { name: string; initials: string; color: string } }) => {
                const pm = PRIORITY_META[t.priority || 'Medium'] || PRIORITY_META['Medium'];
                return (
                  <div key={t.id} className="task-panel__row" role="row">
                    {/* Name */}
                    <div className="task-panel__col task-panel__col--task" role="cell">
                      <button
                        type="button"
                        className="task-panel__task-name task-panel__task-name--link"
                        aria-label={`Open task ${t.taskName}`}
                        onClick={() => handleOpenTaskDrawer(t)}
                        title="Click to open task in drawer"
                      >
                        {t.taskName}
                      </button>
                    </div>

                    {/* Assignee */}
                    <div className="task-panel__col task-panel__col--assignee" role="cell">
                      {(t.assignee || (t as any).employeeName) && (
                        <div className="task-panel__assignee">
                          <div className="task-panel__avatar" style={{ background: t.assignee?.color || (t as any).employeeColor || '#3b82f6' }}>{t.assignee?.initials || (t as any).employeeInitials || 'ME'}</div>
                          <span className="task-panel__assignee-name">{(t.assignee?.name || (t as any).employeeName || 'User').split(' ')[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="task-panel__col task-panel__col--priority" role="cell">
                      <span className="task-panel__priority" style={{ background: pm.bg, color: pm.color }}>
                        {pm.label}
                      </span>
                    </div>

                    {/* Approval Status */}
                    <div className="task-panel__col task-panel__col--approval" role="cell">
                      <Badge variant={statusVariant((t as any).timesheetStatus || 'Pending')}>{(t as any).timesheetStatus || 'Pending'}</Badge>
                    </div>

                    {/* Task Status */}
                    <div className="task-panel__col task-panel__col--progress" role="cell">
                      {(() => {
                        const s = ((t as any).taskStatus || t.status || 'In Progress') as string;
                        const display = s === 'Approved' || s === 'Rejected' ? 'In Progress' : s;
                        const variant = display === 'Completed' ? 'completed' : display === 'In Progress' ? 'in-progress' : 'other';
                        return (
                          <span className={`wl-panel__task-status wl-panel__task-status--${variant}`}>
                            <span className={`wl-panel__task-status-dot wl-panel__task-status-dot--${variant}`} />
                            {display}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Hours */}
                    <div className="task-panel__col task-panel__col--est" role="cell">
                      <span className="task-panel__est">{t.hours}h</span>
                    </div>

                    {/* Due */}
                    <div className="task-panel__col task-panel__col--due" role="cell">
                      <span className="task-panel__due">{formatDisplayDate(t.date)}</span>
                    </div>

                    {/* Open Drawer Action */}
                    <div className="task-panel__col task-panel__col--view" role="cell">
                      <button
                        type="button"
                        title="Open task drawer"
                        aria-label={`Open task drawer for ${t.taskName}`}
                        onClick={() => handleOpenTaskDrawer(t)}
                        className="task-panel__view-btn"
                      >
                        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M1 8s3-5.5 7-5.5S15 8 15 8s-3 5.5-7 5.5S1 8 1 8z"/>
                          <circle cx="8" cy="8" r="2.5"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="task-panel__empty" role="row">
                  <div role="cell">
                    <EmptyState
                      icon="timesheets"
                      title="No logged tasks in this project yet"
                      subtitle="Tasks logged against this project will appear here."
                      compact
                    />
                  </div>
                </div>
              )}
            </div>
            </div>
            <Pagination
              currentPage={taskPage}
              totalItems={filtered.length}
              pageSize={taskPageSize}
              onPageChange={setTaskPage}
            />
          </div>
        );
      })()}

      {/* ── TEAM TAB ── */}
      {activeTab === 'team' && (
        <div>
          <div className="proj-detail__section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
            </svg>
            <span>Project Manager(s)</span>
          </div>
          <div className="proj-detail__team-grid proj-detail__team-grid--managers">
            {members.filter((m: any) => m.role === 'manager').length > 0 ? (
              members.filter((m: any) => m.role === 'manager').map((m: any) => {
                const memberLog = tasks.find((t: any) => t.assignee?.name === m.name || t.employeeName === m.name || t.assignee?.initials === m.initials);
                return (
                  <div key={m.id} className="proj-detail__team-card proj-detail__team-card--manager">
                    <Avatar initials={m.initials} color={m.color} size="lg"/>
                    <div className="proj-detail__team-name">{m.name}</div>
                    <div className="proj-detail__team-role proj-detail__team-role--manager">Project Manager</div>
                    <Badge variant="blue" dot>Lead</Badge>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberLogId(memberLog?.id || `user_${m.id}`)}
                      className="proj-detail__team-timesheet-btn"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M1 8s3-5.5 7-5.5S15 8 15 8s-3 5.5-7 5.5S1 8 1 8z"/>
                        <circle cx="8" cy="8" r="2.5"/>
                      </svg>
                      View Timesheet
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="proj-detail__team-card proj-detail__team-card--manager">
                <Avatar initials={DEFAULT_MANAGER_USER.initials} color={DEFAULT_MANAGER_USER.color} size="lg"/>
                <div className="proj-detail__team-name">{DEFAULT_MANAGER_USER.name}</div>
                <div className="proj-detail__team-role proj-detail__team-role--manager">Project Manager (Default)</div>
                <Badge variant="blue" dot>Lead</Badge>
              </div>
            )}
          </div>

          <div className="proj-detail__section-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Team Members</span>
          </div>
          <div className="proj-detail__team-grid">
            {members.filter((m: any) => m.role !== 'manager').map((m: any) => {
              const memberLog = tasks.find((t: any) => t.assignee?.name === m.name || t.employeeName === m.name || t.assignee?.initials === m.initials);
              return (
                <div key={m.id} className="proj-detail__team-card">
                  <Avatar initials={m.initials} color={m.color} size="lg"/>
                  <div className="proj-detail__team-name">{m.name}</div>
                  <div className="proj-detail__team-role">{m.designation || 'Team Member'}</div>
                  <Badge variant="green" dot>Active</Badge>
                  <button
                    type="button"
                    onClick={() => setSelectedMemberLogId(memberLog?.id || `user_${m.id}`)}
                    className="proj-detail__team-timesheet-btn"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M1 8s3-5.5 7-5.5S15 8 15 8s-3 5.5-7 5.5S1 8 1 8z"/>
                      <circle cx="8" cy="8" r="2.5"/>
                    </svg>
                    View Timesheet
                  </button>
                </div>
              );
            })}
            {members.filter((m: any) => m.role !== 'manager').length === 0 && (
              <div className="proj-detail__team-empty">No additional team members assigned yet.</div>
            )}
          </div>
        </div>
      )}


      {showEditModal && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
          onDeleted={() => navigate('/projects')}
        />
      )}

      {showDrawer && (
        <LogTaskDrawer
          editingLog={editingTaskLog}
          defaultProject={project?.id}
          isReadOnly={isReadOnlyDrawer}
          onClose={() => {
            setShowDrawer(false);
            setEditingTaskLog(null);
            setIsReadOnlyDrawer(false);
          }}
        />
      )}

      {selectedMemberLogId && (
        <TimesheetReviewModal
          approvalId={selectedMemberLogId}
          readOnly={true}
          onClose={() => setSelectedMemberLogId(null)}
        />
      )}
    </div>
  );
};
