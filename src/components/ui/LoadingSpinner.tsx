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
  const dimension = size === 'sm' ? (inline ? 16 : 24) : size === 'lg' ? 48 : 36;
  const borderSize = size === 'sm' ? (inline ? 2 : 2.5) : size === 'lg' ? 4 : 3;

  if (inline) {
    return (
      <span className="loading-spinner-inline" role="status" aria-live="polite">
        <span
          className="loading-spinner-circle"
          style={{
            width: dimension,
            height: dimension,
            borderWidth: borderSize,
          }}
        />
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
        <div
          className="loading-spinner-circle"
          style={{
            width: dimension,
            height: dimension,
            borderWidth: borderSize,
          }}
        />
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
