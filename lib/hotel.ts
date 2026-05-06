import { HotelOption } from '@/types';
import { haversineDistance } from '@/lib/distance';
import { fetchWithTimeout } from '@/lib/api-utils';
import { cache, cacheHotelKey } from '@/lib/cache';

interface CityPopulation {
  [key: string]: number;
}

const cityPopulations: CityPopulation = {
  'new york': 8000000,
  'los angeles': 4000000,
  chicago: 2700000,
  houston: 2320000,
  phoenix: 1700000,
  philadelphia: 1610000,
  'san antonio': 1550000,
  'san diego': 1400000,
  dallas: 1300000,
  'san jose': 1000000,
  denver: 600000,
  boston: 700000,
  portland: 650000,
  nashville: 700000,
  'las vegas': 600000,
  seattle: 750000,
  miami: 450000,
  atlanta: 500000,
  austin: 1000000,
  orlando: 300000,
};

function getPriceByTier(city: string): number {
  const cityLower = city.toLowerCase();
  const population = cityPopulations[cityLower];

  if (!population) {
    return 125;
  }

  if (population > 1000000) {
    return 189;
  } else if (population > 250000) {
    return 139;
  } else {
    return 89;
  }
}

export async function fetchHotelEstimate(
  lat: number,
  lon: number,
  date: string,
  city?: string
): Promise<HotelOption> {
  const cacheKey = cacheHotelKey(lat, lon, date);
  const cached = cache.get<HotelOption>(cacheKey);

  if (cached) {
    return cached;
  }

  const apiKey = process.env.BOOKING_API_KEY;

  if (apiKey) {
    try {
      const result = await fetchFromBookingApi(lat, lon, date, apiKey);
      cache.set(cacheKey, result, 1000 * 60 * 60 * 12);
      return result;
    } catch (error) {
      console.warn(`Booking.com API failed: ${error}, falling back to estimates`);
    }
  }

  const pricePerNight = getPriceByTier(city || 'unknown');

  const result = {
    name: `Hotel in ${city || 'destination'}`,
    pricePerNight: `$${pricePerNight}`,
    lat,
    lon,
    distanceToVenueMiles: 0,
    bookingUrl: 'https://www.booking.com',
  };

  cache.set(cacheKey, result, 1000 * 60 * 60 * 12);

  return result;
}

async function fetchFromBookingApi(
  lat: number,
  lon: number,
  date: string,
  apiKey: string
): Promise<HotelOption> {
  const url = new URL('https://api.booking.com/v1/hotel');
  url.searchParams.append('latitude', lat.toString());
  url.searchParams.append('longitude', lon.toString());
  url.searchParams.append('checkin_date', date);
  url.searchParams.append('checkout_date', getNextDay(date));

  const response = await fetchWithTimeout(
    url.toString(),
    {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    },
    15000
  );

  if (!response.ok) {
    throw new Error(`Booking API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    result?: Array<{
      hotel_name?: string;
      review_score?: number;
      price_per_night?: number;
      url?: string;
    }>;
  };

  const hotel = data.result?.[0];
  if (!hotel) {
    throw new Error('No hotels found');
  }

  return {
    name: hotel.hotel_name || 'Hotel',
    pricePerNight: `$${hotel.price_per_night || 125}`,
    lat,
    lon,
    distanceToVenueMiles: 0,
    bookingUrl: hotel.url || 'https://www.booking.com',
  };
}

function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
