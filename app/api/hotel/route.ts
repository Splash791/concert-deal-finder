import { NextRequest } from 'next/server';
import { fetchHotelEstimate } from '@/lib/hotel';
import { hotelQuerySchema } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse, createValidationError, logRequest, logError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const queryParams = {
      lat: request.nextUrl.searchParams.get('lat'),
      lon: request.nextUrl.searchParams.get('lon'),
      date: request.nextUrl.searchParams.get('date'),
      city: request.nextUrl.searchParams.get('city'),
    };

    logRequest('GET', '/api/hotel', queryParams);

    const validation = hotelQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return createErrorResponse(createValidationError(validation.error), 400);
    }

    const { lat, lon, date, city } = validation.data;

    const hotelOption = await fetchHotelEstimate(lat, lon, date, city);

    return createSuccessResponse(hotelOption, 200);
  } catch (error) {
    logError(error, 'Hotel API error');
    return createErrorResponse(
      {
        type: 'INTERNAL_ERROR',
        message: 'Failed to fetch hotel options',
      },
      500
    );
  }
}
