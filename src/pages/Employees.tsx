import React, { useRef, useState } from 'react';
import { Badge, statusVariant } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Pagination } from '../components/ui/Pagination';
import { CreateEmployeeModal } from '../components/ui/CreateEmployeeModal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useEmployees, useUpdateEmployee } from '../hooks/useEmployees';
import { useAppStore } from '../store/useAppStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { TableSkeleton, Skeleton } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { AccessRestricted } from '../components/ui/AccessRestricted';
import { invitesApi } from '../api/invites';
import { useDialogAccessibility } from '../hooks/useDialogAccessibility';

const DEPTS = ['All', 'Engineering', 'Design', 'Product', 'QA', 'Infrastructure', 'Management', 'Executive', 'Human Resources'];
const ROLE_DEPTS = ['Engineering', 'Design', 'Product', 'QA', 'Infrastructure', 'Management', 'Executive', 'Human Resources'];
const INVITE_ROLES = [
  { value: 'employee', label: 'Employee',  desc: 'Can log hours and submit timesheets' },
  { value: 'manager',  label: 'Manager',   desc: 'Can approve timesheets and view reports' },
  { value: 'admin',    label: 'Admin',     desc: 'Full access to all features' },
] as const;

// ─── Invite Modal ──────────────────────────────────────────────────────────────
const InviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const dialogRef = useRef<HTMLElement>(null);
	useDialogAccessibility(dialogRef, onClose);
  const [email, setEmail]         = useState('');
  const [role, setRole]           = useState<'employee' | 'manager' | 'admin'>('employee');
  const [dept, setDept]           = useState('Engineering');
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    setLoading(true);
    try {
      const res = await invitesApi.create({ email: email.trim(), role, department: dept });
      setInviteUrl(res.inviteUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="invite-modal__backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="invite-modal-title" tabIndex={-1} className="invite-modal__dialog">
        {/* Header */}
        <div className="invite-modal__header">
          <div>
            <div className="invite-modal__title-row">
              <div className="invite-modal__icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.6">
                  <path d="M8 1v14M1 8h14"/>
                </svg>
              </div>
              <h2 id="invite-modal-title" className="invite-modal__title">Invite Team Member</h2>
            </div>
            <p className="invite-modal__subtitle">Send a role-specific invite link</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invite dialog"
            className="invite-modal__close-btn"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 2l12 12M14 2L2 14"/>
            </svg>
          </button>
        </div>

        {inviteUrl ? (
          /* ── Success state ── */
          <div>
            <div className="invite-modal__success-banner">
              <div className="invite-modal__success-emoji">🎉</div>
              <div>
                <div className="invite-modal__success-title">Invite link created!</div>
                <div className="invite-modal__success-sub">Share this link with {email}. It expires in 48 hours.</div>
              </div>
            </div>

            <div className="invite-modal__link-group">
              <div className="invite-modal__link-label">Invite Link</div>
              <div className="invite-modal__link-box">
                <div className="invite-modal__link-url">
                  {inviteUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`invite-modal__copy-btn${copied ? ' invite-modal__copy-btn--copied' : ''}`}
                >
                  {copied ? (
                    <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8l4 4 8-8"/></svg> Copied!</>
                  ) : (
                    <><svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M3 11V3a1 1 0 011-1h8"/></svg> Copy Link</>
                  )}
                </button>
              </div>
            </div>

            <div className="invite-modal__actions">
              <button
                type="button"
                onClick={() => { setInviteUrl(''); setEmail(''); }}
                className="invite-modal__btn-secondary"
              >
                Invite Another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="invite-modal__btn-done"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleCreate}>
            <div className="form-group invite-modal__field">
              <label className="form-group__label" htmlFor="invite-email">Email address <span className="invite-modal__required">*</span></label>
              <input
                className="form-group__input"
                type="email"
                id="invite-email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@timeflow.com"
                autoFocus
              />
            </div>

            <fieldset className="form-group invite-modal__fieldset">
              <legend className="form-group__label">Role <span className="invite-modal__required">*</span></legend>
              <div className="invite-modal__role-list">
                {INVITE_ROLES.map(r => (
                  <label
                    key={r.value}
                    className={`invite-modal__role-option${role === r.value ? ' invite-modal__role-option--active' : ''}`}
                  >
                    <input
                      type="radio" name="invite-role" value={r.value}
                      checked={role === r.value}
                      onChange={() => setRole(r.value)}
                      className="invite-modal__role-radio"
                    />
                    <div>
                      <div className="invite-modal__role-label">{r.label}</div>
                      <div className="invite-modal__role-desc">{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-group invite-modal__field--lg">
              <label className="form-group__label" htmlFor="invite-department">Department <span className="invite-modal__required">*</span></label>
              <select
                className="form-group__select"
                id="invite-department"
                value={dept}
                onChange={e => setDept(e.target.value)}
              >
                {ROLE_DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {error && (
              <p role="alert" className="invite-modal__error">{error}</p>
            )}

            <div className="invite-modal__actions">
              <button
                type="button" onClick={onClose}
                className="invite-modal__btn-secondary"
              >Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className="invite-modal__btn-submit"
              >
                {loading ? 'Creating link…' : (
                  <><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M13 4l-5 5-2-2M8 14A6 6 0 108 2"/></svg>Generate Invite Link</>
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export const Employees: React.FC = () => {
  const { role } = useAppStore();
  const updateEmployeeMutation = useUpdateEmployee();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [confirmModalTarget, setConfirmModalTarget] = useState<{ id: string; name: string; isRowDisabled: boolean } | null>(null);
  const pageSize = 10;

  const { data: employeesData = [], isLoading, isFetching, isError, refetch } = useEmployees({
    search: search || undefined,
    department: dept === 'All' ? undefined : dept,
  });

  const employees = Array.isArray(employeesData) ? employeesData : [];

  const filtered = React.useMemo(() => {
    return [...employees].sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [employees]);
  const paginated = viewMode === 'list' ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

  const deptTabs = React.useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e: any) => { if (e.department) depts.add(e.department); });
    DEPTS.forEach(d => { if (d !== 'All') depts.add(d); });
    return ['All', ...Array.from(depts).sort()];
  }, [employees]);

  if (role !== 'manager' && role !== 'admin' && role !== 'ceo' && role !== 'hr') {
    return <AccessRestricted />;
  }

  if (isLoading && employees.length === 0 && !search) {
    return (
      <div className="page-inner employees__loading">
        <div className="employees__loading-header">
          <div>
            <Skeleton width="180px" height="2rem" className="employees__loading-title" />
            <Skeleton width="280px" height="0.875rem" />
          </div>
          <Skeleton width="130px" height="2.25rem" borderRadius="0.5rem" />
        </div>
        <TableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  if (isError && employees.length === 0) {
    return (
      <div className="page-inner">
        <EmptyState
          icon="error"
          title="Failed to load team members"
          subtitle="An error occurred while connecting to the server. Check your connection and try again."
          action={{ label: isFetching ? 'Retrying…' : 'Try again', onClick: () => void refetch() }}
        />
      </div>
    );
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Employees</h1>
            <div className="page-header__subtitle">
              {employees.length} team members
            </div>
          </div>
          <div className="employees__header-actions">
            <button
              type="button"
              className="btn btn--ghost btn--sm employees__invite-btn"
              onClick={() => setShowInviteModal(true)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M1 8.5A5.5 5.5 0 0112 5M8 1l2.5 2.5L8 6"/>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 11v2M11 12h2"/>
              </svg>
              Invite Member
            </button>
            {(role === 'admin' || role === 'manager' || role === 'hr') && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => setShowCreateModal(true)}
              >
                + Add Employee
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search + Dept Tabs */}
      <div className="employees__toolbar">
        <div className="employees__search">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5"/><path d="M10.5 10.5L14 14"/>
          </svg>
          <input aria-label="Search employees" type="search" placeholder="Search employees…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="employees__toolbar-right">
          <div className="employees__view-toggle" role="group" aria-label="Employee display mode">
            <button type="button" aria-label="List view" aria-pressed={viewMode === 'list'} className={`employees__view-btn${viewMode === 'list' ? ' employees__view-btn--active' : ''}`} onClick={() => setViewMode('list')} title="List View">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 4h13M1.5 8h13M1.5 12h13"/></svg>
            </button>
            <button type="button" aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={`employees__view-btn${viewMode === 'grid' ? ' employees__view-btn--active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="employees__dept-tabs" role="group" aria-label="Filter employees by department">
        {deptTabs.map(d => (
          <button
            type="button"
            key={d}
            aria-pressed={dept === d}
            className={`employees__dept-tab${dept === d ? ' employees__dept-tab--active' : ''}`}
            onClick={() => { setDept(d); setPage(1); }}
          >{d}</button>
        ))}
      </div>

      {viewMode === 'list' ? (
        <div className="data-table--card">
          <table className="data-table">
            <caption className="sr-only">Employees and weekly timesheet summary</caption>
            <thead>
              <tr>
                <th scope="col">Employee</th>
                <th scope="col">Department</th>
                <th scope="col">Status</th>
                <th scope="col">Projects</th>
                <th scope="col">Week Hours</th>
                <th scope="col" className="employees__th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row: any) => (
                <tr key={row.id}>
                  <td>
                    <div className="employees__employee-cell">
                      <Avatar initials={row.initials} color={row.color} size="md" />
                      <div>
                        <div className="employees__employee-name">
                          {row.name}
                        </div>
                        {row.designation && (
                          <div className="employees__employee-designation">{row.designation}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="employees__dept-cell-role">
                      {row.department || 'General'}
                    </div>
                  </td>
                  <td><Badge variant={statusVariant(row.status as any)} dot>{row.status}</Badge></td>
                  <td className="employees__td-left">{row.projectCount || 0}</td>
                  <td className="employees__td-bold">{row.weekHours || 0}h</td>
                  <td className="employees__td-right">
                    <div className="employees__row-actions">
                      {role === 'admin' && (
                        <button
                          type="button"
                          className={`employees__status-btn ${row.status === 'Disabled' ? 'employees__status-btn--enable' : 'employees__status-btn--disable'}`}
                          disabled={updateEmployeeMutation.isPending}
                          onClick={() => {
                            setConfirmModalTarget({
                              id: row.id,
                              name: row.name,
                              isRowDisabled: row.status === 'Disabled'
                            });
                          }}
                        >
                          {row.status === 'Disabled' ? 'Enable' : 'Disable'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="employees__empty-cell">
                    <EmptyState
                      icon="users"
                      title="No employees found"
                      subtitle="No team members match your search or department filter."
                      compact
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            currentPage={page}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <div>
          <div className="employees__card-grid">
            {paginated.map((row: any) => (
              <div className="employees__card" key={row.id}>
                <div className="employees__card-avatar-wrap">
                  <Avatar initials={row.initials} color={row.color} size="lg" />
                </div>
                <div className="employees__card-name">
                  {row.name}
                </div>
                <div className="employees__card-role">{row.designation || row.department || 'Team Member'}</div>
                <div className="employees__card-footer">
                  <div className="employees__card-hours">
                    <div>Hours: <strong>{row.weekHours || 0}h</strong></div>
                  </div>
                  {role === 'admin' && (
                    <button
                      type="button"
                      className={`employees__status-btn employees__status-btn--sm ${row.status === 'Disabled' ? 'employees__status-btn--enable' : 'employees__status-btn--disable'}`}
                      disabled={updateEmployeeMutation.isPending}
                      onClick={() => {
                        setConfirmModalTarget({
                          id: row.id,
                          name: row.name,
                          isRowDisabled: row.status === 'Disabled'
                        });
                      }}
                    >
                      {row.status === 'Disabled' ? 'Enable' : 'Disable'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="employees__empty-grid">
                <EmptyState
                  icon="users"
                  title="No employees found"
                  subtitle="No team members match your search or department filter."
                />
              </div>
            )}
          </div>
        </div>
      )}
      {showCreateModal && <CreateEmployeeModal onClose={() => setShowCreateModal(false)} />}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {confirmModalTarget && (
        <ConfirmModal
          title={`${confirmModalTarget.isRowDisabled ? 'Enable' : 'Disable'} Employee`}
          message={`Are you sure you want to ${confirmModalTarget.isRowDisabled ? 'enable' : 'disable'} ${confirmModalTarget.name}? ${!confirmModalTarget.isRowDisabled ? 'They will be unable to log timesheets or submit tasks.' : 'They will regain access to log timesheets.'}`}
          confirmText={confirmModalTarget.isRowDisabled ? 'Enable' : 'Disable'}
          cancelText="Cancel"
          onConfirm={() => {
            updateEmployeeMutation.mutate({
              id: confirmModalTarget.id,
              data: { status: confirmModalTarget.isRowDisabled ? 'Active' : 'Disabled' }
            });
            setConfirmModalTarget(null);
          }}
          onCancel={() => setConfirmModalTarget(null)}
        />
      )}
    </div>
  );
};
