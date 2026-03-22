import { PrismaClient, Prisma } from '@prisma/client';
import { decimalToNumber } from '../utils/decimal';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from '../types';

export function createTransactionsService(prisma: PrismaClient) {
  return {
    async list(householdId: string, filters?: TransactionFilters) {
      const where: Prisma.TransactionWhereInput = { householdId };

      if (filters?.cardId) {
        where.cardId = filters.cardId;
      }

      if (filters?.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
          where.date.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          where.date.lte = new Date(filters.endDate + 'T23:59:59.999Z');
        }
      }

      if (filters?.search) {
        where.merchant = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }

      if (filters?.tagIds && filters.tagIds.length > 0) {
        where.tags = {
          some: {
            tagId: {
              in: filters.tagIds,
            },
          },
        };
      }

      const limit = filters?.limit ?? 20;
      const offset = filters?.offset ?? 0;

      const includeOptions = {
        card: {
          select: {
            id: true,
            name: true,
            bank: true,
            lastFour: true,
            color: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      };

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: includeOptions,
          orderBy: { date: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.transaction.count({ where }),
      ]);

      return {
        data: transactions.map((t) => ({
          ...t,
          amount: decimalToNumber(t.amount),
          tags: t.tags.map((tt) => tt.tag),
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    },

    async getById(id: string, householdId: string) {
      const transaction = await prisma.transaction.findFirst({
        where: { id, householdId },
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
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        ...transaction,
        amount: decimalToNumber(transaction.amount),
        tags: transaction.tags.map((tt) => tt.tag),
      };
    },

    async create(input: CreateTransactionInput, householdId: string, userId: string) {
      const { tagIds, ...transactionData } = input;

      // Verify card belongs to household
      const card = await prisma.creditCard.findFirst({
        where: { id: input.cardId, householdId },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      const transaction = await prisma.transaction.create({
        data: {
          ...transactionData,
          amount: new Prisma.Decimal(transactionData.amount),
          date: new Date(transactionData.date),
          householdId,
          createdById: userId,
          tags: tagIds?.length
            ? {
                create: tagIds.map((tagId) => ({ tagId })),
              }
            : undefined,
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
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        ...transaction,
        amount: decimalToNumber(transaction.amount),
        tags: transaction.tags.map((tt) => tt.tag),
      };
    },

    async update(id: string, input: UpdateTransactionInput, householdId: string) {
      const existing = await prisma.transaction.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Transaction not found');
      }

      const { tagIds, ...updateData } = input;

      // If card is being changed, verify it belongs to household
      if (updateData.cardId) {
        const card = await prisma.creditCard.findFirst({
          where: { id: updateData.cardId, householdId },
        });
        if (!card) {
          throw new Error('Card not found');
        }
      }

      const data: Prisma.TransactionUpdateInput = {};
      if (updateData.cardId) data.card = { connect: { id: updateData.cardId } };
      if (updateData.amount !== undefined) data.amount = new Prisma.Decimal(updateData.amount);
      if (updateData.merchant !== undefined) data.merchant = updateData.merchant;
      if (updateData.categoryId !== undefined) data.category = { connect: { id: updateData.categoryId } };
      if (updateData.date !== undefined) data.date = new Date(updateData.date);
      if (updateData.notes !== undefined) data.notes = updateData.notes;
      if (updateData.receiptUrl !== undefined) data.receiptUrl = updateData.receiptUrl;
      if (updateData.isRecurring !== undefined) data.isRecurring = updateData.isRecurring;

      // Handle tags update
      if (tagIds !== undefined) {
        // Delete existing tags and recreate
        await prisma.transactionTag.deleteMany({
          where: { transactionId: id },
        });

        if (tagIds.length > 0) {
          await prisma.transactionTag.createMany({
            data: tagIds.map((tagId) => ({ transactionId: id, tagId })),
          });
        }
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data,
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
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        ...transaction,
        amount: decimalToNumber(transaction.amount),
        tags: transaction.tags.map((tt) => tt.tag),
      };
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.transaction.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Transaction not found');
      }

      await prisma.transaction.delete({
        where: { id },
      });
    },
  };
}

export type TransactionsService = ReturnType<typeof createTransactionsService>;
