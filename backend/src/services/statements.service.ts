import { PrismaClient, Prisma } from '@prisma/client';
import { decimalToNumber } from '../utils/decimal';

export function createStatementsService(prisma: PrismaClient) {
  return {
    async list(householdId: string, cardId?: string) {
      const where: Prisma.StatementWhereInput = {
        card: { householdId },
      };

      if (cardId) {
        where.cardId = cardId;
      }

      const statements = await prisma.statement.findMany({
        where,
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              lastFour: true,
              color: true,
            },
          },
        },
        orderBy: { periodStart: 'desc' },
      });

      return statements.map((s) => ({
        ...s,
        totalAmount: decimalToNumber(s.totalAmount),
      }));
    },

    async markPaid(id: string, householdId: string) {
      const statement = await prisma.statement.findFirst({
        where: {
          id,
          card: { householdId },
        },
      });

      if (!statement) {
        throw new Error('Statement not found');
      }

      if (statement.isPaid) {
        throw new Error('Statement is already paid');
      }

      const updated = await prisma.statement.update({
        where: { id },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              lastFour: true,
              color: true,
            },
          },
        },
      });

      return {
        ...updated,
        totalAmount: decimalToNumber(updated.totalAmount),
      };
    },
  };
}

export type StatementsService = ReturnType<typeof createStatementsService>;
