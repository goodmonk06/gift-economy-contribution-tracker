import { describe, it, expect, beforeEach } from 'vitest';
import { Metrics } from './metrics';

describe('Metrics', () => {
  let metrics: Metrics;

  beforeEach(() => {
    metrics = new Metrics();
  });

  describe('incrementCounter', () => {
    it('should increment counter without labels', () => {
      metrics.incrementCounter('test_counter');
      metrics.incrementCounter('test_counter');

      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['test_counter']).toBe(2);
    });

    it('should increment counter with labels', () => {
      metrics.incrementCounter('requests', { method: 'GET', path: '/api' });
      metrics.incrementCounter('requests', { method: 'GET', path: '/api' });
      metrics.incrementCounter('requests', { method: 'POST', path: '/api' });

      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['requests{method="GET",path="/api"}']).toBe(2);
      expect(snapshot.counters['requests{method="POST",path="/api"}']).toBe(1);
    });

    it('should increment by custom value', () => {
      metrics.incrementCounter('bytes_sent', undefined, 1024);
      metrics.incrementCounter('bytes_sent', undefined, 2048);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['bytes_sent']).toBe(3072);
    });
  });

  describe('setGauge', () => {
    it('should set gauge value', () => {
      metrics.setGauge('temperature', 25.5);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['temperature']).toBe(25.5);
    });

    it('should overwrite gauge value', () => {
      metrics.setGauge('active_users', 10);
      metrics.setGauge('active_users', 15);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['active_users']).toBe(15);
    });

    it('should set gauge with labels', () => {
      metrics.setGauge('queue_size', 42, { queue: 'emails' });

      const snapshot = metrics.getSnapshot();
      expect(snapshot.gauges['queue_size{queue="emails"}']).toBe(42);
    });
  });

  describe('recordRequestDuration', () => {
    it('should record HTTP request metrics', () => {
      metrics.recordRequestDuration('GET', '/api/users', 200, 125.5);
      metrics.recordRequestDuration('GET', '/api/users', 200, 98.2);

      const snapshot = metrics.getSnapshot();
      expect(snapshot.counters['http_requests_total{method="GET",path="/api/users",status="200"}']).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset all metrics', () => {
      metrics.incrementCounter('test');
      metrics.setGauge('gauge', 100);

      metrics.reset();

      const snapshot = metrics.getSnapshot();
      expect(Object.keys(snapshot.counters).length).toBe(0);
      expect(Object.keys(snapshot.gauges).length).toBe(0);
    });
  });
});
