import { format, parseISO, addMonths } from 'date-fns';

/**
 * Format a number as Thai Baht currency
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a date string to display format
 */
export function formatDate(dateString: string, formatString = 'MMM d, yyyy'): string {
  return format(parseISO(dateString), formatString);
}

/**
 * Format a date string to input format (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string): string {
  return format(parseISO(dateString), 'yyyy-MM-dd');
}

/**
 * Format a date to month string (YYYY-MM)
 */
export function formatMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Get current month string (YYYY-MM)
 */
export function getCurrentMonth(): string {
  return formatMonth(new Date());
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '\u2026';
}

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

/**
 * Format billing period dates for display (e.g., "Feb 16 - Mar 15").
 */
export function formatBillingPeriodDisplay(start: string, end: string): string {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const startStr = format(startDate, 'MMM d');
  const endStr = format(endDate, 'MMM d');
  return `${startStr} - ${endStr}`;
}
