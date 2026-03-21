import { PrismaClient, Prisma } from '@prisma/client';
import { decimalToNumber } from '../utils/decimal';

export interface CreateFixedCostInput {
  name: string;
  amount: number;
  categoryId: string;
  dueDay?: number;
  notes?: string;
}

export interface UpdateFixedCostInput {
  name?: string;
  amount?: number;
  categoryId?: string;
  dueDay?: number | null;
  notes?: string | null;
  isActive?: boolean;
}

export function createFixedCostsService(prisma: PrismaClient) {
  return {
    async list(householdId: string, activeOnly = true) {
      const fixedCosts = await prisma.fixedCost.findMany({
        where: {
          householdId,
          ...(activeOnly ? { isActive: true } : {}),
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      });

      return fixedCosts.map((fc) => ({
        ...fc,
        amount: decimalToNumber(fc.amount),
      }));
    },

    async getById(id: string, householdId: string) {
      const fixedCost = await prisma.fixedCost.findFirst({
        where: { id, householdId },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!fixedCost) {
        throw new Error('Fixed cost not found');
      }

      return {
        ...fixedCost,
        amount: decimalToNumber(fixedCost.amount),
      };
    },

    async create(input: CreateFixedCostInput, householdId: string, userId: string) {
      const fixedCost = await prisma.fixedCost.create({
        data: {
          name: input.name,
          amount: new Prisma.Decimal(input.amount),
          categoryId: input.categoryId,
          dueDay: input.dueDay,
          notes: input.notes,
          householdId,
          createdById: userId,
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...fixedCost,
        amount: decimalToNumber(fixedCost.amount),
      };
    },

    async update(id: string, input: UpdateFixedCostInput, householdId: string) {
      const existing = await prisma.fixedCost.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Fixed cost not found');
      }

      const data: Prisma.FixedCostUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.amount !== undefined) data.amount = new Prisma.Decimal(input.amount);
      if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
      if (input.dueDay !== undefined) data.dueDay = input.dueDay;
      if (input.notes !== undefined) data.notes = input.notes;
      if (input.isActive !== undefined) data.isActive = input.isActive;

      const fixedCost = await prisma.fixedCost.update({
        where: { id },
        data,
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...fixedCost,
        amount: decimalToNumber(fixedCost.amount),
      };
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.fixedCost.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Fixed cost not found');
      }

      await prisma.fixedCost.delete({
        where: { id },
      });
    },

    async getMonthlyTotal(householdId: string) {
      const activeFixedCosts = await prisma.fixedCost.findMany({
        where: { householdId, isActive: true },
      });

      return activeFixedCosts.reduce(
        (sum, fc) => sum + decimalToNumber(fc.amount),
        0
      );
    },
  };
}

export type FixedCostsService = ReturnType<typeof createFixedCostsService>;
