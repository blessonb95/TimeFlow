import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { Badge, statusVariant } from "../components/ui/Badge";
import { ProgressBar, UtilBar } from "../components/ui/ProgressBar";
import { Avatar } from "../components/ui/Avatar";
import { formatDisplayDate } from "../utils/date";
import {
	useEmployeeDashboard,
	useManagerDashboard,
} from "../hooks/useDashboard";
import { useApprovals, useBulkApprove } from "../hooks/useApprovals";
import { LogTaskDrawer } from "../components/ui/LogTaskDrawer";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { DashboardSkeleton } from "../components/ui/LoadingState";
import { WeekBars } from "../components/ui/Charts";
import { EmptyState } from "../components/ui/EmptyState";

// ─── SVG Progress Ring ──────────────────────────────────────────────────────────
const ProjectProgressRing: React.FC<{
	progress: number;
	progressMode: "budget" | "activity" | "none";
	status: string;
	size?: number;
}> = ({ progress, progressMode, status, size = 56 }) => {
	const strokeWidth = 4;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const safeProgress = Math.max(0, Math.min(100, progress));
	const offset = circumference - (safeProgress / 100) * circumference;

	const getStrokeColor = () => {
		if (status === "Completed") return "#15803d";
		if (status === "At Risk") return "#c2410c";
		if (progressMode === "activity") return "#4f46e5";
		return "#2563eb";
	};

	const strokeColor = getStrokeColor();
	const isUnmeasured = progressMode === "activity";

	return (
		<div
			className={`dashboard__project-ring${isUnmeasured ? " dashboard__project-ring--activity" : ""}`}
		>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{/* Track */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="#f3f4f6"
					strokeWidth={strokeWidth}
				/>
				{/* Fill */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					style={{
						transition: "stroke-dashoffset 0.6s ease",
						transform: "rotate(-90deg)",
						transformOrigin: "50% 50%",
					}}
				/>
			</svg>
			<span className="dashboard__project-ring-label" style={{ color: strokeColor }}>
				{safeProgress}%
			</span>
		</div>
	);
};

// ─── Project Type Definition ────────────────────────────────────────────────────
interface DashboardProject {
	id: string;
	name: string;
	status: string;
	progress: number;
	progressMode?: "budget" | "activity" | "none";
	dueDate: string;
	loggedHours: number;
	totalHours: number;
	hasBudget?: boolean;
}

// ─── Shared Project Card ────────────────────────────────────────────────────────
const ProjectCard: React.FC<{
	project: DashboardProject;
	to: string;
}> = ({ project: p, to }) => {
	const accentColor =
		p.status === "At Risk"
			? "#f97316"
			: p.status === "Completed"
				? "#22c55e"
				: "#3b82f6";

	const progressMode = p.progressMode || (p.totalHours > 0 ? "budget" : p.loggedHours > 0 ? "activity" : "none");

	const effectiveProgress = p.status === "Completed"
		? 100
		: (p.totalHours > 0 && p.hasBudget !== false)
			? Math.min(100, Math.round((p.loggedHours / p.totalHours) * 100))
			: p.loggedHours > 0
				? Math.max(p.progress || 0, Math.min(95, Math.max(5, Math.round(p.loggedHours * 5))))
				: (p.progress || 0);

	const getProgressLabel = () => {
		if (progressMode === "activity") {
			return (
				<span className="dashboard__project-card-activity-tag">
					<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
						<path d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z" />
						<path d="M6.5 13.5a1.5 1.5 0 003 0" />
					</svg>
					Activity-based
				</span>
			);
		}
		return null;
	};

	return (
		<Link
			to={to}
			className="dashboard__project-card"
			style={{ "--accent-color": accentColor } as React.CSSProperties}
		>
			<div className="dashboard__project-card-body">
				<div className="dashboard__project-card-info">
					<div className="dashboard__project-card-header">
						<span className="dashboard__project-card-name">{p.name}</span>
						<Badge variant={statusVariant(p.status)} dot>
							{p.status}
						</Badge>
					</div>
					<div className="dashboard__project-card-meta">
						<span className="dashboard__project-card-meta-item">
							<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
								<rect x="2" y="2.5" width="12" height="11" rx="2" />
								<path d="M2 6.5h12" />
								<path d="M5.5 1v3M10.5 1v3" />
							</svg>
							{formatDisplayDate(p.dueDate) || "No due date"}
						</span>
						<span className="dashboard__project-card-meta-divider" />
						<span className="dashboard__project-card-meta-item">
							<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
								<circle cx="8" cy="8" r="6.5" />
								<polyline points="8 4.5 8 8 10.5 9.5" />
							</svg>
							{p.totalHours > 0
								? `${p.loggedHours}h / ${p.totalHours}h`
								: p.loggedHours > 0
									? `${p.loggedHours}h logged`
									: "No hours yet"}
						</span>
					</div>
					{getProgressLabel()}
				</div>
				<ProjectProgressRing
					progress={effectiveProgress}
					progressMode={progressMode}
					status={p.status}
				/>
			</div>
			{/* Bottom progress bar as secondary indicator */}
			<div className="dashboard__project-card-bar">
				<ProgressBar
					value={effectiveProgress}
					color={
						p.status === "At Risk"
							? "orange"
							: p.status === "Completed"
								? "green"
								: progressMode === "activity"
									? "purple"
									: "blue"
					}
					thickness="thin"
				/>
			</div>
		</Link>
	);
};


// ─── Shared Quick Actions Component ─────────────────────────────────────────────
const DashboardQuickActions: React.FC<{ pendingCount?: number }> = ({ pendingCount = 0 }) => {
	const navigate = useNavigate();
	const { role } = useAppStore();

	const canApprove = role === "manager" || role === "ceo" || role === "hr";

	const primaryAction = canApprove
		? {
			label: pendingCount > 0 ? `Review approvals (${pendingCount})` : "Review approvals",
				to: "/approvals",
				icon: (
					<svg
						width="15"
						height="15"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="M14 4L6 12l-4-4" />
						<rect x="1.5" y="1.5" width="13" height="13" rx="2" />
					</svg>
				),
			}
		: {
				label: "View Reports",
				to: "/reports",
				icon: (
					<svg
						width="15"
						height="15"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						<path d="M4 14V8m4 6V2m4 12V5" />
					</svg>
				),
			};

	const defaultActions = [
		{
			label: "Browse Projects",
			to: "/projects",
			icon: (
				<svg
					width="15"
					height="15"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				>
					<path d="M1.5 4.5A1.5 1.5 0 013 3h3.5l1.5 1.5H13A1.5 1.5 0 0114.5 6v6A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12V4.5z" />
				</svg>
			),
		},
		{
			label: "Employee Directory",
			to: "/employees",
			icon: (
				<svg
					width="15"
					height="15"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				>
					<path d="M11 13v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1" />
					<circle cx="6.5" cy="5" r="2.5" />
				</svg>
			),
		},
		{
			label: "Account Settings",
			to: "/settings",
			icon: (
				<svg
					width="15"
					height="15"
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
				>
					<circle cx="8" cy="8" r="2.5" />
					<path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85" />
				</svg>
			),
		},
	];

	return (
		<div className="dashboard__section">
			<div className="dashboard__section-header">
				<h2 className="dashboard__section-title">{canApprove ? "Needs your attention" : "Quick actions"}</h2>
			</div>
			<button
				type="button"
				className="dashboard__quick-action dashboard__quick-action--primary"
				onClick={() => navigate(primaryAction.to)}
			>
				<span style={{ display: "flex", alignItems: "center", gap: '0.5rem'}}>
					{primaryAction.icon}
					{primaryAction.label}
				</span>
				<span style={{ color: "#6b7280" }}>›</span>
			</button>
			{defaultActions.map((a) => (
				<button
					type="button"
					key={a.label}
					className="dashboard__quick-action dashboard__quick-action--default"
					onClick={() => navigate(a.to)}
				>
					<span
						style={{
							display: "flex",
							alignItems: "center",
							gap: '0.5rem',
							color: "#4b5563",
						}}
					>
						<span style={{ color: "#6b7280", display: "flex" }}>{a.icon}</span>
						{a.label}
					</span>
					<span style={{ color: "#6b7280" }}>›</span>
				</button>
			))}
		</div>
	);
};

// ─── Employee Dashboard ───────────────────────────────────────────────────────
const EmployeeDashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading } = useEmployeeDashboard();
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const [showLogTask, setShowLogTask] = useState(false);

	if (isLoading || !data) { return <DashboardSkeleton />; }

	const myProjects = (data.projects || []).slice(0, 3);
	const weekHours = data.weekHours || [];
	const todayHours = data.todayHours || 0;
	const weekTotal =
		data.weekHours?.reduce(
			(acc: number, d: { hours: number }) => acc + d.hours,
			0,
		) || 0;
	const todayProgress = Math.min(100, Math.round((todayHours / 8) * 100));
	const weeklyProgress = Math.min(100, Math.round((weekTotal / 40) * 100));
	const allProjects = data.projects || [];
	const projectProgress = allProjects.length
		? Math.min(
				100,
				Math.round(
					allProjects.reduce(
						(total: number, project: DashboardProject) => total + project.progress,
						0,
					) / allProjects.length,
				),
			)
		: 0;

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
				<h1 className="dashboard__greeting">
						{greeting}, {currentUser.name.split(" ")[0]}
					</h1>
					<p className="dashboard__meta">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</p>
				</div>
				<div className="dashboard__header-actions dashboard__header-actions--log-task">
					<button
						type="button"
						className="btn btn--primary dashboard__log-task-top-action"
						onClick={() => setShowLogTask(true)}
					>
						+ Log Task
					</button>
				</div>
			</div>

			<section className="dashboard__week-hero" aria-labelledby="week-overview-title">
				<div className="dashboard__week-hero-copy">
					<p className="dashboard__week-hero-eyebrow">YOUR WEEK</p>
					<h2 id="week-overview-title" className="dashboard__week-hero-title">A steady week, one day at a time.</h2>
					<p className="dashboard__week-hero-description">Your logged time is building toward your 40-hour weekly target.</p>
					<button
						type="button"
						className="btn btn--primary dashboard__week-log-task"
						onClick={() => setShowLogTask(true)}
					>
						+ Log Task
					</button>
				</div>
				<div className="dashboard__week-hero-progress">
					<div className="dashboard__week-hero-total">
						<strong>{weekTotal}h</strong>
						<span>of 40h</span>
					</div>
					<div className="dashboard__week-hero-track" role="progressbar" aria-label="Weekly hours logged" aria-valuemin={0} aria-valuemax={40} aria-valuenow={Math.min(40, weekTotal)} aria-valuetext={`${weekTotal} of 40 hours logged`}>
						<span style={{ width: `${Math.min(100, (weekTotal / 40) * 100)}%` }} />
					</div>
					<p className="dashboard__week-hero-footnote">{weekTotal >= 40 ? "Weekly target reached" : `${Math.max(0, 40 - weekTotal)}h remaining this week`}</p>
				</div>
			</section>

			<div className="dashboard__grid">
				<div className="dashboard__grid-left">
					<section className="dashboard__section" aria-labelledby="weekly-activity-title">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title" id="weekly-activity-title">Hours this week</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/work-logs")}>View work log <span aria-hidden="true">→</span></button>
						</div>
						{weekTotal === 0 ? (
							<EmptyState icon="timesheets" title="No hours logged this week" subtitle="Start with a quick entry and your week will take shape here." action={{ label: "Log time", onClick: () => setShowLogTask(true) }} compact />
						) : (
							<>
								<WeekBars data={weekHours} targetHours={8} />
								<div className="dashboard__week-total">
									<span className="dashboard__week-total-label">Logged this week</span>
									<strong className="dashboard__week-total-val">{weekTotal}h <span>/ 40h</span></strong>
								</div>
							</>
						)}
					</section>

					{/* Assigned Projects */}
					<section className="dashboard__section dashboard__section--flush" aria-labelledby="project-pulse-title">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title" id="project-pulse-title">Project pulse</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/projects")}>All projects <span aria-hidden="true">→</span></button>
						</div>

						<div className="dashboard__project-card-list">
							{myProjects.length === 0 ? (
								<EmptyState
									icon="projects"
									title="No Assigned Projects"
									subtitle="You are not currently assigned to any active projects."
									compact
								/>
							) : (
								myProjects.map((p: DashboardProject) => (
									<ProjectCard
										key={p.id}
										project={p}
									to={`/projects/${p.id}`}
									/>
								))
							)}
						</div>
					</section>
				</div>

				<div className="dashboard__grid-right">
					<section className="dashboard__section dashboard__progress-statistics" aria-labelledby="attention-title">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title" id="attention-title">Progress statistics</h2>
						</div>
						<div className="dashboard__activity-summary">
							<strong>{weeklyProgress}%</strong>
							<span>Weekly<br />goal<small>{weekTotal}h of 40h</small></span>
						</div>
						<div className="dashboard__activity-metrics">
							{[
								{ label: "Today", value: todayProgress, tone: "purple" },
								{ label: "This week", value: weeklyProgress, tone: "green" },
								{ label: "Projects", value: projectProgress, tone: "orange" },
							].map((metric) => (
								<div className="dashboard__activity-metric" key={metric.label}>
									<div
										className="dashboard__activity-track"
										role="progressbar"
										aria-label={`${metric.label} progress`}
										aria-valuemin={0}
										aria-valuemax={100}
										aria-valuenow={metric.value}
									>
										<span className={`dashboard__activity-fill dashboard__activity-fill--${metric.tone}`} style={{ width: `${metric.value}%` }} />
									</div>
									<div className="dashboard__activity-caption">
										<span className="dashboard__activity-percent">{metric.value}%</span>
										<span className="dashboard__activity-label">{metric.label}</span>
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>
			{showLogTask && <LogTaskDrawer onClose={() => setShowLogTask(false)} />}
		</div>
	);
};

// ─── Manager Dashboard ────────────────────────────────────────────────────────
const ManagerDashboard: React.FC = () => {
	const { currentUser, role } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();
	const bulkApproveMutation = useBulkApprove();
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

	if (isLoading || !data) { return <DashboardSkeleton />; }

	const monthlyHours = data.monthlyHours || [];
	const deptUtilization = data.deptUtilization || [];
	const employeeTable = data.employeeTable || [];
	const myProjects = (data.projects || []).slice(0, 3);
	const teamHoursThisWeek = employeeTable.reduce(
		(total: number, row: { weekHours?: number }) => total + Number(row.weekHours || 0),
		0,
	);
	const teamNotStarted = employeeTable.filter(
		(row: { timesheetStatus?: string }) => row.timesheetStatus === "Not Started",
	).length;

	const handleBulkApproveAll = () => {
		const pendingIds = approvals
			.filter((a: { status: string; id: string }) => a.status === "Pending")
			.map((a: { id: string }) => a.id);
		if (
			pendingIds.length > 0 &&
			window.confirm(
				`Are you sure you want to approve all ${pendingIds.length} pending timesheets right now?`,
			)
		) {
			bulkApproveMutation.mutate(pendingIds);
		}
	};

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						{greeting}, {currentUser.name.split(" ")[0]}
					</h1>
					<p className="dashboard__meta">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							year: "numeric",
						})}{" "}
					</p>
				</div>
				<div className="dashboard__header-actions">
					{role !== "admin" && (
						<button
							type="button"
							className="btn btn--primary"
							onClick={() => navigate("/approvals")}
						>
							✓ Review ({data.pendingApprovals || 0})
						</button>
					)}
				</div>
			</div>

			<section className="dashboard__manager-hero" aria-labelledby="manager-overview-title">
				<div className="dashboard__manager-hero-copy">
					<p className="dashboard__manager-hero-eyebrow">MANAGER WORKSPACE</p>
					<h2 id="manager-overview-title">Team workweek</h2>
					<p>Track logged time, review submissions, and spot gaps across your team.</p>
				</div>
				<dl className="dashboard__manager-metrics">
					<div><dt>Hours logged</dt><dd>{teamHoursThisWeek}h</dd></div>
					<div><dt>Team members</dt><dd>{employeeTable.length}</dd></div>
					<div><dt>Not started</dt><dd>{teamNotStarted}</dd></div>
				</dl>
			</section>

			{/* Approval Banner with HR Reminder */}
			{role !== "admin" && data.pendingApprovals > 0 && (
				<div
					className="dashboard__banner"
					style={{
						background: "#fffbe6",
						border: "1px solid #ffe58f",
						color: "#854d0e",
						padding: "0.75rem 1.25rem",
						borderRadius: 8,
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: '0.625rem'}}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 16 16"
							fill="none"
							stroke="#d97706"
							strokeWidth="1.8"
						>
							<path d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z" />
							<path d="M6.5 13.5a1.5 1.5 0 003 0" />
						</svg>
						<div>
							<strong style={{ color: "#92400e" }}>
								HR Reminder (from Reshma):
							</strong>{" "}
							You have{" "}
							<strong>
								{data.pendingApprovals} timesheet
								{data.pendingApprovals > 1 ? "s" : ""}
							</strong>{" "}
							awaiting your review and approval.
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: '1rem'}}>
						<button
							type="button"
							className="btn btn--sm"
							onClick={handleBulkApproveAll}
							disabled={bulkApproveMutation.isPending}
							style={{
								background: "#059669",
								color: "#fff",
								border: "none",
								borderRadius: 6,
								padding: "0.3125rem 0.875rem",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							✓ Approve All ({data.pendingApprovals})
						</button>
						<button type="button"
							className="dashboard__banner-link"
							style={{ color: "#d97706", fontWeight: 600 }}
							onClick={() => navigate("/approvals")}
						>
							Review listing →
						</button>
					</div>
				</div>
			)}

			{/* Stats */}
			<div className="dashboard__stats">
				{[
					{
						label: "Total Employees",
						value: `${data.totalEmployees || 0}`,
						sub: "Active personnel",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--blue",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						),
					},
					{
						label: "Active Projects",
						value: `${data.activeProjects || 0}`,
						sub: "In progress",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--green",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
							</svg>
						),
					},
					role === "admin"
						? {
								label: "Departments",
								value: `${deptUtilization.length || 5}`,
								sub: "Active departments",
								subCls: "green",
								iconCls: "dashboard__stat-card-icon--purple",
								icon: (
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
										<line x1="8" y1="21" x2="16" y2="21" />
										<line x1="12" y1="17" x2="12" y2="21" />
									</svg>
								),
							}
						: {
								label: "Pending Approvals",
								value: `${data.pendingApprovals || 0}`,
								sub: "Needs action",
								subCls: data.pendingApprovals > 0 ? "red" : "green",
								iconCls: "dashboard__stat-card-icon--amber",
								icon: (
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<circle cx="12" cy="12" r="10" />
										<polyline points="12 6 12 12 16 14" />
									</svg>
								),
							},
					{
						label: "Avg Utilization",
						value: deptUtilization.length
							? `${Math.round(deptUtilization.reduce((acc: number, d: { utilization: number }) => acc + d.utilization, 0) / deptUtilization.length)}%`
							: "0%",
						sub: "Across departments",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--indigo",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
								<polyline points="17 6 23 6 23 12" />
							</svg>
						),
					},
				].map((s, i) => (
					<div className="dashboard__stat-card" key={i}>
						<div className="dashboard__stat-card-top">
							<span className="dashboard__stat-card-label">{s.label}</span>
							<span className={`dashboard__stat-card-icon ${s.iconCls}`}>
								{s.icon}
							</span>
						</div>
						<div className="dashboard__stat-card-value">{s.value}</div>
						<div
							className={`dashboard__stat-card-sub dashboard__stat-card-sub--${s.subCls}`}
						>
							{s.sub}
						</div>
					</div>
				))}
			</div>

			{/* Grid with Team Status and Quick Actions */}
			<div className="dashboard__grid">
				<div className="dashboard__grid-left">
					{/* Assigned Projects */}
					<div className="dashboard__section" style={{ padding: '0rem'}}>
						<div
							className="dashboard__section-header"
							style={{ padding: "1.25rem 1.5rem", marginBottom: '0rem'}}
						>
							<h2 className="dashboard__section-title">
								Assigned Projects
							</h2>
							<button type="button"
								className="dashboard__section-link"
								onClick={() => navigate("/projects")}
							>
								View all{" "}
								<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
									<path d="M6 3l5 5-5 5" />
								</svg>
							</button>
						</div>

						<div className="dashboard__project-card-list">
							{myProjects.length === 0 ? (
								<EmptyState
									icon="projects"
									title="No Assigned Projects"
									subtitle="No active project assignments found for your account."
									compact
								/>
							) : (
								myProjects.map((p: DashboardProject) => (
									<ProjectCard
										key={p.id}
										project={p}
										to={`/projects/${p.id}`}
									/>
								))
							)}
						</div>
					</div>

					{/* Team Status */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title">Team Timesheets Overview</h2>
							<button type="button"
								className="dashboard__section-link"
								onClick={() => navigate("/approvals")}
							>
								Full Listing →
							</button>
						</div>
						{employeeTable.length === 0 ? (
							<EmptyState
								icon="timesheets"
								title="No Team Timesheets Found"
								subtitle="Your team currently has no timesheets logged for this period."
							/>
						) : (
							<div className="table-responsive">
							<table className="data-table">
				<caption className="sr-only">Team timesheets for this week</caption>
								<thead>
									<tr>
											<th scope="col">Employee</th>
											<th scope="col">Hours Logged</th>
											<th scope="col">Utilization</th>
											<th scope="col">Timesheet</th>
									</tr>
								</thead>
								<tbody>
									{employeeTable.slice(0, 5).map(
										(row: {
											user: {
												id: string;
												name: string;
												initials: string;
												color: string;
												designation: string;
											};
											weekHours: number;
											utilization: number;
											timesheetStatus: string;
										}) => (
											<tr key={row.user.id}>
												<td>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: '0.625rem',
														}}
													>
														<Avatar
															initials={row.user.initials}
															color={row.user.color}
															size="sm"
														/>
														<div>
															<div style={{ fontWeight: 600, fontSize: '0.8125rem'}}>
																{row.user.name}
															</div>
															<div style={{ fontSize: '0.6875rem', color: "#6b7280" }}>
																{row.user.designation}
															</div>
														</div>
													</div>
												</td>
												<td style={{ fontWeight: 600 }}>{row.weekHours}h</td>
												<td style={{ minWidth: 140 }}>
													<UtilBar value={row.utilization} />
												</td>
												<td>
													<Badge variant={statusVariant(row.timesheetStatus)}>
														{row.timesheetStatus}
													</Badge>
												</td>
											</tr>
										),
									)}
								</tbody>
							</table>
							</div>
						)}
					</div>
				</div>
				<div className="dashboard__grid-right">
					{/* Timesheet Summary */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
											<h2 className="dashboard__section-title">Timesheet Status</h2>
						</div>
						<div className="dashboard__timesheet-status">
							<div className="dashboard__timesheet-status-item">
								<span className="dashboard__timesheet-status-icon dashboard__timesheet-status-icon--pending" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
								</span>
								<strong className="dashboard__timesheet-status-count">{employeeTable.filter((e: any) => e.timesheetStatus === "Pending").length}</strong>
								<span className="dashboard__timesheet-status-label">Pending</span>
							</div>
							<div className="dashboard__timesheet-status-item">
								<span className="dashboard__timesheet-status-icon dashboard__timesheet-status-icon--submitted" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></svg>
								</span>
								<strong className="dashboard__timesheet-status-count">{employeeTable.filter((e: any) => e.timesheetStatus === "Submitted").length}</strong>
								<span className="dashboard__timesheet-status-label">Submitted</span>
							</div>
							<div className="dashboard__timesheet-status-item">
								<span className="dashboard__timesheet-status-icon dashboard__timesheet-status-icon--upcoming" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /></svg>
								</span>
								<strong className="dashboard__timesheet-status-count">{employeeTable.filter((e: any) => e.timesheetStatus === "Not Started").length}</strong>
								<span className="dashboard__timesheet-status-label">Not Started</span>
							</div>
						</div>
					</div>

					<DashboardQuickActions pendingCount={data.pendingApprovals || 0} />
				</div>
			</div>
		</div>
	);
};

// ─── CEO Dashboard ────────────────────────────────────────────────────────────
const CEODashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading || !data) { return <DashboardSkeleton />; }

	const deptUtilization = data.deptUtilization || [];
	const employeeTable = data.employeeTable || [];
	const myProjects = (data.projects || []).slice(0, 3);
	const totalTimesheets = approvals.length;
	const pendingTimesheets = approvals.filter(
		(a: any) => a.status === "Pending",
	).length;
	const approvedTimesheets = approvals.filter(
		(a: any) => a.status === "Approved",
	).length;

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						Executive Dashboard · {currentUser.name}
					</h1>
					<p className="dashboard__meta">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							year: "numeric",
						})}{" "}
					</p>
				</div>
				<div className="dashboard__header-actions">
					<button
						type="button"
						className="btn btn--ghost"
						onClick={() => navigate("/reports")}
					>
						View Reports
					</button>
					<button
						type="button"
						className="btn btn--primary"
						onClick={() => navigate("/approvals")}
					>
						All Timesheets ({approvals.length})
					</button>
				</div>
			</div>

			{/* HR Reminder Banner for CEO */}
			{pendingTimesheets > 0 && (
				<div
					className="dashboard__banner"
					style={{
						background: "#fffbe6",
						border: "1px solid #ffe58f",
						color: "#854d0e",
						padding: "0.75rem 1.25rem",
						borderRadius: 8,
						marginBottom: '1.25rem',
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: '0.625rem'}}>
						<svg
							width="20"
							height="20"
							viewBox="0 0 16 16"
							fill="none"
							stroke="#d97706"
							strokeWidth="1.8"
						>
							<path d="M8 1.5a5 5 0 015 5v2.5l1 2H2l1-2V6.5a5 5 0 015-5z" />
							<path d="M6.5 13.5a1.5 1.5 0 003 0" />
						</svg>
						<div>
							<strong style={{ color: "#92400e" }}>
								HR Reminder (from Reshma):
							</strong>{" "}
							You have{" "}
							<strong>
								{pendingTimesheets} timesheet{pendingTimesheets > 1 ? "s" : ""}
							</strong>{" "}
							awaiting review and approval across the organization.
						</div>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: '1rem'}}>
						<button
							type="button"
							className="btn btn--sm"
							onClick={() => navigate("/approvals")}
							style={{
								background: "#d97706",
								color: "#fff",
								border: "none",
								borderRadius: 6,
								padding: "0.3125rem 0.875rem",
								fontWeight: 600,
								cursor: "pointer",
							}}
						>
							Review Timesheets →
						</button>
					</div>
				</div>
			)}

			{/* Stats Cards */}
			<div className="dashboard__stats">
				{[
					{
						label: "Total Staff",
						value: `${employeeTable.length || 9}`,
						sub: "HR, Managers & Engineers",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--blue",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
							</svg>
						),
					},
					{
						label: "Active Projects",
						value: `${myProjects.length || 5}`,
						sub: "Ongoing organization projects",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--green",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
							</svg>
						),
					},
					{
						label: "All Timesheets",
						value: `${totalTimesheets || approvals.length}`,
						sub: `${pendingTimesheets} pending review`,
						subCls: pendingTimesheets > 0 ? "orange" : "green",
						iconCls: "dashboard__stat-card-icon--amber",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
							</svg>
						),
					},
					{
						label: "Org Utilization",
						value: deptUtilization.length
							? `${Math.round(deptUtilization.reduce((acc: number, d: { utilization: number }) => acc + d.utilization, 0) / deptUtilization.length)}%`
							: "85%",
						sub: "Across all departments",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--purple",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
								<polyline points="17 6 23 6 23 12" />
							</svg>
						),
					},
				].map((s, i) => (
					<div className="dashboard__stat-card" key={i}>
						<div className="dashboard__stat-card-top">
							<span className="dashboard__stat-card-label">{s.label}</span>
							<span className={`dashboard__stat-card-icon ${s.iconCls}`}>
								{s.icon}
							</span>
						</div>
						<div className="dashboard__stat-card-value">{s.value}</div>
						<div
							className={`dashboard__stat-card-sub dashboard__stat-card-sub--${s.subCls}`}
						>
							{s.sub}
						</div>
					</div>
				))}
			</div>

			<div className="dashboard__grid">
				<div className="dashboard__grid-left">
					{/* Active Organization Projects */}
					<div className="dashboard__section" style={{ padding: '0rem'}}>
						<div
							className="dashboard__section-header"
							style={{ padding: "1.25rem 1.5rem", marginBottom: '0rem'}}
						>
								<h2 className="dashboard__section-title">
								Organization Projects Progress
								</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/projects")}>
								All Projects{" "}
								<span style={{ color: "#6b7280", marginLeft: '0.25rem'}}>›</span>
							</button>
						</div>
						<div style={{ display: "flex", flexDirection: "column" }}>
							{myProjects.slice(0, 3).map((p: any) => (
								<Link
									className="dashboard__project-item"
									key={p.id}
									to={`/projects/${p.id}`}
									style={{
										borderTop: "1px solid #f3f4f6",
										padding: "1.25rem 1.5rem",
										display: "flex",
										alignItems: "center",
										cursor: "pointer",
									}}
								>
									<div style={{ flex: 1, paddingRight: '1.5rem'}}>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: '0.75rem',
												marginBottom: '0.5rem',
											}}
										>
											<span className="dashboard__project-item-name">
												{p.name}
											</span>
											<Badge variant={statusVariant(p.status)} dot>
												{p.status}
											</Badge>
										</div>
										<ProgressBar
											value={p.progress}
											color={
												p.status === "At Risk"
													? "orange"
													: p.status === "Completed"
														? "green"
														: "blue"
											}
										/>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												fontSize: '0.75rem',
												color: "#6b7280",
												marginTop: '0.375rem',
											}}
										>
											<span>Due {formatDisplayDate(p.dueDate) || "N/A"}</span>
											<span>
												{p.totalHours > 0
													? `${p.loggedHours}h / ${p.totalHours}h logged`
													: `${p.loggedHours}h logged`}
											</span>
										</div>
									</div>
									<div
										style={{ width: 64, textAlign: "center", flexShrink: 0 }}
									>
										<div
											style={{
												fontSize: '1rem',
												fontWeight: 700,
												color: "#111827",
											}}
										>
											{p.progress}%
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>

					{/* All Personnel Timesheet Overview (CEO view includes HR, Managers, Employees) */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title">
								All Personnel Timesheets (HR, Managers & Staff)
							</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/approvals")}>
								Full Listing →
							</button>
						</div>
						{employeeTable.length === 0 ? (
							<EmptyState
								icon="timesheets"
								title="No Workforce Timesheets Recorded"
								subtitle="No employee timesheet submissions found for this period."
							/>
						) : (
			<div className="table-responsive">
							<table className="data-table">
								<caption className="sr-only">All personnel timesheets for this week</caption>
								<thead>
									<tr>
										<th scope="col">Person</th>
										<th scope="col">Role</th>
										<th scope="col">Hours</th>
										<th scope="col">Utilization</th>
										<th scope="col">Timesheet Status</th>
									</tr>
								</thead>
								<tbody>
									{employeeTable.slice(0, 5).map((row: any) => (
										<tr key={row.user.id}>
											<td>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: '0.625rem',
													}}
												>
													<Avatar
														initials={row.user.initials}
														color={row.user.color}
														size="sm"
													/>
													<div>
														<div style={{ fontWeight: 600, fontSize: '0.8125rem'}}>
															{row.user.name}
														</div>
														<div style={{ fontSize: '0.6875rem', color: "#6b7280" }}>
															{row.user.designation}
														</div>
													</div>
												</div>
											</td>
											<td>
												<span
													style={{
														fontSize: '0.6875rem',
														textTransform: "uppercase",
														fontWeight: 700,
														padding: "0.125rem 0.5rem",
														borderRadius: 4,
														background: "#f3f4f6",
														color: "#374151",
													}}
												>
													{row.user.role || "Staff"}
												</span>
											</td>
											<td style={{ fontWeight: 600 }}>{row.weekHours}h</td>
											<td style={{ minWidth: 120 }}>
												<UtilBar value={row.utilization} />
											</td>
											<td>
												<Badge variant={statusVariant(row.timesheetStatus)}>
													{row.timesheetStatus}
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
			</div>
						)}
					</div>
				</div>

				<div className="dashboard__grid-right">
					{/* Timesheets Summary Breakdown */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
											<h2 className="dashboard__section-title">
								Company Timesheet Summary
											</h2>
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: '0.75rem',
							}}
						>
							<div
								style={{
									padding: '0.875rem',
									borderRadius: 8,
									border: "1px solid #e5e7eb",
									textAlign: "center",
									background: "#f8fafc",
								}}
							>
								<div
									style={{ fontSize: '1.375rem', fontWeight: 700, color: "#1e293b" }}
								>
									{totalTimesheets}
								</div>
								<div style={{ fontSize: '0.6875rem', color: "#64748b", marginTop: '0.25rem'}}>
									Total Submissions
								</div>
							</div>
							<div
								style={{
									padding: '0.875rem',
									borderRadius: 8,
									border: "1px solid #e5e7eb",
									textAlign: "center",
									background: "#fefce8",
								}}
							>
								<div
									style={{ fontSize: '1.375rem', fontWeight: 700, color: "#ca8a04" }}
								>
									{pendingTimesheets}
								</div>
								<div style={{ fontSize: '0.6875rem', color: "#854d0e", marginTop: '0.25rem'}}>
									Pending Approvals
								</div>
							</div>
							<div
								style={{
									padding: '0.875rem',
									borderRadius: 8,
									border: "1px solid #e5e7eb",
									textAlign: "center",
									background: "#f0fdf4",
									gridColumn: "span 2",
								}}
							>
								<div
									style={{ fontSize: '1.375rem', fontWeight: 700, color: "#16a34a" }}
								>
									{approvedTimesheets}
								</div>
								<div style={{ fontSize: '0.6875rem', color: "#15803d", marginTop: '0.25rem'}}>
									Approved Timesheets
								</div>
							</div>
						</div>
					</div>

					<DashboardQuickActions pendingCount={approvals.filter((a: { status: string }) => a.status === "Pending").length} />
				</div>
			</div>
		</div>
	);
};

// ─── HR Dashboard ─────────────────────────────────────────────────────────────
const HRDashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading || !data) { return <DashboardSkeleton />; }

	const deptUtilization = data.deptUtilization || [];
	const employeeTable = data.employeeTable || [];

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						HR Dashboard · {currentUser.name}
					</h1>
					<p className="dashboard__meta">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							year: "numeric",
						})}{" "}
					</p>
				</div>
				<div className="dashboard__header-actions">
					<button
						type="button"
						className="btn btn--ghost"
						onClick={() => navigate("/employees")}
					>
						Employee Directory
					</button>
					<button
						type="button"
						className="btn btn--primary"
						onClick={() => navigate("/approvals")}
					>
						Review Timesheets ({approvals.length})
					</button>
				</div>
			</div>

			{/* HR Stats Cards */}
			<div className="dashboard__stats">
				{[
					{
						label: "Total Employees",
						value: `${employeeTable.length || 9}`,
						sub: "Active headcount",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--blue",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
							</svg>
						),
					},
					{
						label: "Departments",
						value: `${deptUtilization.length || 5}`,
						sub: "Operational units",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--purple",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
								<line x1="8" y1="21" x2="16" y2="21" />
								<line x1="12" y1="17" x2="12" y2="21" />
							</svg>
						),
					},
					{
						label: "Timesheets Submitted",
						value: `${approvals.length}`,
						sub: "Across managers & employees",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--amber",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
							</svg>
						),
					},
					{
						label: "Avg Resource Util",
						value: deptUtilization.length
							? `${Math.round(deptUtilization.reduce((acc: number, d: { utilization: number }) => acc + d.utilization, 0) / deptUtilization.length)}%`
							: "85%",
						sub: "Workforce allocation",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--indigo",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
								<polyline points="17 6 23 6 23 12" />
							</svg>
						),
					},
				].map((s, i) => (
					<div className="dashboard__stat-card" key={i}>
						<div className="dashboard__stat-card-top">
							<span className="dashboard__stat-card-label">{s.label}</span>
							<span className={`dashboard__stat-card-icon ${s.iconCls}`}>
								{s.icon}
							</span>
						</div>
						<div className="dashboard__stat-card-value">{s.value}</div>
						<div
							className={`dashboard__stat-card-sub dashboard__stat-card-sub--${s.subCls}`}
						>
							{s.sub}
						</div>
					</div>
				))}
			</div>

			<div className="dashboard__grid">
				<div className="dashboard__grid-left">
					{/* Employee Directory & Timesheet Overview (HR sees Managers & Employees) */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
										<h2 className="dashboard__section-title">
								Workforce Timesheets (Managers & Staff)
										</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/approvals")}>
								View All Timesheets →
							</button>
						</div>
						{employeeTable.length === 0 ? (
							<EmptyState
								icon="timesheets"
								title="No Workforce Timesheets Recorded"
								subtitle="No employee timesheet submissions found for this period."
							/>
						) : (
			<div className="table-responsive">
							<table className="data-table">
								<caption className="sr-only">Workforce timesheets for this week</caption>
								<thead>
									<tr>
										<th scope="col">Employee</th>
										<th scope="col">Department</th>
										<th scope="col">Hours Logged</th>
										<th scope="col">Utilization</th>
										<th scope="col">Timesheet</th>
									</tr>
								</thead>
								<tbody>
									{employeeTable.slice(0, 5).map((row: any) => (
										<tr key={row.user.id}>
											<td>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: '0.625rem',
													}}
												>
													<Avatar
														initials={row.user.initials}
														color={row.user.color}
														size="sm"
													/>
													<div>
														<div style={{ fontWeight: 600, fontSize: '0.8125rem'}}>
															{row.user.name}
														</div>
														<div style={{ fontSize: '0.6875rem', color: "#6b7280" }}>
															{row.user.designation}
														</div>
													</div>
												</div>
											</td>
											<td style={{ fontSize: '0.8125rem', color: "#374151" }}>
												{row.user.department || "Engineering"}
											</td>
											<td style={{ fontWeight: 600 }}>{row.weekHours}h</td>
											<td style={{ minWidth: 120 }}>
												<UtilBar value={row.utilization} />
											</td>
											<td>
												<Badge variant={statusVariant(row.timesheetStatus)}>
													{row.timesheetStatus}
												</Badge>
											</td>
										</tr>
									))}
							</tbody>
						</table>
			</div>
					)}
					</div>
				</div>

				<div className="dashboard__grid-right">
					{/* Department Utilization Breakdown */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
										<h2 className="dashboard__section-title">
								Department Resource Allocation
										</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/reports")}>
								View reports →
							</button>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: '0.875rem'}}>
							{deptUtilization.slice(0, 5).map((d: any) => (
								<div key={d.dept}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											fontSize: '0.8125rem',
											fontWeight: 600,
											marginBottom: '0.25rem',
										}}
									>
										<span>{d.dept}</span>
										<span style={{ color: "#4b5563" }}>{d.utilization}%</span>
									</div>
									<ProgressBar
										value={d.utilization}
										color={d.utilization > 85 ? "green" : "orange"}
									/>
								</div>
							))}
						</div>
					</div>

					<DashboardQuickActions pendingCount={approvals.filter((a: { status: string }) => a.status === "Pending").length} />
				</div>
			</div>
		</div>
	);
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading || !data) {
		return (
			<div className="page-inner dashboard">
				<LoadingSpinner
					message="Loading System Admin Control Center…"
					fullPage
				/>
			</div>
		);
	}

	const employeeTable = data.employeeTable || [];
	const myProjects = (data.projects || []).slice(0, 3);
	const totalTimesheets = approvals.length;

	const systemAuditLogs = [
		{
			id: 1,
			time: "15:06 PM",
			event: "MySQL Schema & Table Column Verification",
			user: "System",
			status: "Completed",
		},
		{
			id: 2,
			time: "14:44 PM",
			event: "Admin Session Authenticated via JWT Token",
			user: currentUser.name,
			status: "Success",
		},
		{
			id: 3,
			time: "12:30 PM",
			event: "HR Timesheet Reminder Notification Dispatched",
			user: "Reshma (HR)",
			status: "Delivered",
		},
		{
			id: 4,
			time: "09:15 AM",
			event: "Automated Microservice Health Check Passed",
			user: "System",
			status: "Optimal",
		},
	];

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						<span>System Administration & Operations</span>
					</h1>
					<p className="dashboard__meta">
						{new Date().toLocaleDateString("en-US", {
							weekday: "long",
							month: "short",
							day: "numeric",
							year: "numeric",
						})}{" "}
					</p>
				</div>
				<div className="dashboard__header-actions">
					<button
						type="button"
						className="btn btn--ghost"
						onClick={() => navigate("/employees")}
						style={{ display: "flex", alignItems: "center", gap: '0.375rem'}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<path d="M11 13v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1" />
							<circle cx="6.5" cy="5" r="2.5" />
						</svg>
						Manage Users
					</button>
					<button
						type="button"
						className="btn btn--primary"
						onClick={() => navigate("/projects")}
						style={{ display: "flex", alignItems: "center", gap: '0.375rem'}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.8"
						>
							<path d="M1.5 4.5A1.5 1.5 0 013 3h3.5l1.5 1.5H13A1.5 1.5 0 0114.5 6v6A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12V4.5z" />
						</svg>
						Manage Projects
					</button>
				</div>
			</div>

			<section className="dashboard__admin-hero" aria-labelledby="admin-overview-title">
				<div className="dashboard__admin-hero-copy">
					<p className="dashboard__admin-hero-eyebrow">SYSTEM ADMINISTRATION</p>
					<h2 id="admin-overview-title">Platform at a glance</h2>
					<p>Manage access, review system activity, and monitor service health.</p>
				</div>
				<ul className="dashboard__admin-health">
					<li><span aria-hidden="true" />API operational</li>
					<li><span aria-hidden="true" />Database connected</li>
					<li><span aria-hidden="true" />Auth engine active</li>
				</ul>
			</section>

			{/* Admin KPI Stats Bar */}
			<div className="dashboard__stats">
				{[
					{
						label: "System Status",
						value: "99.98%",
						sub: "All API Nodes Operational",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--green",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
								<polyline points="22 4 12 14.01 9 11.01" />
							</svg>
						),
					},
					{
						label: "Registered Accounts",
						value: `${employeeTable.length || 13}`,
						sub: "Admin, HR, Manager & Staff",
						subCls: "blue",
						iconCls: "dashboard__stat-card-icon--blue",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
						),
					},
					{
						label: "Active Projects",
						value: `${myProjects.length || 6}`,
						sub: "Organization Resource Pool",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--cyan",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
							</svg>
						),
					},
					{
						label: "Database Sync",
						value: "Connected",
						sub: "Aiven Cloud MySQL (12ms)",
						subCls: "green",
						iconCls: "dashboard__stat-card-icon--purple",
						icon: (
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<ellipse cx="12" cy="5" rx="9" ry="3" />
								<path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
								<path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
							</svg>
						),
					},
				].map((s, i) => (
					<div className="dashboard__stat-card" key={i}>
						<div className="dashboard__stat-card-top">
							<span className="dashboard__stat-card-label">{s.label}</span>
							<span className={`dashboard__stat-card-icon ${s.iconCls}`}>
								{s.icon}
							</span>
						</div>
						<div
							className="dashboard__stat-card-value"
							style={{ marginTop: '0.375rem'}}
						>
							{s.value}
						</div>
						<div
							className={`dashboard__stat-card-sub dashboard__stat-card-sub--${s.subCls}`}
						>
							{s.sub}
						</div>
					</div>
				))}
			</div>

			<div className="dashboard__grid">
				{/* Left Column */}
				<div className="dashboard__grid-left">
					{/* User Role & Security Access Directory */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
							<div>
								<h2 className="dashboard__section-title">
									User Accounts & Access Directory
								</h2>
								<div style={{ fontSize: '0.75rem', color: "#64748b", marginTop: '0.125rem'}}>
									System user roles, designations, and account status
								</div>
							</div>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/employees")}>
								Manage Users{" "}
								<span style={{ color: "#6b7280", marginLeft: '0.25rem'}}>›</span>
							</button>
						</div>
						<div className="table-responsive">
							{employeeTable.length === 0 ? (
								<EmptyState
									icon="users"
									title="No Registered User Accounts"
									subtitle="Add team members to configure system access and security roles."
									action={{
										label: "+ Add Team Member",
										onClick: () => navigate("/employees"),
									}}
								/>
							) : (
								<table className="data-table">
									<caption className="sr-only">User accounts and access roles</caption>
									<thead>
										<tr>
											<th scope="col">User Account</th>
											<th scope="col">Security Role</th>
											<th scope="col">Department</th>
											<th scope="col">Account Status</th>
										</tr>
									</thead>
									<tbody>
										{employeeTable.map((row: any) => {
											const roleName = (
												row.user.role || "employee"
											).toLowerCase();
											const roleBadgeStyle =
												roleName === "admin"
													? { bg: "#f3e8ff", color: "#7c3aed" }
													: roleName === "ceo"
														? { bg: "#e0e7ff", color: "#3730a3" }
														: roleName === "hr"
															? { bg: "#fdf2f8", color: "#db2777" }
															: roleName === "manager"
																? { bg: "#eff6ff", color: "#2563eb" }
																: { bg: "#f1f5f9", color: "#64748b" };

											return (
												<tr key={row.user.id}>
													<td>
														<div
															style={{
																display: "flex",
																alignItems: "center",
																gap: '0.625rem',
															}}
														>
															<Avatar
																initials={row.user.initials}
																color={row.user.color}
																size="sm"
															/>
															<div>
																<div
																	style={{
																		fontWeight: 600,
																		fontSize: '0.8125rem',
																		color: "#0f172a",
																	}}
																>
																	{row.user.name}
																</div>
																<div style={{ fontSize: '0.6875rem', color: "#64748b" }}>
																	{row.user.designation}
																</div>
															</div>
														</div>
													</td>
													<td>
														<span
															style={{
																fontSize: '0.625rem',
																fontWeight: 700,
																padding: "0.1875rem 0.5rem",
																borderRadius: 4,
																textTransform: "uppercase",
																background: roleBadgeStyle.bg,
																color: roleBadgeStyle.color,
																letterSpacing: "0.025rem",
															}}
														>
															{roleName}
														</span>
													</td>
													<td style={{ color: "#334155", fontWeight: 500 }}>
														{row.user.department || "General"}
													</td>
													<td>
														<span
															style={{
																display: "inline-flex",
																alignItems: "center",
																gap: '0.375rem',
																fontSize: '0.75rem',
																fontWeight: 600,
																color: "#059669",
															}}
														>
															<span
																style={{
																	width: 6,
																	height: 6,
																	borderRadius: "50%",
																	background: "#10b981",
																}}
															/>
															Active
														</span>
													</td>
												</tr>
											);
										})
									}
								</tbody>
							</table>
						)}
						</div>
					</div>

					{/* System Security & Audit Feed */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title">
								System Audit Log & Security Events
							</h2>
							<span
								className="dashboard__section-link"
								style={{ cursor: "default", color: "#64748b" }}
							>
								Real-time Trail
							</span>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: '0.75rem'}}>
							{systemAuditLogs.map((log) => (
								<div
									key={log.id}
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: '0.75rem',
										padding: "0.75rem 1rem",
										borderRadius: 8,
										background: "#f8fafc",
										border: "1px solid #e2e8f0",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: '0.75rem',
											flex: 1,
											minWidth: 0,
										}}
									>
										<div
											style={{
												width: 32,
												height: 32,
												borderRadius: "50%",
												background: "#e0e7ff",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												color: "#4338ca",
												flexShrink: 0,
											}}
										>
											<svg
												width="15"
												height="15"
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.8"
											>
												<path d="M8 1.5A6.5 6.5 0 1014.5 8 6.5 6.5 0 008 1.5z" />
												<path d="M8 4.5V8l2.5 1.5" />
											</svg>
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<div
												style={{
													fontSize: '0.8125rem',
													fontWeight: 600,
													color: "#1e293b",
													wordBreak: "break-word",
												}}
											>
												{log.event}
											</div>
											<div
												style={{ fontSize: '0.6875rem', color: "#64748b", marginTop: '0.125rem'}}
											>
												Initiated by {log.user}
											</div>
										</div>
									</div>
									<div style={{ textAlign: "right", flexShrink: 0 }}>
										<span
											style={{
												fontSize: '0.625rem',
												fontWeight: 700,
												color: "#059669",
												background: "#ecfdf5",
												padding: "0.125rem 0.5rem",
												borderRadius: 4,
											}}
										>
											{log.status}
										</span>
										<div
											style={{ fontSize: '0.6875rem', color: "#64748b", marginTop: '0.1875rem'}}
										>
											{log.time}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column */}
				<div className="dashboard__grid-right">
					{/* Infrastructure & Server Health */}
					<div className="dashboard__section">
						<div className="dashboard__section-header">
							<h2 className="dashboard__section-title">
								Platform Infrastructure
							</h2>
						</div>
						<div style={{ display: "flex", flexDirection: "column", gap: '0.875rem'}}>
							{[
								{
									label: "API Microservice",
									status: "Operational",
									val: "200 OK",
									color: "#10b981",
								},
								{
									label: "MySQL Database Cluster",
									status: "Healthy",
									val: "12ms Latency",
									color: "#10b981",
								},
								{
									label: "JWT Auth Engine",
									status: "Active",
									val: "RS256 Verified",
									color: "#10b981",
								},
								{
									label: "Total Submitted Logs",
									status: "Tracked",
									val: `${totalTimesheets} Submissions`,
									color: "#6366f1",
								},
							].map((item, idx) => (
								<div
									key={idx}
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										paddingBottom: '0.625rem',
										borderBottom: idx < 3 ? "1px solid #f1f5f9" : "none",
									}}
								>
									<div>
										<div
											style={{
												fontSize: '0.8125rem',
												fontWeight: 600,
												color: "#1e293b",
											}}
										>
											{item.label}
										</div>
										<div
											style={{
												fontSize: '0.6875rem',
												color: item.color,
												fontWeight: 600,
												marginTop: '0.125rem',
											}}
										>
											• {item.status}
										</div>
									</div>
									<span
										style={{
											fontSize: '0.75rem',
											fontWeight: 600,
											color: "#475569",
											background: "#f8fafc",
											padding: "0.25rem 0.625rem",
											borderRadius: 6,
											border: "1px solid #e2e8f0",
										}}
									>
										{item.val}
									</span>
								</div>
							))}
						</div>
					</div>

					<DashboardQuickActions />
				</div>
			</div>
		</div>
	);
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
	const { role } = useAppStore();

	switch (role) {
		case "ceo":
			return <CEODashboard />;
		case "hr":
			return <HRDashboard />;
		case "admin":
			return <AdminDashboard />;
		case "manager":
			return <ManagerDashboard />;
		case "employee":
		default:
			return <EmployeeDashboard />;
	}
};
