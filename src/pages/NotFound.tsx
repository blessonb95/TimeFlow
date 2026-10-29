import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { authToken } = useAppStore();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(authToken ? '/dashboard' : '/login');
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        {/* Visual 404 Badge */}
        <div className="not-found-illustration">
          <div className="not-found-glow" />
          <div className="not-found-code">404</div>
          <div className="not-found-icon-wrap">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
              <path d="M16 16l3 3" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-desc">
          We couldn't find the page you're looking for. It might have been moved, renamed, or the link might be broken.
        </p>

        {/* Action Buttons */}
        <div className="not-found-actions">
          <Link to={authToken ? '/dashboard' : '/login'} className="btn not-found-btn--primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
            <span>{authToken ? 'Back to Dashboard' : 'Back to Login'}</span>
          </Link>

          <button
            type="button"
            className="btn not-found-btn--secondary"
            onClick={handleGoBack}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13L5 8l5-5" />
            </svg>
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Destinations (if logged in) */}
        {authToken && (
          <div className="not-found-quicklinks">
            <span className="not-found-quicklinks-title">Popular Destinations</span>
            <div className="not-found-links-grid">
              <Link to="/work-logs" className="not-found-link-item">
                <span className="not-found-link-icon">🕒</span>
                <div>
                  <div className="not-found-link-label">Work Logs</div>
                  <div className="not-found-link-sub">Log daily tasks & timesheets</div>
                </div>
              </Link>

              <Link to="/projects" className="not-found-link-item">
                <span className="not-found-link-icon">📁</span>
                <div>
                  <div className="not-found-link-label">Projects</div>
                  <div className="not-found-link-sub">Track active projects & hours</div>
                </div>
              </Link>

              <Link to="/reports" className="not-found-link-item">
                <span className="not-found-link-icon">📊</span>
                <div>
                  <div className="not-found-link-label">Reports</div>
                  <div className="not-found-link-sub">Utilization & export metrics</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        <div className="not-found-footer">
          <span>Need help? Contact your administrator or support team.</span>
        </div>
      </div>
    </div>
  );
};

