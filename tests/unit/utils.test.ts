import { formatYear, formatYearRange, cn } from '@/lib/utils';
import { PERIODS, PERIOD_ORDER } from '@/lib/constants';

describe('formatYear', () => {
  it('formats BCE years', () => {
    expect(formatYear(-350)).toBe('350 לפנה״ס');
  });

  it('formats CE years', () => {
    expect(formatYear(70)).toBe('70 לספירה');
  });

  it('handles null', () => {
    expect(formatYear(null)).toBe('לא ידוע');
  });

  it('handles undefined', () => {
    expect(formatYear(undefined)).toBe('לא ידוע');
  });
});

describe('formatYearRange', () => {
  it('formats a range', () => {
    expect(formatYearRange(-200, 50)).toBe('200 לפנה״ס – 50 לספירה');
  });

  it('handles same year', () => {
    expect(formatYearRange(100, 100)).toBe('100 לספירה');
  });

  it('handles missing dates', () => {
    expect(formatYearRange(null, null)).toBe('לא ידוע');
  });
});

describe('cn', () => {
  it('joins classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });
});

describe('PERIODS', () => {
  it('has 6 periods in correct order', () => {
    expect(PERIOD_ORDER).toHaveLength(6);
    expect(PERIOD_ORDER[0]).toBe('ANSHEI_KNESSET');
    expect(PERIOD_ORDER[5]).toBe('SAVORAIM');
  });

  it('all periods have Hebrew labels', () => {
    PERIOD_ORDER.forEach((key) => {
      expect(PERIODS[key].label).toBeTruthy();
      expect(PERIODS[key].color).toBeTruthy();
    });
  });
});
