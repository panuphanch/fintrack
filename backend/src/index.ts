import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import multipart from '@fastify/multipart';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

// Import plugins
import { authPlugin } from './plugins/auth.plugin';

// Import routes
import { authRoutes } from './routes/auth.routes';
import { householdRoutes } from './routes/household.routes';
import { cardsRoutes } from './routes/cards.routes';
import { transactionsRoutes } from './routes/transactions.routes';
import { tagsRoutes } from './routes/tags.routes';
import { budgetsRoutes } from './routes/budgets.routes';
import { statementsRoutes } from './routes/statements.routes';
import { analyticsRoutes } from './routes/analytics.routes';
import { uploadsRoutes } from './routes/uploads.routes';
import { ocrRoutes } from './routes/ocr.routes';
import { installmentsRoutes } from './routes/installments.routes';
import { fixedCostsRoutes } from './routes/fixed-costs.routes';
import { categoriesRoutes } from './routes/categories.routes';

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Decorate fastify with prisma
fastify.decorate('prisma', prisma);

// Register plugins
async function registerPlugins() {
  // CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Sensible defaults (better error handling)
  await fastify.register(sensible);

  // Multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
  });

  // JWT Authentication
  await fastify.register(authPlugin);
}

// API routes placeholder
fastify.get('/api', async () => {
  return { message: 'Financial Tracker API', version: '0.1.0' };
});

// Health check route
fastify.get('/api/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Deep health check (includes database connectivity)
fastify.get('/api/health/ready', async (_request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    };
  } catch (error) {
    reply.status(503);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'error',
      },
      message: 'Database connection failed',
    };
  }
});

// Register API routes
async function registerRoutes() {
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(householdRoutes, { prefix: '/api/household' });
  await fastify.register(cardsRoutes, { prefix: '/api/cards' });
  await fastify.register(transactionsRoutes, { prefix: '/api/transactions' });
  await fastify.register(tagsRoutes, { prefix: '/api/tags' });
  await fastify.register(budgetsRoutes, { prefix: '/api/budgets' });
  await fastify.register(statementsRoutes, { prefix: '/api/statements' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
  await fastify.register(uploadsRoutes, { prefix: '/api/uploads' });
  await fastify.register(ocrRoutes, { prefix: '/api/transactions' });
  await fastify.register(installmentsRoutes, { prefix: '/api/installments' });
  await fastify.register(fixedCostsRoutes, { prefix: '/api/fixed-costs' });
  await fastify.register(categoriesRoutes, { prefix: '/api/categories' });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info('Shutting down gracefully...');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = parseInt(process.env.PORT || '3000', 10);
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    fastify.log.info(`Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Type declarations for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
