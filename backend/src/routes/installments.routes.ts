import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  createInstallmentsService,
  CreateInstallmentInput,
  UpdateInstallmentInput,
} from '../services/installments.service';

const createInstallmentSchema = z.object({
  cardId: z.string().optional(),
  name: z.string().min(1),
  totalAmount: z.number().min(0),
  monthlyAmount: z.number().min(0),
  currentInstallment: z.number().int().min(1).optional(),
  totalInstallments: z.number().int().min(1),
  categoryId: z.string().min(1, 'Category is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
});

const updateInstallmentSchema = z.object({
  cardId: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  totalAmount: z.number().min(0).optional(),
  monthlyAmount: z.number().min(0).optional(),
  currentInstallment: z.number().int().min(1).optional(),
  totalInstallments: z.number().int().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function installmentsRoutes(fastify: FastifyInstance) {
  const installmentsService = createInstallmentsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // List installments
  fastify.get<{ Querystring: { activeOnly?: string } }>(
    '/',
    async (request: FastifyRequest<{ Querystring: { activeOnly?: string } }>, reply) => {
      try {
        const activeOnly = request.query.activeOnly !== 'false';
        const installments = await installmentsService.list(
          request.jwtPayload.householdId,
          activeOnly
        );
        return reply.send({
          success: true,
          data: installments,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list installments';
        fastify.log.error(error);
        return reply.status(500).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get single installment
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const installment = await installmentsService.getById(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: installment,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Installment not found';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Create installment
  fastify.post<{ Body: CreateInstallmentInput }>(
    '/',
    async (request: FastifyRequest<{ Body: CreateInstallmentInput }>, reply) => {
      try {
        const validated = createInstallmentSchema.parse(request.body);
        const installment = await installmentsService.create(
          validated,
          request.jwtPayload.householdId,
          request.jwtPayload.userId
        );
        return reply.status(201).send({
          success: true,
          data: installment,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create installment';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Update installment
  fastify.put<{ Params: { id: string }; Body: UpdateInstallmentInput }>(
    '/:id',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateInstallmentInput }>,
      reply
    ) => {
      try {
        const validated = updateInstallmentSchema.parse(request.body);
        const installment = await installmentsService.update(
          request.params.id,
          validated,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: installment,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update installment';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Increment installment (advance to next payment)
  fastify.post<{ Params: { id: string } }>(
    '/:id/increment',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const installment = await installmentsService.incrementInstallment(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: installment,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to increment installment';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Delete installment
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        await installmentsService.delete(
          request.params.id,
          request.jwtPayload.householdId
        );
        return reply.send({
          success: true,
          data: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete installment';
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
        const total = await installmentsService.getMonthlyTotal(
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
