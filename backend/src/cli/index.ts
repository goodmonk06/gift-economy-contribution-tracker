#!/usr/bin/env node
/**
 * Gift Economy CLI Tool
 * Provides administrative commands for the gift economy tracker
 */

import { Command } from 'commander';
import { statsCommand } from './commands/stats';
import { seedCommand } from './commands/seed';
import { exportCommand } from './commands/export';
import { generateCommand } from './commands/generate';

const program = new Command();

program
  .name('gift-cli')
  .description('Gift Economy Tracker CLI')
  .version('1.0.0');

// Register commands
program.addCommand(statsCommand);
program.addCommand(seedCommand);
program.addCommand(exportCommand);
program.addCommand(generateCommand);

program.parse();
