import { FastifyInstance, FastifyRequest } from 'fastify';
import { createAnalyticsService } from '../services/analytics.service';
import { monthQuerySchema, paymentMonthQuerySchema, trendQuerySchema } from '../types/schemas';

interface MonthQuery {
  month: string;
}

interface PaymentMonthQuery {
  paymentMonth: string;
}

export async function analyticsRoutes(fastify: FastifyInstance) {
  const analyticsService = createAnalyticsService(fastify.prisma);

  // Require authentication for all routes
  fastify.addHook('preHandler', fastify.authenticate);

  // Get monthly summary
  fastify.get<{ Querystring: MonthQuery }>(
    '/monthly-summary',
    async (request: FastifyRequest<{ Querystring: MonthQuery }>, reply) => {
      try {
        const validated = monthQuerySchema.parse(request.query);
        const summary = await analyticsService.getMonthlySummary(
          request.jwtPayload.householdId,
          validated.month
        );
        return reply.send({
          success: true,
          data: summary,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get summary';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get spending by category
  fastify.get<{ Querystring: MonthQuery }>(
    '/by-category',
    async (request: FastifyRequest<{ Querystring: MonthQuery }>, reply) => {
      try {
        const validated = monthQuerySchema.parse(request.query);
        const data = await analyticsService.getByCategory(
          request.jwtPayload.householdId,
          validated.month
        );
        return reply.send({
          success: true,
          data,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get category data';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get spending by card
  fastify.get<{ Querystring: MonthQuery }>(
    '/by-card',
    async (request: FastifyRequest<{ Querystring: MonthQuery }>, reply) => {
      try {
        const validated = monthQuerySchema.parse(request.query);
        const data = await analyticsService.getByCard(
          request.jwtPayload.householdId,
          validated.month
        );
        return reply.send({
          success: true,
          data,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get card data';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get monthly trend for dashboard chart
  fastify.get<{ Querystring: { months?: string } }>(
    '/monthly-trend',
    async (request: FastifyRequest<{ Querystring: { months?: string } }>, reply) => {
      try {
        const validated = trendQuerySchema.parse(request.query);
        const data = await analyticsService.getMonthlyTrend(
          request.jwtPayload.householdId,
          validated.months
        );
        return reply.send({
          success: true,
          data,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get trend data';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get billing cycle summary
  fastify.get<{ Querystring: PaymentMonthQuery }>(
    '/billing-cycle-summary',
    async (request: FastifyRequest<{ Querystring: PaymentMonthQuery }>, reply) => {
      try {
        const validated = paymentMonthQuerySchema.parse(request.query);
        const data = await analyticsService.getBillingCycleSummary(
          request.jwtPayload.householdId,
          validated.paymentMonth
        );
        return reply.send({
          success: true,
          data,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get billing cycle summary';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
