import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'md',
  fullPage = false,
  inline = false,
}) => {
  const sizeClass = size === 'sm' ? (inline ? 'loading-spinner-circle--sm-inline' : 'loading-spinner-circle--sm') : size === 'lg' ? 'loading-spinner-circle--lg' : 'loading-spinner-circle--md';

  if (inline) {
    return (
      <span className="loading-spinner-inline" role="status" aria-live="polite">
        <span className={`loading-spinner-circle ${sizeClass}`} />
        {message && <span className="loading-spinner-inline-msg">{message}</span>}
      </span>
    );
  }

  return (
    <div
      className={`loading-spinner-container${fullPage ? ' loading-spinner-container--full' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner-wrapper">
        <div className={`loading-spinner-circle ${sizeClass}`} />
        <div className="loading-spinner-glow" />
      </div>
      {message && (
        <span className={`loading-spinner-msg loading-spinner-msg--${size}`}>
          {message}
        </span>
      )}
    </div>
  );
};
