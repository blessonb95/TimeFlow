import React, { useId, useMemo } from 'react';
import {
  resolveFestiveTheme,
  type FestiveTheme,
  type FestiveThemeId,
} from '../../utils/festiveThemes';

/**
 * Shared festive treatment for the dashboard banners (employee, manager, admin).
 *
 * Usage:
 *   const festive = useFestiveBanner();
 *   <section className={`dashboard__week-hero${festive.className}`} style={festive.style} {...festive.dataAttrs}>
 *     ...existing banner content...
 *     <FestiveBannerArt theme={festive.theme} />
 *   </section>
 *
 * On regular days `theme` is null, `className` is '' and nothing is rendered,
 * so the banner keeps its original blue gradient and layout.
 * Colours/dates live in utils/festiveThemes.ts; the layout/responsive rules
 * live once in styles/components/festive-banner.less.
 */
export function useFestiveBanner() {
  const theme = useMemo(() => resolveFestiveTheme(), []);

  return useMemo(() => {
    if (!theme) {
      return {
        theme: null as FestiveTheme | null,
        className: '',
        style: undefined as React.CSSProperties | undefined,
        dataAttrs: {} as { 'data-festive'?: string },
      };
    }
    return {
      theme,
      className: ' dashboard__festive',
      style: {
        '--festive-from': theme.bgFrom,
        '--festive-mid': theme.bgMid,
        '--festive-to': theme.bgTo,
        '--festive-border': theme.border,
        '--festive-accent': theme.accent,
        '--festive-ink': theme.ink,
      } as React.CSSProperties,
      dataAttrs: { 'data-festive': theme.id },
    };
  }, [theme]);
}

type ArtProps = { uid: string };

// ── 3D-style illustrations (self-contained inline SVG, 200×200 viewBox) ─────────

const DiwaliArt: React.FC<ArtProps> = ({ uid }) => (
  <>
    <defs>
      <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fde047" stopOpacity="0.75" />
        <stop offset="1" stopColor="#fde047" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${uid}-bowl`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f59e0b" />
        <stop offset="0.55" stopColor="#c2410c" />
        <stop offset="1" stopColor="#7c2d12" />
      </linearGradient>
      <linearGradient id={`${uid}-rim`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fbbf24" />
        <stop offset="0.5" stopColor="#fde68a" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
      <radialGradient id={`${uid}-flame`} cx="50%" cy="70%" r="60%">
        <stop offset="0" stopColor="#fffbeb" />
        <stop offset="0.45" stopColor="#fde047" />
        <stop offset="1" stopColor="#f97316" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="82" r="62" fill={`url(#${uid}-glow)`} />
    <ellipse cx="100" cy="172" rx="62" ry="9" fill="#92400e" opacity="0.18" />
    <path d="M34 112 Q100 96 166 112 Q160 160 100 168 Q40 160 34 112Z" fill={`url(#${uid}-bowl)`} />
    <ellipse cx="100" cy="111" rx="66" ry="14" fill={`url(#${uid}-rim)`} />
    <ellipse cx="100" cy="112" rx="52" ry="9" fill="#9a3412" />
    <path d="M52 124 Q70 146 100 150" fill="none" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" opacity="0.45" />
    <rect x="97" y="96" width="6" height="16" rx="3" fill="#7c2d12" />
    <g className="festive-art__flame">
      <path d="M100 52 C112 68 116 80 108 92 C104 98 96 98 92 92 C84 80 88 68 100 52Z" fill={`url(#${uid}-flame)`} />
      <path d="M100 74 C105 82 106 88 100 93 C94 88 95 82 100 74Z" fill="#fff7ed" opacity="0.9" />
    </g>
    <g className="festive-art__twinkle" fill="#f59e0b">
      <path d="M160 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
      <path d="M38 52 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
      <circle cx="170" cy="96" r="3" />
      <circle cx="28" cy="94" r="2.5" />
    </g>
  </>
);

const NewYearArt: React.FC<ArtProps> = ({ uid }) => {
  const balloon = (id: string, a: string, b: string) => (
    <radialGradient id={`${uid}-${id}`} cx="35%" cy="30%" r="75%">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
      <stop offset="0.25" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </radialGradient>
  );
  return (
    <>
      <defs>
        {balloon('b1', '#a78bfa', '#5b21b6')}
        {balloon('b2', '#f9a8d4', '#be185d')}
        {balloon('b3', '#7dd3fc', '#0369a1')}
      </defs>
      <ellipse cx="100" cy="184" rx="58" ry="7" fill="#4c1d95" opacity="0.12" />
      <g fill="none" stroke="#6b7280" strokeWidth="1.5" opacity="0.7">
        <path d="M62 112 Q80 150 100 182" />
        <path d="M100 118 Q100 150 100 182" />
        <path d="M140 108 Q122 150 100 182" />
      </g>
      <ellipse cx="62" cy="76" rx="30" ry="36" fill={`url(#${uid}-b1)`} />
      <path d="M58 110 l4 7 4 -7z" fill="#5b21b6" />
      <ellipse cx="100" cy="88" rx="32" ry="38" fill={`url(#${uid}-b2)`} />
      <path d="M96 124 l4 7 4 -7z" fill="#be185d" />
      <ellipse cx="140" cy="72" rx="28" ry="34" fill={`url(#${uid}-b3)`} />
      <path d="M136 104 l4 7 4 -7z" fill="#0369a1" />
      <g className="festive-art__twinkle" fill="#a855f7">
        <path d="M168 28 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path d="M24 32 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        <circle cx="176" cy="120" r="3" />
      </g>
      {/* Confetti + party streamers for a clear celebration cue */}
      <g opacity="0.95">
        <rect x="30" y="58" width="8" height="3" rx="1.5" fill="#fbbf24" transform="rotate(30 34 60)" />
        <rect x="166" y="70" width="8" height="3" rx="1.5" fill="#34d399" transform="rotate(-25 170 72)" />
        <rect x="14" y="120" width="7" height="3" rx="1.5" fill="#f472b6" transform="rotate(60 17 121)" />
        <rect x="108" y="22" width="8" height="3" rx="1.5" fill="#60a5fa" transform="rotate(-40 112 24)" />
        <rect x="182" y="150" width="7" height="3" rx="1.5" fill="#fbbf24" transform="rotate(20 185 151)" />
        <circle cx="46" cy="18" r="2.5" fill="#f472b6" />
        <circle cx="152" cy="14" r="2.5" fill="#34d399" />
        <path d="M18 168 q10 -14 20 0 t20 0" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M146 176 q10 -14 20 0 t20 0" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </>
  );
};

const FlagArt: React.FC<ArtProps> = ({ uid }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-s`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fdba74" />
        <stop offset="1" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id={`${uid}-w`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
      <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4ade80" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
      <linearGradient id={`${uid}-pole`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f1f5f9" />
        <stop offset="1" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0.12" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.18" />
        <stop offset="1" stopColor="#000" stopOpacity="0.14" />
      </linearGradient>
    </defs>
    <ellipse cx="62" cy="186" rx="40" ry="6" fill="#0f172a" opacity="0.15" />
    <rect x="54" y="34" width="7" height="150" rx="3.5" fill={`url(#${uid}-pole)`} />
    <circle cx="57.5" cy="30" r="7" fill="#fbbf24" />
    <circle cx="55.5" cy="28" r="2.5" fill="#fef3c7" />
    <g className="festive-art__wave">
      <path d="M61 42 Q95 32 125 44 T186 44 L186 78 Q156 90 125 78 T61 78Z" fill={`url(#${uid}-s)`} />
      <path d="M61 78 Q95 68 125 78 T186 78 L186 112 Q156 124 125 112 T61 112Z" fill={`url(#${uid}-w)`} />
      <path d="M61 112 Q95 102 125 112 T186 112 L186 146 Q156 158 125 146 T61 146Z" fill={`url(#${uid}-g)`} />
      <path d="M61 42 Q95 32 125 44 T186 44 L186 146 Q156 158 125 146 T61 146Z" fill={`url(#${uid}-shade)`} />
      <circle cx="124" cy="95" r="12" fill="none" stroke="#1e3a8a" strokeWidth="2" />
      <circle cx="124" cy="95" r="2.5" fill="#1e3a8a" />
      <g stroke="#1e3a8a" strokeWidth="1">
        <path d="M124 83v24M112 95h24M115.5 86.5l17 17M132.5 86.5l-17 17" />
      </g>
    </g>
  </>
);

const HoliArt: React.FC<ArtProps> = ({ uid }) => {
  const mound = (id: string, a: string, b: string) => (
    <radialGradient id={`${uid}-${id}`} cx="40%" cy="30%" r="80%">
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </radialGradient>
  );
  return (
    <>
      <defs>
        {mound('m1', '#f9a8d4', '#be185d')}
        {mound('m2', '#fde047', '#d97706')}
        {mound('m3', '#67e8f9', '#0e7490')}
        {mound('m4', '#c4b5fd', '#6d28d9')}
        <linearGradient id={`${uid}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="176" rx="76" ry="9" fill="#831843" opacity="0.15" />
      <ellipse cx="100" cy="150" rx="82" ry="24" fill={`url(#${uid}-plate)`} />
      <ellipse cx="100" cy="146" rx="72" ry="18" fill="#fff7ed" opacity="0.7" />
      <path d="M40 146 Q52 98 64 146Z" fill={`url(#${uid}-m4)`} />
      <path d="M62 148 Q80 82 98 148Z" fill={`url(#${uid}-m1)`} />
      <path d="M96 148 Q116 90 136 148Z" fill={`url(#${uid}-m2)`} />
      <path d="M132 146 Q146 100 160 146Z" fill={`url(#${uid}-m3)`} />
      <g className="festive-art__twinkle">
        <circle cx="46" cy="64" r="6" fill="#ec4899" />
        <circle cx="160" cy="52" r="7" fill="#06b6d4" />
        <circle cx="108" cy="40" r="5" fill="#f59e0b" />
        <circle cx="176" cy="100" r="4" fill="#8b5cf6" />
        <circle cx="24" cy="110" r="4" fill="#facc15" />
        <circle cx="82" cy="58" r="3" fill="#8b5cf6" />
      </g>
    </>
  );
};

const ChristmasArt: React.FC<ArtProps> = ({ uid }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-t1`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4ade80" />
        <stop offset="1" stopColor="#166534" />
      </linearGradient>
      <linearGradient id={`${uid}-t2`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#22c55e" />
        <stop offset="1" stopColor="#14532d" />
      </linearGradient>
      <linearGradient id={`${uid}-trunk`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#b45309" />
        <stop offset="1" stopColor="#78350f" />
      </linearGradient>
      <radialGradient id={`${uid}-orb`} cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
        <stop offset="0.3" stopColor="#f87171" />
        <stop offset="1" stopColor="#b91c1c" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="186" rx="52" ry="7" fill="#052e16" opacity="0.18" />
    <rect x="90" y="156" width="20" height="26" rx="3" fill={`url(#${uid}-trunk)`} />
    <path d="M100 82 L152 146 Q100 160 48 146Z" fill={`url(#${uid}-t2)`} />
    <path d="M100 54 L142 108 Q100 122 58 108Z" fill={`url(#${uid}-t1)`} />
    <path d="M100 28 L132 72 Q100 84 68 72Z" fill={`url(#${uid}-t2)`} />
    <path d="M100 18 l5 11 12 1.5 -9 8 3 12 -11 -6.5 -11 6.5 3 -12 -9 -8 12 -1.5z" fill="#fbbf24" />
    <circle cx="82" cy="104" r="6" fill={`url(#${uid}-orb)`} />
    <circle cx="118" cy="92" r="5" fill="#fde047" />
    <circle cx="96" cy="136" r="6.5" fill={`url(#${uid}-orb)`} />
    <circle cx="128" cy="130" r="5" fill="#93c5fd" />
    <circle cx="72" cy="140" r="4.5" fill="#fde047" />
    <g className="festive-art__twinkle" fill="#dc2626">
      <path d="M170 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
      <path d="M30 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
    </g>
  </>
);

const BlackFridayArt: React.FC<ArtProps> = ({ uid }) => (
  <>
    <defs>
      <linearGradient id={`${uid}-bag`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#475569" />
        <stop offset="0.5" stopColor="#1e293b" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
      <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={`${uid}-tag`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fde047" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <ellipse cx="96" cy="184" rx="58" ry="8" fill="#0f172a" opacity="0.2" />
    <path d="M70 70 C70 36 122 36 122 70" fill="none" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
    <path d="M42 70 H150 L158 176 Q158 182 150 182 H42 Q34 182 34 176Z" fill={`url(#${uid}-bag)`} stroke="#64748b" strokeWidth="1.5" />
    <path d="M42 70 H150 L158 176 Q158 182 150 182 H42 Q34 182 34 176Z" fill={`url(#${uid}-side)`} />
    <path d="M44 78 L40 170" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
    <circle cx="70" cy="70" r="4" fill="#94a3b8" />
    <circle cx="122" cy="70" r="4" fill="#94a3b8" />
    <g className="festive-art__tag" transform="rotate(12 128 128)">
      <path d="M92 100 H150 L164 124 L150 148 H92Z" fill={`url(#${uid}-tag)`} />
      <circle cx="104" cy="124" r="4.5" fill="#1e293b" />
      <text x="116" y="131" fontSize="20" fontWeight="800" fill="#1e293b" fontFamily="system-ui, sans-serif">%</text>
    </g>
    <g className="festive-art__twinkle" fill="#f59e0b">
      <path d="M170 34 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
      <path d="M24 46 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
    </g>
  </>
);

/** Theme id → illustration. Add new themes here. */
const ART: Record<FestiveThemeId, React.FC<ArtProps>> = {
  newyear: NewYearArt,
  republic: FlagArt,
  independence: FlagArt,
  holi: HoliArt,
  diwali: DiwaliArt,
  blackfriday: BlackFridayArt,
  christmas: ChristmasArt,
};

/**
 * Decorative illustration + small occasion label, anchored to the right edge of a
 * `.dashboard__festive` banner. The artwork is aria-hidden and non-interactive; the label
 * names the occasion. Both are hidden on narrow screens (see festive-banner.less).
 */
export const FestiveBannerArt: React.FC<{ theme: FestiveTheme | null }> = ({ theme }) => {
  const uid = useId().replace(/:/g, '');
  if (!theme) return null;
  const Art = ART[theme.id];
  return (
    <div className="festive-art">
      <svg
        className="festive-art__svg"
        viewBox="0 0 200 200"
        focusable="false"
        aria-hidden="true"
      >
        <Art uid={uid} />
      </svg>
      <span className="festive-art__label">{theme.greeting}</span>
    </div>
  );
};

