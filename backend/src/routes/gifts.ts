import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../db';

const createGiftSchema = z.object({
  communityId: z.string(),
  giverMemberId: z.string(),
  receiverMemberId: z.string().nullable().optional(),
  descriptionMarkdown: z.string().min(1),
  valueEstimate: z.number().positive().optional(),
  tags: z.array(z.string()).default([]),
  timestamp: z.string().datetime().optional(),
});

export default async function giftsRoutes(app: FastifyInstance) {
  // Get gifts with filters
  app.get('/', async (request, reply) => {
    const {
      communityId,
      giverMemberId,
      receiverMemberId,
      limit = '50',
      offset = '0',
    } = request.query as {
      communityId?: string;
      giverMemberId?: string;
      receiverMemberId?: string;
      limit?: string;
      offset?: string;
    };

    const where: any = {};
    if (communityId) where.communityId = communityId;
    if (giverMemberId) where.giverMemberId = giverMemberId;
    if (receiverMemberId) where.receiverMemberId = receiverMemberId;

    const gifts = await prisma.giftContribution.findMany({
      where,
      include: {
        giver: true,
        receiver: true,
        community: true,
      },
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    return gifts;
  });

  // Get single gift
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const gift = await prisma.giftContribution.findUnique({
      where: { id },
      include: {
        giver: true,
        receiver: true,
        community: true,
      },
    });

    if (!gift) {
      return reply.status(404).send({ error: 'Gift not found' });
    }

    return gift;
  });

  // Create gift contribution
  app.post('/', async (request, reply) => {
    const result = createGiftSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors });
    }

    const { tags, timestamp, ...data } = result.data;

    const gift = await prisma.giftContribution.create({
      data: {
        ...data,
        tagsJson: JSON.stringify(tags),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      include: {
        giver: true,
        receiver: true,
        community: true,
      },
    });

    return reply.status(201).send(gift);
  });

  // Get gift statistics for a community
  app.get('/stats/community/:communityId', async (request, reply) => {
    const { communityId } = request.params as { communityId: string };

    const gifts = await prisma.giftContribution.findMany({
      where: { communityId },
      include: {
        giver: true,
        receiver: true,
      },
    });

    const stats = {
      totalGifts: gifts.length,
      totalValue: gifts.reduce((sum, gift) => sum + (gift.valueEstimate || 0), 0),
      uniqueGivers: new Set(gifts.map((g) => g.giverMemberId)).size,
      uniqueReceivers: new Set(
        gifts.filter((g) => g.receiverMemberId).map((g) => g.receiverMemberId)
      ).size,
      communityWideGifts: gifts.filter((g) => !g.receiverMemberId).length,
    };

    return stats;
  });
}
