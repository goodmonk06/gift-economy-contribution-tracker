/**
 * Analytics adapter interface
 * Implementations can send analytics to external services (Mixpanel, Segment, etc.)
 */

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  anonymousId?: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface AnalyticsIdentity {
  userId: string;
  traits?: Record<string, any>;
}

export interface IAnalyticsAdapter {
  /**
   * Track an event
   */
  track(event: AnalyticsEvent): Promise<void>;

  /**
   * Identify a user
   */
  identify(identity: AnalyticsIdentity): Promise<void>;

  /**
   * Track multiple events in batch
   */
  trackBatch(events: AnalyticsEvent[]): Promise<void>;

  /**
   * Get adapter name
   */
  getName(): string;
}
