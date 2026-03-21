import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createInstallmentsService } from './installments.service';

const service = createInstallmentsService(mockPrisma);
const householdId = 'household-1';
const userId = 'user-1';

const mockInstallment = {
  id: 'inst-1',
  name: 'iPhone',
  totalAmount: new Prisma.Decimal(45000),
  monthlyAmount: new Prisma.Decimal(4500),
  currentInstallment: 5,
  totalInstallments: 10,
  categoryId: 'cat-1',
  startDate: new Date('2025-01-01'),
  notes: null,
  isActive: true,
  householdId,
  cardId: 'card-1',
  createdById: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  card: { id: 'card-1', name: 'TTB', bank: 'TTB', color: '#000' },
  category: { id: 'cat-1', name: 'GADGET' },
  createdBy: { id: userId, name: 'Test' },
};

beforeEach(() => {
  resetMocks();
});

describe('InstallmentsService', () => {
  describe('list', () => {
    it('should return active installments by default with decimal conversion', async () => {
      (mockPrisma.installment.findMany as any).mockResolvedValue([mockInstallment]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(1);
      expect(result[0].totalAmount).toBe(45000);
      expect(result[0].monthlyAmount).toBe(4500);
      expect(mockPrisma.installment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId, isActive: true },
        })
      );
    });

    it('should return all installments when activeOnly is false', async () => {
      (mockPrisma.installment.findMany as any).mockResolvedValue([]);

      await service.list(householdId, false);

      expect(mockPrisma.installment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { householdId },
        })
      );
    });
  });

  describe('getById', () => {
    it('should return an installment', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(mockInstallment);

      const result = await service.getById('inst-1', householdId);

      expect(result.totalAmount).toBe(45000);
      expect(result.monthlyAmount).toBe(4500);
    });

    it('should throw if not found', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(null);

      await expect(service.getById('999', householdId)).rejects.toThrow('Installment not found');
    });
  });

  describe('create', () => {
    it('should create an installment', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue({ id: 'card-1' });
      (mockPrisma.installment.create as any).mockResolvedValue(mockInstallment);

      const result = await service.create(
        {
          name: 'iPhone',
          totalAmount: 45000,
          monthlyAmount: 4500,
          totalInstallments: 10,
          categoryId: 'cat-1',
          startDate: '2025-01-01',
          cardId: 'card-1',
        },
        householdId,
        userId
      );

      expect(result.totalAmount).toBe(45000);
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'X',
            totalAmount: 1000,
            monthlyAmount: 100,
            totalInstallments: 10,
            categoryId: 'cat-1',
            startDate: '2025-01-01',
            cardId: 'bad-card',
          },
          householdId,
          userId
        )
      ).rejects.toThrow('Card not found');
    });

    it('should create without card', async () => {
      (mockPrisma.installment.create as any).mockResolvedValue({
        ...mockInstallment,
        cardId: null,
        card: null,
      });

      await service.create(
        {
          name: 'iPhone',
          totalAmount: 45000,
          monthlyAmount: 4500,
          totalInstallments: 10,
          categoryId: 'cat-1',
          startDate: '2025-01-01',
        },
        householdId,
        userId
      );

      expect(mockPrisma.creditCard.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an installment', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(mockInstallment);
      (mockPrisma.installment.update as any).mockResolvedValue({
        ...mockInstallment,
        name: 'Updated',
      });

      const result = await service.update('inst-1', { name: 'Updated' }, householdId);

      expect(result.name).toBe('Updated');
    });

    it('should throw if not found', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' }, householdId)).rejects.toThrow(
        'Installment not found'
      );
    });

    it('should throw if updated card not found', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(mockInstallment);
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(
        service.update('inst-1', { cardId: 'bad-card' }, householdId)
      ).rejects.toThrow('Card not found');
    });
  });

  describe('incrementInstallment', () => {
    it('should increment current installment', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(mockInstallment);
      (mockPrisma.installment.update as any).mockResolvedValue({
        ...mockInstallment,
        currentInstallment: 6,
      });

      const result = await service.incrementInstallment('inst-1', householdId);

      expect(mockPrisma.installment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentInstallment: 6, isActive: true },
        })
      );
      expect(result.currentInstallment).toBe(6);
    });

    it('should mark as inactive when reaching total installments', async () => {
      const lastInstallment = {
        ...mockInstallment,
        currentInstallment: 10,
        totalInstallments: 10,
      };
      (mockPrisma.installment.findFirst as any).mockResolvedValue(lastInstallment);
      (mockPrisma.installment.update as any).mockResolvedValue({
        ...lastInstallment,
        isActive: false,
      });

      await service.incrementInstallment('inst-1', householdId);

      expect(mockPrisma.installment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentInstallment: 10, isActive: false },
        })
      );
    });

    it('should throw if not found', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(null);

      await expect(service.incrementInstallment('999', householdId)).rejects.toThrow(
        'Installment not found'
      );
    });
  });

  describe('delete', () => {
    it('should delete an installment', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(mockInstallment);

      await service.delete('inst-1', householdId);

      expect(mockPrisma.installment.delete).toHaveBeenCalledWith({ where: { id: 'inst-1' } });
    });

    it('should throw if not found', async () => {
      (mockPrisma.installment.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Installment not found');
    });
  });

  describe('getMonthlyTotal', () => {
    it('should sum active installment monthly amounts', async () => {
      (mockPrisma.installment.findMany as any).mockResolvedValue([
        { monthlyAmount: new Prisma.Decimal(4500) },
        { monthlyAmount: new Prisma.Decimal(2000) },
      ]);

      const result = await service.getMonthlyTotal(householdId);

      expect(result).toBe(6500);
    });

    it('should return 0 when no active installments', async () => {
      (mockPrisma.installment.findMany as any).mockResolvedValue([]);

      const result = await service.getMonthlyTotal(householdId);

      expect(result).toBe(0);
    });
  });
});
