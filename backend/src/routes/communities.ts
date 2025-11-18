import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../db';

const createCommunitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export default async function communitiesRoutes(app: FastifyInstance) {
  // Get all communities
  app.get('/', async (request, reply) => {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            giftContributions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return communities;
  });

  // Get single community
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        members: true,
        _count: {
          select: {
            giftContributions: true,
            giftBalanceSnapshots: true,
          },
        },
      },
    });

    if (!community) {
      return reply.status(404).send({ error: 'Community not found' });
    }

    return community;
  });

  // Create community
  app.post('/', async (request, reply) => {
    const result = createCommunitySchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors });
    }

    const community = await prisma.community.create({
      data: result.data,
    });

    return reply.status(201).send(community);
  });
}
