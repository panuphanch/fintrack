import { Decimal } from '@prisma/client/runtime/library';
import { decimalToNumber, roundToSatang, formatTHB } from './decimal';

describe('decimalToNumber', () => {
  it('should convert Prisma Decimal to number', () => {
    expect(decimalToNumber(new Decimal(1234.56))).toBe(1234.56);
  });

  it('should return 0 for null', () => {
    expect(decimalToNumber(null)).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(decimalToNumber(undefined)).toBe(0);
  });

  it('should pass through number values', () => {
    expect(decimalToNumber(42)).toBe(42);
  });

  it('should handle zero', () => {
    expect(decimalToNumber(new Decimal(0))).toBe(0);
  });
});

describe('roundToSatang', () => {
  it('should round to 2 decimal places', () => {
    expect(roundToSatang(123.456)).toBe(123.46);
  });

  it('should handle exact values', () => {
    expect(roundToSatang(100)).toBe(100);
  });

  it('should round 0.005 up', () => {
    expect(roundToSatang(10.005)).toBe(10.01);
  });

  it('should handle zero', () => {
    expect(roundToSatang(0)).toBe(0);
  });
});

describe('formatTHB', () => {
  it('should format as Thai Baht', () => {
    const result = formatTHB(1234.5);
    expect(result).toContain('1,234.50');
  });

  it('should handle zero', () => {
    const result = formatTHB(0);
    expect(result).toContain('0.00');
  });
});
