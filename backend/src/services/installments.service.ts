import { PrismaClient, Prisma } from '@prisma/client';
import { decimalToNumber } from '../utils/decimal';

export interface CreateInstallmentInput {
  cardId?: string;
  name: string;
  totalAmount: number;
  monthlyAmount: number;
  currentInstallment?: number;
  totalInstallments: number;
  categoryId: string;
  startDate: string;
  notes?: string;
}

export interface UpdateInstallmentInput {
  cardId?: string | null;
  name?: string;
  totalAmount?: number;
  monthlyAmount?: number;
  currentInstallment?: number;
  totalInstallments?: number;
  categoryId?: string;
  startDate?: string;
  notes?: string | null;
  isActive?: boolean;
}

export function createInstallmentsService(prisma: PrismaClient) {
  return {
    async list(householdId: string, activeOnly = true) {
      const installments = await prisma.installment.findMany({
        where: {
          householdId,
          ...(activeOnly ? { isActive: true } : {}),
        },
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              color: true,
            },
          },
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

      return installments.map((inst) => ({
        ...inst,
        totalAmount: decimalToNumber(inst.totalAmount),
        monthlyAmount: decimalToNumber(inst.monthlyAmount),
      }));
    },

    async getById(id: string, householdId: string) {
      const installment = await prisma.installment.findFirst({
        where: { id, householdId },
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              color: true,
            },
          },
          category: true,
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!installment) {
        throw new Error('Installment not found');
      }

      return {
        ...installment,
        totalAmount: decimalToNumber(installment.totalAmount),
        monthlyAmount: decimalToNumber(installment.monthlyAmount),
      };
    },

    async create(input: CreateInstallmentInput, householdId: string, userId: string) {
      // Verify card belongs to household if provided
      if (input.cardId) {
        const card = await prisma.creditCard.findFirst({
          where: { id: input.cardId, householdId },
        });
        if (!card) {
          throw new Error('Card not found');
        }
      }

      const installment = await prisma.installment.create({
        data: {
          name: input.name,
          totalAmount: new Prisma.Decimal(input.totalAmount),
          monthlyAmount: new Prisma.Decimal(input.monthlyAmount),
          currentInstallment: input.currentInstallment || 1,
          totalInstallments: input.totalInstallments,
          categoryId: input.categoryId,
          startDate: new Date(input.startDate),
          notes: input.notes,
          householdId,
          cardId: input.cardId,
          createdById: userId,
        },
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              color: true,
            },
          },
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
        ...installment,
        totalAmount: decimalToNumber(installment.totalAmount),
        monthlyAmount: decimalToNumber(installment.monthlyAmount),
      };
    },

    async update(id: string, input: UpdateInstallmentInput, householdId: string) {
      const existing = await prisma.installment.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Installment not found');
      }

      // Verify card if being changed
      if (input.cardId) {
        const card = await prisma.creditCard.findFirst({
          where: { id: input.cardId, householdId },
        });
        if (!card) {
          throw new Error('Card not found');
        }
      }

      const data: Prisma.InstallmentUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.totalAmount !== undefined) data.totalAmount = new Prisma.Decimal(input.totalAmount);
      if (input.monthlyAmount !== undefined) data.monthlyAmount = new Prisma.Decimal(input.monthlyAmount);
      if (input.currentInstallment !== undefined) data.currentInstallment = input.currentInstallment;
      if (input.totalInstallments !== undefined) data.totalInstallments = input.totalInstallments;
      if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
      if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
      if (input.notes !== undefined) data.notes = input.notes;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.cardId !== undefined) {
        data.card = input.cardId ? { connect: { id: input.cardId } } : { disconnect: true };
      }

      const installment = await prisma.installment.update({
        where: { id },
        data,
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              color: true,
            },
          },
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
        ...installment,
        totalAmount: decimalToNumber(installment.totalAmount),
        monthlyAmount: decimalToNumber(installment.monthlyAmount),
      };
    },

    async incrementInstallment(id: string, householdId: string) {
      const existing = await prisma.installment.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Installment not found');
      }

      const newCurrent = existing.currentInstallment + 1;
      const isCompleted = newCurrent > existing.totalInstallments;

      const installment = await prisma.installment.update({
        where: { id },
        data: {
          currentInstallment: isCompleted ? existing.totalInstallments : newCurrent,
          isActive: !isCompleted,
        },
        include: {
          card: {
            select: {
              id: true,
              name: true,
              bank: true,
              color: true,
            },
          },
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
        ...installment,
        totalAmount: decimalToNumber(installment.totalAmount),
        monthlyAmount: decimalToNumber(installment.monthlyAmount),
      };
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.installment.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Installment not found');
      }

      await prisma.installment.delete({
        where: { id },
      });
    },

    async getMonthlyTotal(householdId: string) {
      const activeInstallments = await prisma.installment.findMany({
        where: { householdId, isActive: true },
      });

      return activeInstallments.reduce(
        (sum, inst) => sum + decimalToNumber(inst.monthlyAmount),
        0
      );
    },
  };
}

export type InstallmentsService = ReturnType<typeof createInstallmentsService>;
