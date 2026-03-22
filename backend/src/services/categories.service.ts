import { PrismaClient } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  label: string;
  color: string;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  label?: string;
  color?: string;
  icon?: string | null;
  sortOrder?: number;
}

export interface ReorderCategoryInput {
  id: string;
  sortOrder: number;
}

// Default categories to be created for new households
export const DEFAULT_CATEGORIES = [
  { name: 'HOME', label: 'Home', color: '#3b82f6', icon: 'home', sortOrder: 0, isSystem: true },
  { name: 'HEALTH', label: 'Health', color: '#22c55e', icon: 'heart', sortOrder: 1, isSystem: true },
  { name: 'GADGET', label: 'Gadget', color: '#8b5cf6', icon: 'device-mobile', sortOrder: 2, isSystem: true },
  { name: 'CLOTHES', label: 'Clothes', color: '#ec4899', icon: 'shopping-bag', sortOrder: 3, isSystem: true },
  { name: 'CAR', label: 'Car', color: '#f97316', icon: 'truck', sortOrder: 4, isSystem: true },
  { name: 'BAKERY', label: 'Bakery', color: '#a855f7', icon: 'cake', sortOrder: 5, isSystem: true },
  { name: 'FOOD_DINING', label: 'Food & Dining', color: '#ef4444', icon: 'fire', sortOrder: 6, isSystem: true },
  { name: 'ENTERTAINMENT', label: 'Entertainment', color: '#06b6d4', icon: 'film', sortOrder: 7, isSystem: true },
  { name: 'TRAVEL', label: 'Travel', color: '#14b8a6', icon: 'globe', sortOrder: 8, isSystem: true },
  { name: 'FIXED', label: 'Fixed', color: '#6b7280', icon: 'calendar', sortOrder: 9, isSystem: true },
  { name: 'OTHERS', label: 'Others', color: '#9ca3af', icon: 'dots-horizontal', sortOrder: 10, isSystem: true },
];

export function createCategoriesService(prisma: PrismaClient) {
  return {
    async list(householdId: string) {
      const categories = await prisma.category.findMany({
        where: { householdId },
        orderBy: { sortOrder: 'asc' },
      });
      return categories;
    },

    async getById(id: string, householdId: string) {
      const category = await prisma.category.findFirst({
        where: { id, householdId },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    },

    async getByName(name: string, householdId: string) {
      const category = await prisma.category.findFirst({
        where: { name, householdId },
      });

      return category;
    },

    async create(input: CreateCategoryInput, householdId: string) {
      // Check for duplicate name
      const existing = await prisma.category.findFirst({
        where: { name: input.name.toUpperCase(), householdId },
      });

      if (existing) {
        throw new Error('Category with this name already exists');
      }

      // Get max sortOrder if not provided
      let sortOrder = input.sortOrder;
      if (sortOrder === undefined) {
        const maxSort = await prisma.category.aggregate({
          where: { householdId },
          _max: { sortOrder: true },
        });
        sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
      }

      const category = await prisma.category.create({
        data: {
          name: input.name.toUpperCase(),
          label: input.label,
          color: input.color,
          icon: input.icon,
          sortOrder,
          isSystem: false,
          householdId,
        },
      });

      return category;
    },

    async update(id: string, input: UpdateCategoryInput, householdId: string) {
      const existing = await prisma.category.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Category not found');
      }

      // If changing name, check for duplicates
      if (input.name && input.name.toUpperCase() !== existing.name) {
        const duplicate = await prisma.category.findFirst({
          where: { name: input.name.toUpperCase(), householdId },
        });
        if (duplicate) {
          throw new Error('Category with this name already exists');
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          name: input.name ? input.name.toUpperCase() : undefined,
          label: input.label,
          color: input.color,
          icon: input.icon,
          sortOrder: input.sortOrder,
        },
      });

      return category;
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.category.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Category not found');
      }

      if (existing.isSystem) {
        throw new Error('Cannot delete system categories');
      }

      // Check if category is in use
      const transactionCount = await prisma.transaction.count({
        where: { categoryId: id },
      });

      const budgetCount = await prisma.budget.count({
        where: { categoryId: id },
      });

      const installmentCount = await prisma.installment.count({
        where: { categoryId: id },
      });

      const fixedCostCount = await prisma.fixedCost.count({
        where: { categoryId: id },
      });

      const totalUsage = transactionCount + budgetCount + installmentCount + fixedCostCount;

      if (totalUsage > 0) {
        throw new Error(
          `Cannot delete category: it is used by ${transactionCount} transactions, ${budgetCount} budgets, ${installmentCount} installments, and ${fixedCostCount} fixed costs`
        );
      }

      await prisma.category.delete({
        where: { id },
      });
    },

    async reorder(items: ReorderCategoryInput[], householdId: string) {
      // Verify all categories belong to the household
      const categoryIds = items.map((i) => i.id);
      const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds }, householdId },
      });

      if (categories.length !== items.length) {
        throw new Error('Some categories were not found');
      }

      // Update all sort orders in a transaction
      await prisma.$transaction(
        items.map((item) =>
          prisma.category.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        )
      );

      return this.list(householdId);
    },

    async createDefaultCategories(householdId: string) {
      const existingCategories = await prisma.category.count({
        where: { householdId },
      });

      if (existingCategories > 0) {
        return; // Categories already exist
      }

      await prisma.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          householdId,
        })),
      });
    },

    async ensureHouseholdHasCategories(householdId: string) {
      await this.createDefaultCategories(householdId);
      return this.list(householdId);
    },
  };
}

export type CategoriesService = ReturnType<typeof createCategoriesService>;
