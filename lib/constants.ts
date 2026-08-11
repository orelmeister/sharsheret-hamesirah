/** Period configuration matching the spec's color scheme */
export const PERIODS = {
  ANSHEI_KNESSET: {
    label: 'אנשי כנסת הגדולה',
    color: 'ansheiKnesset',
    bgClass: 'bg-emerald-100 text-emerald-800',
    borderClass: 'border-emerald-300',
    startYear: -350,
    endYear: -190,
    order: 1,
  },
  ZUGOT: {
    label: 'הזוגות',
    color: 'zugot',
    bgClass: 'bg-blue-100 text-blue-800',
    borderClass: 'border-blue-300',
    startYear: -190,
    endYear: 10,
    order: 2,
  },
  TANNAIM: {
    label: 'תנאים',
    color: 'tannaim',
    bgClass: 'bg-amber-100 text-amber-800',
    borderClass: 'border-amber-300',
    startYear: 10,
    endYear: 220,
    order: 3,
  },
  AMORAIM_ERETZ_YISRAEL: {
    label: 'אמוראי ארץ ישראל',
    color: 'amoraimIsrael',
    bgClass: 'bg-orange-100 text-orange-800',
    borderClass: 'border-orange-300',
    startYear: 220,
    endYear: 400,
    order: 4,
  },
  AMORAIM_BAVEL: {
    label: 'אמוראי בבל',
    color: 'amoraimBavel',
    bgClass: 'bg-red-100 text-red-800',
    borderClass: 'border-red-300',
    startYear: 220,
    endYear: 500,
    order: 5,
  },
  SAVORAIM: {
    label: 'סבוראים',
    color: 'savoraim',
    bgClass: 'bg-purple-100 text-purple-800',
    borderClass: 'border-purple-300',
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
