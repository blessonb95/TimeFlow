import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useLogout } from '../../hooks/useAuth';
import type { Role } from '../../types';

export const GuestBanner: React.FC = () => {
  const { role, setRole, isGuest } = useAppStore();
  const logout = useLogout();

  if (!isGuest) return null;

  const roles: { id: Role; label: string }[] = [
    { id: 'manager', label: 'Manager' },
    { id: 'employee', label: 'Employee' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <div className="guest-banner" role="status" aria-label="Demo Mode Active">
      <div className="guest-banner__left">
        <span className="guest-banner__badge">
          <span className="guest-banner__pulse" />
          DEMO MODE
        </span>
        <span className="guest-banner__text">
          Exploring TimeFlow with interactive sample data.
        </span>
      </div>

      <div className="guest-banner__actions">
        <div className="guest-banner__roles" role="group" aria-label="Switch Preview Role">
          <span className="guest-banner__roles-label">View as:</span>
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`guest-banner__role-pill${role === r.id ? ' guest-banner__role-pill--active' : ''}`}
              onClick={() => setRole(r.id)}
              title={`Switch dashboard view to ${r.label}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="guest-banner__exit"
          onClick={logout}
          title="Exit Demo Mode and return to sign in"
        >
          Exit Demo
        </button>
      </div>
    </div>
  );
};

