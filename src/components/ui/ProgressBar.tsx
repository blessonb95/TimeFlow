import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  thickness?: 'thin' | 'base' | 'thick';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'blue', thickness }) => {
  const num = Number(value) || 0;
  const safeMax = Number(max) > 0 ? Number(max) : 100;
  const rawPct = (num / safeMax) * 100;
  const pct = num > 0 ? Math.max(2, Math.min(100, Math.round(rawPct))) : 0;
  const cls = `progress${thickness === 'thin' ? ' progress--thin' : thickness === 'thick' ? ' progress--thick' : ''}`;
  return (
    <div className={cls}>
      <div className={`progress__fill progress__fill--${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

interface UtilBarProps { value: number; }
export const UtilBar: React.FC<UtilBarProps> = ({ value }) => {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const tier = safeValue >= 85 ? 'high' : safeValue >= 70 ? 'med' : 'low';
  return (
    <div className="util-bar" role="img" aria-label={`Utilization ${safeValue} percent. Target range is 85 to 100 percent.`} title="Weekly target: 85–100% of a 40-hour week (34–40 hours).">
      <div className="util-bar__track">
        <div className={`util-bar__fill util-bar__fill--${tier}`} style={{ width: `${safeValue}%` }} />
      </div>
      <span className={`util-bar__label util-bar__label--${tier}`}>{safeValue}%</span>
    </div>
  );
};
