import prisma from '../db';

/**
 * Generate a balance snapshot for a specific member
 * This aggregates their giving and receiving activity into a summary
 */
export async function generateSnapshot(memberId: string, communityId: string) {
  // Get all gifts given by this member
  const givenGifts = await prisma.giftContribution.findMany({
    where: {
      giverMemberId: memberId,
      communityId,
    },
  });

  // Get all gifts received by this member
  const receivedGifts = await prisma.giftContribution.findMany({
    where: {
      receiverMemberId: memberId,
      communityId,
    },
  });

  // Calculate counts
  const givenCount = givenGifts.length;
  const receivedCount = receivedGifts.length;

  // Calculate value totals (soft indicators)
  const totalGivenValue = givenGifts.reduce(
    (sum, gift) => sum + (gift.valueEstimate || 0),
    0
  );
  const totalReceivedValue = receivedGifts.reduce(
    (sum, gift) => sum + (gift.valueEstimate || 0),
    0
  );

  // Net balance (positive = net giver, negative = net receiver)
  // Note: this is a soft metric, not strict accounting
  const netBalance = totalGivenValue - totalReceivedValue;

  // Collect metadata
  const tags = new Set<string>();
  [...givenGifts, ...receivedGifts].forEach((gift) => {
    try {
      const giftTags = JSON.parse(gift.tagsJson);
      giftTags.forEach((tag: string) => tags.add(tag));
    } catch {
      // Ignore parse errors
    }
  });

  const metaJson = JSON.stringify({
    totalGivenValue,
    totalReceivedValue,
    uniqueTags: Array.from(tags),
    lastGiftGiven: givenGifts[0]?.timestamp || null,
    lastGiftReceived: receivedGifts[0]?.timestamp || null,
  });

  // Create snapshot
  const snapshot = await prisma.giftBalanceSnapshot.create({
    data: {
      memberId,
      communityId,
      givenCount,
      receivedCount,
      netBalance,
      metaJson,
      timestamp: new Date(),
    },
    include: {
      member: true,
      community: true,
    },
  });

  return snapshot;
}

/**
 * Generate snapshots for all members in a community
 */
export async function generateCommunitySnapshots(communityId: string) {
  const members = await prisma.member.findMany({
    where: { communityId },
  });

  const snapshots = await Promise.all(
    members.map((member) => generateSnapshot(member.id, communityId))
  );

  return snapshots;
}

/**
 * Get balance trend for a member (last N snapshots)
 */
export async function getMemberBalanceTrend(memberId: string, limit = 10) {
  const snapshots = await prisma.giftBalanceSnapshot.findMany({
    where: { memberId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return snapshots.reverse(); // Oldest to newest for trend
}
