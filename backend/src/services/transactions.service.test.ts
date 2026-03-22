import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createTransactionsService } from './transactions.service';

const service = createTransactionsService(mockPrisma);
const householdId = 'household-1';
const userId = 'user-1';

const mockTransaction = {
  id: 't-1',
  amount: new Prisma.Decimal(500),
  merchant: 'Restaurant',
  categoryId: 'cat-1',
  cardId: 'card-1',
  date: new Date('2025-03-15'),
  notes: null,
  receiptUrl: null,
  isRecurring: false,
  householdId,
  createdById: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  card: { id: 'card-1', name: 'TTB', bank: 'TTB', lastFour: '1234', color: '#000' },
  category: { id: 'cat-1', name: 'FOOD_DINING' },
  tags: [{ tag: { id: 'tag-1', name: 'Lunch' } }],
  createdBy: { id: userId, name: 'Test', email: 'test@test.com' },
};

beforeEach(() => {
  resetMocks();
});

describe('TransactionsService', () => {
  describe('list', () => {
    it('should return transactions with decimal conversion and flattened tags', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([mockTransaction]);
      (mockPrisma.transaction.count as any).mockResolvedValue(1);

      const result = await service.list(householdId);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].amount).toBe(500);
      expect(result.data[0].tags).toEqual([{ id: 'tag-1', name: 'Lunch' }]);
      expect(result.pagination).toEqual({
        total: 1,
        limit: 20,
        offset: 0,
        hasMore: false,
      });
    });

    it('should apply card filter', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.count as any).mockResolvedValue(0);

      await service.list(householdId, { cardId: 'card-1' });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ householdId, cardId: 'card-1' }),
        })
      );
    });

    it('should apply date range filter', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.count as any).mockResolvedValue(0);

      await service.list(householdId, {
        startDate: '2025-03-01',
        endDate: '2025-03-31',
      });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date('2025-03-01'),
              lte: new Date('2025-03-31T23:59:59.999Z'),
            },
          }),
        })
      );
    });

    it('should apply search filter', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.count as any).mockResolvedValue(0);

      await service.list(householdId, { search: 'Rest' });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            merchant: { contains: 'Rest', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should apply tag filter', async () => {
      (mockPrisma.transaction.findMany as any).mockResolvedValue([]);
      (mockPrisma.transaction.count as any).mockResolvedValue(0);

      await service.list(householdId, { tagIds: ['tag-1', 'tag-2'] });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { some: { tagId: { in: ['tag-1', 'tag-2'] } } },
          }),
        })
      );
    });
  });

  describe('getById', () => {
    it('should return a transaction', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(mockTransaction);

      const result = await service.getById('t-1', householdId);

      expect(result.amount).toBe(500);
      expect(result.tags).toEqual([{ id: 'tag-1', name: 'Lunch' }]);
    });

    it('should throw if not found', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(null);

      await expect(service.getById('999', householdId)).rejects.toThrow('Transaction not found');
    });
  });

  describe('create', () => {
    it('should create a transaction with tags', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue({ id: 'card-1' });
      (mockPrisma.transaction.create as any).mockResolvedValue(mockTransaction);

      const result = await service.create(
        {
          cardId: 'card-1',
          amount: 500,
          merchant: 'Restaurant',
          categoryId: 'cat-1',
          date: '2025-03-15',
          tagIds: ['tag-1'],
        },
        householdId,
        userId
      );

      expect(result.amount).toBe(500);
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });

    it('should throw if card not found', async () => {
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(
        service.create(
          {
            cardId: 'bad-card',
            amount: 500,
            merchant: 'X',
            categoryId: 'cat-1',
            date: '2025-03-15',
          },
          householdId,
          userId
        )
      ).rejects.toThrow('Card not found');
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(mockTransaction);
      (mockPrisma.transaction.update as any).mockResolvedValue({
        ...mockTransaction,
        merchant: 'Updated',
      });

      const result = await service.update(
        't-1',
        { merchant: 'Updated' },
        householdId
      );

      expect(result.merchant).toBe('Updated');
    });

    it('should update tags by deleting and recreating', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(mockTransaction);
      (mockPrisma.transaction.update as any).mockResolvedValue(mockTransaction);

      await service.update('t-1', { tagIds: ['tag-2', 'tag-3'] }, householdId);

      expect(mockPrisma.transactionTag.deleteMany).toHaveBeenCalledWith({
        where: { transactionId: 't-1' },
      });
      expect(mockPrisma.transactionTag.createMany).toHaveBeenCalledWith({
        data: [
          { transactionId: 't-1', tagId: 'tag-2' },
          { transactionId: 't-1', tagId: 'tag-3' },
        ],
      });
    });

    it('should throw if not found', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(null);

      await expect(service.update('999', { merchant: 'X' }, householdId)).rejects.toThrow(
        'Transaction not found'
      );
    });

    it('should throw if updated card not found', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(mockTransaction);
      (mockPrisma.creditCard.findFirst as any).mockResolvedValue(null);

      await expect(
        service.update('t-1', { cardId: 'bad-card' }, householdId)
      ).rejects.toThrow('Card not found');
    });
  });

  describe('delete', () => {
    it('should delete a transaction', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(mockTransaction);

      await service.delete('t-1', householdId);

      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({ where: { id: 't-1' } });
    });

    it('should throw if not found', async () => {
      (mockPrisma.transaction.findFirst as any).mockResolvedValue(null);

      await expect(service.delete('999', householdId)).rejects.toThrow('Transaction not found');
    });
  });
});
