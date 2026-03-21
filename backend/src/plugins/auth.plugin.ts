import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import type { JwtPayload } from '../types';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    jwtPayload: JwtPayload;
  }
}

async function authPluginCallback(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
  });

  // Add authenticate decorator
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const payload = await request.jwtVerify<JwtPayload>();
        request.jwtPayload = payload;
      } catch (err) {
        reply.status(401).send({
          success: false,
          error: 'Unauthorized',
        });
      }
    }
  );
}

// Use fastify-plugin to prevent encapsulation
export const authPlugin = fp(authPluginCallback, {
  name: 'auth-plugin',
});

// Type augmentation for authenticate decorator
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
