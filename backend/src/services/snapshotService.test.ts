import { describe, it, expect } from 'vitest';

describe('SnapshotService', () => {
  it('should export generateSnapshot function', async () => {
    const { generateSnapshot } = await import('./snapshotService');
    expect(typeof generateSnapshot).toBe('function');
  });

  it('should export generateCommunitySnapshots function', async () => {
    const { generateCommunitySnapshots } = await import('./snapshotService');
    expect(typeof generateCommunitySnapshots).toBe('function');
  });

  it('should export getMemberBalanceTrend function', async () => {
    const { getMemberBalanceTrend } = await import('./snapshotService');
    expect(typeof getMemberBalanceTrend).toBe('function');
  });
});
