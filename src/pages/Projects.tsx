import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { AvatarStack } from "../components/ui/Avatar";
import { Pagination } from "../components/ui/Pagination";
import { CreateProjectModal } from "../components/ui/CreateProjectModal";
import { EditProjectModal } from "../components/ui/EditProjectModal";
import { useProjects } from "../hooks/useProjects";
import { useAppStore } from "../store/useAppStore";
import { CardGridSkeleton, Skeleton } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { PROJECT_EXTRAS, getProjectLeadLabel } from "../data/dummy";

export const Projects: React.FC = () => {
	const { role } = useAppStore();
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState("All");
	const [page, setPage] = useState(1);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingProject, setEditingProject] = useState<any | null>(null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [isMobileView, setIsMobileView] = useState<boolean>(() =>
		typeof window !== "undefined"
			? window.matchMedia("(max-width: 48rem)").matches
			: false,
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const mql = window.matchMedia("(max-width: 48rem)");
		const handleChange = (e: MediaQueryListEvent) => {
			setIsMobileView(e.matches);
		};
		setIsMobileView(mql.matches);
		mql.addEventListener("change", handleChange);
		return () => mql.removeEventListener("change", handleChange);
	}, []);

	const effectiveViewMode = isMobileView ? "list" : viewMode;
	const pageSize = effectiveViewMode === "list" ? 10 : 6;

	const { data: projects = [], isLoading, isError, isFetching, refetch } = useProjects({
		search: search || undefined,
		status: filter === "All" ? undefined : filter,
	});

	const paginatedProjects = effectiveViewMode === "list"
		? projects.slice((page - 1) * pageSize, page * pageSize)
		: projects;

	if (isLoading && projects.length === 0 && !search) {
		return (
			<div className="page-inner page-inner--fade">
				<div className="page-header projects__skeleton-header">
					<Skeleton width="180px" height="2rem" />
				</div>
				<CardGridSkeleton count={6} />
			</div>
		);
	}

	if (isError && projects.length === 0) {
		return (
			<div className="page-inner">
				<EmptyState
					icon="error"
					title="Unable to load projects"
					subtitle="We couldn't fetch the projects list. Check your connection and try again."
					action={{ label: isFetching ? "Retrying…" : "Try again", onClick: () => void refetch() }}
				/>
			</div>
		);
	}

	return (
		<div className="page-inner">
			<div className="page-header">
				<div className="page-header__row">
					<div>
						<h1 className="page-header__title">Projects</h1>
					</div>
					{(role === "manager" || role === "admin") && (
						<button
							type="button"
							className="btn btn--primary"
							onClick={() => setShowCreateModal(true)}
						>
							+ New Project
						</button>
					)}
				</div>
			</div>

			<div className="projects__toolbar">
				<div className="projects__toolbar-left">
					<div className="projects__search">
						<svg
							width="14"
							height="14"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<circle cx="6.5" cy="6.5" r="4.5" />
							<path d="M10.5 10.5L14 14" />
						</svg>
						<input
							aria-label="Search projects"
							type="search"
							placeholder="Search projects..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
						/>
					</div>
					<div className="projects__tabs" role="group" aria-label="Filter projects by status">
						{["All", "Not Started", "Ongoing", "Completed"].map((f) => (
							<button
								type="button"
								key={f}
								aria-pressed={filter === f}
								className={`projects__tab${filter === f ? " projects__tab--active" : ""}`}
								onClick={() => {
									setFilter(f);
									setPage(1);
								}}
							>
								{f}
							</button>
						))}
					</div>
				</div>
				<div className="projects__toolbar-right">
					<div className="worklogs__view-toggle" role="group" aria-label="Project view">
						<button
							type="button"
							aria-label="Grid view"
							aria-pressed={viewMode === "grid"}
							className={`worklogs__view-btn${viewMode === "grid" ? " worklogs__view-btn--active" : ""}`}
							onClick={() => setViewMode("grid")}
						>
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="projects__view-icon"
							>
								<rect x="1.5" y="1.5" width="5" height="5" rx="1" />
								<rect x="9.5" y="1.5" width="5" height="5" rx="1" />
								<rect x="1.5" y="9.5" width="5" height="5" rx="1" />
								<rect x="9.5" y="9.5" width="5" height="5" rx="1" />
							</svg>
						</button>
						<button
							type="button"
							aria-label="List view"
							aria-pressed={viewMode === "list"}
							className={`worklogs__view-btn${viewMode === "list" ? " worklogs__view-btn--active" : ""}`}
							onClick={() => setViewMode("list")}
						>
							<svg
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="projects__view-icon"
							>
								<path d="M1.5 4h13M1.5 8h13M1.5 12h13" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			{effectiveViewMode === "grid" ? (
				<div className="projects__grid">
					{paginatedProjects.map(
						(p: {
							id: string;
							name: string;
							status: string;
							priority: string;
							description: string;
							progress: number;
							loggedHours: number;
							totalHours: number;
							teamMembers?: { initials: string; color: string; name: string }[];
							managers?: {
								initials?: string;
								color?: string;
								name: string;
								role?: string;
							}[];
						}) => {
							const badgeVariant =
								p.status === "Completed"
									? "green"
									: p.status === "Ongoing" || p.status === "On Track"
										? "blue"
										: "gray";
							const ex = PROJECT_EXTRAS[p.id];
							const dotColor = ex?.color || "blue";
							const barColor =
								p.status === "Over Budget"
									? "red"
									: p.status === "At Risk"
										? "orange"
										: "green";

							return (
								<div
									key={p.id}
									className="projects__card"
								>
									<div className="projects__card-header">
										<div className="projects__card-header-left">
											<div
												className={`projects__card-dot projects__card-dot--${dotColor}`}
											/>
											<Link className="projects__card-title" to={`/projects/${p.id}`}>{p.name}</Link>
										</div>
										<div className="projects__card-header-right">
											<Badge variant={badgeVariant as any} dot>
												{p.status}
											</Badge>
											{(role === "manager" || role === "admin") && (
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setEditingProject(p);
													}}
													title="Edit project details"
													aria-label={`Edit ${p.name}`}
													className="projects__card-edit-btn"
												>
													<svg
														width="14"
														height="14"
														viewBox="0 0 16 16"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.6"
													>
														<path d="M11 2a2 2 0 0 1 2 2l-8 8-4 1 1-4 8-8z" />
													</svg>
												</button>
											)}
										</div>
									</div>
									<div className="projects__card-desc">
										{p.description || "No description provided."}
									</div>

									<div className="projects__card-lead-banner">
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#d97706"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
										</svg>
										<div>
											<span className="projects__card-lead-label">
												Project Manager:{" "}
											</span>
											<span className="projects__card-lead-name">
												{getProjectLeadLabel(p)}
											</span>
										</div>
									</div>

									<div className="projects__card-progress">
										<div className="projects__card-progress-header">
											<span className="projects__card-progress-label">
												Progress
											</span>
											<span className="projects__card-progress-pct">
												{p.progress}%
											</span>
										</div>
										<ProgressBar
											value={p.progress}
											color={barColor as any}
											thickness="thick"
										/>
									</div>

									<div className="projects__card-meta">
										<AvatarStack
											members={(p.teamMembers || []).filter(
												(m: any) => m.role !== "manager" && m.role !== "admin",
											)}
											max={4}
										/>
										<div>
											<div className="projects__card-meta-hours">
												{p.totalHours > 0
													? `${p.loggedHours}h / ${p.totalHours}h`
													: `${p.loggedHours}h logged`}
											</div>
											<div className="projects__card-meta-days">
												{p.totalHours > 0
													? `${Math.max(0, Math.floor((p.totalHours - p.loggedHours) / 8))}d left`
													: "No budget limit"}
											</div>
										</div>
									</div>

									<div className="projects__card-footer">
										<div className="projects__card-footer-badges">
											<Badge
												variant={
													p.status === "Completed" ? "green" : ("blue" as any)
												}
											>
												{p.status}
											</Badge>
											<Badge
												variant={
													p.priority === "High" || p.priority === "Critical"
														? "red"
														: ("blue" as any)
												}
											>
												{p.priority || "Medium"}
											</Badge>
										</div>
										<span className="projects__card-footer-client">
											{ex?.client ||
												(p.name.toLowerCase() === "internal"
													? "Internal"
													: "TimeFlow Client")}
										</span>
									</div>
								</div>
							);
						},
					)}
					{projects.length === 0 && (
						<div className="projects__grid-empty">
							<EmptyState
								icon="projects"
								title="No projects found"
								subtitle="No projects match your current search or status filter."
							/>
						</div>
					)}
				</div>
			) : (
				<div className="data-table--card">
					<div className="table-responsive">
						<table className="data-table">
							<caption className="sr-only">Projects, status, progress, and team assignments</caption>
							<thead>
								<tr>
									<th scope="col">Project</th>
									<th scope="col">Status</th>
									<th scope="col">Priority</th>
									<th scope="col">Project Manager</th>
									<th scope="col" className="projects__th-progress">Progress</th>
									<th scope="col">Hours</th>
									<th scope="col">Team</th>
									{(role === "manager" || role === "admin") && (
										<th scope="col" className="projects__th-right">Actions</th>
									)}
								</tr>
							</thead>
							<tbody>
								{paginatedProjects.map(
									(p: {
										id: string;
										name: string;
										status: string;
										priority: string;
										description: string;
										progress: number;
										loggedHours: number;
										totalHours: number;
										teamMembers?: {
											initials: string;
											color: string;
											name: string;
										}[];
										managers?: {
											initials?: string;
											color?: string;
											name: string;
											role?: string;
										}[];
									}) => {
										const badgeVariant =
											p.status === "Completed"
												? "green"
												: p.status === "Ongoing" || p.status === "On Track"
													? "blue"
													: p.status === "At Risk"
														? "orange"
														: p.status === "Over Budget"
															? "red"
															: "gray";
										const ex = PROJECT_EXTRAS[p.id];
										const dotColor = ex?.color || "blue";
										const barColor =
											p.status === "Over Budget"
												? "red"
												: p.status === "At Risk"
													? "orange"
													: "green";

										return (
											<tr key={p.id}>
												<td>
													<div className="projects__table-proj-cell">
														<div
															className={`projects__table-dot projects__table-dot--${dotColor}`}
														/>
														<div>
													<Link className="projects__table-proj-name" to={`/projects/${p.id}`}>
														{p.name}
													</Link>
														</div>
													</div>
												</td>
											<td>
												<Badge variant={badgeVariant as any} dot>
													{p.status}
												</Badge>
											</td>
											<td>
												<Badge
													variant={
														p.priority === "High" || p.priority === "Critical"
															? "red"
															: ("blue" as any)
													}
												>
													{p.priority || "Medium"}
												</Badge>
											</td>
											<td>
												<div className="projects__table-lead-row">
													<svg
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="#d97706"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
													</svg>
													<span>
														{getProjectLeadLabel(p)}
													</span>
												</div>
											</td>
											<td>
												<div className="projects__table-progress-col">
													<div className="projects__table-progress-label">
														<span>{p.progress}%</span>
													</div>
													<ProgressBar
														value={p.progress}
														color={barColor as any}
														thickness="thick"
													/>
												</div>
											</td>
											<td>
												<span className="projects__table-hours-val">
													{p.loggedHours}h
												</span>
												{p.totalHours > 0 ? (
													<span className="projects__table-hours-total">
														{" "}
														/ {p.totalHours}h
													</span>
												) : (
													<span className="projects__table-hours-total projects__table-no-budget">
														{" "}
														(No budget)
													</span>
												)}
											</td>
											<td>
												<AvatarStack
													members={(p.teamMembers || []).filter(
														(m: any) =>
															m.role !== "manager" && m.role !== "admin",
													)}
													max={4}
												/>
											</td>
											{(role === "manager" || role === "admin") && (
												<td className="projects__table-action-cell">
													<button
														type="button"
														onClick={() => setEditingProject(p)}
														title="Edit project details"
														aria-label={`Edit ${p.name}`}
														className="projects__table-edit-btn"
													>
														<svg
															width="14"
															height="14"
															viewBox="0 0 16 16"
															fill="none"
															stroke="currentColor"
															strokeWidth="1.6"
														>
															<path d="M11 2a2 2 0 0 1 2 2l-8 8-4 1 1-4 8-8z" />
														</svg>
													</button>
												</td>
											)}
										</tr>
									);
								},
							)}
							{projects.length === 0 && (
								<tr>
									<td
										colSpan={role === "manager" || role === "admin" ? 8 : 7}
										className="projects__table-empty"
									>
										<EmptyState
											icon="projects"
											title="No projects found"
											subtitle="No projects match your current search or status filter."
											compact
										/>
									</td>
								</tr>
							)}
						</tbody>
					</table>
					</div>
				</div>
			)}
			{effectiveViewMode === "list" && (
				<div className="projects__pagination-wrapper">
					<Pagination
						currentPage={page}
						totalItems={projects.length}
						pageSize={pageSize}
						onPageChange={setPage}
					/>
				</div>
			)}
			{showCreateModal && (
				<CreateProjectModal onClose={() => setShowCreateModal(false)} />
			)}
			{editingProject && (
				<EditProjectModal
					project={editingProject}
					onClose={() => setEditingProject(null)}
				/>
			)}
		</div>
	);
};
