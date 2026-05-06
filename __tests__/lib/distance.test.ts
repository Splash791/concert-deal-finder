import { haversineDistance } from '@/lib/distance';

describe('haversineDistance', () => {
  it('calculates distance between New York and Los Angeles', () => {
    const distance = haversineDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(distance).toBeCloseTo(2451, -1);
  });

  it('returns 0 for same coordinates', () => {
    const distance = haversineDistance(40.7128, -74.0060, 40.7128, -74.0060);
    expect(distance).toBeCloseTo(0, 5);
  });

  it('calculates distance between San Francisco and Seattle', () => {
    const distance = haversineDistance(37.7749, -122.4194, 47.6062, -122.3321);
    expect(distance).toBeCloseTo(682, -1);
  });

  it('handles negative coordinates', () => {
    const distance = haversineDistance(-33.8688, 151.2093, 40.7128, -74.0060);
    expect(distance).toBeGreaterThan(0);
  });
});
