/**
 * Shared Chart Components
 * Beautiful, consistent SVG charts used across Dashboard and Reports.
 *
 * Font sizing note: SVG viewBox coordinates (W=800 for LineChart) mean
 * that fontSize="12" in SVG units ≈ 12*(rendered_width/800)px on screen.
 * We use larger SVG font values so they render at readable sizes.
 */
import React, { useState } from 'react';

// ─── Shared constants ─────────────────────────────────────────────────────────
const CC = {
  primary:   '#1e293b',
  secondary: '#64748b',
  warning:   '#f97316',
  danger:    '#ef4444',
  muted:     '#64748b',
  gridLine:  '#f1f5f9',
  label:     '#64748b',
  tooltipBg: '#0f172a',
  tooltipFg: '#f8fafc',
  tooltipSub:'#64748b',
};

function utilColor(pct: number) {
  if (pct >= 85) return CC.secondary;
  if (pct >= 60) return CC.warning;
  return CC.danger;
}

// ─── LINE / AREA CHART ────────────────────────────────────────────────────────
// viewBox: 800 × H  → fontSize 14 ≈ 14px when chart ~800px wide
export interface LinePoint { label: string; value: number; }

export const LineChart: React.FC<{
  data: LinePoint[];
  height?: number;
  color?: string;
  gradientId?: string;
  showArea?: boolean;
  yLabel?: string;
  emptyMsg?: string;
}> = ({
  data,
  height = 200,
  color = CC.primary,
  gradientId = 'lineGrad',
  showArea = true,
  yLabel = '',
  emptyMsg = 'No data available',
}) => {
  const [hov, setHov] = useState<number | null>(null);

  const W = 800, H = height;
  const P = { l: 64, r: 24, t: 28, b: 52 };
  const iW = W - P.l - P.r, iH = H - P.t - P.b;

  if (!data?.length) return (
    <div className="tf-chart__empty" style={{ height }}>
      {emptyMsg}
    </div>
  );

  const maxV = Math.max(...data.map(d => d.value), 1);
  const niceMax = Math.ceil(maxV / 10) * 10 || 10;
  // 5 y-ticks
  const ticks = [0, .25, .5, .75, 1].map(f => Math.round(niceMax * f));

  const pts = data.map((d, i) => ({
    x: P.l + (data.length === 1 ? iW / 2 : i * (iW / (data.length - 1))),
    y: P.t + (1 - d.value / niceMax) * iH,
    ...d,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
  const areaPath = `M${pts[0].x} ${P.t + iH} ${pts.map(p => `L${p.x} ${p.y}`).join(' ')} L${pts[pts.length-1].x} ${P.t + iH}Z`;

  return (
    <div className="tf-chart">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="tf-chart__svg tf-chart__svg--visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid + Y labels */}
        {ticks.map((v, i) => {
          const y = P.t + (1 - v / niceMax) * iH;
          return (
            <g key={i}>
              <line x1={P.l} y1={y} x2={W - P.r} y2={y}
                stroke={CC.gridLine} strokeWidth="1"
                strokeDasharray={v === 0 ? '0' : '4 4'} />
              <text x={P.l - 8} y={y + 4} textAnchor="end"
                fontSize="12" fill={CC.label} fontFamily="inherit">
                {v}{yLabel}
              </text>
            </g>
          );
        })}

        {/* Area */}
        {showArea && <path d={areaPath} fill={`url(#${gradientId})`} />}

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />

        {/* Points + X labels + tooltips */}
        {pts.map((p, i) => {
          const isHov = hov === i;
          // Keep tooltip inside viewBox
          const tipX = Math.min(Math.max(p.x, P.l + 54), W - P.r - 54);
          const tipY = p.y - 52 < P.t ? p.y + 10 : p.y - 52;
          return (
            <g key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              className="tf-chart__point">
              {/* Hover zone */}
              <rect x={p.x - 24} y={P.t} width={48} height={iH} fill="transparent" />
              {/* Guide line */}
              {isHov && <line x1={p.x} y1={P.t} x2={p.x} y2={P.t + iH}
                stroke={color} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />}
              {/* Dot */}
              <circle cx={p.x} cy={p.y} r={isHov ? 5 : 3.5}
                fill="#fff" stroke={color} strokeWidth="2.5"
                className="tf-chart__dot" />
              {/* X label */}
              <text x={p.x} y={H - 12} textAnchor="middle"
                fontSize="12" fill={CC.label} fontFamily="inherit">
                {p.label}
              </text>
              {/* Tooltip */}
              {isHov && (
                <g>
                  <rect x={tipX - 54} y={tipY} width="108" height="42" rx="6" fill={CC.tooltipBg} />
                  <text x={tipX} y={tipY + 16} textAnchor="middle"
                    fontSize="11" fill={CC.tooltipSub} fontFamily="inherit">{p.label}</text>
                  <text x={tipX} y={tipY + 32} textAnchor="middle"
                    fontSize="13" fontWeight="700" fill={CC.tooltipFg} fontFamily="inherit">
                    {p.value}{yLabel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── BAR CHART ────────────────────────────────────────────────────────────────
// viewBox: 700 × H
export interface BarPoint { label: string; value: number; color?: string; }

export const BarChart: React.FC<{
  data: BarPoint[];
  height?: number;
  maxValue?: number;
  showPercent?: boolean;
  emptyMsg?: string;
}> = ({
  data,
  height = 180,
  maxValue,
  showPercent = false,
  emptyMsg = 'No data available',
}) => {
  const [hov, setHov] = useState<number | null>(null);

  const W = 700, H = height;
  const P = { l: 48, r: 20, t: 24, b: 40 };
  const iH = H - P.t - P.b;

  if (!data?.length) return (
    <div className="tf-chart__empty" style={{ height }}>
      {emptyMsg}
    </div>
  );

  const maxV = maxValue ?? Math.max(...data.map(d => d.value), 1);
  const niceMax = showPercent ? 100 : (Math.ceil(maxV / 10) * 10 || 10);
  const yTicks = [0, Math.round(niceMax / 2), niceMax];

  const slotW = (W - P.l - P.r) / data.length;
  const barW = Math.min(56, slotW * 0.55);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="tf-chart__svg">
      <defs>
        {data.map((d, i) => (
          <linearGradient key={i} id={`bG${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.color ?? (showPercent ? utilColor(d.value) : CC.primary)} stopOpacity="1" />
            <stop offset="100%" stopColor={d.color ?? (showPercent ? utilColor(d.value) : CC.primary)} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>

      {yTicks.map((v, i) => {
        const y = P.t + (1 - v / niceMax) * iH;
        return (
          <g key={i}>
            <line x1={P.l} y1={y} x2={W - P.r} y2={y} stroke={CC.gridLine} strokeWidth="1" />
            <text x={P.l - 8} y={y + 4} textAnchor="end" fontSize="12" fill={CC.label} fontFamily="inherit">
              {showPercent ? `${v}%` : v}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const bh = Math.max(3, (d.value / niceMax) * iH);
        const x = P.l + i * slotW + (slotW - barW) / 2;
        const y = P.t + iH - bh;
        const isHov = hov === i;
        const tipX = Math.min(Math.max(x + barW / 2, P.l + 44), W - P.r - 44);
        return (
          <g key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            className="tf-chart__point">
            {/* Track */}
            <rect x={x} y={P.t} width={barW} height={iH} rx="4" fill="#f8fafc" />
            {/* Bar */}
            <rect x={x} y={y} width={barW} height={bh} rx="4"
              fill={`url(#bG${i})`} opacity={isHov ? 1 : 0.85} />
            {/* X label */}
            <text x={x + barW / 2} y={H - 10} textAnchor="middle"
              fontSize="12" fill={CC.label} fontFamily="inherit">{d.label}</text>
            {/* Tooltip */}
            {isHov && (
              <g>
                <rect x={tipX - 36} y={y - 32} width="72" height="26" rx="5" fill={CC.tooltipBg} />
                <text x={tipX} y={y - 15} textAnchor="middle"
                  fontSize="12" fontWeight="700" fill={CC.tooltipFg} fontFamily="inherit">
                  {showPercent ? `${d.value}%` : d.value}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ─── GROUPED BAR CHART (Budget vs Logged) ────────────────────────────────────
// viewBox: 900 × H
export interface GroupedBarPoint { label: string; a: number; b: number; }

export const GroupedBarChart: React.FC<{
  data: GroupedBarPoint[];
  height?: number;
  colorA?: string;
  colorB?: string;
  labelA?: string;
  labelB?: string;
  emptyMsg?: string;
}> = ({
  data,
  height = 220,
  colorA = '#cbd5e1',
  colorB = '#1e293b',
  labelA = 'Budgeted',
  labelB = 'Logged',
  emptyMsg = 'No data available',
}) => {
  const [hov, setHov] = useState<number | null>(null);

  const W = 900, H = height;
  const P = { l: 52, r: 24, t: 24, b: 52 };
  const iH = H - P.t - P.b;

  if (!data?.length) return (
    <div className="tf-chart__empty" style={{ height }}>
      {emptyMsg}
    </div>
  );

  const maxV = Math.max(...data.flatMap(d => [d.a, d.b]), 1);
  const niceMax = Math.ceil(maxV / 50) * 50 || 50;
  const yTicks = [0, .25, .5, .75, 1].map(f => Math.round(niceMax * f));

  const slotW = (W - P.l - P.r) / data.length;
  const barW = Math.min(48, slotW * 0.32);
  const gap = 6;

  // Legend row position
  const legY = H - 10;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="tf-chart__svg">
      <defs>
        <linearGradient id="gbA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorA} stopOpacity="1" />
          <stop offset="100%" stopColor={colorA} stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id="gbB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorB} stopOpacity="1" />
          <stop offset="100%" stopColor={colorB} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {yTicks.map((v, i) => {
        const y = P.t + (1 - v / niceMax) * iH;
        return (
          <g key={i}>
            <line x1={P.l} y1={y} x2={W - P.r} y2={y}
              stroke={CC.gridLine} strokeWidth="1"
              strokeDasharray={v === 0 ? '0' : '4 4'} />
            <text x={P.l - 8} y={y + 4} textAnchor="end"
              fontSize="12" fill={CC.label} fontFamily="inherit">{v}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cx = P.l + i * slotW + slotW / 2;
        const ax = cx - barW - gap / 2;
        const bx = cx + gap / 2;
        const aH = Math.max(3, (d.a / niceMax) * iH);
        const bH = Math.max(3, (d.b / niceMax) * iH);
        const isHov = hov === i;
        const tipX = Math.min(Math.max(cx, P.l + 58), W - P.r - 58);
        return (
          <g key={i}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            className="tf-chart__point">
            {/* Track A */}
            <rect x={ax} y={P.t} width={barW} height={iH} rx="3" fill="#f8fafc" />
            <rect x={ax} y={P.t + iH - aH} width={barW} height={aH} rx="3" fill="url(#gbA)" opacity={isHov ? 1 : 0.85} />
            {/* Track B */}
            <rect x={bx} y={P.t} width={barW} height={iH} rx="3" fill="#f8fafc" />
            <rect x={bx} y={P.t + iH - bH} width={barW} height={bH} rx="3" fill="url(#gbB)" opacity={isHov ? 1 : 0.85} />
            {/* X label */}
            <text x={cx} y={H - P.b + 18} textAnchor="middle"
              fontSize="12" fill={CC.label} fontFamily="inherit">
              {d.label.length > 15 ? d.label.slice(0, 14) + '…' : d.label}
            </text>
            {/* Tooltip */}
            {isHov && (
              <g>
                <rect x={tipX - 60} y={P.t + 4} width="120" height="52" rx="6" fill={CC.tooltipBg} />
                <text x={tipX} y={P.t + 18} textAnchor="middle"
                  fontSize="11" fill={CC.tooltipSub} fontFamily="inherit">
                  {d.label.length > 18 ? d.label.slice(0,17)+'…' : d.label}
                </text>
                <text x={tipX} y={P.t + 33} textAnchor="middle"
                  fontSize="12" fill="#e2e8f0" fontFamily="inherit">{labelA}: {d.a}h</text>
                <text x={tipX} y={P.t + 47} textAnchor="middle"
                  fontSize="12" fontWeight="700" fill={colorB} fontFamily="inherit">{labelB}: {d.b}h</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Legend */}
      <g>
        <rect x={P.l} y={legY - 10} width="10" height="10" rx="2"
          fill={colorA} stroke="#d1d5db" strokeWidth="1" />
        <text x={P.l + 16} y={legY - 1} fontSize="12" fill={CC.label} fontFamily="inherit">{labelA}</text>
        <rect x={P.l + 90} y={legY - 10} width="10" height="10" rx="2" fill={colorB} />
        <text x={P.l + 106} y={legY - 1} fontSize="12" fill={CC.label} fontFamily="inherit">{labelB}</text>
      </g>
    </svg>
  );
};

// ─── HORIZONTAL UTILIZATION BARS ─────────────────────────────────────────────
export interface UtilRow {
  name: string; dept?: string; initials?: string;
  color?: string; pct: number;
}

export const UtilBars: React.FC<{ data: UtilRow[]; emptyMsg?: string }> = ({
  data, emptyMsg = 'No utilization data.',
}) => {
  if (!data?.length) return (
    <div className="util-bars__empty">{emptyMsg}</div>
  );
  return (
    <div className="util-bars">
      {data.map((row, i) => {
        const c = utilColor(row.pct);
        return (
          <div key={i} className="util-bars__row">
            {row.initials && (
              <div className="util-bars__avatar" style={{ background: row.color || CC.primary }}>
                {row.initials}
              </div>
            )}
            <div className="util-bars__info">
              <div className="util-bars__header">
                <span className="util-bars__name">
                  {row.name}
                </span>
                {row.dept && (
                  <span className="util-bars__dept">{row.dept}</span>
                )}
              </div>
              <div className="util-bars__track">
                <div className="util-bars__fill" style={{ width: `${Math.min(100, row.pct)}%`, background: c }} />
              </div>
            </div>
            <span className="util-bars__pct" style={{ color: c }}>
              {row.pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── WEEK BARS (Employee Dashboard) ──────────────────────────────────────────
export interface DayHour { day: string; hours: number; isToday?: boolean; }

export const WeekBars: React.FC<{ data: DayHour[]; targetHours?: number }> = ({
  data, targetHours = 8,
}) => {
  const [hov, setHov] = useState<number | null>(null);
  if (!data?.length) return null;

  const maxH = Math.max(...data.map(d => d.hours), targetHours, 1);

  return (
    <div
      role="img"
      aria-label={`Hours logged by day: ${data.map((d) => `${d.day} ${d.hours} hours`).join(', ')}`}
      className="week-bars"
    >
      {data.map((d, i) => {
        const pct = (d.hours / maxH) * 100;
        const tgtPct = (targetHours / maxH) * 100;
        const col = d.isToday
          ? CC.primary
          : d.hours >= targetHours
            ? CC.secondary
            : d.hours > 0 ? '#818cf8' : '#e2e8f0';
        return (
          <div key={i}
            className="week-bars__col"
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}>
            {/* Tooltip */}
            {hov === i && d.hours > 0 && (
              <div className="week-bars__tooltip">
                {d.hours}h
              </div>
            )}
            <span aria-hidden="true" className="week-bars__val">
              {d.hours > 0 ? `${d.hours}h` : '—'}
            </span>
            {/* Bar track */}
            <div className="week-bars__track">
              {/* Target line */}
              <div className="week-bars__target" style={{ bottom: `${tgtPct}%` }} />
              {/* Fill */}
              <div className="week-bars__fill" style={{ height: `${pct}%`, background: col }} />
            </div>
            {/* Day label */}
            <span aria-hidden="true" className={`week-bars__day ${d.isToday ? 'week-bars__day--today' : ''}`}>
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
};
