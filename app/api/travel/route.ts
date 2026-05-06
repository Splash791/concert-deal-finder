import { NextRequest } from 'next/server';
import { fetchDriveInfo } from '@/lib/directions';
import { fetchFlightEstimate } from '@/lib/amadeus';
import { TravelOption } from '@/types';
import { travelQuerySchema } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse, createValidationError, logRequest, logError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = {
      originLat: request.nextUrl.searchParams.get('originLat'),
      originLon: request.nextUrl.searchParams.get('originLon'),
      destLat: request.nextUrl.searchParams.get('destLat'),
      destLon: request.nextUrl.searchParams.get('destLon'),
      date: request.nextUrl.searchParams.get('date'),
      originCity: request.nextUrl.searchParams.get('originCity'),
      destCity: request.nextUrl.searchParams.get('destCity'),
    };

    logRequest('GET', '/api/travel', queryParams);

    const validation = travelQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return createErrorResponse(createValidationError(validation.error), 400);
    }

    const { originLat, originLon, destLat, destLon, date, originCity, destCity } = validation.data;

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
      logError(error, 'Drive info fetch failed');
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
        logError(error, 'Flight estimate fetch failed');
      }
    }

    const sorted = travelOptions.sort((a, b) => a.cost - b.cost);

    return createSuccessResponse(sorted, 200);
  } catch (error) {
    logError(error, 'Travel API error');
    return createErrorResponse(
      {
        type: 'INTERNAL_ERROR',
        message: 'Failed to fetch travel options',
      },
      500
    );
  }
}
