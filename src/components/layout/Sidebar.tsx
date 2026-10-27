import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useApprovals } from '../../hooks/useApprovals';
import { Avatar } from '../ui/Avatar';

const IconDashboard = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2"/>
  </svg>
);
const IconFolder = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1.5 4.5A1.5 1.5 0 013 3h3.5l1.5 1.5H13A1.5 1.5 0 0114.5 6v6A1.5 1.5 0 0113 13.5H3A1.5 1.5 0 011.5 12V4.5z"/>
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M11 13v-1a3 3 0 00-3-3H5a3 3 0 00-3 3v1"/><circle cx="6.5" cy="5" r="2.5"/>
    <path d="M14 13v-1a3 3 0 00-2-2.83"/><path d="M10.5 2.17A2.5 2.5 0 0112.5 4.5"/>
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2.5 8l4 4 7-7"/>
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M1.5 12.5L5 8l3.5 3L12 5l3 2"/>
    <path d="M1.5 14.5h13"/>
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="2.5"/>
    <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.4 3.4l.85.85M11.75 11.75l.85.85M3.4 12.6l.85-.85M11.75 4.25l.85-.85"/>
  </svg>
);

interface NavItemDef {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { role, currentUser, isSidebarCollapsed, toggleSidebar } = useAppStore();
  const { data: approvals = [] } = useApprovals();
  const isElevatedRole = role === 'manager' || role === 'admin' || role === 'hr' || role === 'ceo';
  const canViewApprovals = role === 'manager' || role === 'hr' || role === 'ceo';
  const canViewReports = true;
  const pendingApprovalsCount = canViewApprovals ? approvals.filter((a: { status: string }) => a.status === 'Pending').length : 0;
  const closeMobileNavigation = () => {
    if (window.matchMedia('(max-width: 64rem)').matches && !isSidebarCollapsed) {
      toggleSidebar();
    }
  };

  const mainNav: NavItemDef[] = [
    { to: '/dashboard', icon: <IconDashboard />, label: 'Dashboard' },
    { to: '/work-logs',  icon: <IconClock />,    label: 'Work Logs' },
    { to: '/projects',   icon: <IconFolder />,   label: 'Projects' },
  ];

  const manageNav: NavItemDef[] = [
    ...(isElevatedRole ? [{ to: '/employees', icon: <IconUsers />, label: 'Employees' }] : []),
    ...(canViewApprovals ? [{ to: '/approvals', icon: <IconCheck />, label: 'Approvals', badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined }] : []),
    ...(canViewReports ? [{ to: '/reports',   icon: <IconChart />, label: 'Reports'   }] : []),
  ];


  const systemNav: NavItemDef[] = [
    { to: '/settings', icon: <IconSettings />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar${isSidebarCollapsed ? ' sidebar--collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar__logo">
        {isSidebarCollapsed ? (
          <button
            type="button"
            className="sidebar__logo-mark"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo-only.svg`}
              alt="TimeFlow"
            />
          </button>
        ) : (
          <Link to="/dashboard" className="sidebar__logo-link" title="TimeFlow Dashboard">
            <img
              src={`${import.meta.env.BASE_URL}logo-with-name.png`}
              alt="TimeFlow"
              className="sidebar__logo-img"
            />
          </Link>
        )}
        {!isSidebarCollapsed && (
          <button type="button" className="sidebar__logo-toggle" onClick={toggleSidebar} aria-label="Collapse sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 20, height: 20 }}>
              <rect x="3" y="4" width="18" height="16" rx="2.5" />
              <path d="M9 4v16" />
              <path d="m16 9-3 3 3 3" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav — takes all available space and scrolls */}
      <nav className="sidebar__nav" aria-label="Primary navigation">
        <div className="sidebar__section-label">Main</div>
        {mainNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileNavigation}
            title={isSidebarCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <span className="sidebar__nav-item-icon">{item.icon}</span>
            <span className="sidebar__nav-item-label">{item.label}</span>
            {item.badge && <span className="sidebar__nav-item-badge">{item.badge}</span>}
          </NavLink>
        ))}

        {manageNav.length > 0 && (
          <>
            <div className="sidebar__section-label">Manage</div>
            {manageNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileNavigation}
                title={isSidebarCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
                }
              >
                <span className="sidebar__nav-item-icon">{item.icon}</span>
                <span className="sidebar__nav-item-label">{item.label}</span>
                {item.badge && <span className="sidebar__nav-item-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </>
        )}

        <div className="sidebar__section-label">System</div>
        {systemNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileNavigation}
            title={isSidebarCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <span className="sidebar__nav-item-icon">{item.icon}</span>
            <span className="sidebar__nav-item-label">{item.label}</span>
          </NavLink>
        ))}

      </nav>

      {/* Footer — user profile card */}
      <div className="sidebar__footer">
        <Link 
          className="sidebar__user-card" 
          to="/settings"
          title="Go to Settings"
        >
          <Avatar src={currentUser.avatar} initials={currentUser.initials} color={currentUser.color} size="md" />
          {!isSidebarCollapsed && (
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{currentUser.name}</div>
              <div className="sidebar__user-role">{currentUser.designation}</div>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
