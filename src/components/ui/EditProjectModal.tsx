import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";
import {
	useUpdateProject,
	useDeleteProject,
	useProjects,
} from "../../hooks/useProjects";
import { useEmployees } from "../../hooks/useEmployees";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
interface EditProjectModalProps {
	project: {
		id: string;
		name: string;
		description?: string;
		status: string;
		priority?: string;
		totalHours?: number;
		endDate?: string;
		teamMembers?: any[];
	};
	onClose: () => void;
	onDeleted?: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
	project,
	onClose,
	onDeleted,
}) => {
	const dialogRef = useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose);
	const { data: existingProjects } = useProjects();
	const updateMutation = useUpdateProject();
	const deleteMutation = useDeleteProject();
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [name, setName] = useState(project.name || "");
	const [description, setDescription] = useState(project.description || "");
	const [status, setStatus] = useState(project.status || "Not Started");
	const [priority, setPriority] = useState(project.priority || "Medium");
	const [type, setType] = useState<'Billable' | 'Internal'>((project as any).type || (project as any).projectType || 'Billable');
	const [estimatedHours, setEstimatedHours] = useState(
		project.totalHours ? String(project.totalHours) : "",
	);
	const [endDate, setEndDate] = useState(project.endDate ? String(project.endDate).split('T')[0] : "");
	const [error, setError] = useState("");
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const { data: employeesData } = useEmployees();
	const allUsers = employeesData || [];
	const availableManagers = allUsers.filter(
		(u: any) => u.role === "manager" || u.role === "admin",
	);
	const availableEmployees = allUsers.filter((u: any) => u.role === "employee");

	const initialManagers = (project.teamMembers || [])
		.filter((m: any) => m.role === "manager" || m.role === "admin")
		.map((m: any) => m.id);
	const initialEmployees = (project.teamMembers || [])
		.filter((m: any) => m.role === "employee")
		.map((m: any) => m.id);

	const [selectedManagers, setSelectedManagers] =
		useState<string[]>(initialManagers);
	const [selectedEmployees, setSelectedEmployees] =
		useState<string[]>(initialEmployees);

	const isDuplicate = existingProjects?.some(
		(p: { id: string; name: string }) =>
			p.id !== project.id &&
			p.name.trim().toLowerCase() === name.trim().toLowerCase(),
	);

	const fieldErrors = {
		name: !name.trim()
			? "Project Name is required."
			: isDuplicate
				? "A project with this name already exists."
				: undefined,
		type: !type ? "Project Type is required." : undefined,
		managers: selectedManagers.length === 0 ? "Select at least one manager." : undefined,
		employees: selectedEmployees.length === 0 ? "Select at least one employee." : undefined,
	};

	const isSubmitDisabled =
		!!fieldErrors.name ||
		!!fieldErrors.type ||
		!!fieldErrors.managers ||
		!!fieldErrors.employees ||
		updateMutation.isPending;

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleFocus = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: false }));
	};

	const handleUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitDisabled) {
			setTouched({ name: true, type: true, managers: true, employees: true });
			return;
		}

		const numHours = parseFloat(estimatedHours) || 0;
		updateMutation.mutate(
			{
				id: project.id,
				data: {
					name: name.trim(),
					description: description.trim(),
					status,
					priority,
					type,
					projectType: type,
					estimatedHours: numHours,
					endDate: endDate || undefined,
					memberIds: [...selectedManagers, ...selectedEmployees],
				},
			},
			{
				onSuccess: () => {
					onClose();
				},
				onError: (err: unknown) => {
					const msg =
						(err as { response?: { data?: { message?: string } } })?.response
							?.data?.message || "Failed to update project.";
					setError(msg);
				},
			},
		);
	};

	const renderFieldError = (message?: string) => {
		if (!message) return null;
		return (
			<div className="modal__field-error">
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

	return ReactDOM.createPortal(
		<div
			className="modal-overlay"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<section ref={dialogRef} className="modal modal--md" role="dialog" aria-modal="true" aria-labelledby="edit-project-title" aria-describedby="edit-project-dialog-help" tabIndex={-1}>
				<div className="modal__header">
					<div>
						<h2 id="edit-project-title" className="modal__header-title">Edit Project Details</h2>
						<span id="edit-project-dialog-help" className="sr-only">Update project details, ownership, and schedule.</span>
					</div>
					<button
						type="button"
						className="modal__header-close"
						onClick={onClose}
						aria-label="Close edit project dialog"
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

				<form onSubmit={handleUpdate} className="modal__form">
					<div className="modal__body">
						{error && <div className="modal__error-banner">{error}</div>}

						<div className="form-group">
							<label className="form-group__label" htmlFor="edit-project-name">
								Project Name <span className="form-group__required">*</span>
							</label>
							<input
								className={`form-group__input ${touched.name && fieldErrors.name ? "form-group__input--error" : ""}`}
								id="edit-project-name"
								placeholder="e.g. Q3 Mobile App Redesign"
								value={name}
								onChange={(e) => setName(e.target.value)}
								onBlur={() => handleBlur("name")}
								onFocus={() => handleFocus("name")}
								autoFocus
							/>
							{touched.name && renderFieldError(fieldErrors.name)}
						</div>

						<div className="form-group">
							<label className="form-group__label" htmlFor="edit-project-description">Description</label>
							<textarea
								className="form-group__input modal__textarea"
								id="edit-project-description"
								placeholder="Brief summary of project goals and scope..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								onBlur={() => handleBlur("description")}
							/>
						</div>

						<div className="modal__grid-3">
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-type">
									Project Type <span className="form-group__required">*</span>
								</label>
								<select
									className="form-group__select"
									id="edit-project-type"
									value={type}
									onChange={(e) => setType(e.target.value as 'Billable' | 'Internal')}
								>
									<option value="Billable">Billable</option>
									<option value="Internal">Internal</option>
								</select>
							</div>
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-status">
									Status <span className="form-group__required">*</span>
								</label>
								<select
									className="form-group__select"
									id="edit-project-status"
									value={status}
									onChange={(e) => setStatus(e.target.value)}
								>
									<option value="Not Started">Not Started</option>
									<option value="Ongoing">Ongoing</option>
									<option value="Completed">Completed</option>
								</select>
							</div>
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-priority">
									Priority <span className="form-group__required">*</span>
								</label>
								<select
									className="form-group__select"
									id="edit-project-priority"
									value={priority}
									onChange={(e) => setPriority(e.target.value)}
								>
									<option value="Critical">Critical</option>
									<option value="High">High</option>
									<option value="Medium">Medium</option>
									<option value="Low">Low</option>
								</select>
							</div>
						</div>

						<div className="modal__grid-2">
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-hours">
									Estimated Budget Hours
								</label>
								<input
									type="number"
									className="form-group__input"
									id="edit-project-hours"
									min="0"
									step="1"
									placeholder="e.g. 100"
									value={estimatedHours}
									onChange={(e) => setEstimatedHours(e.target.value)}
								/>
							</div>
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-due-date">
									Target Due Date
								</label>
								<input
									type="date"
									className="form-group__input"
									id="edit-project-due-date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="modal__grid-2 modal__grid-2--spaced">
							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-managers">
									Managers <span className="form-group__required">*</span>
								</label>
								<Select
									inputId="edit-project-managers"
									aria-label="Managers"
									isMulti
									menuPortalTarget={document.body}
									options={availableManagers.map((m: any) => ({
										value: m.id,
										label: m.name,
									}))}
									value={availableManagers
										.filter((m: any) => selectedManagers.includes(m.id))
										.map((m: any) => ({ value: m.id, label: m.name }))}
									onChange={(selected: any) => {
										setSelectedManagers(
											selected ? selected.map((o: any) => o.value) : [],
										);
										setTouched((prev) => ({ ...prev, managers: true }));
									}}
									placeholder="Select managers..."
									noOptionsMessage={() => "No managers available"}
									styles={{
										control: (base) => ({
											...base,
											minHeight: 42,
											borderRadius: 8,
											borderColor: touched.managers && fieldErrors.managers ? "#ef4444" : "#e5e7eb",
										}),
										menuPortal: (base) => ({ ...base, zIndex: 9999 }),
									}}
								/>
								{touched.managers && renderFieldError(fieldErrors.managers)}
							</div>

							<div className="form-group">
								<label className="form-group__label" htmlFor="edit-project-employees">
									Employees <span className="form-group__required">*</span>
								</label>
								<Select
									inputId="edit-project-employees"
									aria-label="Employees"
									isMulti
									menuPortalTarget={document.body}
									options={availableEmployees.map((e: any) => ({
										value: e.id,
										label: e.name,
									}))}
									value={availableEmployees
										.filter((e: any) => selectedEmployees.includes(e.id))
										.map((e: any) => ({ value: e.id, label: e.name }))}
									onChange={(selected: any) => {
										setSelectedEmployees(
											selected ? selected.map((o: any) => o.value) : [],
										);
										setTouched((prev) => ({ ...prev, employees: true }));
									}}
									placeholder="Select employees..."
									noOptionsMessage={() => "No employees available"}
									styles={{
										control: (base) => ({
											...base,
											minHeight: 42,
											borderRadius: 8,
											borderColor: touched.employees && fieldErrors.employees ? "#ef4444" : "#e5e7eb",
										}),
										menuPortal: (base) => ({ ...base, zIndex: 9999 }),
									}}
								/>
								{touched.employees && renderFieldError(fieldErrors.employees)}
							</div>
						</div>
					</div>

					<div className="modal__footer">
						{confirmDelete ? (
							<>
								<button
									type="button"
									className="btn btn--ghost"
									onClick={() => setConfirmDelete(false)}
									disabled={deleteMutation.isPending}
								>
									Keep Project
								</button>
								<button
									type="button"
									className="btn btn--danger"
									disabled={deleteMutation.isPending}
									onClick={() => {
										deleteMutation.mutate(project.id, {
											onSuccess: () => {
												onClose();
												onDeleted?.();
											},
											onError: () => {
												setError("Failed to delete project.");
												setConfirmDelete(false);
											},
										});
									}}
								>
									{deleteMutation.isPending ? "Deleting…" : "Confirm Delete"}
								</button>
							</>
						) : (
							<>
								<button
									type="button"
									className="btn btn--danger btn--sm"
									onClick={() => setConfirmDelete(true)}
									disabled={updateMutation.isPending || deleteMutation.isPending}
								>
									Delete Project
								</button>
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
									className="btn btn--primary modal__submit-btn"
									disabled={isSubmitDisabled}
								>
									{updateMutation.isPending ? "Saving…" : "Save Changes"}
								</button>
							</>
						)}
					</div>
				</form>
			</section>
		</div>,
		document.body,
	);
};
