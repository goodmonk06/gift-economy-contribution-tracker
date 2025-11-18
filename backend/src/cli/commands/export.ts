/**
 * Export command - Export community data
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../../db';
import { logger } from '../../lib/logger';

export const exportCommand = new Command('export')
  .description('Export community data to JSON')
  .requiredOption('-c, --community <id>', 'Community ID')
  .option('-o, --output <path>', 'Output file path', './export.json')
  .action(async (options) => {
    try {
      console.log(`📤 Exporting community data...`);

      const community = await prisma.community.findUnique({
        where: { id: options.community },
        include: {
          members: true,
          giftContributions: {
            include: {
              giver: true,
              receiver: true,
            },
          },
          tags: true,
          settings: true,
        },
      });

      if (!community) {
        console.log(`❌ Community not found: ${options.community}`);
        process.exit(1);
      }

      const outputPath = path.resolve(options.output);
      fs.writeFileSync(outputPath, JSON.stringify(community, null, 2));

      console.log(`\n✅ Data exported to: ${outputPath}`);
      console.log(`   Members: ${community.members.length}`);
      console.log(`   Gifts: ${community.giftContributions.length}`);
      console.log(`   Tags: ${community.tags.length}`);
    } catch (error) {
      logger.error('Export failed', error as Error);
      console.error('❌ Export failed:', (error as Error).message);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  });
