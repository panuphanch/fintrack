import { FastifyInstance, FastifyRequest } from 'fastify';
import { createAuthService } from '../services/auth.service';

export async function householdRoutes(fastify: FastifyInstance) {
  const authService = createAuthService(fastify.prisma);

  // Get household members
  fastify.get(
    '/members',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply) => {
      try {
        const members = await authService.getHouseholdMembers(
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: members,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get members';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
