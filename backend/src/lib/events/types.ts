/**
 * Domain Event Types
 * These events represent significant occurrences in the gift economy domain
 */

export enum DomainEventType {
  // Gift events
  GIFT_CREATED = 'gift.created',
  GIFT_ACKNOWLEDGED = 'gift.acknowledged',
  GIFT_CANCELLED = 'gift.cancelled',

  // Member events
  MEMBER_JOINED = 'member.joined',
  MEMBER_INVITED = 'member.invited',
  MEMBER_UPDATED = 'member.updated',

  // Community events
  COMMUNITY_CREATED = 'community.created',
  COMMUNITY_SETTINGS_UPDATED = 'community.settings_updated',

  // Snapshot events
  SNAPSHOT_GENERATED = 'snapshot.generated',
  SNAPSHOTS_BATCH_GENERATED = 'snapshots.batch_generated',

  // Relationship events
  RELATIONSHIP_CREATED = 'relationship.created',

  // Tag events
  TAG_CREATED = 'tag.created',
  GIFT_TAGGED = 'gift.tagged',
  MEMBER_TAGGED = 'member.tagged',
}

export interface BaseDomainEvent {
  id: string;
  type: DomainEventType;
  timestamp: Date;
  communityId: string;
  metadata?: Record<string, any>;
}

export interface GiftCreatedEvent extends BaseDomainEvent {
  type: DomainEventType.GIFT_CREATED;
  giftId: string;
  giverMemberId: string;
  receiverMemberId?: string;
  valueEstimate?: number;
}

export interface GiftAcknowledgedEvent extends BaseDomainEvent {
  type: DomainEventType.GIFT_ACKNOWLEDGED;
  giftId: string;
  giverMemberId: string;
  receiverMemberId: string;
  acknowledgedAt: Date;
}

export interface MemberJoinedEvent extends BaseDomainEvent {
  type: DomainEventType.MEMBER_JOINED;
  memberId: string;
  memberName: string;
  memberEmail?: string;
}

export interface CommunityCreatedEvent extends BaseDomainEvent {
  type: DomainEventType.COMMUNITY_CREATED;
  communityName: string;
  communitySlug: string;
}

export interface SnapshotGeneratedEvent extends BaseDomainEvent {
  type: DomainEventType.SNAPSHOT_GENERATED;
  memberId: string;
  snapshotId: string;
  givenCount: number;
  receivedCount: number;
  netBalance: number;
}

export type DomainEvent =
  | GiftCreatedEvent
  | GiftAcknowledgedEvent
  | MemberJoinedEvent
  | CommunityCreatedEvent
  | SnapshotGeneratedEvent
  | BaseDomainEvent;

export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;
