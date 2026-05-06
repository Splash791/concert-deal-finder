interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtl: number = 1000 * 60 * 60; // 1 hour

  set<T>(key: string, data: T, ttlMs: number = this.defaultTtl): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { data, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.store.get(key) as CacheEntry<unknown> | undefined;

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.store.clear();
  }

  delete(key: string): void {
    this.store.delete(key);
  }
}

export const cache = new Cache();

export function getCacheKey(...parts: string[]): string {
  return parts.join(':');
}

export function cacheTourDatesKey(artist: string): string {
  return getCacheKey('tours', artist.toLowerCase());
}

export function cacheFlightKey(origin: string, dest: string, date: string): string {
  return getCacheKey('flight', origin.toLowerCase(), dest.toLowerCase(), date);
}

export function cacheHotelKey(lat: number, lon: number, date: string): string {
  return getCacheKey('hotel', lat.toString(), lon.toString(), date);
}

export function cacheDrivingKey(lat1: number, lon1: number, lat2: number, lon2: number): string {
  return getCacheKey('drive', lat1.toString(), lon1.toString(), lat2.toString(), lon2.toString());
}
