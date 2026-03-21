import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createFixedCostsService,
  CreateFixedCostInput,
  UpdateFixedCostInput,
} from '../services/fixed-costs.service';

const createFixedCostSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  categoryId: z.string().min(1, 'Category is required'),
  dueDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().optional(),
});

const updateFixedCostSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  dueDay: z.number().int().min(1).max(31).optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function fixedCostsRoutes(fastify: FastifyInstance) {
  const fixedCostsService = createFixedCostsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List fixed costs
  fastify.get<{ Querystring: { activeOnly?: string } }>(
    '/',
    async (request: FastifyRequest<{ Querystring: { activeOnly?: string } }>, reply) => {
      try {
        const activeOnly = request.query.activeOnly !== 'false';
        const fixedCosts = await fixedCostsService.list(
          request.jwtPayload.householdId,
          activeOnly
        );
        return reply.send({
          success: true,
          data: fixedCosts,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list fixed costs';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get single fixed cost
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const fixedCost = await fixedCostsService.getById(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: fixedCost,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Fixed cost not found';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create fixed cost
  fastify.post<{ Body: CreateFixedCostInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateFixedCostInput }>, reply) => {
      try {
        const validated = createFixedCostSchema.parse(request.body);
        const fixedCost = await fixedCostsService.create(
          validated,
          request.jwtPayload.householdId,
          request.jwtPayload.userId
        );
        return reply.status(201).send({
          success: true,
          data: fixedCost,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create fixed cost';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update fixed cost
  fastify.put<{ Params: { id: string }; Body: UpdateFixedCostInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateFixedCostInput }>,
      reply
    ) => {
      try {
        const validated = updateFixedCostSchema.parse(request.body);
        const fixedCost = await fixedCostsService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: fixedCost,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update fixed cost';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete fixed cost
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await fixedCostsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete fixed cost';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get monthly total
  fastify.get(
    '/monthly-total',
    async (request: FastifyRequest, reply) => {
      try {
        const total = await fixedCostsService.getMonthlyTotal(
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: { total },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get monthly total';
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
