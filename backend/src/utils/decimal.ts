import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convert Prisma Decimal to JavaScript number
 */
export function decimalToNumber(decimal: Decimal | number | null | undefined): number {
  if (decimal === null || decimal === undefined) {
    return 0;
  }
  if (typeof decimal === 'number') {
    return decimal;
  }
  return decimal.toNumber();
}

/**
 * Round to 2 decimal places (Thai Baht satang)
 */
export function roundToSatang(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Format as Thai Baht currency string
 */
export function formatTHB(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
