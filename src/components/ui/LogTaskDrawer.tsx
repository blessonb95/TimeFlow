import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjects } from "../../hooks/useProjects";
import { useCreateWorkLog, useUpdateWorkLog } from "../../hooks/useWorkLogs";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { useAppStore } from "../../store/useAppStore";
import { aiApi } from "../../api/ai";
import { upsertQueuedWorkLog } from "../../utils/offlineQueue";
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
	const isUserDisabled = currentUser?.status === "Disabled";
	const { data: projects = [] } = useProjects();
	const { isOnline, retryEntry } = useOfflineSync();
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

	// ─── AI Assist State ────────────────────────────────────────────────────────
	const [showAiAssist, setShowAiAssist] = useState(false);
	const [roughNotes, setRoughNotes] = useState("");
	const [isGeneratingAi, setIsGeneratingAi] = useState(false);
	const [aiError, setAiError] = useState("");
	const [aiDraftTitle, setAiDraftTitle] = useState("");
	const [aiDraftDescription, setAiDraftDescription] = useState("");
	const [hasAiDraft, setHasAiDraft] = useState(false);

	const selectedProjectObj = projects.find((p: { id: string }) => p.id === project);
	const selectedProjectName =
		project === "internal" ? "Internal" : selectedProjectObj?.name || "";

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

	const handleGenerateAiDraft = async () => {
		const trimmedNotes = roughNotes.trim();
		if (!trimmedNotes) {
			setAiError("Enter a few rough notes first so AI Assist can draft your task.");
			return;
		}
		if (!isOnline) {
			setAiError(
				"AI Assist is unavailable while offline. You can still enter your task title and description manually.",
			);
			return;
		}
		setAiError("");
		setIsGeneratingAi(true);
		try {
			const res = await aiApi.draftTask({
				notes: trimmedNotes,
				projectName: selectedProjectName || undefined,
			});
			setAiDraftTitle(res.taskName);
			setAiDraftDescription(res.taskDescription);
			setHasAiDraft(true);
		} catch (err: any) {
			const msg =
				err?.response?.data?.error ||
				err?.response?.data?.message ||
				"AI service is temporarily unavailable. You can continue logging your task manually.";
			setAiError(msg);
		} finally {
			setIsGeneratingAi(false);
		}
	};

	const handleApplyAiDraft = () => {
		if (aiDraftTitle.trim()) {
			setTask(aiDraftTitle.trim());
		}
		if (aiDraftDescription.trim()) {
			setTaskDescription(aiDraftDescription);
		}
		setHasAiDraft(false);
		setShowAiAssist(false);
	};

	const handleDiscardAiDraft = () => {
		setAiDraftTitle("");
		setAiDraftDescription("");
		setHasAiDraft(false);
		setAiError("");
	};

	const handleSave = async () => {
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
					queryClient.invalidateQueries({ queryKey: ["workLogs"] }),
					queryClient.invalidateQueries({ queryKey: ["projects"] }),
					queryClient.invalidateQueries({ queryKey: ["project"] }),
					queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
					queryClient.invalidateQueries({ queryKey: ["reports"] }),
				]);
			} catch (e) {
				console.error(e);
			} finally {
				setIsUpdatingList(false);
				onClose();
			}
		};

		// Editing an existing offline queued entry in IndexedDB
		if (editingLog?.isOfflineQueued) {
			setIsUpdatingList(true);
			try {
				const clientId = editingLog.clientId || editingLog.id;
				const userId =
					currentUser?.id || localStorage.getItem("active_user_id") || "guest-demo-user";
				await upsertQueuedWorkLog({
					clientId,
					userId,
					projectId: project,
					projectName: selectedProjectName || "Internal Task",
					projectColor: selectedProjectObj?.color || "#2563EB",
					taskName: task.trim(),
					taskDescription,
					hours: numHours,
					date,
					status: "Pending",
					taskStatus,
					tickets: tickets.map((t) => ({ ticketNumber: t })),
					createdAt: editingLog.createdAt || new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					syncState: "waiting",
					retryCount: editingLog.retryCount || 0,
				});
				if (isOnline) {
					await retryEntry(clientId);
				}
				await refreshQueries();
			} catch (err: any) {
				setIsUpdatingList(false);
				setError(err?.message || "Failed to update queued offline entry.");
			}
			return;
		}

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
							(err as { response?: { data?: { error?: string; message?: string } } })?.response
								?.data?.error ||
							(err as { response?: { data?: { message?: string } } })?.response
								?.data?.message ||
							"Failed to update work log";
						setError(msg);
					},
				},
			);
		} else {
			createWorkLogMutation.mutate(
				{
					projectId: project,
					projectName: selectedProjectName || "Internal Task",
					projectColor: selectedProjectObj?.color || "#2563EB",
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
							(err as { response?: { data?: { error?: string; message?: string } } })?.response
								?.data?.error ||
							(err as { response?: { data?: { message?: string } } })?.response
								?.data?.message ||
							"Failed to create work log";
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
						{isReadOnly
							? "Task View"
							: editingLog?.isOfflineQueued
							? "Edit Queued Offline Entry"
							: editingLog
							? "Edit Task Log"
							: "Log Task"}
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
					{!isOnline && !isReadOnly && (
						<div className="drawer__offline-banner" role="status">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
								<circle cx="8" cy="8" r="6.5" />
								<path d="M8 4.5v3.8l2.4 1.6" strokeLinecap="round" />
							</svg>
							<div>
								<strong>Offline Mode Active:</strong> Your entry will be saved locally and synced automatically when your connection returns.
							</div>
						</div>
					)}
					{editingLog?.syncError && (
						<div className="drawer__error-banner" role="alert">
							<strong>Sync issue to resolve:</strong> {editingLog.syncError}
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
						<div className="drawer__label-row">
							<label className="form-group__label" htmlFor="log-task-name">
								Task Name <span className="form-group__required">*</span>
							</label>
							{!isReadOnly && (
								<button
									type="button"
									className={`drawer__ai-trigger${showAiAssist ? " drawer__ai-trigger--active" : ""}`}
									onClick={() => setShowAiAssist((prev) => !prev)}
									aria-expanded={showAiAssist}
									aria-controls="drawer-ai-assist-panel"
								>
									<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14" aria-hidden="true">
										<path d="M8 1.5l1.6 3.9L13.5 7l-3.9 1.6L8 12.5 6.4 8.6 2.5 7l3.9-1.6L8 1.5z" strokeLinejoin="round" />
										<path d="M13 11.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4z" strokeLinejoin="round" />
									</svg>
									<span>{showAiAssist ? "Hide AI Assist" : "AI Assist"}</span>
								</button>
							)}
						</div>

						{showAiAssist && !isReadOnly && (
							<div id="drawer-ai-assist-panel" className="drawer__ai-panel" role="region" aria-label="AI-assisted task drafting">
								<div className="drawer__ai-privacy">
									<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" aria-hidden="true">
										<path d="M8 1.75L2.75 4v3.8c0 3.35 2.24 6.38 5.25 7.2 3.01-.82 5.25-3.85 5.25-7.2V4L8 1.75z" />
										<path d="M6 8l1.4 1.4L10.25 6.5" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									<span>
										<strong>Data-sharing notice:</strong> Only your rough notes below{selectedProjectName ? ` and project name ("${selectedProjectName}")` : ""} will be sent to the secure TimeFlow AI service to draft a title and description. Logged hours, dates, tickets, and personal/company records are never sent.
									</span>
								</div>

								{!isOnline && (
									<div className="drawer__ai-unavailable" role="status">
										AI Assist is unavailable while offline. You can still type your task name and description manually below.
									</div>
								)}

								<div className="drawer__ai-input-group">
									<label htmlFor="ai-rough-notes" className="drawer__ai-label">
										Rough Notes
									</label>
									<textarea
										id="ai-rough-notes"
										className="form-group__input drawer__ai-textarea"
										rows={3}
										placeholder="Jot down rough bullet points or shorthand notes (e.g., 'fixed mobile table overflow in work logs; added IndexedDB offline queue & verified build')..."
										value={roughNotes}
										onChange={(e) => setRoughNotes(e.target.value)}
										disabled={isGeneratingAi}
									/>
									<div className="drawer__ai-actions">
										<button
											type="button"
											className="btn btn--secondary btn--sm"
											onClick={handleGenerateAiDraft}
											disabled={isGeneratingAi || !isOnline || !roughNotes.trim()}
										>
											{isGeneratingAi ? (
												<>
													<LoadingSpinner inline size="sm" />
													Drafting…
												</>
											) : (
												<>
													<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13" aria-hidden="true">
														<path d="M8 1.5l1.6 3.9L13.5 7l-3.9 1.6L8 12.5 6.4 8.6 2.5 7l3.9-1.6L8 1.5z" strokeLinejoin="round" />
													</svg>
													Generate Draft
												</>
											)}
										</button>
									</div>
								</div>

								{aiError && (
									<div className="drawer__ai-error" role="alert">
										{aiError}
									</div>
								)}

								{hasAiDraft && (
									<div className="drawer__ai-draft-preview">
										<div className="drawer__ai-draft-header">
											<span>Suggested Draft (Review &amp; edit before applying)</span>
										</div>
										<div className="form-group">
											<label htmlFor="ai-draft-title" className="drawer__ai-label">
												Suggested Title
											</label>
											<input
												id="ai-draft-title"
												className="form-group__input"
												value={aiDraftTitle}
												onChange={(e) => setAiDraftTitle(e.target.value)}
											/>
										</div>
										<div className="form-group">
											<label htmlFor="ai-draft-desc" className="drawer__ai-label">
												Suggested Description
											</label>
											<RichTextEditor
												id="ai-draft-desc"
												value={aiDraftDescription}
												onChange={setAiDraftDescription}
												placeholder="Review generated description..."
											/>
										</div>
										<div className="drawer__ai-draft-footer">
											<button
												type="button"
												className="btn btn--ghost btn--sm"
												onClick={handleDiscardAiDraft}
											>
												Discard Draft
											</button>
											<button
												type="button"
												className="btn btn--primary btn--sm"
												onClick={handleApplyAiDraft}
											>
												Apply Draft to Form
											</button>
										</div>
									</div>
								)}
							</div>
						)}

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
							) : editingLog?.isOfflineQueued ? (
								isOnline ? "Update & Retry Sync" : "Update Queued Entry"
							) : editingLog ? (
								"Update Entry"
							) : !isOnline ? (
								"Save Offline (Queue)"
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
