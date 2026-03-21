import { PrismaClient } from '@prisma/client';
import type { CreateTagInput } from '../types';

export function createTagsService(prisma: PrismaClient) {
  return {
    async list(householdId: string) {
      return prisma.tag.findMany({
        where: { householdId },
        orderBy: { name: 'asc' },
      });
    },

    async create(input: CreateTagInput, householdId: string) {
      // Check for duplicate
      const existing = await prisma.tag.findFirst({
        where: {
          householdId,
          name: input.name,
        },
      });

      if (existing) {
        throw new Error('Tag with this name already exists');
      }

      return prisma.tag.create({
        data: {
          name: input.name,
          householdId,
        },
      });
    },

    async delete(id: string, householdId: string) {
      const existing = await prisma.tag.findFirst({
        where: { id, householdId },
      });

      if (!existing) {
        throw new Error('Tag not found');
      }

      // Check if tag is in use
      const usageCount = await prisma.transactionTag.count({
        where: { tagId: id },
      });

      if (usageCount > 0) {
        throw new Error(`Tag is used in ${usageCount} transactions. Remove it from transactions first.`);
      }

      await prisma.tag.delete({
        where: { id },
      });
    },
  };
}

export type TagsService = ReturnType<typeof createTagsService>;
