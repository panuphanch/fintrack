import { FastifyInstance, FastifyRequest } from 'fastify';
import { createCardsService } from '../services/cards.service';
import { createCardSchema, updateCardSchema, markCardPaidSchema } from '../types/schemas';
import type { CreateCardInput, UpdateCardInput, MarkCardPaidInput } from '../types';

export async function cardsRoutes(fastify: FastifyInstance) {
  const cardsService = createCardsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List all cards
  fastify.get(
    '/',
    async (request: FastifyRequest, reply) => {
      try {
        const cards = await cardsService.list(request.jwtPayload.householdId);
        return reply.send({
          success: true,
          data: cards,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list cards';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get single card
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const card = await cardsService.getById(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: card,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Card not found';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create card
  fastify.post<{ Body: CreateCardInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateCardInput }>, reply) => {
      try {
        const validated = createCardSchema.parse(request.body);
        const card = await cardsService.create(
          validated,
          request.jwtPayload.householdId
        );
        return reply.status(201).send({
          success: true,
          data: card,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create card';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update card
  fastify.put<{ Params: { id: string }; Body: UpdateCardInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateCardInput }>,
      reply
    ) => {
      try {
        const validated = updateCardSchema.parse(request.body);
        const card = await cardsService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: card,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update card';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete card (soft delete)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await cardsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete card';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get current statement
  fastify.get<{ Params: { id: string } }>(
    '/:id/current-statement',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const statement = await cardsService.getCurrentStatement(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: statement,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get statement';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Mark card payment as paid
  fastify.post<{ Params: { id: string }; Body: MarkCardPaidInput }>(
    '/:id/pay',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: MarkCardPaidInput }>,
      reply
    ) => {
      try {
        const validated = markCardPaidSchema.parse(request.body);
        const statement = await cardsService.markStatementPaid(
          request.params.id,
          validated.paymentMonth,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: statement,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark card as paid';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
