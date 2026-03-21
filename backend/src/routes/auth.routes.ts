import { FastifyInstance, FastifyRequest } from 'fastify';
import { createAuthService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  inviteSchema,
  acceptInviteSchema,
} from '../types/schemas';
import type { RegisterInput, LoginInput, AcceptInviteInput } from '../types';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = createAuthService(fastify.prisma);

  // Register new user with household
  fastify.post<{ Body: RegisterInput }>(
    '/register',
    async (request, reply) => {
      try {
        const validated = registerSchema.parse(request.body);
        const user = await authService.register(validated);

        const token = fastify.jwt.sign({
          userId: user.id,
          householdId: user.householdId,
          email: user.email,
        });

        return reply.status(201).send({
          success: true,
          data: { user, token },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Login
  fastify.post<{ Body: LoginInput }>(
    '/login',
    async (request, reply) => {
      try {
        const validated = loginSchema.parse(request.body);
        const user = await authService.login(validated);

        const token = fastify.jwt.sign({
          userId: user.id,
          householdId: user.householdId,
          email: user.email,
        });

        return reply.send({
          success: true,
          data: { user, token },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        return reply.status(401).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Logout (client-side token removal, but we can add server-side blacklisting later)
  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate] },
    async (_request, reply) => {
      // For now, just return success - client will remove token
      // Could add token blacklisting here if needed
      return reply.send({
        success: true,
        data: null,
      });
    }
  );

  // Get current user
  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply) => {
      try {
        const user = await authService.getUserById(request.jwtPayload.userId);
        return reply.send({
          success: true,
          data: user,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to get user';
        return reply.status(404).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Send invitation
  fastify.post<{ Body: { email: string } }>(
    '/invite',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest<{ Body: { email: string } }>, reply) => {
      try {
        const validated = inviteSchema.parse(request.body);
        const invitation = await authService.createInvitation(
          validated.email,
          request.jwtPayload.userId,
          request.jwtPayload.householdId
        );

        // In production, send email here
        // For now, just return the invitation with token for testing
        return reply.status(201).send({
          success: true,
          data: invitation,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create invitation';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Get invitation details (for accept-invite page)
  fastify.get<{ Params: { token: string } }>(
    '/invite/:token',
    async (request, reply) => {
      try {
        const { token } = request.params;
        const invitation = await authService.getInvitation(token);
        return reply.send({
          success: true,
          data: invitation,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid invitation';
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );

  // Accept invitation
  fastify.post<{ Body: AcceptInviteInput }>(
    '/accept-invite',
    async (request, reply) => {
      try {
        const validated = acceptInviteSchema.parse(request.body);
        const user = await authService.acceptInvitation(validated);

        const token = fastify.jwt.sign({
          userId: user.id,
          householdId: user.householdId,
          email: user.email,
        });

        return reply.status(201).send({
          success: true,
          data: { user, token },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to accept invitation';
        fastify.log.error(error);
        return reply.status(400).send({
          success: false,
          error: message,
        });
      }
    }
  );
}
