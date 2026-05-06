import { haversineDistance } from '@/lib/distance';

interface GoogleDirectionsResponse {
  routes?: Array<{
    legs?: Array<{
      duration?: {
        value?: number;
      };
      distance?: {
        value?: number;
      };
    }>;
  }>;
  status?: string;
}

export async function fetchDriveInfo(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<{ miles: number; durationMinutes: number }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set');
  }

  const origin = `${originLat},${originLon}`;
  const destination = `${destLat},${destLon}`;

  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.append('origin', origin);
  url.searchParams.append('destination', destination);
  url.searchParams.append('mode', 'driving');
  url.searchParams.append('key', apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = (await response.json()) as GoogleDirectionsResponse;

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      throw new Error(`No route found: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs?.[0];

    if (!leg) {
      throw new Error('No route legs found');
    }

    const distanceMeters = leg.distance?.value || 0;
    const durationSeconds = leg.duration?.value || 0;

    const miles = distanceMeters / 1609.34;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    return { miles, durationMinutes };
  } catch (error) {
    console.warn(`Error fetching drive info: ${error}`);
    const miles = haversineDistance(originLat, originLon, destLat, destLon);
    const averageSpeedMph = 65;
    const durationMinutes = Math.ceil((miles / averageSpeedMph) * 60);
    return { miles, durationMinutes };
  }
}
