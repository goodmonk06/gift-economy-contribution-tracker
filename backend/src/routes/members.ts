import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../db';

const createMemberSchema = z.object({
  communityId: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export default async function membersRoutes(app: FastifyInstance) {
  // Get members by community
  app.get('/', async (request, reply) => {
    const { communityId } = request.query as { communityId?: string };

    const where = communityId ? { communityId } : {};

    const members = await prisma.member.findMany({
      where,
      include: {
        community: true,
        _count: {
          select: {
            givenContributions: true,
            receivedContributions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return members;
  });

  // Get member profile with gift stats
  app.get('/:id/profile', async (request, reply) => {
    const { id } = request.params as { id: string };

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        community: true,
        givenContributions: {
          include: {
            receiver: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        receivedContributions: {
          include: {
            giver: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        balanceSnapshots: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    });

    if (!member) {
      return reply.status(404).send({ error: 'Member not found' });
    }

    // Calculate basic stats
    const stats = {
      totalGiven: member.givenContributions.length,
      totalReceived: member.receivedContributions.length,
      totalValueGiven: member.givenContributions.reduce(
        (sum, gift) => sum + (gift.valueEstimate || 0),
        0
      ),
      totalValueReceived: member.receivedContributions.reduce(
        (sum, gift) => sum + (gift.valueEstimate || 0),
        0
      ),
    };

    return {
      ...member,
      stats,
    };
  });

  // Create member
  app.post('/', async (request, reply) => {
    const result = createMemberSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors });
    }

    const member = await prisma.member.create({
      data: result.data,
      include: {
        community: true,
      },
    });

    return reply.status(201).send(member);
  });
}
