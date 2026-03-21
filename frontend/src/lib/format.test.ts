import {
  formatTHB,
  formatNumber,
  formatDate,
  formatDateForInput,
  formatMonth,
  getCurrentMonth,
  formatPercentage,
  truncate,
  getDefaultPaymentMonth,
  formatPaymentMonthDisplay,
  formatBillingPeriodDisplay,
} from './format';

describe('formatTHB', () => {
  it('should format as Thai Baht', () => {
    const result = formatTHB(1234.5);
    expect(result).toContain('1,234.50');
  });

  it('should handle zero', () => {
    const result = formatTHB(0);
    expect(result).toContain('0.00');
  });

  it('should handle negative amounts', () => {
    const result = formatTHB(-500);
    expect(result).toContain('500.00');
  });
});

describe('formatNumber', () => {
  it('should format with commas and 2 decimals by default', () => {
    expect(formatNumber(1234567.89)).toBe('1,234,567.89');
  });

  it('should format with custom decimal places', () => {
    expect(formatNumber(1234.5, 0)).toBe('1,235');
  });

  it('should handle zero', () => {
    expect(formatNumber(0)).toBe('0.00');
  });
});

describe('formatDate', () => {
  it('should format ISO date to default format', () => {
    expect(formatDate('2026-03-15')).toBe('Mar 15, 2026');
  });

  it('should format with custom format string', () => {
    expect(formatDate('2026-03-15', 'yyyy-MM-dd')).toBe('2026-03-15');
  });
});

describe('formatDateForInput', () => {
  it('should format ISO date string to YYYY-MM-DD', () => {
    expect(formatDateForInput('2026-03-15T10:30:00.000Z')).toBe('2026-03-15');
  });
});

describe('formatMonth', () => {
  it('should format date to YYYY-MM', () => {
    expect(formatMonth(new Date(2026, 2, 15))).toBe('2026-03');
  });
});

describe('getCurrentMonth', () => {
  it('should return current month in YYYY-MM format', () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('formatPercentage', () => {
  it('should format with one decimal', () => {
    expect(formatPercentage(85.714)).toBe('85.7%');
  });

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should handle 100', () => {
    expect(formatPercentage(100)).toBe('100.0%');
  });
});

describe('truncate', () => {
  it('should return text as-is when under limit', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('should truncate with ellipsis when over limit', () => {
    expect(truncate('hello world this is long', 10)).toBe('hello wor\u2026');
  });

  it('should handle exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('getDefaultPaymentMonth', () => {
  it('should return next month in YYYY-MM format', () => {
    const result = getDefaultPaymentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe('formatPaymentMonthDisplay', () => {
  it('should format YYYY-MM to full month name', () => {
    expect(formatPaymentMonthDisplay('2026-04')).toBe('April 2026');
  });
});

describe('formatBillingPeriodDisplay', () => {
  it('should format date range', () => {
    expect(formatBillingPeriodDisplay('2026-02-16', '2026-03-15')).toBe('Feb 16 - Mar 15');
  });
});
