import { PrismaClient, Prisma } from '@prisma/client';
import { subMonths, setDate, addMonths } from 'date-fns';
import { decimalToNumber } from '../utils/decimal';
import { calculateBillingPeriod } from '../utils/billingPeriod';
import type { CreateCardInput, UpdateCardInput } from '../types';

export function createCardsService(prisma: PrismaClient) {
  return {
    async list(householdId: string) {
      const cards = await prisma.creditCard.findMany({
        where: { householdId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      });

      return cards.map((card) => ({
        ...card,
        creditLimit: decimalToNumber(card.creditLimit),
      }));
    },

    async getById(id: string, householdId: string) {
      const card = await prisma.creditCard.findFirst({
        where: { id, householdId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      return {
        ...card,
        creditLimit: decimalToNumber(card.creditLimit),
      };
    },

    async create(input: CreateCardInput, householdId: string) {
      const card = await prisma.creditCard.create({
        data: {
          ...input,
          creditLimit: new Prisma.Decimal(input.creditLimit),
          householdId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        ...card,
        creditLimit: decimalToNumber(card.creditLimit),
      };
    },

    async update(id: string, input: UpdateCardInput, householdId: string) {
      // Verify card belongs to household
      const existing = await prisma.creditCard.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Card not found');
      }

      const updateData: Prisma.CreditCardUpdateInput = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.bank !== undefined) updateData.bank = input.bank;
      if (input.lastFour !== undefined) updateData.lastFour = input.lastFour;
      if (input.color !== undefined) updateData.color = input.color;
      if (input.cutoffDay !== undefined) updateData.cutoffDay = input.cutoffDay;
      if (input.dueDay !== undefined) updateData.dueDay = input.dueDay;
      if (input.creditLimit !== undefined)
        updateData.creditLimit = new Prisma.Decimal(input.creditLimit);
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.ownerId !== undefined) {
        updateData.owner = input.ownerId ? { connect: { id: input.ownerId } } : { disconnect: true };
      }

      const card = await prisma.creditCard.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        ...card,
        creditLimit: decimalToNumber(card.creditLimit),
      };
    },

    async delete(id: string, householdId: string) {
      // Soft delete by setting isActive to false
      const existing = await prisma.creditCard.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Card not found');
      }

      await prisma.creditCard.update({
        where: { id },
        data: { isActive: false },
      });
    },

    async getCurrentStatement(id: string, householdId: string) {
      const card = await prisma.creditCard.findFirst({
        where: { id, householdId },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      // Calculate current billing period based on cutoff day
      const today = new Date();
      const cutoffDay = card.cutoffDay;

      let periodStart: Date;
      let periodEnd: Date;

      if (today.getDate() <= cutoffDay) {
        // We're before cutoff, so current period started last month
        periodStart = setDate(subMonths(today, 1), cutoffDay + 1);
        periodEnd = setDate(today, cutoffDay);
      } else {
        // We're after cutoff, so current period started this month
        periodStart = setDate(today, cutoffDay + 1);
        periodEnd = setDate(addMonths(today, 1), cutoffDay);
      }

      // Get transactions in this period
      const transactions = await prisma.transaction.findMany({
        where: {
          cardId: id,
          date: {
            gte: periodStart,
            lte: periodEnd,
          },
        },
        include: {
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
        orderBy: { date: 'desc' },
      });

      const totalAmount = transactions.reduce(
        (sum, t) => sum + decimalToNumber(t.amount),
        0
      );

      return {
        transactions: transactions.map((t) => ({
          ...t,
          amount: decimalToNumber(t.amount),
          tags: t.tags.map((tt) => tt.tag),
        })),
        totalAmount,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
    },

    async markStatementPaid(cardId: string, paymentMonth: string, householdId: string) {
      // Verify card belongs to household
      const card = await prisma.creditCard.findFirst({
        where: { id: cardId, householdId },
      });

      if (!card) {
        throw new Error('Card not found');
      }

      const billingPeriod = calculateBillingPeriod(
        paymentMonth,
        card.cutoffDay,
        card.dueDay
      );

      // Calculate total amount from transactions in this period
      const transactions = await prisma.transaction.findMany({
        where: {
          cardId,
          date: {
            gte: billingPeriod.start,
            lte: billingPeriod.end,
          },
        },
      });

      const totalAmount = transactions.reduce(
        (sum, t) => sum + decimalToNumber(t.amount),
        0
      );

      // Upsert statement record
      const statement = await prisma.statement.upsert({
        where: {
          cardId_periodStart: {
            cardId,
            periodStart: billingPeriod.start,
          },
        },
        update: {
          isPaid: true,
          paidAt: new Date(),
        },
        create: {
          cardId,
          periodStart: billingPeriod.start,
          periodEnd: billingPeriod.end,
          totalAmount: new Prisma.Decimal(totalAmount),
          isPaid: true,
          paidAt: new Date(),
        },
      });

      return {
        ...statement,
        totalAmount: decimalToNumber(statement.totalAmount),
      };
    },
  };
}

export type CardsService = ReturnType<typeof createCardsService>;
