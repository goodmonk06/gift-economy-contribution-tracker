/**
 * Console analytics adapter (for development/testing)
 * Logs analytics events to console instead of sending to external service
 */

import { logger } from '../logger';
import { AnalyticsEvent, AnalyticsIdentity, IAnalyticsAdapter } from './IAnalyticsAdapter';

export class ConsoleAnalyticsAdapter implements IAnalyticsAdapter {
  getName(): string {
    return 'ConsoleAnalyticsAdapter';
  }

  async track(event: AnalyticsEvent): Promise<void> {
    logger.info('📊 [ANALYTICS] Event tracked', {
      event: event.event,
      userId: event.userId,
      properties: event.properties,
    });

    console.log('\n📊 ANALYTICS EVENT:');
    console.log(`  Event: ${event.event}`);
    if (event.userId) console.log(`  User ID: ${event.userId}`);
    if (event.properties) {
      console.log('  Properties:', JSON.stringify(event.properties, null, 2));
    }
    console.log('');
  }

  async identify(identity: AnalyticsIdentity): Promise<void> {
    logger.info('📊 [ANALYTICS] User identified', {
      userId: identity.userId,
      traits: identity.traits,
    });

    console.log('\n📊 ANALYTICS IDENTIFY:');
    console.log(`  User ID: ${identity.userId}`);
    if (identity.traits) {
      console.log('  Traits:', JSON.stringify(identity.traits, null, 2));
    }
    console.log('');
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    logger.info(`📊 [ANALYTICS] Batch tracking ${events.length} events`);

    for (const event of events) {
      await this.track(event);
    }
  }
}
