import { NextRequest, NextResponse } from 'next/server';
import { fetchHotelEstimate } from '@/lib/hotel';

export async function GET(request: NextRequest) {
  try {
    const lat = parseFloat(request.nextUrl.searchParams.get('lat') || '0');
    const lon = parseFloat(request.nextUrl.searchParams.get('lon') || '0');
    const date = request.nextUrl.searchParams.get('date');
    const city = request.nextUrl.searchParams.get('city');

    if (lat === 0 || lon === 0 || !date) {
      return NextResponse.json(
        { error: 'lat, lon, and date parameters are required' },
        { status: 400 }
      );
    }

    const hotelOption = await fetchHotelEstimate(lat, lon, date, city || undefined);

    return NextResponse.json(hotelOption);
  } catch (error) {
    console.error('Hotel API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotel options' },
      { status: 500 }
    );
  }
}
