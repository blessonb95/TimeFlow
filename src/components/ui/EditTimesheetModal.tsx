import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approvalsApi } from "../../api/approvals";
import { Avatar } from "./Avatar";
import { RichTextEditor } from "./RichTextEditor";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";

interface EditTimesheetModalProps {
	item: any | null;
	onClose: () => void;
}

export const EditTimesheetModal: React.FC<EditTimesheetModalProps> = ({
	item,
	onClose,
}) => {
	const dialogRef = useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose, !!item);
	const queryClient = useQueryClient();

	const getTaskValue = (it: any): string => {
		if (!it) return "";
		return it.taskName || it.task || it.task_name || "Work Log Task";
	};

	const getDateValue = (it: any): string => {
		if (!it) return "";
		const raw = it.submittedDateRaw || it.date || it.weekStart || "";
		if (typeof raw === "string") {
			if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.split("T")[0];
			if (raw.includes("T") && /^\d{4}/.test(raw)) return raw.split("T")[0];
		}

		const sDate = it.submittedDate;
		if (
			sDate &&
			typeof sDate === "string" &&
			sDate !== "N/A" &&
			!sDate.includes("–") &&
			!sDate.includes("to")
		) {
			try {
				const p = new Date(sDate);
				if (!isNaN(p.getTime())) return p.toISOString().split("T")[0];
			} catch {}
		}

		const periodStr = String(it.period || it.timesheetAsSubmitted || raw || "");
		if (periodStr && periodStr !== "N/A") {
			const part = periodStr.split(/–|to/)[0].trim();
			if (part) {
				try {
					const fullStr = part.includes(",") ? part : `${part}, 2026`;
					const p = new Date(fullStr);
					if (!isNaN(p.getTime())) return p.toISOString().split("T")[0];
				} catch {}
			}
		}

		try {
			if (raw) {
				const p = new Date(raw);
				if (!isNaN(p.getTime())) return p.toISOString().split("T")[0];
			}
		} catch {}

		return new Date().toISOString().split("T")[0];
	};

	const [task, setTask] = useState(() => getTaskValue(item));
	const [taskDescription, setTaskDescription] = useState(
		() => item?.taskDescription || item?.task_description || "",
	);
	const [timeHours, setTimeHours] = useState(() => {
		if (item?.hours !== undefined) return String(Math.floor(item.hours));
		return "0";
	});
	const [timeMinutes, setTimeMinutes] = useState(() => {
		if (item?.hours !== undefined)
			return String(Math.round((item.hours % 1) * 60));
		return "0";
	});
	const [date, setDate] = useState(() => getDateValue(item));
	const [status, setStatus] = useState<string>(
		() => item?.status || "Submitted",
	);
	const [error, setError] = useState("");

	useEffect(() => {
		if (item) {
			setTask(getTaskValue(item));
			setTaskDescription(item.taskDescription || item.task_description || "");
			setTimeHours(String(Math.floor(item.hours ?? 0)));
			setTimeMinutes(String(Math.round(((item.hours ?? 0) % 1) * 60)));
			setDate(getDateValue(item));
			setStatus(item.status || "Submitted");
			setError("");
		}
	}, [item]);

	const updateMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: any }) =>
			approvalsApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["approvals"] });
			queryClient.invalidateQueries({ queryKey: ["timesheets"] });
			queryClient.invalidateQueries({ queryKey: ["workLogs"] });
			onClose();
		},
		onError: (err: any) => {
			setError(err?.response?.data?.message || "Failed to update timesheet.");
		},
	});

	if (!item) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		const h = parseInt(timeHours || "0", 10);
		const m = parseInt(timeMinutes || "0", 10);
		const totalMins = h * 60 + m;
		const totalDecimalHours = parseFloat((h + m / 60).toFixed(2));

		if (totalMins < 5) {
			setError("Minimum time is 5 minutes.");
			return;
		}
		if (totalDecimalHours > 24) {
			setError("Cannot exceed 24 hours per entry.");
			return;
		}

		updateMutation.mutate({
			id: item.id,
			data: {
				taskName: task,
				taskDescription,
				hours: totalDecimalHours,
				date,
				status,
			},
		});
	};

	return ReactDOM.createPortal(
		<div
			className="modal-overlay"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<section ref={dialogRef} className="modal" style={{ width: 520 }} role="dialog" aria-modal="true" aria-labelledby="edit-timesheet-title" tabIndex={-1}>
				<div className="modal__header">
					<h2 id="edit-timesheet-title" className="modal__header-title">Edit Timesheet Submission</h2>
					<button
						type="button"
						className="modal__header-close"
						onClick={onClose}
						aria-label="Close edit timesheet dialog"
					>
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
				<form
					onSubmit={handleSubmit}
					style={{
						display: "flex",
						flexDirection: "column",
						flex: 1,
						overflow: "hidden",
					}}
				>
					<div className="modal__body">
						{error && (
							<div
								style={{
									background: "#fef2f2",
									border: "1px solid #f87171",
									color: "#b91c1c",
									padding: "0.625rem 0.875rem",
									borderRadius: 8,
									fontSize: '0.8125rem',
									marginBottom: '1rem',
								}}
							>
								{error}
							</div>
						)}

						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: '0.75rem',
								padding: '0.75rem',
								background: "#f8fafc",
								borderRadius: 10,
								border: "1px solid #e2e8f0",
								marginBottom: '1.25rem',
							}}
						>
							<Avatar
								initials={item.employee?.initials || "U"}
								color={item.employee?.color || "#3b82f6"}
								size="md"
							/>
							<div>
								<div
									style={{ fontWeight: 600, color: "#0f172a", fontSize: '0.875rem'}}
								>
									{item.employee?.name || "Employee"}
								</div>
								<div style={{ fontSize: '0.75rem', color: "#64748b", marginTop: '0.125rem'}}>
									Project: {item.projects?.[0] || "General Task"}
								</div>
							</div>
						</div>

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: '1rem',
							}}
						>
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-timesheet-date">Date</label>
								<input
									type="date"
									id="edit-timesheet-date"
									className="form-group__input"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									required
								/>
							</div>
							<div className="form-group">
								<label className="form-group__label">Time Spent</label>
								<div
									style={{
										display: "grid",
										gridTemplateColumns: "1fr 1fr",
										gap: '0.5rem',
									}}
								>
									<div
										style={{ display: "flex", alignItems: "center", gap: '0.25rem'}}
									>
										<input
											type="number"
										aria-label="Hours spent"
											step="1"
											min="0"
											max="24"
											className="form-group__input"
											value={timeHours}
											onChange={(e) => setTimeHours(e.target.value)}
										/>
										<span style={{ fontSize: '0.8125rem', color: "#6b7280" }}>h</span>
									</div>
									<div
										style={{ display: "flex", alignItems: "center", gap: '0.25rem'}}
									>
										<input
											type="number"
										aria-label="Minutes spent"
											step="1"
											min="0"
											max="59"
											className="form-group__input"
											value={timeMinutes}
											onChange={(e) => setTimeMinutes(e.target.value)}
										/>
										<span style={{ fontSize: '0.8125rem', color: "#6b7280" }}>m</span>
									</div>
								</div>
							</div>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="edit-timesheet-task">Task</label>
							<input
								type="text"
								className="form-group__input"
								id="edit-timesheet-task"
								value={task}
								onChange={(e) => setTask(e.target.value)}
								placeholder="Enter task title..."
								required
							/>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="edit-timesheet-description">Description</label>
							<RichTextEditor
								id="edit-timesheet-description"
								value={taskDescription}
								onChange={setTaskDescription}
								placeholder="Add task details, bullet points, notes..."
							/>
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="edit-timesheet-status">Status</label>
							<select
								className="form-group__select"
								id="edit-timesheet-status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								<option value="Submitted">Submitted</option>
								<option value="Pending">Pending</option>
								<option value="Approved">Approved</option>
								<option value="Rejected">Rejected</option>
							</select>
						</div>
					</div>
					<div className="modal__footer">
						<button
							type="button"
							className="btn btn--ghost"
							onClick={onClose}
							disabled={updateMutation.isPending}
						>
							Cancel
						</button>
						<button
							type="submit"
							className="btn btn--primary"
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</section>
		</div>,
		document.body,
	);
};
