import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createCategoriesService,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoryInput,
} from '../services/categories.service';

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format'),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  label: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(50).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});

const reorderCategoriesSchema = z.array(
  z.object({
    id: z.string(),
    sortOrder: z.number().int().min(0),
  })
);

export async function categoriesRoutes(fastify: FastifyInstance) {
  const categoriesService = createCategoriesService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List categories
  fastify.get(
    '/',
    async (request: FastifyRequest, reply) => {
      try {
        // Ensure household has categories (creates defaults if needed)
        const categories = await categoriesService.ensureHouseholdHasCategories(
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: categories,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list categories';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get single category
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const category = await categoriesService.getById(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: category,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Category not found';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create category
  fastify.post<{ Body: CreateCategoryInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateCategoryInput }>, reply) => {
      try {
        const validated = createCategorySchema.parse(request.body);
        const category = await categoriesService.create(
          validated,
          request.jwtPayload.householdId
        );
        return reply.status(201).send({
          success: true,
          data: category,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create category';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update category
  fastify.put<{ Params: { id: string }; Body: UpdateCategoryInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateCategoryInput }>,
      reply
    ) => {
      try {
        const validated = updateCategorySchema.parse(request.body);
        const category = await categoriesService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: category,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update category';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete category
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await categoriesService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete category';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Reorder categories
  fastify.post<{ Body: ReorderCategoryInput[] }>(
    '/reorder',
    async (request: FastifyRequest<{ Body: ReorderCategoryInput[] }>, reply) => {
      try {
        const validated = reorderCategoriesSchema.parse(request.body);
        const categories = await categoriesService.reorder(
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: categories,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to reorder categories';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
