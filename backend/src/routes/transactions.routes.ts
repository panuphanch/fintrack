import { FastifyInstance, FastifyRequest } from 'fastify';
import { createTransactionsService } from '../services/transactions.service';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
} from '../types/schemas';
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFilters } from '../types';

export async function transactionsRoutes(fastify: FastifyInstance) {
  const transactionsService = createTransactionsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List transactions with filters
  fastify.get<{ Querystring: TransactionFilters }>(
    '/',
    async (request: FastifyRequest<{ Querystring: TransactionFilters }>, reply) => {
      try {
        const validated = transactionFiltersSchema.parse(request.query);

        // Parse comma-separated tagIds
        const filters: TransactionFilters = {
          ...validated,
          tagIds: validated.tagIds ? validated.tagIds.split(',').filter(Boolean) : undefined,
        };

        const transactions = await transactionsService.list(
          request.jwtPayload.householdId,
          filters
        );
        return reply.send({
          success: true,
          data: transactions,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list transactions';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get single transaction
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const transaction = await transactionsService.getById(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: transaction,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Transaction not found';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create transaction
  fastify.post<{ Body: CreateTransactionInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateTransactionInput }>, reply) => {
      try {
        const validated = createTransactionSchema.parse(request.body);
        const transaction = await transactionsService.create(
          validated,
          request.jwtPayload.householdId,
          request.jwtPayload.userId
        );
        return reply.status(201).send({
          success: true,
          data: transaction,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create transaction';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update transaction
  fastify.put<{ Params: { id: string }; Body: UpdateTransactionInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateTransactionInput }>,
      reply
    ) => {
      try {
        const validated = updateTransactionSchema.parse(request.body);
        const transaction = await transactionsService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: transaction,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update transaction';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete transaction
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await transactionsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete transaction';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
