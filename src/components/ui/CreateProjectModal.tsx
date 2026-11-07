import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { useCreateProject, useProjects } from '../../hooks/useProjects';
import { useEmployees } from '../../hooks/useEmployees';
import { useAppStore } from '../../store/useAppStore';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';

interface CreateProjectModalProps {
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose }) => {
	const dialogRef = React.useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose);
  const { currentUser } = useAppStore();
  const { data: existingProjects } = useProjects();
  const createProjectMutation = useCreateProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Not Started');
  const [priority, setPriority] = useState('Medium');
  const [type, setType] = useState<'Billable' | 'Internal'>('Billable');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { data: employeesData } = useEmployees();
  const allUsers = employeesData || [];
  const availableManagers = allUsers.filter((u: any) => u.role === 'manager' || u.role === 'admin');
  const availableEmployees = allUsers.filter((u: any) => u.role === 'employee');

  const [selectedManagers, setSelectedManagers] = useState<string[]>(() => {
    if (currentUser?.id && (currentUser?.role === 'manager' || currentUser?.role === 'admin')) {
      return [currentUser.id];
    }
    return [];
  });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  React.useEffect(() => {
    if (currentUser?.id && (currentUser?.role === 'manager' || currentUser?.role === 'admin')) {
      setSelectedManagers(prev => prev.includes(currentUser.id) ? prev : [...prev, currentUser.id]);
    }
  }, [currentUser?.id, currentUser?.role]);

  const isDuplicate = existingProjects?.some((p: { name: string }) => p.name.trim().toLowerCase() === name.trim().toLowerCase());

  const fieldErrors = {
    name: !name.trim() ? 'Project Name is required.' : isDuplicate ? 'A project with this name already exists.' : undefined,
    type: !type ? 'Project Type is required.' : undefined,
  };

  const isSubmitDisabled =
    !!fieldErrors.name ||
    !!fieldErrors.type ||
    createProjectMutation.isPending;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleFocus = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) {
      setTouched({ name: true, type: true });
      return;
    }

    const numHours = parseFloat(estimatedHours) || 0;
    createProjectMutation.mutate(
      {
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
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create project.';
          setError(msg);
        },
      }
    );
  };

  const renderFieldError = (message?: string) => {
    if (!message) return null;
    return (
      <div className="modal__field-error">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 5v3.5M8 11h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{message}</span>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="modal modal--md" role="dialog" aria-modal="true" aria-labelledby="create-project-title" aria-describedby="create-project-description" tabIndex={-1}>
        <div className="modal__header">
          <div>
            <h2 id="create-project-title" className="modal__header-title">Create New Project</h2>
            <span id="create-project-description" className="sr-only">Add project details, ownership, and schedule.</span>
          </div>
          <button type="button" className="modal__header-close" onClick={onClose} aria-label="Close create project dialog">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal__form">
          <div className="modal__body">
            {error && <div role="alert" aria-live="assertive" className="modal__error-banner">{error}</div>}
            <div className="form-group">
              <label className="form-group__label" htmlFor="project-name">
                Project Name <span className="form-group__required">*</span>
              </label>
              <input
                className={`form-group__input ${touched.name && fieldErrors.name ? 'form-group__input--error' : ''}`}
                id="project-name"
                name="name"
                required
                aria-invalid={touched.name && !!fieldErrors.name}
                aria-describedby={touched.name && fieldErrors.name ? 'project-name-error' : undefined}
                placeholder="e.g. Q3 Mobile App Redesign"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                onFocus={() => handleFocus('name')}
                autoFocus
              />
              {touched.name && fieldErrors.name && <div id="project-name-error">{renderFieldError(fieldErrors.name)}</div>}
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="project-description">
                Description
              </label>
              <textarea
                className="form-group__input modal__textarea"
                id="project-description"
                name="description"
                placeholder="Brief summary of project goals and scope..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={() => handleBlur('description')}
              />
            </div>
            <div className="modal__grid-3">
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-type">
                  Project Type <span className="form-group__required">*</span>
                </label>
                <select id="project-type" name="type" className="form-group__select" value={type} onChange={e => setType(e.target.value as 'Billable' | 'Internal')} required>
                  <option value="Billable">Billable</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-status">
                  Status <span className="form-group__required">*</span>
                </label>
                <select id="project-status" name="status" className="form-group__select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Not Started">Not Started</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-priority">
                  Priority <span className="form-group__required">*</span>
                </label>
                <select id="project-priority" name="priority" className="form-group__select" value={priority} onChange={e => setPriority(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            <div className="modal__grid-2">
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-hours">
                  Estimated Budget Hours
                </label>
                <input
                  type="number"
                  id="project-hours"
                  name="estimatedHours"
                  className="form-group__input"
                  min="0"
                  step="1"
                  placeholder="e.g. 100"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-due-date">
                  Target Due Date
                </label>
                <input
                  type="date"
                  id="project-due-date"
                  name="endDate"
                  className="form-group__input"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="modal__grid-2 modal__grid-2--spaced">
              <div className="form-group">
                <label className="form-group__label" htmlFor="project-managers">
                  Managers
                </label>
                <Select
                  inputId="project-managers"
                  aria-label="Managers"
                  isMulti
                  menuPortalTarget={document.body}
                  options={availableManagers.map((m: any) => ({ value: m.id, label: m.name }))}
                  value={availableManagers.filter((m: any) => selectedManagers.includes(m.id)).map((m: any) => ({ value: m.id, label: m.name }))}
                  onChange={(selected: any) => {
                    setSelectedManagers(selected ? selected.map((o: any) => o.value) : []);
                  }}
                  placeholder="Select managers..."
                  noOptionsMessage={() => "No managers available"}
                  styles={{ 
                    control: (base) => ({
                      ...base,
                      minHeight: 42,
                      borderRadius: 8,
                      borderColor: '#e5e7eb'
                    }),
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-group__label" htmlFor="project-employees">
                  Employees
                </label>
                <Select
                  inputId="project-employees"
                  aria-label="Employees"
                  isMulti
                  menuPortalTarget={document.body}
                  options={availableEmployees.map((e: any) => ({ value: e.id, label: e.name }))}
                  value={availableEmployees.filter((e: any) => selectedEmployees.includes(e.id)).map((e: any) => ({ value: e.id, label: e.name }))}
                  onChange={(selected: any) => {
                    setSelectedEmployees(selected ? selected.map((o: any) => o.value) : []);
                  }}
                  placeholder="Select employees..."
                  noOptionsMessage={() => "No employees available"}
                  styles={{ 
                    control: (base) => ({
                      ...base,
                      minHeight: 42,
                      borderRadius: 8,
                      borderColor: '#e5e7eb'
                    }),
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />
              </div>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={createProjectMutation.isPending}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary modal__submit-btn"
              disabled={isSubmitDisabled}
            >
              {createProjectMutation.isPending ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};
