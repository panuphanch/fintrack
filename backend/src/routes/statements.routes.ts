import { FastifyInstance, FastifyRequest } from 'fastify';
import { createStatementsService } from '../services/statements.service';

interface StatementsQuery {
  cardId?: string;
}

export async function statementsRoutes(fastify: FastifyInstance) {
  const statementsService = createStatementsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List statements
  fastify.get<{ Querystring: StatementsQuery }>(
    '/',
    async (request: FastifyRequest<{ Querystring: StatementsQuery }>, reply) => {
      try {
        const statements = await statementsService.list(
          request.jwtPayload.householdId,
          request.query.cardId
        );
        return reply.send({
          success: true,
          data: statements,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list statements';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Mark statement as paid
  fastify.put<{ Params: { id: string } }>(
    '/:id/mark-paid',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const statement = await statementsService.markPaid(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: statement,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark statement as paid';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
