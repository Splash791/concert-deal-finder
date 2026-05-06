import { NextRequest, NextResponse } from 'next/server';
import { fetchTourDates } from '@/lib/ticketmaster';
import { toursQuerySchema } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse, createValidationError, logRequest, logError, fetchWithTimeout } from '@/lib/api-utils';

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
    const response = await fetchWithTimeout(url.toString(), {}, 10000);
    const data = (await response.json()) as GeocodeResult;

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry?.location;
      if (location?.lat !== undefined && location?.lng !== undefined) {
        return { lat: location.lat, lon: location.lng };
      }
    }
    return null;
  } catch (error) {
    logError(error, 'Geocoding error');
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const queryParams = {
      artist: request.nextUrl.searchParams.get('artist'),
      city: request.nextUrl.searchParams.get('city'),
    };

    logRequest('GET', '/api/tours', queryParams);

    const validation = toursQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return createErrorResponse(createValidationError(validation.error), 400);
    }

    const { artist, city } = validation.data;

    const shows = await fetchTourDates(artist);

    if (!shows || shows.length === 0) {
      return createSuccessResponse([], 200);
    }

    return createSuccessResponse(shows, 200);
  } catch (error) {
    logError(error, 'Tours API error');
    return createErrorResponse(
      {
        type: 'INTERNAL_ERROR',
        message: 'Failed to fetch tour dates',
      },
      500
    );
  }
}
