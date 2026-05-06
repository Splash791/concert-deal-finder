import { Show } from '@/types';

interface TicketmasterEvent {
  id: string;
  name: string;
  dates?: {
    start?: {
      localDate?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name?: string;
      city?: {
        name?: string;
      };
      state?: {
        stateCode?: string;
      };
      location?: {
        latitude?: string;
        longitude?: string;
      };
    }>;
  };
  priceRanges?: Array<{
    min?: number;
    max?: number;
  }>;
  url?: string;
  classifications?: Array<{
    primary?: boolean;
    segment?: {
      name?: string;
    };
  }>;
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
}

export async function fetchTourDates(artist: string): Promise<Show[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    throw new Error('TICKETMASTER_API_KEY is not set');
  }

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
  url.searchParams.append('keyword', artist);
  url.searchParams.append('classificationName', 'Music');
  url.searchParams.append('sort', 'date,asc');
  url.searchParams.append('apikey', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.statusText}`);
  }

  const data = (await response.json()) as TicketmasterResponse;

  const events = data._embedded?.events || [];

  return events
    .map((event) => {
      const venue = event._embedded?.venues?.[0];
      if (!venue) return null;

      const lat = parseFloat(venue.location?.latitude || '0');
      const lon = parseFloat(venue.location?.longitude || '0');

      if (!event.dates?.start?.localDate || lat === 0 || lon === 0) {
        return null;
      }

      const priceRange = event.priceRanges?.[0];
      const minPrice = priceRange?.min || 0;
      const maxPrice = priceRange?.max || minPrice;

      return {
        id: event.id,
        artist: artist,
        city: venue.city?.name || 'Unknown',
        state: venue.state?.stateCode || 'Unknown',
        venue: venue.name || 'Unknown',
        date: event.dates.start.localDate,
        lat,
        lon,
        minPrice,
        maxPrice,
        ticketUrl: event.url || '',
      };
    })
    .filter((show): show is Show => show !== null);
}
