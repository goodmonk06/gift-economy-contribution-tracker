/**
 * Simple metrics abstraction
 * In production, this would integrate with Prometheus, DataDog, or similar
 */

import { logger } from './logger';

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
}

interface MetricLabels {
  [key: string]: string | number;
}

class Metrics {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();

  /**
   * Increment a counter metric
   */
  incrementCounter(name: string, labels?: MetricLabels, value: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    logger.debug('Counter incremented', {
      metric: name,
      value,
      labels,
      total: current + value,
    });
  }

  /**
   * Set a gauge metric value
   */
  setGauge(name: string, value: number, labels?: MetricLabels): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, value);

    logger.debug('Gauge set', {
      metric: name,
      value,
      labels,
    });
  }

  /**
   * Record a histogram value (timing, size, etc)
   * For now, just logs the value. In production, would calculate percentiles.
   */
  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    logger.debug('Histogram recorded', {
      metric: name,
      value,
      labels,
    });
  }

  /**
   * Record request timing
   */
  recordRequestDuration(method: string, path: string, statusCode: number, durationMs: number): void {
    this.recordHistogram('http_request_duration_ms', durationMs, {
      method,
      path,
      status: statusCode,
    });

    this.incrementCounter('http_requests_total', {
      method,
      path,
      status: statusCode,
    });
  }

  /**
   * Get current metric values (for debugging/monitoring endpoints)
   */
  getSnapshot(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
  } {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
  }

  private buildKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}

// Export singleton instance
export const metrics = new Metrics();

// Export class for testing
export { Metrics };
