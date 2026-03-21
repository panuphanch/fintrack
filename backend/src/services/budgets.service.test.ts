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
    it('should return budgets with spending including installments and child categories', async () => {
      const budgets = [
        {
          id: 'b1',
          categoryId: 'cat-1',
          householdId,
          monthlyLimit: new Prisma.Decimal(5000),
          category: {
            id: 'cat-1',
            name: 'Food',
            sortOrder: 1,
            children: [{ id: 'cat-1a' }], // child category
          },
        },
        {
          id: 'b2',
          categoryId: 'cat-2',
          householdId,
          monthlyLimit: new Prisma.Decimal(2000),
          category: {
            id: 'cat-2',
            name: 'Travel',
            sortOrder: 2,
            children: [], // no children
          },
        },
      ];
      (mockPrisma.budget.findMany as any).mockResolvedValue(budgets);
      (mockPrisma.transaction.groupBy as any).mockResolvedValue([
        { categoryId: 'cat-1', _sum: { amount: new Prisma.Decimal(1000) } },
        { categoryId: 'cat-1a', _sum: { amount: new Prisma.Decimal(500) } },
      ]);
      (mockPrisma.installment.findMany as any).mockResolvedValue([
        { categoryId: 'cat-1', monthlyAmount: new Prisma.Decimal(300), isActive: true },
        { categoryId: 'cat-1a', monthlyAmount: new Prisma.Decimal(200), isActive: true },
      ]);
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([
        { categoryId: 'cat-1', amount: new Prisma.Decimal(100), isActive: true },
        { categoryId: 'cat-2', amount: new Prisma.Decimal(400), isActive: true },
      ]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(2);
      expect(result[0].monthlyLimit).toBe(5000);
      // cat-1 txns(1000) + cat-1a txns(500) + cat-1 inst(300) + cat-1a inst(200) + cat-1 fixed(100)
      expect(result[0].spent).toBe(2100);
      expect(result[1].monthlyLimit).toBe(2000);
      expect(result[1].spent).toBe(400); // cat-2 fixed cost only
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
    it('should update budget and recalculate spending with child categories', async () => {
      (mockPrisma.budget.findFirst as any).mockResolvedValue({ id: 'b1', householdId });
      (mockPrisma.budget.update as any).mockResolvedValue({
        id: 'b1',
        categoryId: 'cat-1',
        householdId,
        monthlyLimit: new Prisma.Decimal(8000),
        category: { id: 'cat-1', name: 'Food' },
      });
      // getCategoryIdsWithChildren query
      (mockPrisma.category.findMany as any).mockResolvedValue([
        { id: 'cat-1a' },
      ]);
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
      expect(result.spent).toBe(4500); // 3000 transactions + 1000 installments + 500 fixed costs

      // Verify categoryId filter uses { in: [...] } for child rollup
      expect(mockPrisma.transaction.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat-1', 'cat-1a'] },
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
});
