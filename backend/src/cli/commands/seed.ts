/**
 * Seed command - Seed database with test data
 */

import { Command } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../lib/logger';

const execAsync = promisify(exec);

export const seedCommand = new Command('seed')
  .description('Seed database with test data')
  .option('--reset', 'Reset database before seeding')
  .action(async (options) => {
    try {
      console.log('🌱 Seeding database...\n');

      if (options.reset) {
        console.log('⚠️  Resetting database...');
        await execAsync('npx prisma migrate reset --force');
      }

      await execAsync('npx tsx prisma/seed.ts');

      console.log('\n✅ Database seeded successfully!');
    } catch (error) {
      logger.error('Seeding failed', error as Error);
      console.error('❌ Seeding failed:', (error as Error).message);
      process.exit(1);
    }
  });
