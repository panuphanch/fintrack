import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createBudgetsService } from './budgets.service';

const service = createBudgetsService(mockPrisma);
const householdId = 'household-1';

beforeEach(() => {
  resetMocks();
});

describe('BudgetsService', () => {
  describe('list', () => {
    it('should return budgets with spending calculation', async () => {
      const budgets = [
        {
          id: 'b1',
          categoryId: 'cat-1',
          householdId,
          monthlyLimit: new Prisma.Decimal(5000),
          category: { id: 'cat-1', name: 'Food', sortOrder: 1 },
        },
        {
          id: 'b2',
          categoryId: 'cat-2',
          householdId,
          monthlyLimit: new Prisma.Decimal(2000),
          category: { id: 'cat-2', name: 'Travel', sortOrder: 2 },
        },
      ];
      (mockPrisma.budget.findMany as any).mockResolvedValue(budgets);
      (mockPrisma.transaction.groupBy as any).mockResolvedValue([
        { categoryId: 'cat-1', _sum: { amount: new Prisma.Decimal(1500) } },
      ]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(2);
      expect(result[0].monthlyLimit).toBe(5000);
      expect(result[0].spent).toBe(1500);
      expect(result[1].monthlyLimit).toBe(2000);
      expect(result[1].spent).toBe(0); // no spending for cat-2
    });
  });

  describe('create', () => {
    it('should create a budget', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue(null);
      (mockPrisma.budget.create as any).mockResolvedValue({
        id: 'b1',
        categoryId: 'cat-1',
        householdId,
        monthlyLimit: new Prisma.Decimal(5000),
        category: { id: 'cat-1', name: 'Food' },
      });

      const result = await service.create(
        { categoryId: 'cat-1', monthlyLimit: 5000 },
        householdId
      );

      expect(result.monthlyLimit).toBe(5000);
      expect(result.spent).toBe(0);
    });

    it('should throw if budget for category already exists', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue({ id: 'b1' });

      await expect(
        service.create({ categoryId: 'cat-1', monthlyLimit: 5000 }, householdId)
      ).rejects.toThrow('Budget for this category already exists');
    });
  });

  describe('update', () => {
    it('should update budget and recalculate spending', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue({ id: 'b1', householdId });
      (mockPrisma.budget.update as any).mockResolvedValue({
        id: 'b1',
        categoryId: 'cat-1',
        householdId,
        monthlyLimit: new Prisma.Decimal(8000),
        category: { id: 'cat-1', name: 'Food' },
      });
      (mockPrisma.transaction.aggregate as any).mockResolvedValue({
        _sum: { amount: new Prisma.Decimal(3000) },
      });

      const result = await service.update('b1', { monthlyLimit: 8000 }, householdId);

      expect(result.monthlyLimit).toBe(8000);
      expect(result.spent).toBe(3000);
    });

    it('should throw if budget not found', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { monthlyLimit: 8000 }, householdId)).rejects.toThrow(
        'Budget not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete a budget', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue({ id: 'b1', householdId });

      await service.delete('b1', householdId);

      expect(mockPrisma.budget.delete).toHaveBeenCalledWith({ where: { id: 'b1' } });
    });

    it('should throw if budget not found', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Budget not found');
    });
  });
});
