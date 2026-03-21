import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createCardsService } from './cards.service';

const service = createCardsService(mockPrisma);
const householdId = 'household-1';

const mockCard = {
  id: 'card-1',
  name: 'TTB Reserve',
  bank: 'TTB',
  lastFour: '1234',
  color: '#1e3a5f',
  cutoffDay: 25,
  dueDay: 5,
  creditLimit: new Prisma.Decimal(50000),
  isActive: true,
  householdId,
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  owner: { id: 'user-1', name: 'Test', email: 'test@test.com' },
};

beforeEach(() => {
  resetMocks();
});

describe('CardsService', () => {
  describe('list', () => {
    it('should return cards with creditLimit as number', async () => {
      (mockPrisma.creditCard.findMany as any).mockResolvedValue([mockCard]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(1);
      expect(result[0].creditLimit).toBe(50000);
      expect(typeof result[0].creditLimit).toBe('number');
    });
  });

  describe('getById', () => {
    it('should return a card', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);

      const result = await service.getById('card-1', householdId);

      expect(result.creditLimit).toBe(50000);
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(service.getById('999', householdId)).rejects.toThrow('Card not found');
    });
  });

  describe('create', () => {
    it('should create a card with decimal conversion', async () => {
      (mockPrisma.creditCard.create as any).mockResolvedValue(mockCard);

      const result = await service.create(
        {
          name: 'TTB Reserve',
          bank: 'TTB',
          lastFour: '1234',
          color: '#1e3a5f',
          cutoffDay: 25,
          dueDay: 5,
          creditLimit: 50000,
          ownerId: 'user-1',
        },
        householdId
      );

      expect(result.creditLimit).toBe(50000);
      expect(mockPrisma.creditCard.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);
      (mockPrisma.creditCard.update as any).mockResolvedValue({
        ...mockCard,
        name: 'Updated Card',
      });

      const result = await service.update('card-1', { name: 'Updated Card' }, householdId);

      expect(result.name).toBe('Updated Card');
    });

    it('should handle ownerId disconnect (set to null)', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);
      (mockPrisma.creditCard.update as any).mockResolvedValue({ ...mockCard, ownerId: null, owner: null });

      await service.update('card-1', { ownerId: '' }, householdId);

      expect(mockPrisma.creditCard.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            owner: { disconnect: true },
          }),
        })
      );
    });

    it('should handle creditLimit update', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);
      (mockPrisma.creditCard.update as any).mockResolvedValue({ ...mockCard, creditLimit: new Prisma.Decimal(100000) });

      const result = await service.update('card-1', { creditLimit: 100000, cutoffDay: 10, dueDay: 20, isActive: false }, householdId);

      expect(result.creditLimit).toBe(100000);
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { name: 'X' }, householdId)).rejects.toThrow(
        'Card not found'
      );
    });
  });

  describe('delete', () => {
    it('should soft delete by setting isActive to false', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);

      await service.delete('card-1', householdId);

      expect(mockPrisma.creditCard.update).toHaveBeenCalledWith({
        where: { id: 'card-1' },
        data: { isActive: false },
      });
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Card not found');
    });
  });

  describe('getCurrentStatement', () => {
    it('should return transactions with total for current billing period', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);
      (mockPrisma.transaction.findMany as any).mockResolvedValue([
        {
          id: 't1',
          amount: new Prisma.Decimal(500),
          tags: [{ tag: { id: 'tag-1', name: 'Food' } }],
          createdBy: { id: 'user-1', name: 'Test', email: 'test@test.com' },
        },
      ]);

      const result = await service.getCurrentStatement('card-1', householdId);

      expect(result.totalAmount).toBe(500);
      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].tags).toEqual([{ id: 'tag-1', name: 'Food' }]);
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(service.getCurrentStatement('999', householdId)).rejects.toThrow(
        'Card not found'
      );
    });
  });

  describe('markStatementPaid', () => {
    it('should upsert statement as paid', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(mockCard);
      (mockPrisma.transaction.findMany as any).mockResolvedValue([
        { amount: new Prisma.Decimal(1000) },
        { amount: new Prisma.Decimal(2000) },
      ]);
      (mockPrisma.statement.upsert as any).mockResolvedValue({
        id: 's-1',
        cardId: 'card-1',
        isPaid: true,
        totalAmount: new Prisma.Decimal(3000),
      });

      const result = await service.markStatementPaid('card-1', '2026-04', householdId);

      expect(result.isPaid).toBe(true);
      expect(result.totalAmount).toBe(3000);
      expect(mockPrisma.statement.upsert).toHaveBeenCalled();
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(
        service.markStatementPaid('999', '2026-04', householdId)
      ).rejects.toThrow('Card not found');
    });
  });
});
