import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createFixedCostsService } from './fixed-costs.service';

const service = createFixedCostsService(mockPrisma);
const householdId = 'household-1';
const userId = 'user-1';

const mockFixedCost = {
  id: 'fc-1',
  name: 'Rent',
  amount: new Prisma.Decimal(15000),
  categoryId: 'cat-1',
  dueDay: 1,
  notes: null,
  isActive: true,
  householdId,
  createdById: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: 'cat-1', name: 'HOME' },
  createdBy: { id: userId, name: 'Test' },
};

beforeEach(() => {
  resetMocks();
});

describe('FixedCostsService', () => {
  describe('list', () => {
    it('should return active fixed costs by default', async () => {
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([mockFixedCost]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(15000);
      expect(mockPrisma.fixedCost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId, isActive: true },
        })
      );
    });

    it('should return all fixed costs when activeOnly is false', async () => {
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([mockFixedCost]);

      await service.list(householdId, false);

      expect(mockPrisma.fixedCost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId },
        })
      );
    });
  });

  describe('getById', () => {
    it('should return a fixed cost', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(mockFixedCost);

      const result = await service.getById('fc-1', householdId);

      expect(result.amount).toBe(15000);
    });

    it('should throw if not found', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(null);

      await expect(service.getById('999', householdId)).rejects.toThrow('Fixed cost not found');
    });
  });

  describe('create', () => {
    it('should create a fixed cost', async () => {
      (mockPrisma.fixedCost.create as any).mockResolvedValue(mockFixedCost);

      const result = await service.create(
        { name: 'Rent', amount: 15000, categoryId: 'cat-1', dueDay: 1 },
        householdId,
        userId
      );

      expect(result.amount).toBe(15000);
      expect(mockPrisma.fixedCost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Rent',
            householdId,
            createdById: userId,
          }),
        })
      );
    });
  });

  describe('update', () => {
    it('should update a fixed cost', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(mockFixedCost);
      (mockPrisma.fixedCost.update as any).mockResolvedValue({
        ...mockFixedCost,
        name: 'Updated',
        amount: new Prisma.Decimal(20000),
      });

      const result = await service.update('fc-1', { name: 'Updated', amount: 20000 }, householdId);

      expect(result.amount).toBe(20000);
    });

    it('should throw if not found', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' }, householdId)).rejects.toThrow(
        'Fixed cost not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete a fixed cost', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(mockFixedCost);

      await service.delete('fc-1', householdId);

      expect(mockPrisma.fixedCost.delete).toHaveBeenCalledWith({ where: { id: 'fc-1' } });
    });

    it('should throw if not found', async () => {
      (mockPrisma.fixedCost.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Fixed cost not found');
    });
  });

  describe('getMonthlyTotal', () => {
    it('should sum active fixed costs', async () => {
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([
        { amount: new Prisma.Decimal(15000) },
        { amount: new Prisma.Decimal(5000) },
      ]);

      const result = await service.getMonthlyTotal(householdId);

      expect(result).toBe(20000);
    });

    it('should return 0 when no active fixed costs', async () => {
      (mockPrisma.fixedCost.findMany as any).mockResolvedValue([]);

      const result = await service.getMonthlyTotal(householdId);

      expect(result).toBe(0);
    });
  });
});
