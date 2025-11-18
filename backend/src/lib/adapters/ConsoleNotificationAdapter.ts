/**
 * Console notification adapter (for development/testing)
 * Logs notifications to console instead of actually sending them
 */

import { logger } from '../logger';
import {
  INotificationAdapter,
  NotificationChannel,
  NotificationResult,
  SendNotificationOptions,
} from './INotificationAdapter';

export class ConsoleNotificationAdapter implements INotificationAdapter {
  private supportedChannels: Set<NotificationChannel> = new Set([
    NotificationChannel.EMAIL,
    NotificationChannel.IN_APP,
    NotificationChannel.WEBHOOK,
  ]);

  getName(): string {
    return 'ConsoleNotificationAdapter';
  }

  supportsChannel(channel: NotificationChannel): boolean {
    return this.supportedChannels.has(channel);
  }

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const { recipient, channel, payload, priority = 'normal' } = options;

    logger.info('📨 [NOTIFICATION] Sending notification', {
      adapter: this.getName(),
      channel,
      priority,
      recipient: {
        id: recipient.id,
        name: recipient.name,
        email: recipient.email,
      },
      payload: {
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actionUrl,
      },
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 NOTIFICATION [${channel.toUpperCase()}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${recipient.name} (${recipient.email || recipient.id})`);
    if (payload.subject) {
      console.log(`Subject: ${payload.subject}`);
    }
    console.log(`Title: ${payload.title}`);
    console.log(`Message: ${payload.message}`);
    if (payload.actionUrl) {
      console.log(`Action URL: ${payload.actionUrl}`);
    }
    if (payload.data) {
      console.log('Data:', JSON.stringify(payload.data, null, 2));
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      messageId: `console-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
  }

  async sendBatch(notifications: SendNotificationOptions[]): Promise<NotificationResult[]> {
    logger.info(`📨 [NOTIFICATION] Sending ${notifications.length} batch notifications`);

    const results = await Promise.all(notifications.map((notif) => this.send(notif)));

    return results;
  }
}
