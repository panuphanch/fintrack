import { Prisma } from '@prisma/client';
import { mockPrisma, resetMocks } from '../__mocks__/prisma';
import { createStatementsService } from './statements.service';

const service = createStatementsService(mockPrisma);
const householdId = 'household-1';

const mockStatement = {
  id: 's-1',
  cardId: 'card-1',
  periodStart: new Date('2026-02-16'),
  periodEnd: new Date('2026-03-15'),
  totalAmount: new Prisma.Decimal(5000),
  isPaid: false,
  paidAt: null,
  card: { id: 'card-1', name: 'TTB', bank: 'TTB', lastFour: '1234', color: '#000' },
};

beforeEach(() => {
  resetMocks();
});

describe('StatementsService', () => {
  describe('list', () => {
    it('should return statements with decimal conversion', async () => {
      (mockPrisma.statement.findMany as any).mockResolvedValue([mockStatement]);

      const result = await service.list(householdId);

      expect(result).toHaveLength(1);
      expect(result[0].totalAmount).toBe(5000);
      expect(typeof result[0].totalAmount).toBe('number');
    });

    it('should filter by cardId when provided', async () => {
      (mockPrisma.statement.findMany as any).mockResolvedValue([]);

      await service.list(householdId, 'card-1');

      expect(mockPrisma.statement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { card: { householdId }, cardId: 'card-1' },
        })
      );
    });

    it('should not filter by cardId when not provided', async () => {
      (mockPrisma.statement.findMany as any).mockResolvedValue([]);

      await service.list(householdId);

      expect(mockPrisma.statement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { card: { householdId } },
        })
      );
    });
  });

  describe('markPaid', () => {
    it('should mark statement as paid', async () => {
      (mockPrisma.statement.findFirst as any).mockResolvedValue(mockStatement);
      (mockPrisma.statement.update as any).mockResolvedValue({
        ...mockStatement,
        isPaid: true,
        paidAt: new Date(),
      });

      const result = await service.markPaid('s-1', householdId);

      expect(result.isPaid).toBe(true);
      expect(result.totalAmount).toBe(5000);
      expect(mockPrisma.statement.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 's-1' },
          data: expect.objectContaining({ isPaid: true }),
        })
      );
    });

    it('should throw if statement not found', async () => {
      (mockPrisma.statement.findFirst as any).mockResolvedValue(null);

      await expect(service.markPaid('999', householdId)).rejects.toThrow('Statement not found');
    });

    it('should throw if already paid', async () => {
      (mockPrisma.statement.findFirst as any).mockResolvedValue({
        ...mockStatement,
        isPaid: true,
      });

      await expect(service.markPaid('s-1', householdId)).rejects.toThrow(
        'Statement is already paid'
      );
    });
  });
});
