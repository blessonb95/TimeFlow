import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useCreateEmployee, useEmployees } from '../../hooks/useEmployees';
import { useDialogAccessibility } from '../../hooks/useDialogAccessibility';

interface CreateEmployeeModalProps {
  onClose: () => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({ onClose }) => {
	const dialogRef = useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose);
  const createEmployeeMutation = useCreateEmployee();
  const { data: allUsers = [] } = useEmployees({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Senior Software Engineer');
  const [role, setRole] = useState('employee');
  const [reportingManagerId, setReportingManagerId] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fieldErrors = {
    firstName: !firstName.trim() ? 'First Name is required.' : undefined,
    email: !email.trim() ? 'Work Email is required.' : !email.includes('@') || !email.includes('.') ? 'Please enter a valid email address.' : undefined,
    designation: !designation.trim() ? 'Designation / Job Title is required.' : undefined,
  };

  const isSubmitDisabled = !!fieldErrors.firstName || !!fieldErrors.email || !!fieldErrors.designation || createEmployeeMutation.isPending;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) {
      setTouched({ firstName: true, email: true, designation: true });
      return;
    }

    createEmployeeMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        department,
        designation: designation.trim(),
        role,
        reportingManagerId: reportingManagerId || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create employee.';
          setError(msg);
        },
      }
    );
  };

  const renderFieldError = (message?: string) => {
    if (!message) return null;
    return (
      <div style={{ fontSize: '0.8125rem', color: '#ef4444', marginTop: '0.3125rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14, flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 5v3.5M8 11h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{message}</span>
      </div>
    );
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="modal" style={{ width: 520 }} role="dialog" aria-modal="true" aria-labelledby="create-employee-title" tabIndex={-1}>
        <div className="modal__header">
          <h2 id="create-employee-title" className="modal__header-title">Add New Employee</h2>
          <button type="button" className="modal__header-close" onClick={onClose} aria-label="Close add employee dialog">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal__body">
            {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '0.625rem 0.875rem', borderRadius: 8, fontSize: '0.8125rem', marginBottom: '1rem'}}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-group__label" htmlFor="employee-first-name">
                  First Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  className="form-group__input"
                  id="employee-first-name"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  aria-invalid={touched.firstName && !!fieldErrors.firstName}
                  aria-describedby={touched.firstName && fieldErrors.firstName ? 'employee-first-name-error' : undefined}
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  autoFocus
                  style={{ borderColor: touched.firstName && fieldErrors.firstName ? '#ef4444' : undefined }}
                />
                {touched.firstName && fieldErrors.firstName && <div id="employee-first-name-error">{renderFieldError(fieldErrors.firstName)}</div>}
              </div>
              <div className="form-group">
                <label className="form-group__label" htmlFor="employee-last-name">
                  Last Name
                </label>
                <input
                  className="form-group__input"
                  id="employee-last-name"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="employee-work-email">
                Work Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                id="employee-work-email"
                name="email"
                autoComplete="email"
                required
                aria-invalid={touched.email && !!fieldErrors.email}
                aria-describedby={touched.email && fieldErrors.email ? 'employee-email-error' : undefined}
                className="form-group__input"
                placeholder="john.doe@timeflow.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{ borderColor: touched.email && fieldErrors.email ? '#ef4444' : undefined }}
              />
              {touched.email && fieldErrors.email && <div id="employee-email-error">{renderFieldError(fieldErrors.email)}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-group__label" htmlFor="employee-department">
                  Department <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select id="employee-department" name="department" className="form-group__select" value={department} onChange={e => setDepartment(e.target.value)}>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="QA">QA</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-group__label" htmlFor="employee-role">
                  Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select id="employee-role" name="role" className="form-group__select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="employee-designation">
                Designation / Job Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                className="form-group__input"
                id="employee-designation"
                name="designation"
                required
                aria-invalid={touched.designation && !!fieldErrors.designation}
                aria-describedby={touched.designation && fieldErrors.designation ? 'employee-designation-error' : undefined}
                placeholder="e.g. Senior Frontend Engineer"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                onBlur={() => handleBlur('designation')}
                style={{ borderColor: touched.designation && fieldErrors.designation ? '#ef4444' : undefined }}
              />
              {touched.designation && fieldErrors.designation && <div id="employee-designation-error">{renderFieldError(fieldErrors.designation)}</div>}
            </div>
            <div className="form-group">
              <label className="form-group__label" htmlFor="employee-manager">
                Reporting Manager
              </label>
              <select id="employee-manager" name="reportingManagerId" className="form-group__select" value={reportingManagerId} onChange={e => setReportingManagerId(e.target.value)}>
                <option value="">None (Top Level)</option>
                {allUsers.filter((u: any) => u.role === 'manager' || u.role === 'admin').map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={createEmployeeMutation.isPending}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitDisabled}
              style={{ opacity: isSubmitDisabled ? 0.5 : 1, cursor: isSubmitDisabled ? 'not-allowed' : 'pointer' }}
            >
              {createEmployeeMutation.isPending ? 'Adding…' : 'Add Employee'}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
};
