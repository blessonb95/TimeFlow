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
import {
	useApprovals,
	useApproveTimesheet,
	useBulkApprove,
} from "../hooks/useApprovals";
import { resetMockApprovals } from "../api/mockData";
import { useQueryClient } from "@tanstack/react-query";
import { LogTaskDrawer } from "../components/ui/LogTaskDrawer";
import { DashboardSkeleton } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { DEFAULT_HR_USER, getSystemAuditLogs } from "../data/dummy";

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
				<span className="dashboard__quick-action-inner">
					{primaryAction.icon}
					{primaryAction.label}
				</span>
				<span className="dashboard__quick-action-arrow">›</span>
			</button>
			{defaultActions.map((a) => (
				<button
					type="button"
					key={a.label}
					className="dashboard__quick-action dashboard__quick-action--default"
					onClick={() => navigate(a.to)}
				>
					<span className="dashboard__quick-action-inner dashboard__quick-action-inner--default">
						<span className="dashboard__quick-action-icon">{a.icon}</span>
						{a.label}
					</span>
					<span className="dashboard__quick-action-arrow">›</span>
				</button>
			))}
		</div>
	);
};

// ─── Employee Dashboard ───────────────────────────────────────────────────────
const EmployeeDashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading, isError, isFetching, refetch } = useEmployeeDashboard();
	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const [showLogTask, setShowLogTask] = useState(false);
	const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

	if (isLoading) { return <DashboardSkeleton />; }
	if (isError || !data) {
		return (
			<div className="page-inner dashboard">
				<EmptyState
					icon="error"
					title="Dashboard unavailable"
					subtitle="We couldn’t load your workspace dashboard. Check your connection and try again."
					action={{ label: isFetching ? "Retrying…" : "Try again", onClick: () => void refetch() }}
				/>
			</div>
		);
	}

	const myProjects = (data.projects || []).slice(0, 3);
	const weekHours = data.weekHours || [];
	const todayHours = data.todayHours || 0;
	const weekTotal =
		Math.round(
			(data.weekHours?.reduce(
				(acc: number, d: { hours: number }) => acc + d.hours,
				0,
			) || 0) * 10,
		) / 10;
	const weeklyProgress = Math.min(100, Math.round((weekTotal / 40) * 100));
	const remainingWeekHours = Math.max(0, Math.round((40 - weekTotal) * 10) / 10);
	const daysAt8h = weekHours.filter(
		(d: { hours: number; target?: number }) => d.hours >= (d.target || 8),
	).length;
	const entriesCount = data.entriesCount ?? 9;

	const defaultDayIdx = (() => {
		const idx = weekHours.findIndex((d: { isToday?: boolean }) => d.isToday);
		return idx >= 0 ? idx : Math.max(0, weekHours.length - 1);
	})();
	const activeDayIdx =
		selectedDayIdx !== null && weekHours[selectedDayIdx]
			? selectedDayIdx
			: defaultDayIdx;
	const activeDay = weekHours[activeDayIdx] || {
		day: "FRI",
		fullDay: "Friday",
		shortDateLabel: "Fri, Nov 6",
		hours: todayHours || 4.0,
		target: 8,
		isToday: true,
		taskSummary:
			"Dashboard Analytics Card Refactor (2.5h) • Sprint Retro & Planning (1.5h)",
	};
	const currentWorkday = weekHours[defaultDayIdx] || activeDay;
	const currentDayName = currentWorkday.fullDay || "Friday";
	const currentDayShortLabel = currentWorkday.shortDateLabel || "Fri, Nov 6";
	const currentDayHours = Number(currentWorkday.hours ?? todayHours ?? 4.0);
	const currentDayProgress = Math.min(
		100,
		Math.round((currentDayHours / (currentWorkday.target || 8)) * 100),
	);

	const weekRangeShortUpper = (() => {
		const now = new Date();
		const day = now.getDay();
		const diffToMon = day === 0 ? -6 : 1 - day;
		const mon = new Date(now);
		mon.setDate(now.getDate() + diffToMon);
		const sun = new Date(mon);
		sun.setDate(mon.getDate() + 6);
		const sMonth = mon.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
		const eMonth = sun.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
		return sMonth === eMonth
			? `${sMonth} ${mon.getDate()} – ${sun.getDate()}`
			: `${sMonth} ${mon.getDate()} – ${eMonth} ${sun.getDate()}`;
	})();

	const pulseTones = ["indigo", "blue", "slate"] as const;

	return (
		<div className="page-inner dashboard">
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						{greeting}, {currentUser.name?.trim().split(/\s+/)[0] || "there"}
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
					<div className="dashboard__week-hero-eyebrow-row">
						<p className="dashboard__week-hero-eyebrow">
							YOUR WEEK • {weekRangeShortUpper}
						</p>
						<span className="dashboard__week-hero-pill">
							{entriesCount} {entriesCount === 1 ? "entry" : "entries"} logged
						</span>
					</div>
					<h2 id="week-overview-title" className="dashboard__week-hero-title">
						A steady week, one day at a time.
					</h2>
					<p className="dashboard__week-hero-description">
						Your logged time is building toward your 40-hour weekly target.{" "}
						{remainingWeekHours > 0 ? (
							<>
								You have <strong>{remainingWeekHours}h left</strong> on{" "}
								{currentDayName}.
							</>
						) : (
							<>
								You have reached your <strong>40h target</strong> for the week.
							</>
						)}
					</p>
					<div className="dashboard__week-hero-actions">
						<button
							type="button"
							className="dashboard__week-hero-primary-btn"
							onClick={() => setShowLogTask(true)}
						>
							<span aria-hidden="true">+</span> Log {currentDayName} Hours
						</button>
						<button
							type="button"
							className="dashboard__week-hero-secondary-btn"
							onClick={() => navigate("/work-logs")}
						>
							<span className="dashboard__week-hero-check" aria-hidden="true">
								✓
							</span>{" "}
							Week Submitted
						</button>
					</div>
				</div>
				<div className="dashboard__week-hero-progress">
					<div className="dashboard__week-hero-total-row">
						<div className="dashboard__week-hero-total">
							<strong>{weekTotal}h</strong>
							<span>of 40h</span>
						</div>
						<span className="dashboard__week-hero-pct">{weeklyProgress}%</span>
					</div>
					<div
						className="dashboard__week-hero-track"
						role="progressbar"
						aria-label="Weekly hours logged"
						aria-valuemin={0}
						aria-valuemax={40}
						aria-valuenow={Math.min(40, weekTotal)}
						aria-valuetext={`${weekTotal} of 40 hours logged`}
					>
						<span style={{ width: `${Math.min(100, (weekTotal / 40) * 100)}%` }} />
					</div>
					<div className="dashboard__week-hero-footnote-row">
						<p className="dashboard__week-hero-footnote">
							{weekTotal >= 40
								? "Weekly target reached"
								: `${remainingWeekHours}h remaining this week`}
						</p>
						<span className="dashboard__week-hero-days-target">
							{daysAt8h}/5 days at 8h
						</span>
					</div>
				</div>
			</section>

			<div className="dashboard__emp-widgets">
				<section
					className="dashboard__section dashboard__emp-card"
					aria-labelledby="weekly-activity-title"
				>
					<div className="dashboard__emp-card-header">
						<div className="dashboard__emp-card-heading">
							<h2 className="dashboard__section-title" id="weekly-activity-title">
								Hours this week
							</h2>
							<p className="dashboard__emp-card-subtitle">
								Daily target: 8.0h per day
							</p>
						</div>
						<button
							type="button"
							className="dashboard__section-link dashboard__emp-log-link"
							onClick={() => setShowLogTask(true)}
						>
							+ Log entry <span aria-hidden="true">→</span>
						</button>
					</div>
					{weekTotal === 0 ? (
						<EmptyState
							icon="timesheets"
							title="No hours logged this week"
							subtitle="Start with a quick entry and your week will take shape here."
							action={{ label: "Log time", onClick: () => setShowLogTask(true) }}
							compact
						/>
					) : (
						<>
							<div
								className="dashboard__emp-buckets"
								role="group"
								aria-label="Daily logged hours"
							>
								{weekHours.map((d: any, idx: number) => {
									const target = d.target || 8;
									const isMet = d.hours >= target;
									const isSelected = idx === activeDayIdx;
									const fillPct = Math.min(
										100,
										Math.round((d.hours / target) * 100),
									);
									const formattedVal = Number(Number(d.hours || 0).toFixed(1));

									return (
										<button
											type="button"
											key={d.day}
											className={`dashboard__emp-bucket${isSelected ? " dashboard__emp-bucket--active" : ""}${isMet ? " dashboard__emp-bucket--met" : ""}`}
											onClick={() => setSelectedDayIdx(idx)}
											aria-pressed={isSelected}
										>
											<span
												className={`dashboard__emp-bucket-hours${isMet ? " dashboard__emp-bucket-hours--met" : ""}`}
											>
												{formattedVal}h{isMet ? " ✓" : ""}
											</span>
											<span className="dashboard__emp-bucket-well">
												<span
													className={`dashboard__emp-bucket-fill ${isMet ? "dashboard__emp-bucket-fill--full" : "dashboard__emp-bucket-fill--partial"}`}
													style={{ height: `${fillPct}%` }}
												/>
											</span>
											<span
												className={`dashboard__emp-bucket-day${d.isToday || isSelected ? " dashboard__emp-bucket-day--current" : ""}`}
											>
												{d.day}
												{d.isToday ? " •" : ""}
											</span>
										</button>
									);
								})}
							</div>
							<div className="dashboard__emp-card-footer">
								<p className="dashboard__emp-day-breakdown">
									<strong>{activeDay.shortDateLabel || "Fri, Nov 6"}:</strong>{" "}
									{activeDay.taskSummary ||
										"Dashboard Analytics Card Refactor (2.5h) • Sprint Retro & Planning (1.5h)"}
								</p>
								<strong className="dashboard__emp-day-ratio">
									{Number(activeDay.hours || 0).toFixed(1)}h /{" "}
									{activeDay.target || 8}h
								</strong>
							</div>
						</>
					)}
				</section>

				<section
					className="dashboard__section dashboard__emp-card"
					aria-labelledby="project-pulse-title"
				>
					<div className="dashboard__emp-card-header">
						<div className="dashboard__emp-card-heading">
							<h2 className="dashboard__section-title" id="project-pulse-title">
								Project pulse
							</h2>
							<p className="dashboard__emp-card-subtitle">
								Clear breakdown of your assigned projects
							</p>
						</div>
						<button
							type="button"
							className="dashboard__section-link dashboard__emp-log-link"
							onClick={() => navigate("/projects")}
						>
							All projects <span aria-hidden="true">→</span>
						</button>
					</div>

					{myProjects.length === 0 ? (
						<EmptyState
							icon="projects"
							title="No Assigned Projects"
							subtitle="You are not currently assigned to any active projects."
							compact
						/>
					) : (
						<div className="dashboard__emp-split-list">
							{myProjects.map((p: DashboardProject, idx: number) => {
								const pct =
									p.status === "Completed"
										? 100
										: p.totalHours > 0 && p.hasBudget !== false
											? Math.min(
													100,
													Math.round((p.loggedHours / p.totalHours) * 100),
												)
											: p.loggedHours > 0
												? Math.max(
														p.progress || 0,
														Math.min(
															95,
															Math.max(5, Math.round(p.loggedHours * 5)),
														),
													)
												: p.progress || 0;
								const tone = pulseTones[idx % pulseTones.length];
								const hoursLabel =
									p.totalHours > 0
										? `${p.loggedHours}h / ${p.totalHours}h (${pct}%)`
										: `${p.loggedHours}h (${pct}%)`;

								return (
									<Link
										to={`/projects/${p.id}`}
										className="dashboard__emp-split-item dashboard__emp-split-item--link"
										key={p.id}
									>
										<div className="dashboard__emp-split-top">
											<span className="dashboard__emp-split-name">
												{p.name}
											</span>
											<span className="dashboard__emp-split-stat">
												{hoursLabel}
											</span>
										</div>
										<div
											className="dashboard__emp-split-track"
											role="progressbar"
											aria-label={`${p.name} progress`}
											aria-valuemin={0}
											aria-valuemax={100}
											aria-valuenow={pct}
										>
											<span
												className={`dashboard__emp-split-fill dashboard__emp-split-fill--${tone}`}
												style={{ width: `${pct}%` }}
											/>
										</div>
									</Link>
								);
							})}
						</div>
					)}

					<div className="dashboard__emp-card-footer">
						<span className="dashboard__emp-pace-label">
							Today&apos;s Pace ({currentDayShortLabel})
						</span>
						<strong className="dashboard__emp-pace-val">
							{currentDayHours.toFixed(1)}h of 8.0h ({currentDayProgress}%)
						</strong>
					</div>
				</section>
			</div>
			{showLogTask && <LogTaskDrawer onClose={() => setShowLogTask(false)} />}
		</div>
	);
};

// ─── Manager Dashboard ────────────────────────────────────────────────────────
const MAX_VISIBLE_MANAGER_ROWS = 4;
const AVATAR_TONES = [
	"blue",
	"violet",
	"amber",
	"emerald",
	"cyan",
	"rose",
	"slate",
] as const;

interface ManagerTeamMemberRow {
	id: string;
	approvalId?: string;
	name: string;
	role: string;
	initials: string;
	avatarTone: (typeof AVATAR_TONES)[number];
	project: string;
	hours: number;
	capacity: number;
	utilization: number;
	status: "pending" | "approved";
}

const ManagerDashboard: React.FC = () => {
	const { currentUser, role } = useAppStore();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data, isLoading, isError, isFetching, refetch } = useManagerDashboard();
	const approvalsQuery = useApprovals();
	const approvals = Array.isArray(approvalsQuery.data) ? approvalsQuery.data : [];
	const approveTimesheetMutation = useApproveTimesheet();
	const bulkApproveMutation = useBulkApprove();

	const [showAllRows, setShowAllRows] = useState(false);
	const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved">("all");
	const [locallyApprovedIds, setLocallyApprovedIds] = useState<string[]>([]);

	const hour = new Date().getHours();
	const greeting =
		hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

	if (isLoading) {
		return <DashboardSkeleton />;
	}
	if (isError || !data) {
		return (
			<div className="page-inner dashboard">
				<EmptyState
					icon="error"
					title="Dashboard unavailable"
					subtitle="We couldn’t load your team dashboard. Check your connection and try again."
					action={{
						label: isFetching ? "Retrying…" : "Try again",
						onClick: () => void refetch(),
					}}
				/>
			</div>
		);
	}

	const rawEmployeeTable = Array.isArray(data.employeeTable)
		? data.employeeTable.filter((row: unknown) => row !== null && typeof row === "object")
		: [];

	const myProjects = (
		Array.isArray(data.projects)
			? data.projects
			: Array.isArray(data.assignedProjects)
				? data.assignedProjects
				: []
	).filter((project: unknown) => project !== null && typeof project === "object");

	const defaultProjectNames = [
		"FinCore Mobile",
		"Project Atlas",
		"Cloud Billing API",
		"FinCore Mobile",
		"Infra Mesh Migration",
		"Customer Portal v3",
		"Project Atlas",
	];

	const members: ManagerTeamMemberRow[] = rawEmployeeTable.map((row: any, idx: number) => {
		const userId = String(row?.user?.id || idx + 1);
		const userApprovals = approvals.filter(
			(a: any) => a?.employee?.id && row?.user?.id && String(a.employee.id) === String(row.user.id)
		);
		const pendingAppr = userApprovals.find(
			(a: any) => a.status === "Pending" || a.status === "Submitted"
		);

		let rawStatus: "pending" | "approved" =
			row.timesheetStatus === "Pending" || row.timesheetStatus === "Submitted"
				? "pending"
				: "approved";

		if (userApprovals.length > 0) {
			const hasPending = userApprovals.some(
				(a: any) => a.status === "Pending" || a.status === "Submitted"
			);
			const allApproved = userApprovals.every((a: any) => a.status === "Approved");
			if (hasPending) rawStatus = "pending";
			else if (allApproved) rawStatus = "approved";
		}

		const isLocallyApproved = locallyApprovedIds.includes(userId);
		const status: "pending" | "approved" = isLocallyApproved ? "approved" : rawStatus;

		const hours = Number(row.weekHours || 0);
		const capacity = 40;
		const utilization =
			row.utilization != null && Number.isFinite(Number(row.utilization))
				? Number(row.utilization)
				: Math.round((hours / capacity) * 100);

		const primaryProject =
			row.primaryProject ||
			pendingAppr?.projects?.[0] ||
			userApprovals[0]?.projects?.[0] ||
			myProjects[idx % Math.max(1, myProjects.length)]?.name ||
			defaultProjectNames[idx % defaultProjectNames.length];

		const name = String(row?.user?.name || `Team Member ${idx + 1}`);
		const initials =
			row?.user?.initials ||
			name
				.split(/\s+/)
				.map((part: string) => part[0] || "")
				.join("")
				.slice(0, 2)
				.toUpperCase();

		return {
			id: userId,
			approvalId: pendingAppr?.id != null ? String(pendingAppr.id) : undefined,
			name,
			role: String(row?.user?.designation || row?.user?.role || "Software Engineer"),
			initials,
			avatarTone: AVATAR_TONES[idx % AVATAR_TONES.length],
			project: String(primaryProject),
			hours: Number.isFinite(hours) && hours >= 0 ? hours : 0,
			capacity,
			utilization,
			status,
		};
	});

	const pendingItems = members.filter((m) => m.status === "pending");
	const approvedItems = members.filter((m) => m.status === "approved");
	const pendingCount = pendingItems.length;
	const pendingHours = pendingItems.reduce((acc, m) => acc + m.hours, 0).toFixed(1);

	const totalHoursLogged =
		data.teamHours != null && Number.isFinite(Number(data.teamHours))
			? Number(data.teamHours)
			: members.reduce((acc, m) => acc + m.hours, 0);
	const totalCapacity = Math.max(40, members.length * 40);

	const avgUtilization =
		data.teamUtilization != null && Number.isFinite(Number(data.teamUtilization))
			? Number(data.teamUtilization)
			: members.length > 0
				? Math.round(members.reduce((acc, m) => acc + m.utilization, 0) / members.length)
				: 0;
	const utilDelta = avgUtilization - 85;
	const utilDeltaLabel =
		utilDelta === 0
			? "On target"
			: `${utilDelta > 0 ? `+${utilDelta}` : utilDelta}% vs target`;

	const activeProjectsCount = data.activeProjects ?? (myProjects.length || 5);

	const weekLabel =
		data.weekStart && data.weekEnd
			? `${formatDisplayDate(data.weekStart)} – ${formatDisplayDate(data.weekEnd)}`
			: "Nov 02 – Nov 06, 2026";

	const shortWeekLabel = (() => {
		if (!data.weekStart || !data.weekEnd) return "Nov 02 – 06";
		const startFormatted = formatDisplayDate(data.weekStart).replace(/,\s*\d{4}$/, "");
		const endFormatted = formatDisplayDate(data.weekEnd).replace(/,\s*\d{4}$/, "");
		const startParts = startFormatted.split(" ");
		const endParts = endFormatted.split(" ");
		if (startParts.length === 2 && endParts.length === 2 && startParts[0] === endParts[0]) {
			return `${startParts[0]} ${startParts[1]} – ${endParts[1]}`;
		}
		return `${startFormatted} – ${endFormatted}`;
	})();

	const formattedToday = new Date().toLocaleDateString("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	// Sort so pending items are prioritized at the top
	const sortedMembers = [...members].sort((a, b) => {
		if (a.status === b.status) return 0;
		return a.status === "pending" ? -1 : 1;
	});

	const filteredMembers =
		activeFilter === "pending"
			? sortedMembers.filter((m) => m.status === "pending")
			: activeFilter === "approved"
				? sortedMembers.filter((m) => m.status === "approved")
				: sortedMembers;

	const totalFiltered = filteredMembers.length;
	const visibleMembers = showAllRows
		? filteredMembers
		: filteredMembers.slice(0, MAX_VISIBLE_MANAGER_ROWS);
	const hiddenCount = Math.max(0, totalFiltered - visibleMembers.length);

	const hasApprovedInSession = locallyApprovedIds.length > 0;

	const handleApproveOne = (member: ManagerTeamMemberRow) => {
		setLocallyApprovedIds((prev) =>
			prev.includes(member.id) ? prev : [...prev, member.id]
		);
		if (member.approvalId) {
			approveTimesheetMutation.mutate(member.approvalId);
		}
	};

	const handleApproveAll = () => {
		const allPendingMemberIds = pendingItems.map((m) => m.id);
		setLocallyApprovedIds((prev) =>
			Array.from(new Set([...prev, ...allPendingMemberIds]))
		);
		const pendingApprovalIds = approvals
			.filter(
				(a: any) =>
					(a?.status === "Pending" || a?.status === "Submitted") && a?.id != null
			)
			.map((a: any) => String(a.id));
		if (pendingApprovalIds.length > 0) {
			bulkApproveMutation.mutate(pendingApprovalIds);
		}
	};

	const handleResetDemo = () => {
		resetMockApprovals();
		setLocallyApprovedIds([]);
		setShowAllRows(false);
		setActiveFilter("all");
		void qc.invalidateQueries({ queryKey: ["approvals"] });
		void qc.invalidateQueries({ queryKey: ["dashboard"] });
	};

	return (
		<div className="page-inner dashboard dashboard--manager">
			{/* Top Greeting & Date Row */}
			<div className="dashboard__header-row">
				<div>
					<h1 className="dashboard__greeting">
						{greeting}, {currentUser.name?.trim().split(/\s+/)[0] || "there"}
					</h1>
					<p className="dashboard__meta">{formattedToday}</p>
				</div>
				<div className="dashboard__header-actions">
					{hasApprovedInSession && (
						<button
							type="button"
							id="reset-btn"
							className="dashboard__mgr-reset-btn"
							onClick={handleResetDemo}
						>
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
								<path d="M3 3v5h5" />
							</svg>
							<span>Reset demo data</span>
						</button>
					)}
					{role !== "admin" && (
						<button
							type="button"
							className="btn btn--primary"
							onClick={() => navigate("/approvals")}
						>
							Review approvals ({pendingCount})
						</button>
					)}
				</div>
			</div>

			{approvalsQuery.isError && (
				<div role="alert" className="dashboard__alert-warning">
					{approvalsQuery.data
						? "Couldn’t refresh approvals. The count may be out of date."
						: "Couldn’t load approvals, so the pending count is unavailable."}{" "}
					<button
						type="button"
						className="btn btn--secondary btn--sm"
						onClick={() => void approvalsQuery.refetch()}
						disabled={approvalsQuery.isFetching}
					>
						{approvalsQuery.isFetching ? "Retrying…" : "Retry"}
					</button>
				</div>
			)}

			{bulkApproveMutation.isError && (
				<div role="alert" className="dashboard__alert-error">
					Bulk approval couldn&apos;t be confirmed. Refresh the pending list before trying again.
				</div>
			)}

			{/* 1. CLEAN HEADER BANNER */}
			<section
				className="dashboard__mgr-banner"
				aria-labelledby="manager-overview-title"
			>
				<div className="dashboard__mgr-banner-accent" aria-hidden="true" />
				<div className="dashboard__mgr-banner-inner">
					<div>
						<p className="dashboard__mgr-banner-eyebrow">Manager Workspace</p>
						<h2 id="manager-overview-title" className="dashboard__mgr-banner-title">
							Team workweek
						</h2>
						<p className="dashboard__mgr-banner-desc">
							Track logged time, review submissions, and spot gaps across your team.
						</p>
					</div>

					<div className="dashboard__mgr-week-pill">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
							focusable="false"
						>
							<rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
							<line x1="16" x2="16" y1="2" y2="6" />
							<line x1="8" x2="8" y1="2" y2="6" />
							<line x1="3" x2="21" y1="10" y2="10" />
						</svg>
						<span>{weekLabel}</span>
					</div>
				</div>
			</section>

			{/* 3. FOUR MINIMALIST KPI CARDS WITH LIGHT GRADIENTS & 3D ICONS */}
			<section aria-label="Key Metrics" className="dashboard__mgr-kpis">
				{/* Card 1: Hours Logged */}
				<div className="dashboard__mgr-kpi-card dashboard__mgr-kpi-card--blue">
					<div className="dashboard__mgr-kpi-top">
						<span className="dashboard__mgr-kpi-label">Hours Logged</span>
						<span className="dashboard__mgr-kpi-pill dashboard__mgr-kpi-pill--blue">
							{shortWeekLabel}
						</span>
					</div>

					<div className="dashboard__mgr-kpi-body">
						<div className="dashboard__mgr-kpi-value">
							{Number.isInteger(totalHoursLogged)
								? `${totalHoursLogged}.0h`
								: `${totalHoursLogged.toFixed(1)}h`}
						</div>
						<p className="dashboard__mgr-kpi-sub">
							of {totalCapacity}h weekly capacity
						</p>
					</div>

					<svg
						className="dashboard__mgr-kpi-icon-3d"
						viewBox="0 0 120 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<defs>
							<linearGradient
								id="mgrBlueTop"
								x1="20"
								y1="15"
								x2="90"
								y2="55"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#93C5FD" />
								<stop offset="100%" stopColor="#3B82F6" />
							</linearGradient>
							<linearGradient
								id="mgrBlueLeft"
								x1="20"
								y1="45"
								x2="65"
								y2="105"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#3B82F6" />
								<stop offset="100%" stopColor="#1D4ED8" />
							</linearGradient>
							<linearGradient
								id="mgrBlueRight"
								x1="65"
								y1="45"
								x2="108"
								y2="105"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#60A5FA" />
								<stop offset="100%" stopColor="#2563EB" />
							</linearGradient>
							<linearGradient
								id="mgrClockGlass"
								x1="40"
								y1="25"
								x2="88"
								y2="85"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
								<stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.75" />
							</linearGradient>
						</defs>
						<ellipse
							cx="66"
							cy="103"
							rx="34"
							ry="8"
							fill="#1E40AF"
							fillOpacity="0.12"
						/>
						<path
							d="M64 20L104 42L64 64L24 42L64 20Z"
							fill="url(#mgrBlueTop)"
							fillOpacity="0.28"
						/>
						<path
							d="M24 42L64 64V102L24 80V42Z"
							fill="url(#mgrBlueLeft)"
							fillOpacity="0.32"
						/>
						<path
							d="M104 42L64 64V102L104 80V42Z"
							fill="url(#mgrBlueRight)"
							fillOpacity="0.22"
						/>
						<circle
							cx="67"
							cy="61"
							r="28"
							fill="url(#mgrBlueLeft)"
							fillOpacity="0.45"
						/>
						<circle
							cx="63"
							cy="58"
							r="28"
							fill="url(#mgrClockGlass)"
							stroke="#FFFFFF"
							strokeWidth="1.5"
						/>
						<circle
							cx="63"
							cy="58"
							r="22"
							stroke="#3B82F6"
							strokeOpacity="0.28"
							strokeWidth="1.5"
							strokeDasharray="3 3"
						/>
						<path
							d="M63 44V58L73 64"
							stroke="#2563EB"
							strokeWidth="3.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle cx="63" cy="58" r="3.2" fill="#1D4ED8" />
						<circle cx="43" cy="36" r="4" fill="#60A5FA" fillOpacity="0.45" />
					</svg>
				</div>

				{/* Card 2: Avg Utilization */}
				<div className="dashboard__mgr-kpi-card dashboard__mgr-kpi-card--indigo">
					<div className="dashboard__mgr-kpi-top">
						<span className="dashboard__mgr-kpi-label">Avg Utilization</span>
						<span className="dashboard__mgr-kpi-pill dashboard__mgr-kpi-pill--indigo">
							{utilDeltaLabel}
						</span>
					</div>

					<div className="dashboard__mgr-kpi-body">
						<div className="dashboard__mgr-kpi-value">{avgUtilization}%</div>
						<p className="dashboard__mgr-kpi-sub dashboard__mgr-kpi-sub--with-dot">
							<span
								className="dashboard__mgr-dot dashboard__mgr-dot--indigo"
								aria-hidden="true"
							/>
							<span>Target: 85–100%</span>
						</p>
					</div>

					<svg
						className="dashboard__mgr-kpi-icon-3d"
						viewBox="0 0 120 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<defs>
							<linearGradient id="mgrVFront1" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#A78BFA" stopOpacity="0.55" />
								<stop offset="100%" stopColor="#7C3AED" stopOpacity="0.35" />
							</linearGradient>
							<linearGradient id="mgrVFront2" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.68" />
								<stop offset="100%" stopColor="#6D28D9" stopOpacity="0.45" />
							</linearGradient>
							<linearGradient id="mgrVFront3" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#6366F1" stopOpacity="0.82" />
								<stop offset="100%" stopColor="#4338CA" stopOpacity="0.55" />
							</linearGradient>
						</defs>
						<ellipse
							cx="68"
							cy="104"
							rx="34"
							ry="7"
							fill="#4C1D95"
							fillOpacity="0.1"
						/>
						<path d="M38 68L48 62L58 68L48 74L38 68Z" fill="#DDD6FE" />
						<path d="M38 68L48 74V96L38 90V68Z" fill="url(#mgrVFront1)" />
						<path
							d="M58 68L48 74V96L58 90V68Z"
							fill="#C4B5FD"
							fillOpacity="0.5"
						/>
						<path d="M58 54L68 48L78 54L68 60L58 54Z" fill="#C4B5FD" />
						<path d="M58 54L68 60V96L58 90V54Z" fill="url(#mgrVFront2)" />
						<path
							d="M78 54L68 60V96L78 90V54Z"
							fill="#A78BFA"
							fillOpacity="0.55"
						/>
						<path d="M78 36L88 30L98 36L88 42L78 36Z" fill="#E0E7FF" />
						<path d="M78 36L88 42V96L78 90V36Z" fill="url(#mgrVFront3)" />
						<path
							d="M98 36L88 42V96L98 90V36Z"
							fill="#818CF8"
							fillOpacity="0.55"
						/>
						<path
							d="M36 58L58 46L70 50L92 24"
							stroke="#6366F1"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<circle
							cx="92"
							cy="24"
							r="4.5"
							fill="#FFFFFF"
							stroke="#4F46E5"
							strokeWidth="2.5"
						/>
					</svg>
				</div>

				{/* Card 3: Active Projects */}
				<div className="dashboard__mgr-kpi-card dashboard__mgr-kpi-card--emerald">
					<div className="dashboard__mgr-kpi-top">
						<span className="dashboard__mgr-kpi-label">Active Projects</span>
						<span className="dashboard__mgr-kpi-pill dashboard__mgr-kpi-pill--emerald">
							{members.length} members
						</span>
					</div>

					<div className="dashboard__mgr-kpi-body">
						<div className="dashboard__mgr-kpi-value">{activeProjectsCount}</div>
						<p className="dashboard__mgr-kpi-sub">
							Across {members.length} team members
						</p>
					</div>

					<svg
						className="dashboard__mgr-kpi-icon-3d"
						viewBox="0 0 120 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<defs>
							<linearGradient
								id="mgrEmBack"
								x1="30"
								y1="30"
								x2="95"
								y2="95"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#34D399" stopOpacity="0.75" />
								<stop offset="100%" stopColor="#059669" stopOpacity="0.55" />
							</linearGradient>
							<linearGradient
								id="mgrEmFront"
								x1="30"
								y1="48"
								x2="100"
								y2="100"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.75" />
								<stop offset="100%" stopColor="#10B981" stopOpacity="0.45" />
							</linearGradient>
						</defs>
						<ellipse
							cx="67"
							cy="103"
							rx="34"
							ry="7"
							fill="#065F46"
							fillOpacity="0.1"
						/>
						<path
							d="M32 42C32 38.6863 34.6863 36 38 36H54L61 43H90C93.3137 43 96 45.6863 96 49V88C96 91.3137 93.3137 94 90 94H38C34.6863 94 32 91.3137 32 88V42Z"
							fill="url(#mgrEmBack)"
						/>
						<rect
							x="40"
							y="39"
							width="48"
							height="38"
							rx="6"
							transform="rotate(-4 40 39)"
							fill="#FFFFFF"
							fillOpacity="0.88"
							stroke="#A7F3D0"
							strokeWidth="1.2"
						/>
						<line
							x1="48"
							y1="49"
							x2="72"
							y2="47"
							stroke="#10B981"
							strokeOpacity="0.45"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<line
							x1="49"
							y1="56"
							x2="65"
							y2="55"
							stroke="#34D399"
							strokeOpacity="0.4"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<path
							d="M28 58C28 54.6863 30.6863 52 34 52H94C97.3137 52 100 54.6863 100 58L95 90C94.4 93.5 91.5 96 88 96H39C35.5 96 32.6 93.5 32 90L28 58Z"
							fill="url(#mgrEmFront)"
							stroke="#FFFFFF"
							strokeOpacity="0.8"
							strokeWidth="1.5"
						/>
						<line
							x1="42"
							y1="62"
							x2="86"
							y2="62"
							stroke="#FFFFFF"
							strokeOpacity="0.7"
							strokeWidth="2"
							strokeLinecap="round"
						/>
					</svg>
				</div>

				{/* Card 4: Awaiting Approval */}
				<div
					id="approval-card"
					className={`dashboard__mgr-kpi-card ${
						pendingCount > 0
							? "dashboard__mgr-kpi-card--amber"
							: "dashboard__mgr-kpi-card--emerald"
					}`}
				>
					<div className="dashboard__mgr-kpi-top">
						<span className="dashboard__mgr-kpi-label">Awaiting Approval</span>
						<span
							id="approval-pill"
							className={`dashboard__mgr-kpi-pill ${
								pendingCount > 0
									? "dashboard__mgr-kpi-pill--amber"
									: "dashboard__mgr-kpi-pill--emerald-strong"
							}`}
						>
							{pendingCount > 0 ? `${pendingHours}h pending` : "0.0h pending"}
						</span>
					</div>

					<div className="dashboard__mgr-kpi-body">
						<div id="approval-number" className="dashboard__mgr-kpi-value">
							{pendingCount}
						</div>
						<p
							id="approval-subtext"
							className={`dashboard__mgr-kpi-sub dashboard__mgr-kpi-sub--with-dot ${
								pendingCount > 0
									? "dashboard__mgr-kpi-sub--amber"
									: "dashboard__mgr-kpi-sub--emerald"
							}`}
						>
							<span
								id="approval-dot"
								className={`dashboard__mgr-dot ${
									pendingCount > 0
										? "dashboard__mgr-dot--amber-pulse"
										: "dashboard__mgr-dot--emerald"
								}`}
								aria-hidden="true"
							/>
							<span id="approval-subtext-label">
								{pendingCount > 0 ? "Needs action" : "All approved"}
							</span>
						</p>
					</div>

					<svg
						className="dashboard__mgr-kpi-icon-3d"
						viewBox="0 0 120 120"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<defs>
							<linearGradient
								id="mgrAmbBack"
								x1="35"
								y1="25"
								x2="95"
								y2="95"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#FBBF24" stopOpacity="0.75" />
								<stop offset="100%" stopColor="#D97706" stopOpacity="0.5" />
							</linearGradient>
							<linearGradient
								id="mgrAmbGlass"
								x1="32"
								y1="30"
								x2="90"
								y2="92"
								gradientUnits="userSpaceOnUse"
							>
								<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
								<stop offset="100%" stopColor="#FDE68A" stopOpacity="0.7" />
							</linearGradient>
						</defs>
						<ellipse
							cx="66"
							cy="104"
							rx="32"
							ry="7"
							fill="#92400E"
							fillOpacity="0.1"
						/>
						<path
							d="M68 24L96 35V60C96 79 84 93 68 99C52 93 40 79 40 60V35L68 24Z"
							fill="url(#mgrAmbBack)"
						/>
						<path
							d="M62 27L90 38V63C90 82 78 96 62 102C46 96 34 82 34 63V38L62 27Z"
							fill="url(#mgrAmbGlass)"
							stroke="#FFFFFF"
							strokeWidth="1.6"
						/>
						<circle cx="62" cy="63" r="16" fill="#F59E0B" fillOpacity="0.22" />
						<path
							d="M55 63.5L60 68.5L70 57.5"
							stroke="#D97706"
							strokeWidth="3.2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</section>

			{/* 4. TEAM SUBMISSIONS TABLE (MAX 4 ROWS INITIAL + SHOW MORE BUTTON) */}
			<section
				id="submissions-section"
				aria-labelledby="submissions-heading"
				className="dashboard__mgr-submissions"
			>
				<div className="dashboard__mgr-submissions-header">
					<div className="dashboard__mgr-submissions-title-wrap">
						<h2
							id="submissions-heading"
							className="dashboard__mgr-submissions-title"
						>
							Team Timesheet Submissions
						</h2>
						<span
							id="table-summary-badge"
							className="dashboard__mgr-submissions-badge"
						>
							Showing {visibleMembers.length} of {totalFiltered}
						</span>
					</div>

					<div className="dashboard__mgr-submissions-controls">
						{pendingCount > 0 && (
							<button
								type="button"
								className="dashboard__mgr-approve-all-btn"
								onClick={handleApproveAll}
								disabled={bulkApproveMutation.isPending}
							>
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.4"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
									focusable="false"
								>
									<path d="M20 6 9 17l-5-5" />
								</svg>
								<span>Approve All ({pendingCount})</span>
							</button>
						)}

						<div
							className="dashboard__mgr-filter-group"
							role="group"
							aria-label="Filter team submissions by status"
						>
							<button
								type="button"
								id="filter-all"
								aria-pressed={activeFilter === "all"}
								className={`dashboard__mgr-filter-btn ${
									activeFilter === "all"
										? "dashboard__mgr-filter-btn--active"
										: ""
								}`}
								onClick={() => {
									setActiveFilter("all");
									setShowAllRows(false);
								}}
							>
								All ({members.length})
							</button>
							<button
								type="button"
								id="filter-pending"
								aria-pressed={activeFilter === "pending"}
								className={`dashboard__mgr-filter-btn ${
									activeFilter === "pending"
										? "dashboard__mgr-filter-btn--active"
										: ""
								}`}
								onClick={() => {
									setActiveFilter("pending");
									setShowAllRows(false);
								}}
							>
								Pending ({pendingCount})
							</button>
							<button
								type="button"
								id="filter-approved"
								aria-pressed={activeFilter === "approved"}
								className={`dashboard__mgr-filter-btn ${
									activeFilter === "approved"
										? "dashboard__mgr-filter-btn--active"
										: ""
								}`}
								onClick={() => {
									setActiveFilter("approved");
									setShowAllRows(false);
								}}
							>
								Approved ({approvedItems.length})
							</button>
						</div>
					</div>
				</div>

				<div className="table-responsive">
					<table className="dashboard__mgr-table">
						<caption className="sr-only">
							Team timesheet submissions for {weekLabel}
						</caption>
						<thead>
							<tr>
								<th scope="col">Team Member</th>
								<th scope="col">Primary Project</th>
								<th scope="col">Hours Logged</th>
								<th scope="col">Utilization</th>
								<th scope="col">Status</th>
								<th scope="col" className="dashboard__mgr-th-right">
									Action
								</th>
							</tr>
						</thead>
						<tbody id="team-table-body">
							{visibleMembers.length === 0 ? (
								<tr>
									<td colSpan={6} className="dashboard__mgr-table-empty">
										No submissions matching this filter.
									</td>
								</tr>
							) : (
								visibleMembers.map((member) => {
									const isPending = member.status === "pending";
									const isGoodUtil = member.utilization >= 85;
									return (
										<tr key={member.id} className="dashboard__mgr-tr">
											<td>
												<div className="dashboard__mgr-member-cell">
													<div
														className={`dashboard__mgr-avatar dashboard__mgr-avatar--${member.avatarTone}`}
														aria-hidden="true"
													>
														{member.initials}
													</div>
													<div>
														<div className="dashboard__mgr-member-name">
															{member.name}
														</div>
														<div className="dashboard__mgr-member-role">
															{member.role}
														</div>
													</div>
												</div>
											</td>
											<td className="dashboard__mgr-td-project">
												{member.project}
											</td>
											<td className="dashboard__mgr-td-hours">
												<span className="dashboard__mgr-hours-val">
													{member.hours.toFixed(1)}h
												</span>
												<span className="dashboard__mgr-hours-cap">
													{" "}
													/ {member.capacity}h
												</span>
											</td>
											<td className="dashboard__mgr-td-util">
												<span
													className={`dashboard__mgr-util-badge ${
														isGoodUtil
															? "dashboard__mgr-util-badge--good"
															: "dashboard__mgr-util-badge--low"
													}`}
												>
													{member.utilization}%
												</span>
											</td>
											<td>
												{isPending ? (
													<span className="dashboard__mgr-status-pill dashboard__mgr-status-pill--pending">
														<span
															className="dashboard__mgr-dot dashboard__mgr-dot--amber"
															aria-hidden="true"
														/>
														Awaiting approval
													</span>
												) : (
													<span className="dashboard__mgr-status-pill dashboard__mgr-status-pill--approved">
														<span
															className="dashboard__mgr-dot dashboard__mgr-dot--emerald"
															aria-hidden="true"
														/>
														Approved
													</span>
												)}
											</td>
											<td className="dashboard__mgr-td-action">
												{isPending ? (
													<button
														type="button"
														className="dashboard__mgr-approve-btn"
														onClick={() => handleApproveOne(member)}
														aria-label={`Approve timesheet for ${member.name}`}
													>
														<svg
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															strokeWidth="2.4"
															strokeLinecap="round"
															strokeLinejoin="round"
															aria-hidden="true"
															focusable="false"
														>
															<path d="M20 6 9 17l-5-5" />
														</svg>
														<span>Approve</span>
													</button>
												) : (
													<span className="dashboard__mgr-verified">
														Verified
													</span>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{totalFiltered > MAX_VISIBLE_MANAGER_ROWS && (
					<div id="table-footer" className="dashboard__mgr-table-footer">
						<span id="footer-count-note" className="dashboard__mgr-footer-note">
							{showAllRows
								? `Showing all ${totalFiltered} team members`
								: `Displaying top ${MAX_VISIBLE_MANAGER_ROWS} priority rows (pending approvals first)`}
						</span>
						<button
							type="button"
							id="show-more-btn"
							aria-expanded={showAllRows}
							className="dashboard__mgr-show-more-btn"
							onClick={() => setShowAllRows((prev) => !prev)}
						>
							<span id="show-more-label">
								{showAllRows
									? `Show fewer (${MAX_VISIBLE_MANAGER_ROWS} rows)`
									: `Show all ${totalFiltered} members (+${hiddenCount} more)`}
							</span>
							{showAllRows ? (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
									focusable="false"
								>
									<path d="m18 15-6-6-6 6" />
								</svg>
							) : (
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
									focusable="false"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							)}
						</button>
					</div>
				)}
			</section>
		</div>
	);
};

// ─── CEO Dashboard ────────────────────────────────────────────────────────────
const CEODashboard: React.FC = () => {
	const { currentUser } = useAppStore();
	const navigate = useNavigate();
	const { data, isLoading, isError, isFetching, refetch } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading) { return <DashboardSkeleton />; }
	if (isError || !data) {
		return (
			<div className="page-inner dashboard">
				<EmptyState
					icon="error"
					title="Dashboard unavailable"
					subtitle="We couldn’t load the executive dashboard. Check your connection and try again."
					action={{ label: isFetching ? "Retrying…" : "Try again", onClick: () => void refetch() }}
				/>
			</div>
		);
	}

	const employeeTable = data.employeeTable || [];
	const myProjects = (data.projects || []).slice(0, 3);
	const totalTimesheets = approvals.length;
	const pendingTimesheets = Number(data.pendingApprovals) || approvals.filter(
		(a: any) => a.status === "Pending",
	).length;
	const currentWeekApprovals = approvals.filter((a: { weekStart?: string }) => !data.weekStart || a.weekStart === data.weekStart);
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
						Approval history ({approvals.length})
					</button>
				</div>
			</div>

			{/* HR Reminder Banner for CEO */}
			{pendingTimesheets > 0 && (
				<div className="dashboard__banner dashboard__banner--hr dashboard__banner--ceo">
					<div className="dashboard__banner-content">
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
							<strong className="dashboard__banner-strong">
								HR Reminder (from {DEFAULT_HR_USER.name}):
							</strong>{" "}
							You have{" "}
							<strong>
								{pendingTimesheets} timesheet{pendingTimesheets > 1 ? "s" : ""}
							</strong>{" "}
							awaiting review and approval across the organization.
						</div>
					</div>
					<div className="dashboard__banner-actions">
						<button
							type="button"
							className="btn btn--sm dashboard__banner-review-btn"
							onClick={() => navigate("/approvals")}
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
						value: `${data.totalEmployees ?? employeeTable.length}`,
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
						value: `${data.activeProjects ?? 0}`,
						sub: "Organization-wide",
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
						label: "Approval History",
						value: `${totalTimesheets}`,
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
						value: data.teamUtilization == null ? "—" : `${data.teamUtilization}%`,
						sub: `Team average · target 85–100% · ${data.weekStart} – ${data.weekEnd}`,
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
					<div className="dashboard__section dashboard__section--flush">
						<div className="dashboard__section-header dashboard__section-header--padded">
							<h2 className="dashboard__section-title">
								Organization active projects
							</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/projects")}>
								All Projects{" "}
								<span className="dashboard__link-chevron">›</span>
							</button>
						</div>
						<div className="dashboard__ceo-project-list">
							{myProjects.slice(0, 3).map((p: any) => (
								<Link
									className="dashboard__project-item dashboard__project-item--row"
									key={p.id}
									to={`/projects/${p.id}`}
								>
									<div className="dashboard__project-item-main">
										<div className="dashboard__project-item-top">
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
										<div className="dashboard__project-item-sub">
											<span>Due {formatDisplayDate(p.dueDate) || "N/A"}</span>
											<span>
												{p.totalHours > 0
													? `${p.loggedHours}h / ${p.totalHours}h logged`
													: `${p.loggedHours}h logged`}
											</span>
										</div>
									</div>
									<div className="dashboard__project-item-pct-wrap">
										<div className="dashboard__project-item-pct-val">
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
								All personnel · this week (first 5)
							</h2>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/approvals")}>
								All timesheets →
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
								<caption className="sr-only">First five personnel timesheet statuses for this week</caption>
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
												<div className="dashboard__emp-cell">
													<Avatar
														initials={row.user.initials}
														color={row.user.color}
														size="sm"
													/>
													<div>
														<div className="dashboard__emp-name">
															{row.user.name}
														</div>
														<div className="dashboard__emp-role">
															{row.user.designation}
														</div>
													</div>
												</div>
											</td>
											<td>
												<span className="dashboard__role-pill">
													{row.user.role || "Staff"}
												</span>
											</td>
											<td className="dashboard__td-hours">{row.weekHours}h</td>
											<td className="dashboard__td-util--sm">
												<UtilBar value={row.utilization} />
											</td>
											<td>
												<Badge variant={statusVariant(row.timesheetStatus)}>
													{row.timesheetStatus === "Pending" || row.timesheetStatus === "Submitted" ? "Awaiting approval" : row.timesheetStatus === "Not Started" ? "Not started" : row.timesheetStatus}
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
						<div className="dashboard__ceo-summary-grid">
							<div className="dashboard__ceo-summary-box dashboard__ceo-summary-box--slate">
								<div className="dashboard__ceo-summary-val dashboard__ceo-summary-val--slate">
									{currentWeekApprovals.length}
								</div>
								<div className="dashboard__ceo-summary-lbl dashboard__ceo-summary-lbl--slate">
									Current week submissions
								</div>
							</div>
							<div className="dashboard__ceo-summary-box dashboard__ceo-summary-box--yellow">
								<div className="dashboard__ceo-summary-val dashboard__ceo-summary-val--yellow">
									{pendingTimesheets}
								</div>
								<div className="dashboard__ceo-summary-lbl dashboard__ceo-summary-lbl--yellow">
									Awaiting approval
								</div>
							</div>
							<div className="dashboard__ceo-summary-box dashboard__ceo-summary-box--green">
								<div className="dashboard__ceo-summary-val dashboard__ceo-summary-val--green">
									{approvedTimesheets}
								</div>
								<div className="dashboard__ceo-summary-lbl dashboard__ceo-summary-lbl--green">
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
	const { data, isLoading, isError, isFetching, refetch } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading) { return <DashboardSkeleton />; }
	if (isError || !data) {
		return (
			<div className="page-inner dashboard">
				<EmptyState
					icon="error"
					title="HR Dashboard unavailable"
					subtitle="We couldn’t load workforce utilization data. Check your connection and try again."
					action={{ label: isFetching ? "Retrying…" : "Try again", onClick: () => void refetch() }}
				/>
			</div>
		);
	}

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
						value: `${data.totalEmployees ?? employeeTable.length}`,
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
						value: data.teamUtilization == null ? "—" : `${data.teamUtilization}%`,
						sub: `Team average · target 85–100% · ${data.weekStart} – ${data.weekEnd}`,
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
												<div className="dashboard__emp-cell">
													<Avatar
														initials={row.user.initials}
														color={row.user.color}
														size="sm"
													/>
													<div>
														<div className="dashboard__emp-name">
															{row.user.name}
														</div>
														<div className="dashboard__emp-role">
															{row.user.designation}
														</div>
													</div>
												</div>
											</td>
											<td className="dashboard__td-dept">
												{row.user.department || "Engineering"}
											</td>
											<td className="dashboard__td-hours">{row.weekHours}h</td>
											<td className="dashboard__td-util--sm">
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
						<div className="dashboard__hr-dept-list">
							{deptUtilization.slice(0, 5).map((d: any) => (
								<div key={d.dept}>
									<div className="dashboard__hr-dept-row">
										<span>{d.dept}</span>
										<span className="dashboard__hr-dept-pct">{d.utilization}%</span>
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
	const { data, isLoading, isError, isFetching, refetch } = useManagerDashboard();
	const { data: approvals = [] } = useApprovals();

	if (isLoading) {
		return <DashboardSkeleton />;
	}
	if (isError || !data) {
		return (
			<div className="page-inner dashboard">
				<EmptyState
					icon="error"
					title="System Admin Dashboard unavailable"
					subtitle="We couldn’t load system administration metrics. Check your connection and try again."
					action={{ label: isFetching ? "Retrying…" : "Try again", onClick: () => void refetch() }}
				/>
			</div>
		);
	}

	const employeeTable = data.employeeTable || [];
	const totalTimesheets = approvals.length;

	const systemAuditLogs = getSystemAuditLogs(currentUser.name);

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
						className="btn btn--ghost dashboard__admin-btn"
						onClick={() => navigate("/employees")}
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
						className="btn btn--primary dashboard__admin-btn"
						onClick={() => navigate("/projects")}
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
						value: `${employeeTable.length}`,
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
						value: `${data.activeProjects ?? 0}`,
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
						<div className="dashboard__stat-card-value dashboard__stat-card-value--spaced">
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
								<div className="dashboard__section-subtitle">
									System user roles, designations, and account status
								</div>
							</div>
							<button type="button" className="dashboard__section-link" onClick={() => navigate("/employees")}>
								Manage Users{" "}
								<span className="dashboard__link-chevron">›</span>
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
														<div className="dashboard__emp-cell">
															<Avatar
																initials={row.user.initials}
																color={row.user.color}
																size="sm"
															/>
															<div>
																<div className="dashboard__emp-name dashboard__emp-name--dark">
																	{row.user.name}
																</div>
																<div className="dashboard__emp-role dashboard__emp-role--slate">
																	{row.user.designation}
																</div>
															</div>
														</div>
													</td>
													<td>
														<span
															className="dashboard__security-role-badge"
															style={{
																background: roleBadgeStyle.bg,
																color: roleBadgeStyle.color,
															}}
														>
															{roleName}
														</span>
													</td>
													<td className="dashboard__td-dept-slate">
														{row.user.department || "General"}
													</td>
													<td>
														<span className="dashboard__active-status">
															<span className="dashboard__active-dot" />
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
							<span className="dashboard__section-link dashboard__section-link--static">
								Real-time Trail
							</span>
						</div>
						<div className="dashboard__audit-list">
							{systemAuditLogs.map((log) => (
								<div key={log.id} className="dashboard__audit-item">
									<div className="dashboard__audit-left">
										<div className="dashboard__audit-icon">
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
										<div className="dashboard__audit-body">
											<div className="dashboard__audit-event">
												{log.event}
											</div>
											<div className="dashboard__audit-user">
												Initiated by {log.user}
											</div>
										</div>
									</div>
									<div className="dashboard__audit-right">
										<span className="dashboard__audit-status">
											{log.status}
										</span>
										<div className="dashboard__audit-time">
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
						<div className="dashboard__infra-list">
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
									color: "#2563eb",
								},
							].map((item, idx) => (
								<div
									key={idx}
									className={`dashboard__infra-item${idx < 3 ? " dashboard__infra-item--bordered" : ""}`}
								>
									<div>
										<div className="dashboard__infra-label">
											{item.label}
										</div>
										<div
											className="dashboard__infra-status"
											style={{ color: item.color }}
										>
											• {item.status}
										</div>
									</div>
									<span className="dashboard__infra-val">
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
