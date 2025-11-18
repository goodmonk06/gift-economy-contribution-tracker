# Integration Recipes

This document provides practical examples of integrating the Gift Economy Tracker with other systems and extending its functionality.

## Table of Contents

1. [Authentication Integration](#authentication-integration)
2. [Notification Systems](#notification-systems)
3. [Analytics Integration](#analytics-integration)
4. [Webhooks](#webhooks)
5. [Data Export & Sync](#data-export--sync)
6. [Custom Gift Types](#custom-gift-types)
7. [Community Platform Integration](#community-platform-integration)

---

## Authentication Integration

### Integrating with an Auth Provider

The gift economy tracker doesn't include built-in authentication. Here's how to integrate it with common auth providers:

#### Option 1: JWT Authentication

```typescript
// backend/src/middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return reply.status(401).send({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    request.user = decoded; // Attach user to request
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

// Register globally or per route
app.addHook('preHandler', authMiddleware);
```

#### Option 2: Next-Auth (Frontend)

```typescript
// frontend/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Create member in gift economy on first sign-in
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          communityId: process.env.DEFAULT_COMMUNITY_ID,
        }),
      });
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## Notification Systems

### Email Notifications with SendGrid

```typescript
// backend/src/lib/adapters/SendGridNotificationAdapter.ts
import sgMail from '@sendgrid/mail';
import {
  INotificationAdapter,
  NotificationChannel,
  NotificationResult,
  SendNotificationOptions,
} from './INotificationAdapter';

export class SendGridNotificationAdapter implements INotificationAdapter {
  constructor(private apiKey: string, private fromEmail: string) {
    sgMail.setApiKey(apiKey);
  }

  getName(): string {
    return 'SendGridNotificationAdapter';
  }

  supportsChannel(channel: NotificationChannel): boolean {
    return channel === NotificationChannel.EMAIL;
  }

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    const { recipient, payload } = options;

    if (!recipient.email) {
      return { success: false, error: 'No email address provided' };
    }

    try {
      const msg = {
        to: recipient.email,
        from: this.fromEmail,
        subject: payload.subject || payload.title,
        text: payload.message,
        html: this.formatHtml(payload),
      };

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBatch(notifications: SendNotificationOptions[]): Promise<NotificationResult[]> {
    return Promise.all(notifications.map((n) => this.send(n)));
  }

  private formatHtml(payload: any): string {
    return `
      <h2>${payload.title}</h2>
      <p>${payload.message}</p>
      ${payload.actionUrl ? `<a href="${payload.actionUrl}">View Details</a>` : ''}
    `;
  }
}

// Register in your app
import { SendGridNotificationAdapter } from './lib/adapters/SendGridNotificationAdapter';

const notificationAdapter = new SendGridNotificationAdapter(
  process.env.SENDGRID_API_KEY!,
  'noreply@yourapp.com'
);
```

### Webhook Notifications

```typescript
// backend/src/lib/adapters/WebhookNotificationAdapter.ts
import axios from 'axios';

export class WebhookNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string, private secret?: string) {}

  async send(options: SendNotificationOptions): Promise<NotificationResult> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (this.secret) {
        // Add signature for verification
        const crypto = require('crypto');
        const payload = JSON.stringify(options);
        const signature = crypto
          .createHmac('sha256', this.secret)
          .update(payload)
          .digest('hex');
        headers['X-Webhook-Signature'] = signature;
      }

      const response = await axios.post(this.webhookUrl, options, { headers });

      return {
        success: true,
        messageId: response.data.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ... implement other methods
}
```

---

## Analytics Integration

### Mixpanel Integration

```typescript
// backend/src/lib/adapters/MixpanelAnalyticsAdapter.ts
import Mixpanel from 'mixpanel';

export class MixpanelAnalyticsAdapter implements IAnalyticsAdapter {
  private mixpanel: Mixpanel.Mixpanel;

  constructor(token: string) {
    this.mixpanel = Mixpanel.init(token);
  }

  getName(): string {
    return 'MixpanelAnalyticsAdapter';
  }

  async track(event: AnalyticsEvent): Promise<void> {
    this.mixpanel.track(event.event, {
      distinct_id: event.userId || event.anonymousId,
      ...event.properties,
      time: event.timestamp || new Date(),
    });
  }

  async identify(identity: AnalyticsIdentity): Promise<void> {
    this.mixpanel.people.set(identity.userId, identity.traits || {});
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.track(event);
    }
  }
}

// Usage with event handlers
import { eventBus } from './lib/events/EventBus';
import { DomainEventType } from './lib/events/types';

const analytics = new MixpanelAnalyticsAdapter(process.env.MIXPANEL_TOKEN!);

// Track gift creation
eventBus.on(DomainEventType.GIFT_CREATED, async (event) => {
  await analytics.track({
    event: 'Gift Created',
    userId: event.giverMemberId,
    properties: {
      giftId: event.giftId,
      communityId: event.communityId,
      receiverId: event.receiverMemberId,
      valueEstimate: event.valueEstimate,
    },
  });
});
```

---

## Webhooks

### Receiving Webhooks from External Systems

```typescript
// backend/src/routes/webhooks.ts
import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { logger } from '../lib/logger';

export default async function webhooksRoutes(app: FastifyInstance) {
  // GitHub webhook example (e.g., to track code contributions as gifts)
  app.post('/webhooks/github', async (request, reply) => {
    // Verify signature
    const signature = request.headers['x-hub-signature-256'] as string;
    const payload = JSON.stringify(request.body);
    const expectedSignature = 'sha256=' +
      crypto
        .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!)
        .update(payload)
        .digest('hex');

    if (signature !== expectedSignature) {
      return reply.status(401).send({ error: 'Invalid signature' });
    }

    const event = request.headers['x-github-event'];
    const body = request.body as any;

    // Create gift for pull request review
    if (event === 'pull_request_review' && body.action === 'submitted') {
      const reviewer = body.review.user.login;
      const prAuthor = body.pull_request.user.login;

      // Find members by GitHub username
      const reviewerMember = await prisma.member.findFirst({
        where: { metadata: { path: ['github_username'], equals: reviewer } },
      });

      const authorMember = await prisma.member.findFirst({
        where: { metadata: { path: ['github_username'], equals: prAuthor } },
      });

      if (reviewerMember && authorMember) {
        await prisma.giftContribution.create({
          data: {
            communityId: reviewerMember.communityId,
            giverMemberId: reviewerMember.id,
            receiverMemberId: authorMember.id,
            descriptionMarkdown: `Code review: ${body.pull_request.title}`,
            valueEstimate: 25,
            metadata: JSON.stringify({
              source: 'github',
              pr_url: body.pull_request.html_url,
            }),
          },
        });

        logger.info('Gift created from GitHub webhook', {
          reviewer,
          prAuthor,
          prUrl: body.pull_request.html_url,
        });
      }
    }

    return { received: true };
  });
}
```

---

## Data Export & Sync

### Syncing to Data Warehouse

```typescript
// backend/src/services/dataWarehouseSync.ts
import { eventBus } from '../lib/events/EventBus';
import { DomainEventType } from '../lib/events/types';

export class DataWarehouseSyncService {
  constructor(private warehouseClient: any) {}

  initialize() {
    // Sync all gift events to warehouse
    eventBus.on(DomainEventType.GIFT_CREATED, async (event) => {
      await this.warehouseClient.insert('gifts', {
        gift_id: event.giftId,
        community_id: event.communityId,
        giver_id: event.giverMemberId,
        receiver_id: event.receiverMemberId,
        value_estimate: event.valueEstimate,
        created_at: event.timestamp,
      });
    });

    // Sync member events
    eventBus.on(DomainEventType.MEMBER_JOINED, async (event) => {
      await this.warehouseClient.insert('members', {
        member_id: event.memberId,
        community_id: event.communityId,
        name: event.memberName,
        joined_at: event.timestamp,
      });
    });
  }
}

// Initialize in index.ts
const syncService = new DataWarehouseSyncService(warehouseClient);
syncService.initialize();
```

### CSV Export

```typescript
// backend/src/services/exportService.ts
import { Parser } from 'json2csv';
import prisma from '../db';

export class ExportService {
  async exportGiftsToCSV(communityId: string): Promise<string> {
    const gifts = await prisma.giftContribution.findMany({
      where: { communityId },
      include: {
        giver: true,
        receiver: true,
      },
    });

    const data = gifts.map((gift) => ({
      'Gift ID': gift.id,
      'Date': gift.timestamp.toISOString(),
      'Giver': gift.giver.name,
      'Receiver': gift.receiver?.name || 'Community',
      'Description': gift.descriptionMarkdown,
      'Value Estimate': gift.valueEstimate || 0,
      'Status': gift.status,
    }));

    const parser = new Parser();
    return parser.parse(data);
  }
}

// Add route
app.get('/api/communities/:id/export/csv', async (request, reply) => {
  const { id } = request.params as { id: string };
  const exportService = new ExportService();
  const csv = await exportService.exportGiftsToCSV(id);

  reply
    .header('Content-Type', 'text/csv')
    .header('Content-Disposition', `attachment; filename="gifts-${id}.csv"`)
    .send(csv);
});
```

---

## Custom Gift Types

### Creating Gift Templates

```typescript
// Example: Tech community gift templates
const templates = [
  {
    name: 'Code Review',
    descriptionTemplate: 'Reviewed {{prLink}} ({{linesChanged}} lines)',
    defaultValue: 50,
    suggestedTags: ['code-review', 'development'],
  },
  {
    name: 'Mentorship Session',
    descriptionTemplate: '{{duration}} hour mentorship on {{topic}}',
    defaultValue: 100,
    suggestedTags: ['mentorship', 'learning'],
  },
  {
    name: 'Bug Fix',
    descriptionTemplate: 'Fixed {{issueLink}}',
    defaultValue: 75,
    suggestedTags: ['debugging', 'maintenance'],
  },
];

// Seed templates
for (const template of templates) {
  await prisma.giftTemplate.create({
    data: {
      ...template,
      communityId: community.id,
      suggestedTags: JSON.stringify(template.suggestedTags),
    },
  });
}

// Use template in gift creation
const template = await prisma.giftTemplate.findFirst({
  where: { name: 'Code Review', communityId },
});

const description = template.descriptionTemplate
  .replace('{{prLink}}', 'PR#123')
  .replace('{{linesChanged}}', '250');

await prisma.giftContribution.create({
  data: {
    communityId,
    giverMemberId,
    receiverMemberId,
    templateId: template.id,
    descriptionMarkdown: description,
    valueEstimate: template.defaultValue,
  },
});
```

---

## Community Platform Integration

### Slack Integration

```typescript
// backend/src/integrations/slack.ts
import { WebClient } from '@slack/web-api';
import { eventBus } from '../lib/events/EventBus';
import { DomainEventType } from '../lib/events/types';

export class SlackIntegration {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  initialize() {
    // Post gift notifications to Slack
    eventBus.on(DomainEventType.GIFT_CREATED, async (event) => {
      const gift = await prisma.giftContribution.findUnique({
        where: { id: event.giftId },
        include: { giver: true, receiver: true },
      });

      if (!gift) return;

      const message = gift.receiver
        ? `🎁 ${gift.giver.name} gave a gift to ${gift.receiver.name}: "${gift.descriptionMarkdown}"`
        : `🎁 ${gift.giver.name} gave a gift to the community: "${gift.descriptionMarkdown}"`;

      await this.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID!,
        text: message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Value estimate: ${gift.valueEstimate || 'Not specified'}`,
              },
            ],
          },
        ],
      });
    });
  }

  // Slack command: /gift @user for helping with deployment
  async handleSlashCommand(payload: any) {
    // Parse command
    const text = payload.text; // "@user for helping with deployment"
    const [mentionPart, ...descriptionParts] = text.split(' for ');
    const description = descriptionParts.join(' for ');

    // Extract mentioned user
    const userMatch = mentionPart.match(/<@([A-Z0-9]+)>/);
    if (!userMatch) {
      return { text: 'Please mention a user: /gift @user for something' };
    }

    const slackUserId = userMatch[1];

    // Find members by Slack user ID
    const giver = await this.findMemberBySlackId(payload.user_id);
    const receiver = await this.findMemberBySlackId(slackUserId);

    if (!giver || !receiver) {
      return { text: 'Could not find community members for these Slack users' };
    }

    // Create gift
    await prisma.giftContribution.create({
      data: {
        communityId: giver.communityId,
        giverMemberId: giver.id,
        receiverMemberId: receiver.id,
        descriptionMarkdown: description,
        metadata: JSON.stringify({ source: 'slack' }),
      },
    });

    return {
      text: `🎁 Gift recorded! ${giver.name} → ${receiver.name}: "${description}"`,
    };
  }

  private async findMemberBySlackId(slackUserId: string) {
    return prisma.member.findFirst({
      where: {
        metadata: {
          path: ['slack_user_id'],
          equals: slackUserId,
        },
      },
    });
  }
}

// Initialize
const slack = new SlackIntegration(process.env.SLACK_BOT_TOKEN!);
slack.initialize();

// Add Slack webhook route
app.post('/webhooks/slack/command', async (request, reply) => {
  const response = await slack.handleSlashCommand(request.body);
  return response;
});
```

---

## Best Practices

### 1. Error Handling in Integrations
Always handle failures gracefully:

```typescript
eventBus.on(DomainEventType.GIFT_CREATED, async (event) => {
  try {
    await externalService.notify(event);
  } catch (error) {
    logger.error('Failed to notify external service', error as Error, {
      eventId: event.id,
      eventType: event.type,
    });
    // Don't throw - let other handlers continue
  }
});
```

### 2. Rate Limiting
Respect external API limits:

```typescript
import pThrottle from 'p-throttle';

const throttle = pThrottle({
  limit: 100,
  interval: 60000, // 100 requests per minute
});

const throttledSend = throttle(async (notification) => {
  await adapter.send(notification);
});
```

### 3. Retry Logic
Implement retries for transient failures:

```typescript
import pRetry from 'p-retry';

await pRetry(
  async () => {
    return await adapter.send(notification);
  },
  {
    retries: 3,
    onFailedAttempt: (error) => {
      logger.warn(`Notification attempt ${error.attemptNumber} failed`);
    },
  }
);
```

### 4. Testing Integrations
Use adapters with test implementations:

```typescript
// test/fixtures/MockNotificationAdapter.ts
export class MockNotificationAdapter implements INotificationAdapter {
  public sentNotifications: SendNotificationOptions[] = [];

  async send(options: SendNotificationOptions) {
    this.sentNotifications.push(options);
    return { success: true, messageId: 'mock-id' };
  }

  // ... other methods
}

// In tests
const mockAdapter = new MockNotificationAdapter();
// ... run code that sends notifications
expect(mockAdapter.sentNotifications).toHaveLength(1);
```

---

## Next Steps

For more integration examples, check:
- [Event Types](../backend/src/lib/events/types.ts)
- [Adapter Interfaces](../backend/src/lib/adapters/)
- [Example Implementations](../backend/src/lib/adapters/Console*.ts)
