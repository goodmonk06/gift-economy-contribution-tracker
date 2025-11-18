import { FastifyInstance } from 'fastify';
import prisma from '../db';
import { generateSnapshot, generateCommunitySnapshots } from '../services/snapshotService';

export default async function snapshotsRoutes(app: FastifyInstance) {
  // Get snapshots for a member
  app.get('/member/:memberId', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const { limit = '10' } = request.query as { limit?: string };

    const snapshots = await prisma.giftBalanceSnapshot.findMany({
      where: { memberId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit, 10),
      include: {
        member: true,
        community: true,
      },
    });

    return snapshots;
  });

  // Get snapshots for a community
  app.get('/community/:communityId', async (request, reply) => {
    const { communityId } = request.params as { communityId: string };
    const { limit = '50' } = request.query as { limit?: string };

    const snapshots = await prisma.giftBalanceSnapshot.findMany({
      where: { communityId },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit, 10),
      include: {
        member: true,
      },
    });

    return snapshots;
  });

  // Generate snapshot for a specific member
  app.post('/generate/member/:memberId', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return reply.status(404).send({ error: 'Member not found' });
    }

    const snapshot = await generateSnapshot(memberId, member.communityId);
    return reply.status(201).send(snapshot);
  });

  // Generate snapshots for all members in a community
  app.post('/generate/community/:communityId', async (request, reply) => {
    const { communityId } = request.params as { communityId: string };

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return reply.status(404).send({ error: 'Community not found' });
    }

    const snapshots = await generateCommunitySnapshots(communityId);
    return reply.status(201).send({
      message: `Generated ${snapshots.length} snapshots`,
      snapshots,
    });
  });
}
