import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../../store/useAppStore';
import { EasterEgg } from '../ui/EasterEgg';
import { GuestBanner } from '../ui/GuestBanner';

export const AppLayout: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    window.matchMedia('(max-width: 64rem)').matches,
  );

  useLayoutEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 64rem)');
    const syncSidebarWithViewport = () => {
      setIsMobileViewport(mobileViewport.matches);
      const collapsed = useAppStore.getState().isSidebarCollapsed;
      if (mobileViewport.matches !== collapsed) {
        useAppStore.getState().toggleSidebar();
      }
    };

    syncSidebarWithViewport();
    mobileViewport.addEventListener('change', syncSidebarWithViewport);
    return () => mobileViewport.removeEventListener('change', syncSidebarWithViewport);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || isSidebarCollapsed) return;

    const closeSidebarOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) {
        useAppStore.getState().toggleSidebar();
      }
    };

    window.addEventListener('keydown', closeSidebarOnEscape);
    return () => window.removeEventListener('keydown', closeSidebarOnEscape);
  }, [isMobileViewport, isSidebarCollapsed]);

  return (
    <div className="app-shell">
      <EasterEgg />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar inert={isMobileViewport && isSidebarCollapsed} />
      {!isSidebarCollapsed && isMobileViewport && (
        <button
          type="button"
          className="sidebar-mobile-backdrop"
          onClick={toggleSidebar}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      <div className="main-area">
        <GuestBanner />
        <Topbar />
        <main className="page-content" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
