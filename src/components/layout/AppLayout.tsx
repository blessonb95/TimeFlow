import React, { useLayoutEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../../store/useAppStore';
import { EasterEgg } from '../ui/EasterEgg';
import { GuestBanner } from '../ui/GuestBanner';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();

  useLayoutEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 64rem)');
    const syncSidebarWithViewport = () => {
      const collapsed = useAppStore.getState().isSidebarCollapsed;
      if (mobileViewport.matches !== collapsed) {
        useAppStore.getState().toggleSidebar();
      }
    };

    syncSidebarWithViewport();
    mobileViewport.addEventListener('change', syncSidebarWithViewport);
    return () => mobileViewport.removeEventListener('change', syncSidebarWithViewport);
  }, []);

  return (
    <div className="app-shell">
      <EasterEgg />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar />
      {!isSidebarCollapsed && (
        <button
          type="button"
          className="sidebar-mobile-backdrop"
          onClick={toggleSidebar}
          aria-label="Close navigation overlay"
        />
      )}
      <div className="main-area" style={{ position: 'relative' }}>
        <GuestBanner />
        <Topbar />
        <main className="page-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
