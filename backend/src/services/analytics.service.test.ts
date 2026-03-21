import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createAnalyticsService } from './analytics.service';

const service = createAnalyticsService(mockPrisma);
const householdId = 'household-1';

const mockTransactions = [
  {
    id: 't1',
    amount: new Prisma.Decimal(1000),
    categoryId: 'cat-1',
    cardId: 'card-1',
    category: { name: 'FOOD_DINING', label: 'Food & Dining', color: '#ef4444' },
    card: { id: 'card-1', name: 'TTB' },
  },
  {
    id: 't2',
    amount: new Prisma.Decimal(2000),
    categoryId: 'cat-1',
    cardId: 'card-1',
    category: { name: 'FOOD_DINING', label: 'Food & Dining', color: '#ef4444' },
    card: { id: 'card-1', name: 'TTB' },
  },
  {
    id: 't3',
    amount: new Prisma.Decimal(500),
    categoryId: 'cat-2',
    cardId: 'card-2',
    category: { name: 'TRAVEL', label: 'Travel', color: '#3b82f6' },
    card: { id: 'card-2', name: 'KTC' },
  },
];

beforeEach(() => {
  resetMocks();
});

describe('AnalyticsService', () => {
  describe('getMonthlySummary', () => {
    it('should return summary with category and card breakdowns', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getMonthlySummary(householdId, '2025-03');

      expect(result.month).toBe('2025-03');
      expect(result.totalSpent).toBe(3500);
      expect(result.transactionCount).toBe(3);

      // Category breakdown
      expect(result.byCategory).toHaveLength(2);
      expect(result.byCategory[0].categoryName).toBe('FOOD_DINING');
      expect(result.byCategory[0].amount).toBe(3000);
      expect(result.byCategory[0].count).toBe(2);

      // Card breakdown
      expect(result.byCard).toHaveLength(2);
      expect(result.byCard[0].cardName).toBe('TTB');
      expect(result.byCard[0].amount).toBe(3000);
    });

    it('should handle empty month', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);

      const result = await service.getMonthlySummary(householdId, '2025-03');

      expect(result.totalSpent).toBe(0);
      expect(result.transactionCount).toBe(0);
      expect(result.byCategory).toEqual([]);
      expect(result.byCard).toEqual([]);
    });

    it('should calculate percentages correctly', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getMonthlySummary(householdId, '2025-03');

      const foodCategory = result.byCategory.find((c) => c.categoryName === 'FOOD_DINING');
      expect(foodCategory!.percentage).toBeCloseTo((3000 / 3500) * 100, 1);

      const travelCategory = result.byCategory.find((c) => c.categoryName === 'TRAVEL');
      expect(travelCategory!.percentage).toBeCloseTo((500 / 3500) * 100, 1);
    });
  });

  describe('getByCategory', () => {
    it('should delegate to getMonthlySummary and return byCategory', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getByCategory(householdId, '2025-03');

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(3000);
    });
  });

  describe('getByCard', () => {
    it('should delegate to getMonthlySummary and return byCard', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue(mockTransactions);

      const result = await service.getByCard(householdId, '2025-03');

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(3000);
    });
  });

  describe('getBillingCycleSummary', () => {
    const mockCard = {
      id: 'card-1',
      name: 'TTB',
      bank: 'TTB',
      lastFour: '1234',
      color: '#000',
      cutoffDay: 15,
      dueDay: 5,
      isActive: true,
      householdId,
      owner: { name: 'Test' },
    };

    it('should return billing cycle summary with totals', async () => {
      (mockPrisma.creditCard.findMany as any).mockResolvedValue([mockCard]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([
        { monthlyAmount: new Prisma.Decimal(4500), cardId: 'card-1', categoryId: 'cat-1' },
      ]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([
        { amount: new Prisma.Decimal(15000) },
      ]);
      (mockPrisma.category.findUnique as any).mockResolvedValue({
        id: 'cat-1',
        name: 'GADGET',
        label: 'Gadget',
        color: '#8b5cf6',
      });
      (mockPrisma.transaction.findMany as any).mockResolvedValue([
        {
          id: 't1',
          amount: new Prisma.Decimal(1000),
          categoryId: 'cat-2',
          category: { name: 'FOOD', label: 'Food', color: '#ef4444' },
        },
      ]);
      (mockPrisma.statement.findUnique as any).mockResolvedValue(null);

      const result = await service.getBillingCycleSummary(householdId, '2026-04');

      expect(result.paymentMonth).toBe('2026-04');
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0].transactionAmount).toBe(1000);
      expect(result.cards[0].installmentAmount).toBe(4500);
      expect(result.cards[0].totalAmount).toBe(5500);
      expect(result.totals.fixedCosts).toBe(15000);
      expect(result.totals.installments).toBe(4500);
      expect(result.totals.transactions).toBe(1000);
      expect(result.totals.grandTotal).toBe(20500);
    });

    it('should handle empty state', async () => {
      (mockPrisma.creditCard.findMany as any).mockResolvedValue([]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([]);

      const result = await service.getBillingCycleSummary(householdId, '2026-04');

      expect(result.cards).toEqual([]);
      expect(result.totals.grandTotal).toBe(0);
    });

    it('should mark card as paid when statement exists', async () => {
      (mockPrisma.creditCard.findMany as any).mockResolvedValue([mockCard]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);
      (mockPrisma.statement.findUnique as any).mockResolvedValue({ isPaid: true });

      const result = await service.getBillingCycleSummary(householdId, '2026-04');

      expect(result.cards[0].isPaid).toBe(true);
    });
  });
});
