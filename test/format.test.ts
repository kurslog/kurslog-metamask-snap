import { formatNumber, formatRate, formatTotal } from '../src/utils/format';

describe('formatNumber', () => {
  it('formats integer with spaces', () => {
    expect(formatNumber(315750)).toBe('315 750');
  });

  it('formats large number', () => {
    expect(formatNumber(1234567)).toBe('1 234 567');
  });

  it('formats decimal < 10000 with 2 digits', () => {
    expect(formatNumber(42.10)).toBe('42.10');
  });

  it('formats small decimal with 3 digits', () => {
    expect(formatNumber(0.0456)).toBe('0.046');
  });

  it('formats small integer', () => {
    expect(formatNumber(100)).toBe('100');
  });

  it('returns empty for NaN', () => {
    expect(formatNumber(NaN)).toBe('');
  });
});

describe('formatRate', () => {
  it('calculates ratio', () => {
    expect(formatRate(1, 42.10)).toBe('42.10');
  });

  it('returns N/A for zero rate', () => {
    expect(formatRate(0, 42.10)).toBe('N/A');
  });
});

describe('formatTotal', () => {
  it('calculates total', () => {
    const result = formatTotal(7500, 1, 42.10);
    expect(result).toBe('315 750');
  });

  it('returns empty for zero amount', () => {
    expect(formatTotal(0, 1, 42.10)).toBe('');
  });
});
