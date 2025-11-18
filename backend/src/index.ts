import Fastify from 'fastify';
import cors from '@fastify/cors';
import prisma from './db';
import giftsRoutes from './routes/gifts';
import snapshotsRoutes from './routes/snapshots';
import membersRoutes from './routes/members';
import communitiesRoutes from './routes/communities';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

async function start() {
  try {
    // Register CORS
    await app.register(cors, {
      origin: true, // Allow all origins in development
      credentials: true,
    });

    // Health check
    app.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await app.register(communitiesRoutes, { prefix: '/api/communities' });
    await app.register(membersRoutes, { prefix: '/api/members' });
    await app.register(giftsRoutes, { prefix: '/api/gifts' });
    await app.register(snapshotsRoutes, { prefix: '/api/snapshots' });

    // Start server
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🎁 Gift Economy Tracker API running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
