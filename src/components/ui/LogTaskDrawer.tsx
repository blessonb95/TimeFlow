import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjects } from "../../hooks/useProjects";
import { useCreateWorkLog, useUpdateWorkLog } from "../../hooks/useWorkLogs";
import { useAppStore } from "../../store/useAppStore";
import type { TaskStatus } from "../../types";
import { RichTextEditor } from "./RichTextEditor";
import { LoadingSpinner } from "./LoadingSpinner";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";

interface DrawerProps {
	onClose: () => void;
	editingLog?: any;
	defaultDate?: string;
	defaultProject?: string;
	isReadOnly?: boolean;
}

export const LogTaskDrawer: React.FC<DrawerProps> = ({
	onClose,
	editingLog,
	defaultDate,
	defaultProject,
	isReadOnly = false,
}) => {
	const dialogRef = React.useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose);
	const queryClient = useQueryClient();
	const { currentUser } = useAppStore();
	const isUserDisabled = currentUser?.status === 'Disabled';
	const { data: projects = [] } = useProjects();
	const createWorkLogMutation = useCreateWorkLog();
	const updateWorkLogMutation = useUpdateWorkLog();
	const [isUpdatingList, setIsUpdatingList] = useState(false);

	const todayStr = new Date().toISOString().slice(0, 10);
	const [project, setProject] = useState(() => {
		const initialId = editingLog?.projectId || defaultProject || "";
		if (initialId === "internal" || initialId === "internal-project") return "internal";
		return initialId;
	});
	const [task, setTask] = useState(editingLog?.taskName || "");
	const [taskDescription, setTaskDescription] = useState(
		editingLog?.taskDescription || editingLog?.description || "",
	);
	const [timeHours, setTimeHours] = useState(() => {
		if (editingLog?.hours !== undefined)
			return String(Math.floor(editingLog.hours));
		return "";
	});
	const [timeMinutes, setTimeMinutes] = useState(() => {
		if (editingLog?.hours !== undefined)
			return String(Math.round((editingLog.hours % 1) * 60));
		return "";
	});
	const [taskStatus, setTaskStatus] = useState<TaskStatus>(
		editingLog?.taskStatus || editingLog?.status || "In Progress",
	);
	const [date, setDate] = useState(() => {
		if (editingLog?.date) return String(editingLog.date).split("T")[0];
		const initial = defaultDate || todayStr;
		return initial > todayStr ? todayStr : initial;
	});
	const [ticketInput, setTicketInput] = useState("");
	const [tickets, setTickets] = useState<string[]>(
		(editingLog?.tickets || []).map((t: any) =>
			typeof t === "string" ? t : t.ticketNumber || "",
		),
	);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [showValidationErrors, setShowValidationErrors] = useState(false);

	const h = parseInt(timeHours || "0", 10);
	const m = parseInt(timeMinutes || "0", 10);
	const totalMins = h * 60 + m;
	const totalDecimalHours = parseFloat((h + m / 60).toFixed(2));

	const fieldErrors = {
		project: !project ? "Please select a project." : undefined,
		task: !task.trim() ? "Task name is required." : undefined,
		time:
			timeHours === "" && timeMinutes === ""
				? "Enter time spent."
				: totalMins < 5
					? "Minimum time is 5 minutes."
					: totalDecimalHours > 24
						? "Cannot exceed 24 hours per entry."
						: undefined,
		date: !date
			? "Date is required."
			: date > todayStr
				? "Cannot enter a future date."
				: undefined,
	};

	const isPending =
		createWorkLogMutation.isPending || updateWorkLogMutation.isPending || isUpdatingList;
	const isSubmitDisabled = isUserDisabled || isPending;
	const hasEnteredValue: Record<string, boolean> = {
		project: !!project,
		task: task.length > 0,
		time: timeHours !== "" || timeMinutes !== "",
		date: !!date,
	};
	const shouldShowFieldError = (field: keyof typeof fieldErrors) =>
		showValidationErrors || (touched[field] && hasEnteredValue[field]);

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const addTicket = () => {
		const val = ticketInput.trim();
		if (val && !tickets.includes(val)) setTickets([...tickets, val]);
		setTicketInput("");
	};

	const handleSave = () => {
		if (isSubmitDisabled) {
			return;
		}
		if (fieldErrors.project || fieldErrors.task || fieldErrors.time || fieldErrors.date) {
			setShowValidationErrors(true);
			setTouched({ project: true, task: true, time: true, date: true });
			return;
		}

		const numHours = totalDecimalHours;
		const refreshQueries = async () => {
			setIsUpdatingList(true);
			try {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ['workLogs'] }),
					queryClient.invalidateQueries({ queryKey: ['projects'] }),
					queryClient.invalidateQueries({ queryKey: ['project'] }),
					queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
					queryClient.invalidateQueries({ queryKey: ['reports'] }),
					queryClient.refetchQueries({ queryKey: ['workLogs'] }),
					queryClient.refetchQueries({ queryKey: ['projects'] }),
					queryClient.refetchQueries({ queryKey: ['dashboard'] }),
				]);
			} catch (e) {
				console.error(e);
			} finally {
				setIsUpdatingList(false);
				onClose();
			}
		};

		if (editingLog) {
			updateWorkLogMutation.mutate(
				{
					id: editingLog.id,
					data: {
						projectId: project,
						taskName: task.trim(),
						taskDescription,
						hours: numHours,
						date,
						taskStatus,
					},
				},
				{
					onSuccess: () => {
						refreshQueries();
					},
					onError: (err: unknown) => {
						const msg =
							(err as { response?: { data?: { message?: string } } })?.response
								?.data?.message || "Failed to update work log";
						setError(msg);
					},
				},
			);
		} else {
			createWorkLogMutation.mutate(
				{
					projectId: project,
					taskName: task.trim(),
					taskDescription,
					hours: numHours,
					date,
					status: "Pending",
					taskStatus,
					tickets: tickets.map((t) => ({ ticketNumber: t })),
				},
				{
					onSuccess: () => {
						refreshQueries();
					},
					onError: (err: unknown) => {
						const msg =
							(err as { response?: { data?: { message?: string } } })?.response
								?.data?.message || "Failed to create work log";
						setError(msg);
					},
				},
			);
		}
	};

	const renderFieldError = (message?: string) => {
		if (!message) return null;
		return (
			<div
				style={{
					fontSize: '0.75rem',
					color: "#ef4444",
					marginTop: '0.3125rem',
					display: "flex",
					alignItems: "center",
					gap: '0.375rem',
					fontWeight: 500,
				}}
			>
				<svg
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					style={{ width: 14, height: 14, flexShrink: 0 }}
				>
					<circle cx="8" cy="8" r="6.25" />
					<path
						d="M8 5v3.5M8 11h.01"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span>{message}</span>
			</div>
		);
	};

	return (
		<div className="drawer-overlay">
			<section ref={dialogRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="log-task-title" tabIndex={-1}>
				<div className="drawer__header">
					<h2 id="log-task-title" className="drawer__header-title">
						{isReadOnly ? "Task View" : editingLog ? "Edit Task Log" : "Log Task"}
					</h2>
					<button type="button" className="drawer__header-close" onClick={onClose} aria-label="Close task drawer">
						<svg
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M3 3l10 10M13 3L3 13" />
						</svg>
					</button>
				</div>
				<div className="drawer__body">
					{isUserDisabled && (
						<div
							style={{
								padding: "0.75rem 1rem",
								background: "#fef2f2",
								border: "1px solid #fecaca",
								borderRadius: 8,
								color: "#991b1b",
								fontSize: '0.8125rem',
								marginBottom: '1rem',
								fontWeight: 600,
								display: "flex",
								alignItems: "center",
								gap: '0.625rem',
							}}
						>
							<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="1.8">
								<circle cx="8" cy="8" r="6" />
								<path d="M5 5l6 6M11 5l-6 6" />
							</svg>
							Account Disabled: Your account has been marked as disabled. You are unable to log or submit timesheet tasks.
						</div>
					)}
					{error && (
						<p role="alert"
							style={{
								color: "#ef4444",
								fontSize: '0.8125rem',
								marginBottom: '0.75rem',
								padding: "0.5rem 0.75rem",
								background: "#fef2f2",
								border: "1px solid #f87171",
								borderRadius: 8,
							}}
						>
							{error}
						</p>
					)}

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-project">
							Project <span style={{ color: "#ef4444" }}>*</span>
						</label>
						<select
							className="form-group__select"
							id="log-project"
							name="project"
							required
							value={project}
							onChange={(e) => setProject(e.target.value)}
							onBlur={() => handleBlur("project")}
							style={{
								borderColor:
								shouldShowFieldError("project") && fieldErrors.project
										? "#ef4444"
										: undefined,
							}}
							disabled={isReadOnly}
						>
							<option value="">Select project…</option>
							<option value="internal">Internal</option>
							{projects
								.filter(
									(p: { id: string; name: string }) =>
										p.id !== "internal" && p.name.toLowerCase() !== "internal",
								)
								.map((p: { id: string; name: string }) => (
									<option key={p.id} value={p.id}>
										{p.name}
									</option>
								))}
						</select>
						{shouldShowFieldError("project") && renderFieldError(fieldErrors.project)}
					</div>

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-task-name">
							Task Name <span style={{ color: "#ef4444" }}>*</span>
						</label>
						<input
							className="form-group__input"
							id="log-task-name"
							name="task"
							required
							placeholder="What did you work on?"
							value={task}
							onChange={(e) => setTask(e.target.value)}
							onBlur={() => handleBlur("task")}
							disabled={isReadOnly}
							style={{
								borderColor:
									shouldShowFieldError("task") && fieldErrors.task ? "#ef4444" : undefined,
							}}
						/>
						{shouldShowFieldError("task") && renderFieldError(fieldErrors.task)}
					</div>

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-task-description">Description</label>
						<RichTextEditor
							id="log-task-description"
							value={taskDescription}
							onChange={setTaskDescription}
							readOnly={isReadOnly}
							placeholder="Add task details, bullet points, acceptance criteria..."
						/>
					</div>

					<div className="form-group">
						<label className="form-group__label">Linked Tickets</label>
						<div className="ticket-chips">
							{tickets.map((t) => (
								<div className="ticket-chip" key={t}>
									{t}
									{!isReadOnly && (
											<button
												type="button"
											className="ticket-chip__remove"
											onClick={() => setTickets(tickets.filter((x) => x !== t))}
												aria-label={`Remove ticket ${t}`}
										>
											✕
											</button>
									)}
								</div>
							))}
						</div>
						{!isReadOnly && (
							<>
								<div style={{ display: "flex", gap: '0.5rem'}}>
									<input
										className="form-group__input"
						aria-label="Ticket ID or URL"
										placeholder="JIRA-324, GH-88, or paste URL…"
										value={ticketInput}
										onChange={(e) => setTicketInput(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && addTicket()}
										style={{ flex: 1 }}
									/>
									<button
										type="button"
										className="btn btn--secondary btn--sm"
										onClick={addTicket}
									>
										Add
									</button>
								</div>
								<p style={{ fontSize: '0.6875rem', color: "#6b7280", marginTop: '0.25rem'}}>
									Press Enter or click Add. Any URL or ticket ID accepted.
								</p>
							</>
						)}
					</div>

					<div
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: '1rem'}}
					>
						<div className="form-group">
							<label className="form-group__label">
								Time Spent <span style={{ color: "#ef4444" }}>*</span>
							</label>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: '0.5rem',
								}}
							>
								<div style={{ display: "flex", alignItems: "center", gap: '0.25rem'}}>
									<input
										className="form-group__input"
										type="number"
										aria-label="Hours spent"
										min="0"
										max="24"
										step="1"
										placeholder="0"
										value={timeHours}
										onChange={(e) => setTimeHours(e.target.value)}
										onBlur={() => handleBlur("time")}
										disabled={isReadOnly}
										style={{
											borderColor:
											shouldShowFieldError("time") && fieldErrors.time
													? "#ef4444"
													: undefined,
										}}
									/>
									<span style={{ fontSize: '0.8125rem', color: "#6b7280" }}>h</span>
								</div>
								<div style={{ display: "flex", alignItems: "center", gap: '0.25rem'}}>
									<input
										className="form-group__input"
										type="number"
										aria-label="Minutes spent"
										min="0"
										max="59"
										step="1"
										placeholder="0"
										value={timeMinutes}
										onChange={(e) => setTimeMinutes(e.target.value)}
										onBlur={() => handleBlur("time")}
										disabled={isReadOnly}
										style={{
											borderColor:
											shouldShowFieldError("time") && fieldErrors.time
													? "#ef4444"
													: undefined,
										}}
									/>
									<span style={{ fontSize: '0.8125rem', color: "#6b7280" }}>m</span>
								</div>
							</div>
							{shouldShowFieldError("time") && renderFieldError(fieldErrors.time)}
						</div>
						<div className="form-group">
							<label className="form-group__label" htmlFor="log-date">
								Date <span style={{ color: "#ef4444" }}>*</span>
							</label>
							<input
								className="form-group__input"
								id="log-date"
								name="date"
								required
								type="date"
								max={todayStr}
								value={date}
								onChange={(e) => setDate(e.target.value)}
								onBlur={() => handleBlur("date")}
								disabled={isReadOnly}
								style={{
									borderColor:
									shouldShowFieldError("date") && fieldErrors.date ? "#ef4444" : undefined,
								}}
							/>
						{shouldShowFieldError("date") && renderFieldError(fieldErrors.date)}
						</div>
					</div>

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-status">
							Status <span style={{ color: "#ef4444" }}>*</span>
						</label>
						<select
							className="form-group__select"
							id="log-status"
							name="status"
							value={taskStatus}
							onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
							disabled={isReadOnly}
						>
							{(
								["Not Started", "In Progress", "Completed"] as TaskStatus[]
							).map((s) => (
								<option key={s}>{s}</option>
							))}
						</select>
					</div>
				</div>
				<div className="drawer__footer">
					{isUpdatingList && (
						<div style={{ padding: "0.375rem 0.75rem", background: "#eff6ff", borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, color: "#1d4ed8", display: "flex", alignItems: "center", gap: '0.5rem', marginRight: "auto"}}>
							<LoadingSpinner inline size="sm" />
							Updating task list…
						</div>
					)}
					<button
						type="button"
						className={isReadOnly ? "btn btn--primary" : "btn btn--ghost"}
						onClick={onClose}
						disabled={isPending}
					>
						{isReadOnly ? "Close" : "Cancel"}
					</button>
					{!isReadOnly && (
						<button
							type="button"
							className="btn btn--primary"
							onClick={handleSave}
							disabled={isSubmitDisabled}
							style={{
								opacity: isSubmitDisabled ? 0.6 : 1,
								cursor: isSubmitDisabled ? "not-allowed" : "pointer",
								display: "inline-flex",
								alignItems: "center",
								gap: '0.375rem',
							}}
						>
							{isPending ? (
								<>
									<LoadingSpinner inline size="sm" />
									{isUpdatingList ? "Updating list…" : "Saving…"}
								</>
							) : editingLog ? (
								"Update Entry"
							) : (
								"Save Entry"
							)}
						</button>
					)}
				</div>
			</section>
		</div>
	);
};
