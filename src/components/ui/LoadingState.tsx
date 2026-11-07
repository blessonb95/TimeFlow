import React from 'react';

// ─── Shimmer Block ────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '1rem', borderRadius = '0.375rem', className = '', style }) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

// ─── Table Skeleton ───────────────────────────────────────────────────────────
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  title?: string;
}> = ({ rows = 5, columns = 5, title }) => (
  <div className="skeleton-table-card" role="status" aria-label="Loading table data" aria-busy="true">
    {title && (
      <div className="skeleton-table-header">
        <Skeleton width="180px" height="1.5rem" />
        <Skeleton width="120px" height="2rem" borderRadius="0.5rem" />
      </div>
    )}
    <div className="skeleton-table">
      <div className="skeleton-table-head">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${60 + ((i * 17) % 35)}%`} height="0.875rem" />
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="skeleton-table-row">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div key={cIdx} className="skeleton-table-cell">
                {cIdx === 0 ? (
                  <div className="skeleton-table-cell-user">
                    <Skeleton width="2rem" height="2rem" borderRadius="50%" />
                    <div className="skeleton-table-cell-user__info">
                      <Skeleton width="80%" height="0.875rem" />
                      <Skeleton width="50%" height="0.75rem" className="skeleton-table-cell-user__sub" />
                    </div>
                  </div>
                ) : cIdx === columns - 1 ? (
                  <Skeleton width="70px" height="1.5rem" borderRadius="9999px" />
                ) : (
                  <Skeleton width={`${50 + ((rIdx * cIdx * 13) % 45)}%`} height="0.875rem" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Grid Cards Skeleton (for Projects / Employees) ───────────────────────────
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="skeleton-grid" role="status" aria-label="Loading cards" aria-busy="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div className="skeleton-card__top">
          <div className="skeleton-card__head">
            <Skeleton width="2.5rem" height="2.5rem" borderRadius="0.625rem" />
            <div className="skeleton-card__titles">
              <Skeleton width="90%" height="1.125rem" />
              <Skeleton width="55%" height="0.75rem" className="skeleton-card__sub" />
            </div>
          </div>
          <Skeleton width="60px" height="1.25rem" borderRadius="9999px" />
        </div>

        <Skeleton width="100%" height="0.875rem" className="skeleton-card__line1" />
        <Skeleton width="85%" height="0.875rem" className="skeleton-card__line2" />

        <div className="skeleton-card__foot">
          <div className="skeleton-card__foot-row">
            <Skeleton width="80px" height="0.75rem" />
            <Skeleton width="40px" height="0.75rem" />
          </div>
          <Skeleton width="100%" height="0.5rem" borderRadius="9999px" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Dashboard Full Page Skeleton ─────────────────────────────────────────────
export const DashboardSkeleton: React.FC = () => (
  <div className="page-inner skeleton-dashboard" role="status" aria-label="Loading dashboard" aria-busy="true">
    {/* Page Header */}
    <div className="skeleton-dashboard__header">
      <div className="skeleton-dashboard__header-left">
        <Skeleton width="min(220px, 80%)" height="2rem" className="skeleton-dashboard__title" />
        <Skeleton width="min(340px, 100%)" height="1rem" />
      </div>
      <Skeleton width="140px" height="2.5rem" borderRadius="0.5rem" />
    </div>

    {/* Metric Stat Cards */}
    <div className="skeleton-dashboard__metrics">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-dashboard__metric-top">
            <Skeleton width="100px" height="0.875rem" />
            <Skeleton width="2rem" height="2rem" borderRadius="0.5rem" />
          </div>
          <Skeleton width="90px" height="1.875rem" className="skeleton-dashboard__metric-val" />
          <Skeleton width="130px" height="0.75rem" />
        </div>
      ))}
    </div>

    {/* Main Content Split: Chart & Projects */}
    <div className="skeleton-dashboard__split">
      <div className="skeleton-card skeleton-dashboard__panel">
        <div className="skeleton-dashboard__panel-head">
          <Skeleton width="180px" height="1.25rem" />
          <Skeleton width="120px" height="1.75rem" borderRadius="0.375rem" />
        </div>
        <Skeleton width="100%" height="240px" borderRadius="0.5rem" />
      </div>

      <div className="skeleton-card skeleton-dashboard__panel">
        <Skeleton width="150px" height="1.25rem" className="skeleton-dashboard__side-title" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-dashboard__side-item">
            <Skeleton width="2.5rem" height="2.5rem" borderRadius="0.5rem" />
            <div className="skeleton-dashboard__side-info">
              <Skeleton width="80%" height="0.875rem" />
              <Skeleton width="45%" height="0.75rem" className="skeleton-dashboard__side-sub" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Branded Loading Screen (Pulse & Spinner) ──────────────────────────────────
export const LoadingState: React.FC<{
  message?: string;
  hint?: string;
  fullPage?: boolean;
}> = ({
  message = 'Loading data…',
  hint,
  fullPage = false,
}) => (
  <div
    className={`loading-state-wrap${fullPage ? ' loading-state-wrap--full' : ''}`}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <div className="loading-state-box">
      <div className="loading-state-spinner">
        <div className="loading-state-pulse" />
        <div className="loading-state-ring" />
        <div className="loading-state-core">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      </div>

      <h3 className="loading-state-title">{message}</h3>
      {hint && <p className="loading-state-hint">{hint}</p>}
    </div>
  </div>
);

