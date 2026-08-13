/**
 * Historical era definitions for the /map "מפות" tab.
 * Polygons are schematic (lon/lat rings) showing the rough division of the
 * region between empires across the chain-of-transmission period:
 * Babylon → Persia → Greece → Rome(+Parthian/Sasanian Babylonia).
 */

export type EraKey = 'BABYLON' | 'PERSIA' | 'GREECE' | 'ROME';

export interface EraEmpire {
  nameHe: string;
  nameEn: string;
  color: string;
  /** lon/lat rings (schematic boundaries) */
  polygons: [number, number][][];
  /** where to place the empire label */
  labelAt: [number, number];
  yearsHe?: string;
}

export interface EraSite {
  lon: number;
  lat: number;
  he: string;
  en: string;
  /** nameHe of the matching Place row in the DB (shows scholar count + panel) */
  db?: string;
  major?: boolean;
  /** label nudge (px, SVG units) */
  dx?: number;
  dy?: number;
  anchor?: 'start' | 'middle' | 'end';
}

export interface EraDef {
  key: EraKey;
  labelHe: string;
  labelEn: string;
  /** e.g. "605–539 לפנה״ס" */
  yearsHe: string;
  noteHe?: string;
  empires: EraEmpire[];
  sites: EraSite[];
}

/** Rivers drawn on every historical map (stylized courses). */
export const RIVERS: { he: string; points: [number, number][] }[] = [
  {
    he: 'פרת',
    points: [
      [39.3, 38.2], [38.3, 37.4], [37.4, 36.5], [38.2, 35.6], [39.8, 34.6],
      [40.9, 33.9], [42.3, 32.9], [43.5, 32.0], [44.3, 31.0], [45.6, 30.0],
      [47.4, 30.4], [48.6, 29.7],
    ],
  },
  {
    he: 'חדקל',
    points: [
      [42.9, 38.1], [43.4, 37.2], [43.3, 36.4], [44.2, 35.6], [44.6, 34.2],
      [44.4, 33.3], [45.4, 32.6], [46.3, 31.7], [47.4, 30.4],
    ],
  },
  {
    he: 'יאור',
    points: [
      [31.9, 24.5], [31.5, 27.0], [31.2, 29.0], [31.1, 30.0], [31.3, 30.6],
    ],
  },
  {
    he: 'הירדן',
    points: [
      [35.57, 33.2], [35.55, 32.8], [35.55, 32.3], [35.52, 31.8],
    ],
  },
];

const CYPRUS: [number, number][] = [
  [32.3, 34.7], [33.2, 35.2], [34.3, 35.4], [34.5, 35.1], [33.4, 34.8], [32.4, 34.6],
];

export const HISTORICAL_ERAS: Record<EraKey, EraDef> = {
  BABYLON: {
    key: 'BABYLON',
    labelHe: 'בבל',
    labelEn: 'Babylonia',
    yearsHe: '605–539 לפנה״ס',
    noteHe: 'גלות בבל לאחר חורבן הבית הראשון (586 לפנה״ס)',
    empires: [
      {
        nameHe: 'האימפריה הבבלית',
        nameEn: 'Neo-Babylonian Empire',
        color: '#8a6d3b',
        labelAt: [43.2, 32.2],
        yearsHe: '605–539 לפנה״ס',
        polygons: [
          [
            [48.8, 30.0], [47.5, 31.8], [45.8, 33.5], [44.0, 35.3], [42.0, 36.8],
            [39.5, 37.3], [37.0, 36.9], [35.6, 34.6], [35.9, 32.8], [34.4, 31.2],
            [34.2, 29.7], [36.5, 28.9], [40.0, 28.3], [44.0, 28.6], [47.5, 28.8],
            [49.6, 29.2],
          ],
        ],
      },
    ],
    sites: [
      { lon: 44.42, lat: 32.54, he: 'בבל', en: 'Babylon', major: true, anchor: 'start', dx: 8 },
      { lon: 35.21, lat: 31.77, he: 'ירושלים', en: 'Jerusalem', major: true, anchor: 'end', dx: -8 },
      { lon: 45.23, lat: 32.13, he: 'ניפור', en: 'Nippur', anchor: 'start', dx: 8, dy: 12 },
      { lon: 48.26, lat: 32.19, he: 'שושן', en: 'Susa', anchor: 'start', dx: 8 },
    ],
  },

  PERSIA: {
    key: 'PERSIA',
    labelHe: 'פרס',
    labelEn: 'Persia',
    yearsHe: '539–332 לפנה״ס',
    noteHe: 'שיבת ציון ובניין הבית השני (516 לפנה״ס); יהודה כפְּרוֹוִינְצְיָה פרסית',
    empires: [
      {
        nameHe: 'האימפריה הפרסית',
        nameEn: 'Achaemenid Persian Empire',
        color: '#5f7d54',
        labelAt: [44.5, 33.6],
        yearsHe: '539–332 לפנה״ס',
        polygons: [
          [
            [26.3, 36.4], [27.0, 39.5], [30.0, 41.1], [34.0, 41.4], [38.5, 40.8],
            [42.5, 39.0], [44.0, 37.8], [47.0, 37.0], [52.0, 37.8], [57.0, 37.0],
            [62.0, 35.0], [62.0, 24.0], [54.0, 24.0], [49.5, 25.0], [46.5, 28.0],
            [43.0, 28.4], [39.0, 28.8], [35.0, 29.2], [33.2, 28.6], [32.0, 26.5],
            [31.5, 24.2], [28.0, 24.0], [25.0, 27.5], [25.2, 31.3], [28.0, 31.5],
            [31.0, 31.4], [33.0, 31.2], [34.2, 31.3], [34.3, 32.6], [35.2, 33.3],
            [36.3, 34.5], [36.2, 36.3], [32.0, 36.7], [28.5, 36.6],
          ],
        ],
      },
    ],
    sites: [
      { lon: 35.21, lat: 31.77, he: 'ירושלים', en: 'Jerusalem', major: true, anchor: 'end', dx: -8 },
      { lon: 48.26, lat: 32.19, he: 'שושן', en: 'Susa', major: true, anchor: 'start', dx: 8 },
      { lon: 44.42, lat: 32.54, he: 'בבל', en: 'Babylon', anchor: 'start', dx: 8 },
      { lon: 45.23, lat: 32.13, he: 'ניפור', en: 'Nippur', anchor: 'start', dx: 8, dy: 12 },
    ],
  },

  GREECE: {
    key: 'GREECE',
    labelHe: 'יוון',
    labelEn: 'Greece',
    yearsHe: '332–63 לפנה״ס',
    noteHe: 'מ-200 לפנה״ס עברה ארץ ישראל לידי הסלאווקים; מ-167 מרד החשמונאים',
    empires: [
      {
        nameHe: 'הממלכה הסלאווקית',
        nameEn: 'Seleucid Empire',
        color: '#9e3b3b',
        labelAt: [44.5, 33.2],
        yearsHe: '312–63 לפנה״ס',
        polygons: [
          [
            [36.0, 34.0], [36.3, 36.3], [32.5, 36.6], [29.5, 36.5], [29.8, 38.0],
            [32.5, 39.2], [36.5, 39.5], [40.0, 38.6], [43.5, 37.2], [47.0, 35.2],
            [50.5, 32.8], [52.5, 30.5], [52.0, 28.8], [49.0, 28.3], [45.0, 28.4],
            [41.0, 28.7], [38.0, 30.5], [36.8, 32.5],
          ],
        ],
      },
      {
        nameHe: 'הממלכה התלמיוסית',
        nameEn: 'Ptolemaic Kingdom',
        color: '#a8792c',
        labelAt: [28.6, 27.3],
        yearsHe: '305–30 לפנה״ס',
        polygons: [
          [
            [25.2, 31.3], [28.5, 31.5], [31.8, 31.4], [34.2, 31.2], [34.3, 32.6],
            [35.2, 33.3], [35.8, 33.9], [36.4, 33.2], [37.2, 31.3], [36.0, 29.8],
            [34.3, 29.0], [32.5, 27.0], [31.8, 24.3], [28.0, 24.0], [25.0, 27.8],
          ],
          CYPRUS,
        ],
      },
    ],
    sites: [
      { lon: 35.21, lat: 31.77, he: 'ירושלים', en: 'Jerusalem', major: true, anchor: 'end', dx: -8 },
      { lon: 23.73, lat: 37.98, he: 'אתונה', en: 'Athens', major: true, anchor: 'middle', dy: -10 },
      { lon: 29.92, lat: 31.2, he: 'אלכסנדריה', en: 'Alexandria', major: true, anchor: 'end', dx: -8, dy: 10 },
      { lon: 36.16, lat: 36.2, he: 'אנטיוכיה', en: 'Antioch', major: true, anchor: 'start', dx: 8 },
      { lon: 44.42, lat: 32.54, he: 'בבל', en: 'Babylon', anchor: 'start', dx: 8 },
      { lon: 27.18, lat: 39.13, he: 'פרגמון', en: 'Pergamon', anchor: 'middle', dy: -10 },
    ],
  },

  ROME: {
    key: 'ROME',
    labelHe: 'רומא',
    labelEn: 'Rome',
    yearsHe: '63 לפנה״ס – 500 לספירה',
    noteHe: 'תקופת התנאים והאמוראים; ישיבות בבל תחת שלטון פרתי-ששאני (מזרחה מהפרת)',
    empires: [
      {
        nameHe: 'האימפריה הרומית',
        nameEn: 'Roman Empire',
        color: '#0f6b63',
        labelAt: [30.0, 38.8],
        yearsHe: '63 לפנה״ס – 476 לספירה',
        polygons: [
          [
            [26.3, 36.4], [27.0, 39.3], [30.0, 41.0], [34.0, 41.3], [38.0, 40.3],
            [40.5, 38.8], [41.5, 37.5], [40.0, 36.0], [38.8, 34.8], [39.8, 34.0],
            [40.8, 33.2], [39.5, 31.8], [37.5, 30.5], [35.5, 29.7], [34.4, 29.2],
            [34.2, 31.0], [34.3, 32.6], [35.2, 33.3], [36.3, 34.5], [36.2, 36.3],
            [32.0, 36.7], [28.5, 36.6],
          ],
          [
            [25.2, 31.3], [28.5, 31.5], [31.8, 31.4], [33.0, 29.0], [32.5, 26.5],
            [32.0, 24.5], [28.0, 24.0], [25.0, 27.8],
          ],
          CYPRUS,
        ],
      },
      {
        nameHe: 'בבל — שלטון פרתי/ששאני',
        nameEn: 'Parthian / Sasanian Babylonia',
        color: '#b0603a',
        labelAt: [46.8, 33.6],
        yearsHe: '247 לפנה״ס – 651 לספירה',
        polygons: [
          [
            [41.5, 37.5], [40.0, 36.0], [38.8, 34.8], [39.8, 34.0], [40.8, 33.2],
            [41.8, 32.3], [44.0, 31.3], [46.2, 30.4], [47.6, 30.0], [48.9, 29.9],
            [49.6, 28.6], [48.5, 26.0], [50.0, 24.5], [54.0, 24.0], [62.0, 24.0],
            [62.0, 36.0], [57.0, 37.0], [52.0, 37.6], [47.5, 37.0], [44.0, 38.2],
            [42.5, 37.8],
          ],
        ],
      },
    ],
    sites: [
      // ── ארץ ישראל (מרכזי תורה — מחוברים לנתוני החכמים) ──
      { lon: 35.2137, lat: 31.7683, he: 'ירושלים', en: 'Jerusalem', db: 'ירושלים', major: true, anchor: 'end', dx: -8, dy: 6 },
      { lon: 34.738, lat: 31.878, he: 'יבנה', en: 'Yavneh', db: 'יבנה', anchor: 'end', dx: -8 },
      { lon: 34.893, lat: 31.953, he: 'לוד', en: 'Lod', db: 'לוד', anchor: 'middle', dy: 16 },
      { lon: 34.833, lat: 32.084, he: 'בני ברק', en: 'Bnei Brak', db: 'בני ברק', anchor: 'middle', dy: 16 },
      { lon: 34.89, lat: 32.5, he: 'קיסריה', en: 'Caesarea', db: 'קיסריה', anchor: 'end', dx: -8 },
      { lon: 35.129, lat: 32.703, he: 'בית שערים', en: "Beit She'arim", db: 'בית שערים', anchor: 'end', dx: -8, dy: -16 },
      { lon: 35.114, lat: 32.798, he: 'אושא', en: 'Usha', db: 'אושא', anchor: 'end', dx: -8, dy: 2 },
      { lon: 35.169, lat: 32.804, he: 'שפרעם', en: "Shefa-'Amr", db: 'שפרעם', anchor: 'start', dx: 8, dy: 12 },
      { lon: 35.279, lat: 32.742, he: 'ציפורי', en: 'Sepphoris', db: 'ציפורי', major: true, anchor: 'start', dx: 8, dy: -8 },
      { lon: 35.5324, lat: 32.7922, he: 'טבריה', en: 'Tiberias', db: 'טבריה', major: true, anchor: 'start', dx: 8 },
      // ── בבל (ישיבות) ──
      { lon: 44.45, lat: 31.88, he: 'סורא', en: 'Sura', db: 'סורא', major: true, anchor: 'start', dx: 8, dy: -6 },
      { lon: 43.78, lat: 33.35, he: 'פומבדיתא', en: 'Pumbedita', db: 'פומבדיתא', major: true, anchor: 'end', dx: -8, dy: -8 },
      { lon: 43.71, lat: 33.38, he: 'נהרדעא', en: 'Nehardea', db: 'נהרדעא', anchor: 'end', dx: -8, dy: 10 },
      { lon: 44.58, lat: 33.1, he: 'מחוזא', en: 'Mechoza', db: 'מחוזא', anchor: 'start', dx: 8 },
      { lon: 41.22, lat: 37.08, he: 'ניסיביס', en: 'Nisibis', db: 'ניסיביס', anchor: 'start', dx: 8 },
      { lon: 44.42, lat: 32.54, he: 'בבל', en: 'Babylon', anchor: 'start', dx: 8, dy: 14 },
      // ── הערות ──
      { lon: 29.92, lat: 31.2, he: 'אלכסנדריה', en: 'Alexandria', anchor: 'end', dx: -8, dy: 10 },
      { lon: 36.16, lat: 36.2, he: 'אנטיוכיה', en: 'Antioch', anchor: 'start', dx: 8 },
    ],
  },
};

export const ERA_ORDER: EraKey[] = ['BABYLON', 'PERSIA', 'GREECE', 'ROME'];
