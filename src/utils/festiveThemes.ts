/**
 * Date-based festive themes for the dashboard banners.
 *
 * To add or adjust a theme:
 *  1. Add an entry to FESTIVE_THEMES (dates + colours).
 *  2. Add a matching illustration in components/ui/FestiveBannerArt.tsx (ART map).
 * Nothing else needs to change.
 *
 * `dates` accepts:
 *  - "MM-DD"      recurring every year (fixed-date holidays)
 *  - "YYYY-MM-DD" a single specific day (movable festivals, e.g. Diwali, Holi)
 *
 * Dates are matched against the user's local calendar day, the same
 * `new Date()` local-time basis the dashboards use for greetings and week ranges.
 *
 * Colours: dark gradients (`bgFrom/bgMid/bgTo`) with light banner text (see festive-banner.less);
 * `ink` is the eyebrow label colour and must be light enough (4.5:1) on the dark tones.
 */

export type FestiveThemeId =
  | 'newyear'
  | 'republic'
  | 'holi'
  | 'independence'
  | 'diwali'
  | 'blackfriday'
  | 'christmas';

export interface FestiveTheme {
  id: FestiveThemeId;
  /** Human readable name (used for the screen-reader-free decorative label). */
  label: string;
  dates: string[];
  /** Optional computed rule for days that follow a pattern (e.g. "4th Thursday + 1"). */
  rule?: (date: Date) => boolean;
  bgFrom: string;
  bgMid: string;
  bgTo: string;
  border: string;
  /** Accent bar / left border colour. */
  accent: string;
  /** Eyebrow text colour (must pass 4.5:1 on the light gradient). */
  ink: string;
}

/** Black Friday = the day after the 4th Thursday of November (US Thanksgiving). */
function isBlackFriday(date: Date): boolean {
  if (date.getMonth() !== 10 || date.getDay() !== 5) return false;
  // Friday's date; Thanksgiving is the previous day, which must be the 4th Thursday (22–28).
  const thanksgiving = date.getDate() - 1;
  return thanksgiving >= 22 && thanksgiving <= 28;
}

export const FESTIVE_THEMES: FestiveTheme[] = [
  {
    id: 'newyear',
    label: 'New Year',
    dates: ['01-01'],
    bgFrom: '#1e1b4b',
    bgMid: '#312e81',
    bgTo: '#581c87',
    border: '#4c1d95',
    accent: '#a78bfa',
    ink: '#c4b5fd',
  },
  {
    id: 'republic',
    label: 'Republic Day',
    dates: ['01-26'],
    bgFrom: '#7c2d12',
    bgMid: '#1e293b',
    bgTo: '#14532d',
    border: '#9a3412',
    accent: '#fb923c',
    ink: '#fdba74',
  },
  {
    id: 'holi',
    label: 'Holi',
    dates: ['2026-03-04', '2027-03-22', '2028-03-11', '2029-03-01', '2030-03-20'],
    bgFrom: '#831843',
    bgMid: '#581c87',
    bgTo: '#155e75',
    border: '#9d174d',
    accent: '#f472b6',
    ink: '#fbcfe8',
  },
  {
    id: 'independence',
    label: 'Independence Day',
    dates: ['08-15'],
    bgFrom: '#7c2d12',
    bgMid: '#1e293b',
    bgTo: '#14532d',
    border: '#166534',
    accent: '#4ade80',
    ink: '#bbf7d0',
  },
  {
    id: 'diwali',
    label: 'Diwali',
    // Main Diwali day; extend this list when adding future years.
    dates: ['2026-11-08', '2027-10-29', '2028-10-17', '2029-11-05', '2030-10-26'],
    bgFrom: '#451a03',
    bgMid: '#78350f',
    bgTo: '#9a3412',
    border: '#b45309',
    accent: '#fbbf24',
    ink: '#fde68a',
  },
  {
    id: 'blackfriday',
    label: 'Black Friday',
    dates: [],
    // Computed each year (see isBlackFriday).
    rule: isBlackFriday,
    bgFrom: '#020617',
    bgMid: '#0f172a',
    bgTo: '#1e293b',
    border: '#334155',
    accent: '#facc15',
    ink: '#fde047',
  },
  {
    id: 'christmas',
    label: 'Christmas',
    dates: ['12-24', '12-25'],
    bgFrom: '#052e16',
    bgMid: '#14532d',
    bgTo: '#7f1d1d',
    border: '#166534',
    accent: '#f87171',
    ink: '#bbf7d0',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar keys for a date: ["YYYY-MM-DD", "MM-DD"]. */
function dateKeys(date: Date): [string, string] {
  const mmdd = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return [`${date.getFullYear()}-${mmdd}`, mmdd];
}

export function getFestiveTheme(date: Date = new Date()): FestiveTheme | null {
  const keys = dateKeys(date);
  return (
    FESTIVE_THEMES.find(
      (theme) => theme.dates.some((d) => keys.includes(d)) || theme.rule?.(date),
    ) ?? null
  );
}

/**
 * Dev-only preview: open the dashboard with `?festive=diwali` to force a theme.
 * Stripped from production builds (import.meta.env.DEV is false there).
 */
export function getFestivePreviewOverride(): FestiveTheme | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const id = new URLSearchParams(window.location.search).get('festive');
  return FESTIVE_THEMES.find((t) => t.id === id) ?? null;
}

export function resolveFestiveTheme(date: Date = new Date()): FestiveTheme | null {
  return getFestivePreviewOverride() ?? getFestiveTheme(date);
}

