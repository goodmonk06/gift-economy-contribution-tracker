/**
 * Notification adapter interface
 * Implementations can send notifications via email, SMS, push, webhooks, etc.
 */

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
  IN_APP = 'in_app',
}

export interface NotificationRecipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pushToken?: string;
}

export interface NotificationPayload {
  subject?: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface SendNotificationOptions {
  recipient: NotificationRecipient;
  channel: NotificationChannel;
  payload: NotificationPayload;
  priority?: 'low' | 'normal' | 'high';
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationAdapter {
  /**
   * Send a notification to a recipient
   */
  send(options: SendNotificationOptions): Promise<NotificationResult>;

  /**
   * Send batch notifications
   */
  sendBatch(notifications: SendNotificationOptions[]): Promise<NotificationResult[]>;

  /**
   * Check if this adapter supports a specific channel
   */
  supportsChannel(channel: NotificationChannel): boolean;

  /**
   * Get adapter name/identifier
   */
  getName(): string;
}
