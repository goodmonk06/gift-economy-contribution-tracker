import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './db';
import giftsRoutes from './routes/gifts';
import snapshotsRoutes from './routes/snapshots';
import membersRoutes from './routes/members';
import communitiesRoutes from './routes/communities';
import { errorHandler } from './lib/errorHandler';
import { logger } from './lib/logger';
import { metrics } from './lib/metrics';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
  disableRequestLogging: true, // We'll handle this manually for better control
});

async function start() {
  try {
    // Register error handler
    app.setErrorHandler(errorHandler);

    // Request logging and metrics
    app.addHook('onRequest', async (request) => {
      request.log.info({
        msg: 'Incoming request',
        method: request.method,
        url: request.url,
      });
    });

    app.addHook('onResponse', async (request, reply) => {
      const duration = reply.getResponseTime();
      metrics.recordRequestDuration(
        request.method,
        request.url,
        reply.statusCode,
        duration
      );

      logger.info('Request completed', {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        duration: `${duration.toFixed(2)}ms`,
      });
    });

    // Register CORS
    await app.register(cors, {
      origin: true, // Allow all origins in development
      credentials: true,
    });

    // Health check
    app.get('/health', async () => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    // Metrics endpoint (for monitoring)
    app.get('/metrics', async () => {
      return metrics.getSnapshot();
    });

    // Register routes
    await app.register(communitiesRoutes, { prefix: '/api/communities' });
    await app.register(membersRoutes, { prefix: '/api/members' });
    await app.register(giftsRoutes, { prefix: '/api/gifts' });
    await app.register(snapshotsRoutes, { prefix: '/api/snapshots' });

    // Start server
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🎁 Gift Economy Tracker API running on http://localhost:${PORT}`);
  } catch (err) {
    logger.error('Failed to start server', err as Error);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    await app.close();
    await prisma.$disconnect();
    logger.info('Server shut down successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err as Error);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
