/**
 * Generate command - Generate test data
 */

import { Command } from 'commander';
import prisma from '../../db';
import { logger } from '../../lib/logger';

export const generateCommand = new Command('generate')
  .description('Generate test data')
  .option('-c, --community <id>', 'Community ID')
  .option('-m, --members <count>', 'Number of members to generate', '5')
  .option('-g, --gifts <count>', 'Number of gifts to generate', '20')
  .action(async (options) => {
    try {
      let communityId = options.community;

      if (!communityId) {
        // Create a test community
        console.log('📦 Creating test community...');
        const community = await prisma.community.create({
          data: {
            name: `Test Community ${Date.now()}`,
            slug: `test-${Date.now()}`,
            description: 'Auto-generated test community',
          },
        });
        communityId = community.id;
        console.log(`   Created: ${community.name} (${community.id})`);
      }

      const memberCount = parseInt(options.members, 10);
      const giftCount = parseInt(options.gifts, 10);

      console.log(`\n👥 Generating ${memberCount} members...`);
      const members = [];
      for (let i = 0; i < memberCount; i++) {
        const member = await prisma.member.create({
          data: {
            communityId,
            name: `Member ${i + 1}`,
            email: `member${i + 1}@example.com`,
            bio: `Test member number ${i + 1}`,
          },
        });
        members.push(member);
      }

      console.log(`\n🎁 Generating ${giftCount} gifts...`);
      for (let i = 0; i < giftCount; i++) {
        const giver = members[Math.floor(Math.random() * members.length)];
        const receiver = members[Math.floor(Math.random() * members.length)];

        if (giver.id !== receiver.id) {
          await prisma.giftContribution.create({
            data: {
              communityId,
              giverMemberId: giver.id,
              receiverMemberId: receiver.id,
              descriptionMarkdown: `Test gift #${i + 1}`,
              valueEstimate: Math.floor(Math.random() * 100) + 10,
              timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      console.log(`\n✅ Test data generated successfully!`);
      console.log(`   Community ID: ${communityId}`);
      console.log(`   Members: ${memberCount}`);
      console.log(`   Gifts: ${giftCount}`);
    } catch (error) {
      logger.error('Generation failed', error as Error);
      console.error('❌ Generation failed:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });
