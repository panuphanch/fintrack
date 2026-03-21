import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, parseISO, subMonths, format } from 'date-fns';
import { decimalToNumber } from '../utils/decimal';
import { calculateBillingPeriod, formatPaymentMonthDisplay } from '../utils/billingPeriod';
import type { MonthlySummary, CategorySummary, CardSummary, BillingCycleSummary, CardBillingSummary, MonthlyTrend } from '../types';

export function createAnalyticsService(prisma: PrismaClient) {
  return {
    async getMonthlySummary(householdId: string, month: string): Promise<MonthlySummary> {
      const monthDate = parseISO(`${month}-01`);
      const startDate = startOfMonth(monthDate);
      const endDate = endOfMonth(monthDate);

      // Get all transactions for the month with category info
      const transactions = await prisma.transaction.findMany({
        where: {
          householdId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          card: {
            select: {
              id: true,
              name: true,
            },
          },
          category: true,
        },
      });

      const totalSpent = transactions.reduce(
        (sum, t) => sum + decimalToNumber(t.amount),
        0
      );

      // Group by category
      const categoryMap = new Map<string, {
        categoryName: string;
        categoryLabel: string;
        categoryColor: string;
        amount: number;
        count: number
      }>();
      for (const t of transactions) {
        const existing = categoryMap.get(t.categoryId) || {
          categoryName: t.category.name,
          categoryLabel: t.category.label,
          categoryColor: t.category.color,
          amount: 0,
          count: 0
        };
        categoryMap.set(t.categoryId, {
          categoryName: t.category.name,
          categoryLabel: t.category.label,
          categoryColor: t.category.color,
          amount: existing.amount + decimalToNumber(t.amount),
          count: existing.count + 1,
        });
      }

      const byCategory: CategorySummary[] = Array.from(categoryMap.entries())
        .map(([categoryId, data]) => ({
          categoryId,
          categoryName: data.categoryName,
          categoryLabel: data.categoryLabel,
          categoryColor: data.categoryColor,
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Group by card
      const cardMap = new Map<string, { name: string; amount: number; count: number }>();
      for (const t of transactions) {
        const existing = cardMap.get(t.cardId) || {
          name: t.card.name,
          amount: 0,
          count: 0,
        };
        cardMap.set(t.cardId, {
          name: t.card.name,
          amount: existing.amount + decimalToNumber(t.amount),
          count: existing.count + 1,
        });
      }

      const byCard: CardSummary[] = Array.from(cardMap.entries())
        .map(([cardId, data]) => ({
          cardId,
          cardName: data.name,
          amount: data.amount,
          count: data.count,
          percentage: totalSpent > 0 ? (data.amount / totalSpent) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        month,
        totalSpent,
        transactionCount: transactions.length,
        byCategory,
        byCard,
      };
    },

    async getByCategory(householdId: string, month: string): Promise<CategorySummary[]> {
      const summary = await this.getMonthlySummary(householdId, month);
      return summary.byCategory;
    },

    async getByCard(householdId: string, month: string): Promise<CardSummary[]> {
      const summary = await this.getMonthlySummary(householdId, month);
      return summary.byCard;
    },

    async getMonthlyTrend(householdId: string, months: number = 6): Promise<MonthlyTrend[]> {
      const now = new Date();
      const results: MonthlyTrend[] = [];

      // Get current installments and fixed costs totals (constant for v1)
      const installments = await prisma.installment.findMany({
        where: { householdId, isActive: true },
      });
      const installmentsTotal = installments.reduce(
        (sum, inst) => sum + decimalToNumber(inst.monthlyAmount),
        0
      );

      const fixedCosts = await prisma.fixedCost.findMany({
        where: { householdId, isActive: true },
      });
      const fixedCostsTotal = fixedCosts.reduce(
        (sum, fc) => sum + decimalToNumber(fc.amount),
        0
      );

      // Get transaction totals per month
      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const monthStr = format(monthDate, 'yyyy-MM');

        const transactionAgg = await prisma.transaction.aggregate({
          where: {
            householdId,
            date: { gte: start, lte: end },
          },
          _sum: { amount: true },
        });

        const transactionsAmount = transactionAgg._sum.amount
          ? decimalToNumber(transactionAgg._sum.amount)
          : 0;

        results.push({
          month: monthStr,
          transactions: transactionsAmount,
          installments: installmentsTotal,
          fixedCosts: fixedCostsTotal,
          total: transactionsAmount + installmentsTotal + fixedCostsTotal,
        });
      }

      return results;
    },

    async getBillingCycleSummary(householdId: string, paymentMonth: string): Promise<BillingCycleSummary> {
      // Get all active cards
      const cards = await prisma.creditCard.findMany({
        where: { householdId, isActive: true },
        include: {
          owner: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Get all active installments
      const installments = await prisma.installment.findMany({
        where: { householdId, isActive: true },
      });

      // Get active fixed costs total
      const fixedCosts = await prisma.fixedCost.findMany({
        where: { householdId, isActive: true },
      });
      const fixedCostsTotal = fixedCosts.reduce(
        (sum, fc) => sum + decimalToNumber(fc.amount),
        0
      );

      // Build installments by card map
      const installmentsByCard = new Map<string, number>();
      let totalInstallments = 0;
      for (const inst of installments) {
        totalInstallments += decimalToNumber(inst.monthlyAmount);
        if (inst.cardId) {
          const current = installmentsByCard.get(inst.cardId) || 0;
          installmentsByCard.set(inst.cardId, current + decimalToNumber(inst.monthlyAmount));
        }
      }

      // Build category spending map for transactions + installments
      const categorySpending = new Map<string, {
        categoryId: string;
        categoryName: string;
        categoryLabel: string;
        categoryColor: string;
        amount: number;
        count: number;
      }>();

      // Add installments to category spending
      for (const inst of installments) {
        const category = await prisma.category.findUnique({
          where: { id: inst.categoryId },
        });
        if (category) {
          const existing = categorySpending.get(inst.categoryId);
          if (existing) {
            existing.amount += decimalToNumber(inst.monthlyAmount);
          } else {
            categorySpending.set(inst.categoryId, {
              categoryId: inst.categoryId,
              categoryName: category.name,
              categoryLabel: category.label,
              categoryColor: category.color,
              amount: decimalToNumber(inst.monthlyAmount),
              count: 0,
            });
          }
        }
      }

      // Process each card
      const cardSummaries: CardBillingSummary[] = [];
      let totalTransactions = 0;

      for (const card of cards) {
        const billingPeriod = calculateBillingPeriod(
          paymentMonth,
          card.cutoffDay,
          card.dueDay
        );

        // Get transactions for this card's billing period
        const transactions = await prisma.transaction.findMany({
          where: {
            cardId: card.id,
            date: {
              gte: billingPeriod.start,
              lte: billingPeriod.end,
            },
          },
          include: {
            category: true,
          },
        });

        const transactionAmount = transactions.reduce(
          (sum, t) => sum + decimalToNumber(t.amount),
          0
        );
        totalTransactions += transactionAmount;

        // Add transactions to category spending
        for (const t of transactions) {
          const existing = categorySpending.get(t.categoryId);
          if (existing) {
            existing.amount += decimalToNumber(t.amount);
            existing.count += 1;
          } else {
            categorySpending.set(t.categoryId, {
              categoryId: t.categoryId,
              categoryName: t.category.name,
              categoryLabel: t.category.label,
              categoryColor: t.category.color,
              amount: decimalToNumber(t.amount),
              count: 1,
            });
          }
        }

        const installmentAmount = installmentsByCard.get(card.id) || 0;

        // Check if statement exists and is paid
        const statement = await prisma.statement.findUnique({
          where: {
            cardId_periodStart: {
              cardId: card.id,
              periodStart: billingPeriod.start,
            },
          },
        });

        cardSummaries.push({
          cardId: card.id,
          cardName: card.name,
          cardColor: card.color,
          cardBank: card.bank,
          cardLastFour: card.lastFour,
          ownerName: card.owner?.name || null,
          billingPeriod: {
            start: billingPeriod.start.toISOString(),
            end: billingPeriod.end.toISOString(),
          },
          dueDate: billingPeriod.dueDate.toISOString(),
          transactionAmount,
          installmentAmount,
          totalAmount: transactionAmount + installmentAmount,
          transactionCount: transactions.length,
          isPaid: statement?.isPaid || false,
        });
      }

      // Build category summaries
      const totalCategoryAmount = Array.from(categorySpending.values())
        .reduce((sum, cat) => sum + cat.amount, 0);

      const byCategory: CategorySummary[] = Array.from(categorySpending.values())
        .map((cat) => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          categoryLabel: cat.categoryLabel,
          categoryColor: cat.categoryColor,
          amount: cat.amount,
          count: cat.count,
          percentage: totalCategoryAmount > 0 ? (cat.amount / totalCategoryAmount) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      return {
        paymentMonth,
        paymentMonthDisplay: formatPaymentMonthDisplay(paymentMonth),
        cards: cardSummaries,
        totals: {
          transactions: totalTransactions,
          installments: totalInstallments,
          fixedCosts: fixedCostsTotal,
          grandTotal: totalTransactions + totalInstallments + fixedCostsTotal,
        },
        byCategory,
      };
    },
  };
}

export type AnalyticsService = ReturnType<typeof createAnalyticsService>;
