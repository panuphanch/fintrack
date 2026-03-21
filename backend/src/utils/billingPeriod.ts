import { format, addMonths, subMonths, setDate, parseISO, startOfDay, endOfDay } from 'date-fns';

/**
 * Get the default payment month (next month from today).
 * If today is March 19, returns "2026-04" (April 2026).
 */
export function getDefaultPaymentMonth(): string {
  const today = new Date();
  const nextMonth = addMonths(today, 1);
  return format(nextMonth, 'yyyy-MM');
}

/**
 * Format a payment month string (YYYY-MM) to display format (e.g., "April 2026").
 */
export function formatPaymentMonthDisplay(paymentMonth: string): string {
  const date = parseISO(`${paymentMonth}-01`);
  return format(date, 'MMMM yyyy');
}

export interface BillingPeriod {
  start: Date;
  end: Date;
  dueDate: Date;
}

/**
 * Calculate billing period dates based on payment month and card's cutoff/due days.
 *
 * For payment month "2026-04" and card with cutoff day 15:
 * - Statement month: March 2026 (one month before payment)
 * - Period Start: February 16, 2026
 * - Period End: March 15, 2026
 * - Due Date: April {dueDay}, 2026
 */
export function calculateBillingPeriod(
  paymentMonth: string,
  cutoffDay: number,
  dueDay: number
): BillingPeriod {
  // Payment month is when the bill is due
  const paymentDate = parseISO(`${paymentMonth}-01`);

  // Statement month is one month before payment month
  const statementMonth = subMonths(paymentDate, 1);

  // Period end is the cutoff day of the statement month
  const periodEnd = setDate(statementMonth, Math.min(cutoffDay, getDaysInMonth(statementMonth)));

  // Period start is the day after cutoff of the previous month
  const previousMonth = subMonths(statementMonth, 1);
  const periodStart = addDays(setDate(previousMonth, Math.min(cutoffDay, getDaysInMonth(previousMonth))), 1);

  // Due date is the due day of the payment month
  const dueDate = setDate(paymentDate, Math.min(dueDay, getDaysInMonth(paymentDate)));

  return {
    start: startOfDay(periodStart),
    end: endOfDay(periodEnd),
    dueDate: startOfDay(dueDate),
  };
}

/**
 * Get number of days in a month.
 */
function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Add days to a date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format billing period dates for display (e.g., "Feb 16 - Mar 15").
 */
export function formatBillingPeriodDisplay(start: Date, end: Date): string {
  const startStr = format(start, 'MMM d');
  const endStr = format(end, 'MMM d');
  return `${startStr} - ${endStr}`;
}
