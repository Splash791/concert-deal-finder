import {
  toursQuerySchema,
  travelQuerySchema,
  hotelQuerySchema,
  dealsQuerySchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('toursQuerySchema', () => {
    it('validates correct tour query', () => {
      const data = {
        artist: 'Taylor Swift',
        city: 'New York',
      };

      const result = toursQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('rejects missing artist', () => {
      const data = { city: 'New York' };

      const result = toursQuerySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects missing city', () => {
      const data = { artist: 'Taylor Swift' };

      const result = toursQuerySchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe('travelQuerySchema', () => {
    it('validates correct travel query', () => {
      const data = {
        originLat: 40.7128,
        originLon: -74.006,
        destLat: 34.0522,
        destLon: -118.2437,
        date: '2024-06-15',
      };

      const result = travelQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('rejects invalid latitude', () => {
      const data = {
        originLat: 91,
        originLon: -74.006,
        destLat: 34.0522,
        destLon: -118.2437,
        date: '2024-06-15',
      };

      const result = travelQuerySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const data = {
        originLat: 40.7128,
        originLon: -74.006,
        destLat: 34.0522,
        destLon: -118.2437,
        date: '06/15/2024',
      };

      const result = travelQuerySchema.safeParse(data);

      expect(result.success).toBe(false);
    });

    it('coerces string numbers to numbers', () => {
      const data = {
        originLat: '40.7128',
        originLon: '-74.006',
        destLat: '34.0522',
        destLon: '-118.2437',
        date: '2024-06-15',
      };

      const result = travelQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('hotelQuerySchema', () => {
    it('validates correct hotel query', () => {
      const data = {
        lat: 40.7505,
        lon: -73.9934,
        date: '2024-06-15',
        city: 'New York',
      };

      const result = hotelQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it('validates without optional city', () => {
      const data = {
        lat: 40.7505,
        lon: -73.9934,
        date: '2024-06-15',
      };

      const result = hotelQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });

  describe('dealsQuerySchema', () => {
    it('validates correct deals query', () => {
      const data = {
        artist: 'Taylor Swift',
        city: 'New York',
      };

      const result = dealsQuerySchema.safeParse(data);

      expect(result.success).toBe(true);
    });
  });
});
