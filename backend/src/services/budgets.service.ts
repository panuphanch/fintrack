import { PrismaClient, Prisma } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { decimalToNumber } from '../utils/decimal';
import type { CreateBudgetInput, UpdateBudgetInput } from '../types';

export function createBudgetsService(prisma: PrismaClient) {
  /**
   * Build spending maps for transactions, installments, and fixed costs
   * for all categories in a household for the current month.
   */
  async function getSpendingMaps(householdId: string) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const spending = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        householdId,
        date: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    const spendingMap = new Map(
      spending.map((s) => [s.categoryId, decimalToNumber(s._sum.amount)])
    );

    const installments = await prisma.installment.findMany({
      where: { householdId, isActive: true },
    });

    const installmentMap = new Map<string, number>();
    for (const inst of installments) {
      const current = installmentMap.get(inst.categoryId) || 0;
      installmentMap.set(inst.categoryId, current + decimalToNumber(inst.monthlyAmount));
    }

    const fixedCosts = await prisma.fixedCost.findMany({
      where: { householdId, isActive: true },
    });

    const fixedCostMap = new Map<string, number>();
    for (const fc of fixedCosts) {
      const current = fixedCostMap.get(fc.categoryId) || 0;
      fixedCostMap.set(fc.categoryId, current + decimalToNumber(fc.amount));
    }

    return { spendingMap, installmentMap, fixedCostMap };
  }

  function getCategorySpent(
    categoryId: string,
    maps: { spendingMap: Map<string, number>; installmentMap: Map<string, number>; fixedCostMap: Map<string, number> }
  ): number {
    return (maps.spendingMap.get(categoryId) || 0)
      + (maps.installmentMap.get(categoryId) || 0)
      + (maps.fixedCostMap.get(categoryId) || 0);
  }

  return {
    async list(householdId: string) {
      const budgets = await prisma.budget.findMany({
        where: { householdId },
        include: {
          category: true,
        },
        orderBy: { category: { sortOrder: 'asc' } },
      });

      const maps = await getSpendingMaps(householdId);

      return budgets.map((budget) => ({
        ...budget,
        category: budget.category,
        monthlyLimit: decimalToNumber(budget.monthlyLimit),
        spent: getCategorySpent(budget.categoryId, maps),
      }));
    },

    async listWithAllCategories(householdId: string) {
      const categories = await prisma.category.findMany({
        where: { householdId },
        orderBy: { sortOrder: 'asc' },
      });

      const budgets = await prisma.budget.findMany({
        where: { householdId },
      });
      const budgetMap = new Map(budgets.map((b) => [b.categoryId, b]));

      const maps = await getSpendingMaps(householdId);

      return categories.map((cat) => {
        const budget = budgetMap.get(cat.id);
        return {
          category: cat,
          budget: budget
            ? { id: budget.id, monthlyLimit: decimalToNumber(budget.monthlyLimit) }
            : null,
          spent: getCategorySpent(cat.id, maps),
        };
      });
    },

    async create(input: CreateBudgetInput, householdId: string) {
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

      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const spending = await prisma.transaction.aggregate({
        where: {
          householdId,
          categoryId: budget.categoryId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      const installmentSpending = await prisma.installment.aggregate({
        where: {
          householdId,
          categoryId: budget.categoryId,
          isActive: true,
        },
        _sum: { monthlyAmount: true },
      });

      const fixedCostSpending = await prisma.fixedCost.aggregate({
        where: {
          householdId,
          categoryId: budget.categoryId,
          isActive: true,
        },
        _sum: { amount: true },
      });

      return {
        ...budget,
        monthlyLimit: decimalToNumber(budget.monthlyLimit),
        spent: decimalToNumber(spending._sum.amount)
          + decimalToNumber(installmentSpending._sum.monthlyAmount)
          + decimalToNumber(fixedCostSpending._sum.amount),
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
