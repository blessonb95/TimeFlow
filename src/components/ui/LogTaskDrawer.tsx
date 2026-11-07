import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjects } from "../../hooks/useProjects";
import { useCreateWorkLog, useUpdateWorkLog } from "../../hooks/useWorkLogs";
import { useAppStore } from "../../store/useAppStore";
import type { TaskStatus } from "../../types";
import { RichTextEditor } from "./RichTextEditor";
import { LoadingSpinner } from "./LoadingSpinner";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import { createPortal } from "react-dom";

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
				role="alert"
				aria-live="polite"
				className="modal__field-error"
			>
				<svg
					viewBox="0 0 16 16"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
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

	return createPortal((
		<div className="drawer-overlay">
			<section ref={dialogRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="log-task-title" aria-describedby="log-task-help" tabIndex={-1}>
				<div className="drawer__header">
					<h2 id="log-task-title" className="drawer__header-title">
						{isReadOnly ? "Task View" : editingLog ? "Edit Task Log" : "Log Task"}
					</h2>
					<span id="log-task-help" className="sr-only">Enter task details and time spent, then save the entry.</span>
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
						<div className="drawer__disabled-banner">
							<svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#dc2626" strokeWidth="1.8">
								<circle cx="8" cy="8" r="6" />
								<path d="M5 5l6 6M11 5l-6 6" />
							</svg>
							Account Disabled: Your account has been marked as disabled. You are unable to log or submit timesheet tasks.
						</div>
					)}
					{error && (
						<p role="alert" className="drawer__error-banner">
							{error}
						</p>
					)}

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-project">
							Project <span className="form-group__required">*</span>
						</label>
						<select
							className={`form-group__select ${shouldShowFieldError("project") && fieldErrors.project ? "form-group__select--error" : ""}`}
							id="log-project"
							aria-invalid={shouldShowFieldError("project") && !!fieldErrors.project}
							aria-describedby={shouldShowFieldError("project") && fieldErrors.project ? "log-project-error" : undefined}
							name="project"
							required
							value={project}
							onChange={(e) => setProject(e.target.value)}
							onBlur={() => handleBlur("project")}
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
						{shouldShowFieldError("project") && <div id="log-project-error">{renderFieldError(fieldErrors.project)}</div>}
					</div>

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-task-name">
							Task Name <span className="form-group__required">*</span>
						</label>
						<input
							className={`form-group__input ${shouldShowFieldError("task") && fieldErrors.task ? "form-group__input--error" : ""}`}
							id="log-task-name"
							aria-invalid={shouldShowFieldError("task") && !!fieldErrors.task}
							aria-describedby={shouldShowFieldError("task") && fieldErrors.task ? "log-task-name-error" : undefined}
							name="task"
							required
							placeholder="What did you work on?"
							value={task}
							onChange={(e) => setTask(e.target.value)}
							onBlur={() => handleBlur("task")}
							disabled={isReadOnly}
						/>
						{shouldShowFieldError("task") && <div id="log-task-name-error">{renderFieldError(fieldErrors.task)}</div>}
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
						<span className="form-group__label" id="linked-tickets-label">Linked Tickets</span>
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
								<div className="drawer__ticket-input-row">
									<input
										className="form-group__input"
										aria-label="Ticket ID or URL"
										aria-describedby="linked-tickets-label"
										placeholder="JIRA-324, GH-88, or paste URL…"
										value={ticketInput}
										onChange={(e) => setTicketInput(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && addTicket()}
									/>
									<button
										type="button"
										className="btn btn--secondary btn--sm"
										onClick={addTicket}
									>
										Add
									</button>
								</div>
								<p className="drawer__ticket-hint">
									Press Enter or click Add. Any URL or ticket ID accepted.
								</p>
							</>
						)}
					</div>

					<div className="modal__grid-2">
						<div className="form-group">
							<label className="form-group__label" id="time-spent-label">
								Time Spent <span className="form-group__required">*</span>
							</label>
							<div className="modal__time-grid">
								<div className="modal__time-unit">
									<input
										className={`form-group__input ${shouldShowFieldError("time") && fieldErrors.time ? "form-group__input--error" : ""}`}
										type="number"
										aria-label="Hours spent"
										aria-invalid={shouldShowFieldError("time") && !!fieldErrors.time}
										aria-describedby={shouldShowFieldError("time") && fieldErrors.time ? "log-time-error" : "time-spent-label"}
										min="0"
										max="24"
										step="1"
										placeholder="0"
										value={timeHours}
										onChange={(e) => setTimeHours(e.target.value)}
										onBlur={() => handleBlur("time")}
										disabled={isReadOnly}
									/>
									<span className="modal__time-unit-label">h</span>
								</div>
								<div className="modal__time-unit">
									<input
										className={`form-group__input ${shouldShowFieldError("time") && fieldErrors.time ? "form-group__input--error" : ""}`}
										type="number"
										aria-label="Minutes spent"
										aria-invalid={shouldShowFieldError("time") && !!fieldErrors.time}
										aria-describedby={shouldShowFieldError("time") && fieldErrors.time ? "log-time-error" : "time-spent-label"}
										min="0"
										max="59"
										step="1"
										placeholder="0"
										value={timeMinutes}
										onChange={(e) => setTimeMinutes(e.target.value)}
										onBlur={() => handleBlur("time")}
										disabled={isReadOnly}
									/>
									<span className="modal__time-unit-label">m</span>
								</div>
							</div>
							{shouldShowFieldError("time") && <div id="log-time-error">{renderFieldError(fieldErrors.time)}</div>}
						</div>
						<div className="form-group">
							<label className="form-group__label" htmlFor="log-date">
								Date <span className="form-group__required">*</span>
							</label>
							<input
								className={`form-group__input ${shouldShowFieldError("date") && fieldErrors.date ? "form-group__input--error" : ""}`}
								id="log-date"
								aria-invalid={shouldShowFieldError("date") && !!fieldErrors.date}
								aria-describedby={shouldShowFieldError("date") && fieldErrors.date ? "log-date-error" : undefined}
								name="date"
								required
								type="date"
								max={todayStr}
								value={date}
								onChange={(e) => setDate(e.target.value)}
								onBlur={() => handleBlur("date")}
								disabled={isReadOnly}
							/>
						{shouldShowFieldError("date") && <div id="log-date-error">{renderFieldError(fieldErrors.date)}</div>}
						</div>
					</div>

					<div className="form-group">
						<label className="form-group__label" htmlFor="log-status">
							Status <span className="form-group__required">*</span>
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
						<div className="drawer__updating-pill">
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
							className="btn btn--primary drawer__save-btn"
							onClick={handleSave}
							disabled={isSubmitDisabled}
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
	), document.body);
};
