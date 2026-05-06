import { NextRequest, NextResponse } from 'next/server';
import { fetchDriveInfo } from '@/lib/directions';
import { fetchFlightEstimate } from '@/lib/amadeus';
import { TravelOption } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const originLat = parseFloat(request.nextUrl.searchParams.get('originLat') || '0');
    const originLon = parseFloat(request.nextUrl.searchParams.get('originLon') || '0');
    const destLat = parseFloat(request.nextUrl.searchParams.get('destLat') || '0');
    const destLon = parseFloat(request.nextUrl.searchParams.get('destLon') || '0');
    const date = request.nextUrl.searchParams.get('date');
    const originCity = request.nextUrl.searchParams.get('originCity');
    const destCity = request.nextUrl.searchParams.get('destCity');

    if (
      originLat === 0 ||
      originLon === 0 ||
      destLat === 0 ||
      destLon === 0 ||
      !date
    ) {
      return NextResponse.json(
        { error: 'originLat, originLon, destLat, destLon, and date parameters are required' },
        { status: 400 }
      );
    }

    const travelOptions: TravelOption[] = [];

    try {
      const driveInfo = await fetchDriveInfo(originLat, originLon, destLat, destLon);
      const driveCost = Math.ceil(driveInfo.miles * 0.67);

      travelOptions.push({
        mode: 'drive',
        cost: driveCost,
        durationMinutes: driveInfo.durationMinutes,
        miles: driveInfo.miles,
      });
    } catch (error) {
      console.warn('Drive info fetch failed:', error);
    }

    if (originCity && destCity) {
      try {
        const flightCost = await fetchFlightEstimate(originCity, destCity, date);
        if (flightCost > 0) {
          travelOptions.push({
            mode: 'fly',
            cost: flightCost,
            durationMinutes: 240,
            miles: 0,
          });
        }
      } catch (error) {
        console.warn('Flight estimate fetch failed:', error);
      }
    }

    const sorted = travelOptions.sort((a, b) => a.cost - b.cost);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Travel API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch travel options' },
      { status: 500 }
    );
  }
}
