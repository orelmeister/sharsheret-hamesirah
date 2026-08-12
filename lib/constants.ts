/** Period configuration matching the spec's color scheme */
export const PERIODS = {
  ANSHEI_KNESSET: {
    label: 'אנשי כנסת הגדולה',
    color: 'ansheiKnesset',
    colorHex: '#5f7d54',
    bgClass: 'bg-[#e9efe3] text-[#46603c]',
    borderClass: 'border-[#5f7d54]',
    startYear: -350,
    endYear: -190,
    order: 1,
  },
  ZUGOT: {
    label: 'הזוגות',
    color: 'zugot',
    colorHex: '#3d5a8a',
    bgClass: 'bg-[#e6ebf4] text-[#31497a]',
    borderClass: 'border-[#3d5a8a]',
    startYear: -190,
    endYear: 10,
    order: 2,
  },
  TANNAIM: {
    label: 'תנאים',
    color: 'tannaim',
    colorHex: '#a8792c',
    bgClass: 'bg-[#f3ead3] text-[#7c5a1f]',
    borderClass: 'border-[#a8792c]',
    startYear: 10,
    endYear: 220,
    order: 3,
  },
  AMORAIM_ERETZ_YISRAEL: {
    label: 'אמוראי ארץ ישראל',
    color: 'amoraimIsrael',
    colorHex: '#b0603a',
    bgClass: 'bg-[#f4e5db] text-[#8a4a2c]',
    borderClass: 'border-[#b0603a]',
    startYear: 220,
    endYear: 400,
    order: 4,
  },
  AMORAIM_BAVEL: {
    label: 'אמוראי בבל',
    color: 'amoraimBavel',
    colorHex: '#9e3b3b',
    bgClass: 'bg-[#f2e0df] text-[#813030]',
    borderClass: 'border-[#9e3b3b]',
    startYear: 220,
    endYear: 500,
    order: 5,
  },
  SAVORAIM: {
    label: 'סבוראים',
    color: 'savoraim',
    colorHex: '#4b5266',
    bgClass: 'bg-[#e7e9ef] text-[#3d4356]',
    borderClass: 'border-[#4b5266]',
    startYear: 500,
    endYear: 589,
    order: 6,
  },
} as const;

export type PeriodKey = keyof typeof PERIODS;

export const PERIOD_ORDER: PeriodKey[] = [
  'ANSHEI_KNESSET',
  'ZUGOT',
  'TANNAIM',
  'AMORAIM_ERETZ_YISRAEL',
  'AMORAIM_BAVEL',
  'SAVORAIM',
];

export const RELATIONSHIP_TYPES = {
  RAV: 'רב',
  STUDENT: 'תלמיד',
  CHEVRUTA: 'חברותא',
  DISPUTANT: 'בר פלוגתא',
  CONTEMPORARY: 'בן דורו',
  FAMILY: 'בן משפחה',
} as const;

export const CONFIDENCE_LEVELS = {
  CERTAIN: { label: 'ודאי', color: 'text-green-700' },
  STRONG: { label: 'מבוסס היטב', color: 'text-emerald-600' },
  TRADITIONAL: { label: 'מסורתי', color: 'text-blue-600' },
  DISPUTED: { label: 'שנוי במחלוקת', color: 'text-amber-600' },
  UNKNOWN: { label: 'לא ידוע', color: 'text-stone-500' },
} as const;
