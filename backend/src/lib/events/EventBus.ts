/**
 * Simple in-memory event bus
 * In production, this could be replaced with a message queue (RabbitMQ, Redis, etc.)
 */

import { logger } from '../logger';
import { DomainEvent, DomainEventType, EventHandler } from './types';
import { v4 as uuidv4 } from 'uuid';

export class EventBus {
  private handlers: Map<DomainEventType, EventHandler[]> = new Map();
  private allHandlers: EventHandler[] = [];

  /**
   * Register a handler for a specific event type
   */
  on<T extends DomainEvent>(eventType: DomainEventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);

    logger.debug('Event handler registered', {
      eventType,
      handlerCount: this.handlers.get(eventType)!.length,
    });
  }

  /**
   * Register a handler for all events
   */
  onAll(handler: EventHandler): void {
    this.allHandlers.push(handler);
    logger.debug('Global event handler registered');
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit(event: Omit<DomainEvent, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: DomainEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
    } as DomainEvent;

    logger.info('Event emitted', {
      eventType: fullEvent.type,
      eventId: fullEvent.id,
      communityId: fullEvent.communityId,
    });

    // Get handlers for this specific event type
    const typeHandlers = this.handlers.get(fullEvent.type) || [];
    const allHandlers = [...typeHandlers, ...this.allHandlers];

    if (allHandlers.length === 0) {
      logger.warn('No handlers registered for event', { eventType: fullEvent.type });
      return;
    }

    // Execute all handlers (in parallel for better performance)
    const results = await Promise.allSettled(
      allHandlers.map((handler) => this.executeHandler(handler, fullEvent))
    );

    // Log any handler failures
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      logger.error(`${failures.length} event handler(s) failed`, undefined, {
        eventType: fullEvent.type,
        eventId: fullEvent.id,
        failures: failures.map((f: any) => f.reason?.message),
      });
    }
  }

  /**
   * Execute a single handler with error handling
   */
  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    try {
      await handler(event);
      logger.debug('Event handler executed successfully', {
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      logger.error('Event handler failed', error as Error, {
        eventType: event.type,
        eventId: event.id,
      });
      throw error; // Re-throw to be caught by Promise.allSettled
    }
  }

  /**
   * Remove a specific handler
   */
  off(eventType: DomainEventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        logger.debug('Event handler removed', { eventType });
      }
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear();
    this.allHandlers = [];
    logger.debug('All event handlers cleared');
  }

  /**
   * Get statistics about registered handlers
   */
  getStats() {
    const typeHandlerCounts: Record<string, number> = {};
    this.handlers.forEach((handlers, type) => {
      typeHandlerCounts[type] = handlers.length;
    });

    return {
      totalTypes: this.handlers.size,
      globalHandlers: this.allHandlers.length,
      byType: typeHandlerCounts,
    };
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Also export the class for testing
export { EventBus as EventBusClass };
