import { NextRequest, NextResponse } from 'next/server';
import { fetchTourDates } from '@/lib/ticketmaster';
import { fetchDriveInfo } from '@/lib/directions';
import { fetchFlightEstimate } from '@/lib/amadeus';
import { fetchHotelEstimate } from '@/lib/hotel';
import { rankDeals } from '@/lib/scorer';
import { DealResult } from '@/types';

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

    const originCoords = await geocodeCity(city);
    if (!originCoords) {
      return NextResponse.json(
        { error: 'Could not geocode the origin city', data: [] },
        { status: 200 }
      );
    }

    const shows = await fetchTourDates(artist);

    if (!shows || shows.length === 0) {
      return NextResponse.json(
        { error: 'No tour dates found for the specified artist', data: [] },
        { status: 200 }
      );
    }

    const deals: DealResult[] = [];

    for (const show of shows) {
      try {
        const travelOptions = [];

        try {
          const driveInfo = await fetchDriveInfo(
            originCoords.lat,
            originCoords.lon,
            show.lat,
            show.lon
          );
          const driveCost = Math.ceil(driveInfo.miles * 0.67);

          travelOptions.push({
            mode: 'drive' as const,
            cost: driveCost,
            durationMinutes: driveInfo.durationMinutes,
            miles: driveInfo.miles,
          });
        } catch (error) {
          console.warn(`Drive info failed for ${show.venue}:`, error);
        }

        try {
          const flightCost = await fetchFlightEstimate(city, show.city, show.date);
          if (flightCost > 0) {
            travelOptions.push({
              mode: 'fly' as const,
              cost: flightCost,
              durationMinutes: 240,
              miles: 0,
            });
          }
        } catch (error) {
          console.warn(`Flight estimate failed for ${show.city}:`, error);
        }

        if (travelOptions.length === 0) {
          console.warn(`No travel options found for ${show.venue}, skipping show`);
          continue;
        }

        const hotelOption = await fetchHotelEstimate(
          show.lat,
          show.lon,
          show.date,
          show.city
        );

        deals.push({
          show,
          travelOptions: travelOptions.sort((a, b) => a.cost - b.cost),
          hotelOption,
          totalCost: 0,
          rank: 0,
        });
      } catch (error) {
        console.warn(`Failed to fetch data for ${show.venue}: ${error}`);
      }
    }

    if (deals.length === 0) {
      return NextResponse.json(
        {
          error: 'Could not process any shows with complete data',
          data: [],
        },
        { status: 200 }
      );
    }

    const rankedDeals = rankDeals(deals);

    return NextResponse.json(rankedDeals);
  } catch (error) {
    console.error('Deals API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
