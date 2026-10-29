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
  <div className="skeleton-table-card">
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Skeleton width="2rem" height="2rem" borderRadius="50%" />
                    <div style={{ flex: 1 }}>
                      <Skeleton width="80%" height="0.875rem" />
                      <Skeleton width="50%" height="0.75rem" style={{ marginTop: '0.25rem' }} />
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
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: '80%' }}>
            <Skeleton width="2.5rem" height="2.5rem" borderRadius="0.625rem" />
            <div style={{ flex: 1 }}>
              <Skeleton width="90%" height="1.125rem" />
              <Skeleton width="55%" height="0.75rem" style={{ marginTop: '0.375rem' }} />
            </div>
          </div>
          <Skeleton width="60px" height="1.25rem" borderRadius="9999px" />
        </div>

        <Skeleton width="100%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="85%" height="0.875rem" style={{ marginBottom: '1.25rem' }} />

        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
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
  <div className="page-inner" style={{ animation: 'fadeIn 0.25s ease' }}>
    {/* Page Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div>
        <Skeleton width="220px" height="2rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="340px" height="1rem" />
      </div>
      <Skeleton width="140px" height="2.5rem" borderRadius="0.5rem" />
    </div>

    {/* Metric Stat Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <Skeleton width="100px" height="0.875rem" />
            <Skeleton width="2rem" height="2rem" borderRadius="0.5rem" />
          </div>
          <Skeleton width="90px" height="1.875rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="130px" height="0.75rem" />
        </div>
      ))}
    </div>

    {/* Main Content Split: Chart & Projects */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
      <div className="skeleton-card" style={{ height: '360px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Skeleton width="180px" height="1.25rem" />
          <Skeleton width="120px" height="1.75rem" borderRadius="0.375rem" />
        </div>
        <Skeleton width="100%" height="240px" borderRadius="0.5rem" />
      </div>

      <div className="skeleton-card" style={{ height: '360px', padding: '1.5rem' }}>
        <Skeleton width="150px" height="1.25rem" style={{ marginBottom: '1.25rem' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
            <Skeleton width="2.5rem" height="2.5rem" borderRadius="0.5rem" />
            <div style={{ flex: 1 }}>
              <Skeleton width="80%" height="0.875rem" />
              <Skeleton width="45%" height="0.75rem" style={{ marginTop: '0.25rem' }} />
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
  <div className={`loading-state-wrap${fullPage ? ' loading-state-wrap--full' : ''}`}>
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

