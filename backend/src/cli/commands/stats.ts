/**
 * Stats command - Display community statistics
 */

import { Command } from 'commander';
import prisma from '../../db';
import { logger } from '../../lib/logger';

export const statsCommand = new Command('stats')
  .description('Display community statistics')
  .option('-c, --community <id>', 'Community ID')
  .option('-a, --all', 'Show all communities')
  .action(async (options) => {
    try {
      if (options.community) {
        await showCommunityStats(options.community);
      } else if (options.all) {
        await showAllCommunities();
      } else {
        console.log('Please specify --community <id> or --all');
        process.exit(1);
      }
    } catch (error) {
      logger.error('Failed to fetch stats', error as Error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });

async function showCommunityStats(communityId: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      _count: {
        select: {
          members: true,
          giftContributions: true,
          tags: true,
        },
      },
    },
  });

  if (!community) {
    console.log(`Community not found: ${communityId}`);
    process.exit(1);
  }

  const gifts = await prisma.giftContribution.findMany({
    where: { communityId },
  });

  const totalValue = gifts.reduce((sum, gift) => sum + (gift.valueEstimate || 0), 0);
  const avgValue = gifts.length > 0 ? totalValue / gifts.length : 0;

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 ${community.name} Statistics`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Members: ${community._count.members}`);
  console.log(`Gifts: ${community._count.giftContributions}`);
  console.log(`Tags: ${community._count.tags}`);
  console.log(`Total Gift Value: ${totalValue.toFixed(2)}`);
  console.log(`Average Gift Value: ${avgValue.toFixed(2)}`);
  console.log(`Created: ${community.createdAt.toLocaleDateString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function showAllCommunities() {
  const communities = await prisma.community.findMany({
    include: {
      _count: {
        select: {
          members: true,
          giftContributions: true,
        },
      },
    },
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 All Communities');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (const community of communities) {
    console.log(`\n${community.name} (${community.slug})`);
    console.log(`  ID: ${community.id}`);
    console.log(`  Members: ${community._count.members}`);
    console.log(`  Gifts: ${community._count.giftContributions}`);
    console.log(`  Created: ${community.createdAt.toLocaleDateString()}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}
