import { PrismaClient, Prisma } from '@prisma/client';
import { startOfMonth, endOfMonth } from 'date-fns';
import { decimalToNumber } from '../utils/decimal';
import type { CreateBudgetInput, UpdateBudgetInput } from '../types';

/**
 * Get all category IDs that should roll up into a budget category.
 * Returns the category itself + all children that have it as parentId.
 */
async function getCategoryIdsWithChildren(
  prisma: PrismaClient,
  categoryId: string,
  householdId: string
): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { householdId, parentId: categoryId },
    select: { id: true },
  });
  return [categoryId, ...children.map((c) => c.id)];
}

export function createBudgetsService(prisma: PrismaClient) {
  return {
    async list(householdId: string) {
      const budgets = await prisma.budget.findMany({
        where: { householdId },
        include: {
          category: {
            include: { children: { select: { id: true } } },
          },
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

      // Include active installments grouped by category
      const installments = await prisma.installment.findMany({
        where: { householdId, isActive: true },
      });

      const installmentMap = new Map<string, number>();
      for (const inst of installments) {
        const current = installmentMap.get(inst.categoryId) || 0;
        installmentMap.set(inst.categoryId, current + decimalToNumber(inst.monthlyAmount));
      }

      // Include active fixed costs grouped by category
      const fixedCosts = await prisma.fixedCost.findMany({
        where: { householdId, isActive: true },
      });

      const fixedCostMap = new Map<string, number>();
      for (const fc of fixedCosts) {
        const current = fixedCostMap.get(fc.categoryId) || 0;
        fixedCostMap.set(fc.categoryId, current + decimalToNumber(fc.amount));
      }

      return budgets.map((budget) => {
        // Collect IDs: this category + all child categories
        const categoryIds = [
          budget.categoryId,
          ...budget.category.children.map((c) => c.id),
        ];

        // Sum spending across parent + children (transactions + installments + fixed costs)
        let totalSpent = 0;
        for (const catId of categoryIds) {
          totalSpent += spendingMap.get(catId) || 0;
          totalSpent += installmentMap.get(catId) || 0;
          totalSpent += fixedCostMap.get(catId) || 0;
        }

        // Strip children from response to keep shape consistent
        const { children: _, ...category } = budget.category;

        return {
          ...budget,
          category,
          monthlyLimit: decimalToNumber(budget.monthlyLimit),
          spent: totalSpent,
        };
      });
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

      // Get all category IDs (parent + children) for rollup
      const categoryIds = await getCategoryIdsWithChildren(prisma, budget.categoryId, householdId);

      // Get current spending (transactions + installments) across all related categories
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const spending = await prisma.transaction.aggregate({
        where: {
          householdId,
          categoryId: { in: categoryIds },
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const installmentSpending = await prisma.installment.aggregate({
        where: {
          householdId,
          categoryId: { in: categoryIds },
          isActive: true,
        },
        _sum: {
          monthlyAmount: true,
        },
      });

      const fixedCostSpending = await prisma.fixedCost.aggregate({
        where: {
          householdId,
          categoryId: { in: categoryIds },
          isActive: true,
        },
        _sum: {
          amount: true,
        },
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
