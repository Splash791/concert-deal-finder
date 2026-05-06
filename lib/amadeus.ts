let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAmadeusToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are required');
  }

  const url = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Amadeus token error: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  const token = data.access_token;
  const expiresIn = data.expires_in * 1000;

  cachedToken = {
    token,
    expiresAt: now + expiresIn - 60000,
  };

  return token;
}

interface FlightOffer {
  price?: {
    total?: string;
  };
}

interface AmadeusFlightResponse {
  data?: FlightOffer[];
}

export async function fetchFlightEstimate(
  originCity: string,
  destCity: string,
  date: string
): Promise<number> {
  try {
    const token = await getAmadeusToken();

    const url = new URL('https://test.api.amadeus.com/v2/shopping/flight-offers');
    url.searchParams.append('originLocationCode', originCity.substring(0, 3).toUpperCase());
    url.searchParams.append('destinationLocationCode', destCity.substring(0, 3).toUpperCase());
    url.searchParams.append('departureDate', date);
    url.searchParams.append('returnDate', date);
    url.searchParams.append('adults', '1');
    url.searchParams.append('max', '1');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Amadeus flight fetch error: ${response.statusText}`);
      return 0;
    }

    const data = (await response.json()) as AmadeusFlightResponse;
    const offers = data.data || [];

    if (offers.length > 0 && offers[0].price?.total) {
      return parseFloat(offers[0].price.total);
    }

    return 0;
  } catch (error) {
    console.warn(`Error fetching flight estimate: ${error}`);
    return 0;
  }
}
