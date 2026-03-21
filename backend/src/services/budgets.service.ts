import { PrismaClient, Prisma } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { decimalToNumber } from '../utils/decimal';
import type { CreateBudgetInput, UpdateBudgetInput } from '../types';

export function createBudgetsService(prisma: PrismaClient) {
  return {
    async list(householdId: string) {
      const budgets = await prisma.budget.findMany({
        where: { householdId },
        include: {
          category: true,
        },
        orderBy: { category: { sortOrder: 'asc' } },
      });

      // Get current month spending for each category
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const spending = await prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          householdId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spendingMap = new Map(
        spending.map((s) => [s.categoryId, decimalToNumber(s._sum.amount)])
      );

      return budgets.map((budget) => ({
        ...budget,
        monthlyLimit: decimalToNumber(budget.monthlyLimit),
        spent: spendingMap.get(budget.categoryId) || 0,
      }));
    },

    async create(input: CreateBudgetInput, householdId: string) {
      // Check for existing budget for this category
      const existing = await prisma.budget.findFirst({
        where: {
          householdId,
          categoryId: input.categoryId,
        },
      });

      if (existing) {
        throw new Error('Budget for this category already exists');
      }

      const budget = await prisma.budget.create({
        data: {
          categoryId: input.categoryId,
          monthlyLimit: new Prisma.Decimal(input.monthlyLimit),
          householdId,
        },
        include: {
          category: true,
        },
      });

      return {
        ...budget,
        monthlyLimit: decimalToNumber(budget.monthlyLimit),
        spent: 0,
      };
    },

    async update(id: string, input: UpdateBudgetInput, householdId: string) {
      const existing = await prisma.budget.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Budget not found');
      }

      const budget = await prisma.budget.update({
        where: { id },
        data: {
          monthlyLimit: new Prisma.Decimal(input.monthlyLimit),
        },
        include: {
          category: true,
        },
      });

      // Get current spending
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const spending = await prisma.transaction.aggregate({
        where: {
          householdId,
          categoryId: budget.categoryId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      return {
        ...budget,
        monthlyLimit: decimalToNumber(budget.monthlyLimit),
        spent: decimalToNumber(spending._sum.amount),
      };
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.budget.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Budget not found');
      }

      await prisma.budget.delete({
        where: { id },
      });
    },
  };
}

export type BudgetsService = ReturnType<typeof createBudgetsService>;
