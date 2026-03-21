import { FastifyInstance, FastifyRequest } from 'fastify';
import { createTagsService } from '../services/tags.service';
import { createTagSchema } from '../types/schemas';
import type { CreateTagInput } from '../types';

export async function tagsRoutes(fastify: FastifyInstance) {
  const tagsService = createTagsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List all tags
  fastify.get(
    '/',
    async (request: FastifyRequest, reply) => {
      try {
        const tags = await tagsService.list(request.jwtPayload.householdId);
        return reply.send({
          success: true,
          data: tags,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list tags';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create tag
  fastify.post<{ Body: CreateTagInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateTagInput }>, reply) => {
      try {
        const validated = createTagSchema.parse(request.body);
        const tag = await tagsService.create(
          validated,
          request.jwtPayload.householdId
        );
        return reply.status(201).send({
          success: true,
          data: tag,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create tag';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete tag
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await tagsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete tag';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
