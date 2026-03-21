import {
  getDefaultPaymentMonth,
  formatPaymentMonthDisplay,
  calculateBillingPeriod,
  formatBillingPeriodDisplay,
} from './billingPeriod';

describe('getDefaultPaymentMonth', () => {
  it('should return next month in YYYY-MM format', () => {
    const result = getDefaultPaymentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);

    // Should be next month from now
    const now = new Date();
    const expectedMonth = now.getMonth() + 2; // 0-indexed + 1 for next
    const expectedYear = expectedMonth > 12 ? now.getFullYear() + 1 : now.getFullYear();
    const normalizedMonth = expectedMonth > 12 ? expectedMonth - 12 : expectedMonth;
    expect(result).toBe(
      `${expectedYear}-${String(normalizedMonth).padStart(2, '0')}`
    );
  });
});

describe('formatPaymentMonthDisplay', () => {
  it('should format YYYY-MM to full month name and year', () => {
    expect(formatPaymentMonthDisplay('2026-04')).toBe('April 2026');
  });

  it('should handle January', () => {
    expect(formatPaymentMonthDisplay('2026-01')).toBe('January 2026');
  });

  it('should handle December', () => {
    expect(formatPaymentMonthDisplay('2025-12')).toBe('December 2025');
  });
});

describe('calculateBillingPeriod', () => {
  it('should calculate standard mid-month cutoff', () => {
    // Payment month April 2026, cutoff 15, due 20
    // Statement month: March 2026
    // Period: Feb 16 - Mar 15
    // Due: Apr 20
    const result = calculateBillingPeriod('2026-04', 15, 20);

    expect(result.start.getFullYear()).toBe(2026);
    expect(result.start.getMonth()).toBe(1); // Feb
    expect(result.start.getDate()).toBe(16);

    expect(result.end.getFullYear()).toBe(2026);
    expect(result.end.getMonth()).toBe(2); // Mar
    expect(result.end.getDate()).toBe(15);

    expect(result.dueDate.getFullYear()).toBe(2026);
    expect(result.dueDate.getMonth()).toBe(3); // Apr
    expect(result.dueDate.getDate()).toBe(20);
  });

  it('should handle end-of-month cutoff (day 25)', () => {
    // Payment month April 2026, cutoff 25, due 5
    // Statement month: March 2026
    // Period: Feb 26 - Mar 25
    // Due: Apr 5
    const result = calculateBillingPeriod('2026-04', 25, 5);

    expect(result.start.getMonth()).toBe(1); // Feb
    expect(result.start.getDate()).toBe(26);

    expect(result.end.getMonth()).toBe(2); // Mar
    expect(result.end.getDate()).toBe(25);

    expect(result.dueDate.getDate()).toBe(5);
  });

  it('should handle year boundary (January payment)', () => {
    // Payment month Jan 2026, cutoff 15, due 10
    // Statement month: Dec 2025
    // Period: Nov 16 - Dec 15
    // Due: Jan 10
    const result = calculateBillingPeriod('2026-01', 15, 10);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(10); // Nov
    expect(result.start.getDate()).toBe(16);

    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(11); // Dec
    expect(result.end.getDate()).toBe(15);

    expect(result.dueDate.getFullYear()).toBe(2026);
    expect(result.dueDate.getMonth()).toBe(0); // Jan
    expect(result.dueDate.getDate()).toBe(10);
  });

  it('should clamp cutoff day on short months (Feb)', () => {
    // Payment month April 2026, cutoff 31, due 10
    // Statement month: March 2026 (31 days, OK)
    // Previous month for start: Feb 2026 (28 days, clamp to 28)
    // Period: Mar 1 (28+1) - Mar 31
    const result = calculateBillingPeriod('2026-04', 31, 10);

    expect(result.end.getMonth()).toBe(2); // Mar
    expect(result.end.getDate()).toBe(31);

    // Feb has 28 days in 2026, so cutoff clamped to 28, start = Mar 1
    expect(result.start.getMonth()).toBe(2); // Mar
    expect(result.start.getDate()).toBe(1);
  });
});

describe('formatBillingPeriodDisplay', () => {
  it('should format date range', () => {
    const start = new Date(2026, 1, 16); // Feb 16
    const end = new Date(2026, 2, 15); // Mar 15
    expect(formatBillingPeriodDisplay(start, end)).toBe('Feb 16 - Mar 15');
  });

  it('should handle same month', () => {
    const start = new Date(2026, 0, 1); // Jan 1
    const end = new Date(2026, 0, 31); // Jan 31
    expect(formatBillingPeriodDisplay(start, end)).toBe('Jan 1 - Jan 31');
  });
});
