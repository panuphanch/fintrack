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
    it('should return budgets with spending per single category (no child rollup)', async () => {
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
        { categoryId: 'cat-1', _sum: { amount: new Prisma.Decimal(1000) } },
      ]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([
        { categoryId: 'cat-1', monthlyAmount: new Prisma.Decimal(300), isActive: true },
      ]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([
        { categoryId: 'cat-1', amount: new Prisma.Decimal(100), isActive: true },
        { categoryId: 'cat-2', amount: new Prisma.Decimal(400), isActive: true },
      ]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(2);
      expect(result[0].monthlyLimit).toBe(5000);
      // Only cat-1 spending: txns(1000) + inst(300) + fixed(100) = 1400
      expect(result[0].spent).toBe(1400);
      expect(result[1].monthlyLimit).toBe(2000);
      expect(result[1].spent).toBe(400); // cat-2 fixed cost only

      // Verify no children include in query
      expect(mockPrisma.budget.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            category: true,
          },
        })
      );
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
    it('should update budget and recalculate spending for single category (no child rollup)', async () => {
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
      (mockPrisma.installment.aggregate as any).mockResolvedValue({
        _sum: { monthlyAmount: new Prisma.Decimal(1000) },
      });
      (mockPrisma.fixedCost.aggregate as any).mockResolvedValue({
        _sum: { amount: new Prisma.Decimal(500) },
      });

      const result = await service.update('b1', { monthlyLimit: 8000 }, householdId);

      expect(result.monthlyLimit).toBe(8000);
      expect(result.spent).toBe(4500);

      // Verify categoryId filter is direct (not { in: [...] })
      expect(mockPrisma.transaction.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: 'cat-1',
          }),
        })
      );
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

  describe('listWithAllCategories', () => {
    it('should return all categories with budget and spending data', async () => {
      const categories = [
        { id: 'cat-1', name: 'HOME', label: 'Home', color: '#3b82f6', sortOrder: 0 },
        { id: 'cat-2', name: 'CAR', label: 'Car', color: '#f97316', sortOrder: 4 },
        { id: 'cat-3', name: 'TRAVEL', label: 'Travel', color: '#14b8a6', sortOrder: 8 },
      ];
      const budgets = [
        { id: 'b1', categoryId: 'cat-1', monthlyLimit: new Prisma.Decimal(5000) },
        { id: 'b2', categoryId: 'cat-2', monthlyLimit: new Prisma.Decimal(10000) },
      ];
      (mockPrisma.category.findMany as any).mockResolvedValue(categories);
      (mockPrisma.budget.findMany as any).mockResolvedValue(budgets);
      (mockPrisma.transaction.groupBy as any).mockResolvedValue([
        { categoryId: 'cat-1', _sum: { amount: new Prisma.Decimal(2000) } },
        { categoryId: 'cat-3', _sum: { amount: new Prisma.Decimal(500) } },
      ]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([
        { categoryId: 'cat-2', monthlyAmount: new Prisma.Decimal(4000) },
      ]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([
        { categoryId: 'cat-1', amount: new Prisma.Decimal(1000) },
      ]);

      const result = await service.listWithAllCategories(householdId);

      expect(result).toHaveLength(3);

      // HOME: has budget, spent = txns(2000) + fixed(1000) = 3000
      expect(result[0].category.name).toBe('HOME');
      expect(result[0].budget).toEqual({ id: 'b1', monthlyLimit: 5000 });
      expect(result[0].spent).toBe(3000);

      // CAR: has budget, spent = inst(4000)
      expect(result[1].category.name).toBe('CAR');
      expect(result[1].budget).toEqual({ id: 'b2', monthlyLimit: 10000 });
      expect(result[1].spent).toBe(4000);

      // TRAVEL: no budget, spent = txns(500)
      expect(result[2].category.name).toBe('TRAVEL');
      expect(result[2].budget).toBeNull();
      expect(result[2].spent).toBe(500);
    });

    it('should return zero spending for categories with no activity', async () => {
      const categories = [
        { id: 'cat-1', name: 'OTHERS', label: 'Others', color: '#9ca3af', sortOrder: 10 },
      ];
      (mockPrisma.category.findMany as any).mockResolvedValue(categories);
      (mockPrisma.budget.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.groupBy as any).mockResolvedValue([]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([]);

      const result = await service.listWithAllCategories(householdId);

      expect(result).toHaveLength(1);
      expect(result[0].budget).toBeNull();
      expect(result[0].spent).toBe(0);
    });
  });
});
