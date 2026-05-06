import { NextRequest, NextResponse } from 'next/server';
import { fetchTourDates } from '@/lib/ticketmaster';

interface GeocodeResult {
  results?: Array<{
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
  status?: string;
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY is not set');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.append('address', city);
  url.searchParams.append('key', apiKey);

  try {
    const response = await fetch(url.toString());
    const data = (await response.json()) as GeocodeResult;

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry?.location;
      if (location?.lat !== undefined && location?.lng !== undefined) {
        return { lat: location.lat, lon: location.lng };
      }
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const artist = request.nextUrl.searchParams.get('artist');
    const city = request.nextUrl.searchParams.get('city');

    if (!artist || !city) {
      return NextResponse.json(
        { error: 'artist and city parameters are required' },
        { status: 400 }
      );
    }

    const shows = await fetchTourDates(artist);

    if (!shows || shows.length === 0) {
      return NextResponse.json(
        {
          error: 'No tour dates found for the specified artist',
          data: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(shows);
  } catch (error) {
    console.error('Tours API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tour dates' },
      { status: 500 }
    );
  }
}
