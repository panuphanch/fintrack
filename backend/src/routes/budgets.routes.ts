import { FastifyInstance, FastifyRequest } from 'fastify';
import { createBudgetsService } from '../services/budgets.service';
import { createBudgetSchema, updateBudgetSchema } from '../types/schemas';
import type { CreateBudgetInput, UpdateBudgetInput } from '../types';

export async function budgetsRoutes(fastify: FastifyInstance) {
  const budgetsService = createBudgetsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // Budget overview: all categories with spending and optional budget data
  fastify.get(
    '/overview',
    async (request: FastifyRequest, reply) => {
      try {
        const overview = await budgetsService.listWithAllCategories(request.jwtPayload.householdId);
        return reply.send({
          success: true,
          data: overview,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load budget overview';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // List all budgets with current spending
  fastify.get(
    '/',
    async (request: FastifyRequest, reply) => {
      try {
        const budgets = await budgetsService.list(request.jwtPayload.householdId);
        return reply.send({
          success: true,
          data: budgets,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list budgets';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create budget
  fastify.post<{ Body: CreateBudgetInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateBudgetInput }>, reply) => {
      try {
        const validated = createBudgetSchema.parse(request.body);
        const budget = await budgetsService.create(
          validated,
          request.jwtPayload.householdId
        );
        return reply.status(201).send({
          success: true,
          data: budget,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create budget';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update budget
  fastify.put<{ Params: { id: string }; Body: UpdateBudgetInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateBudgetInput }>,
      reply
    ) => {
      try {
        const validated = updateBudgetSchema.parse(request.body);
        const budget = await budgetsService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: budget,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update budget';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete budget
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await budgetsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete budget';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
