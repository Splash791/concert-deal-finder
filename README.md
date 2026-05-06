# Concert Deal Finder - Backend API

A Next.js App Router backend service that finds the best concert deals by combining ticket prices with real-time travel and accommodation costs.

## Features

- **Tour Search**: Find concert dates for any artist using Ticketmaster
- **Travel Options**: Calculate drive and flight costs
- **Hotel Estimates**: Get accommodation pricing for concert locations
- **Deal Ranking**: Automatically rank deals by total cost
- **Smart Fallbacks**: Graceful degradation when APIs are unavailable

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **External APIs**: Ticketmaster, Amadeus, Google Maps, Booking.com

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` from the example:
   ```bash
   cp .env.local.example .env.local
   ```

4. Add your API keys to `.env.local`

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## API Endpoints

### GET `/api/tours`
Search for concert tour dates.

**Query Parameters:**
- `artist` (required): Artist name
- `city` (required): City to search from

**Response:**
```json
[
  {
    "id": "event-id",
    "artist": "Artist Name",
    "city": "New York",
    "state": "NY",
    "venue": "Madison Square Garden",
    "date": "2024-06-15",
    "lat": 40.7505,
    "lon": -73.9934,
    "minPrice": 50,
    "maxPrice": 350,
    "ticketUrl": "https://..."
  }
]
```

### GET `/api/travel`
Get travel options between two locations.

**Query Parameters:**
- `originLat` (required): Origin latitude
- `originLon` (required): Origin longitude
- `destLat` (required): Destination latitude
- `destLon` (required): Destination longitude
- `date` (required): Travel date (YYYY-MM-DD)
- `originCity` (optional): Origin city name for flight search
- `destCity` (optional): Destination city name for flight search

**Response:**
```json
[
  {
    "mode": "drive",
    "cost": 650,
    "durationMinutes": 360,
    "miles": 1000
  },
  {
    "mode": "fly",
    "cost": 250,
    "durationMinutes": 240,
    "miles": 0
  }
]
```

### GET `/api/hotel`
Get hotel estimates for a location.

**Query Parameters:**
- `lat` (required): Venue latitude
- `lon` (required): Venue longitude
- `date` (required): Check-in date (YYYY-MM-DD)
- `city` (optional): City name for better price estimates

**Response:**
```json
{
  "name": "Hotel in Los Angeles",
  "pricePerNight": "$189",
  "lat": 34.0522,
  "lon": -118.2437,
  "distanceToVenueMiles": 0,
  "bookingUrl": "https://www.booking.com"
}
```

### GET `/api/deals`
Get ranked concert deals combining all factors.

**Query Parameters:**
- `artist` (required): Artist name
- `city` (required): Your city

**Response:**
```json
[
  {
    "show": {...},
    "travelOptions": [...],
    "hotelOption": {...},
    "totalCost": 800,
    "rank": 0,
    "bestDeal": true
  }
]
```

## Environment Variables

See `.env.local.example` for all required keys.

## Error Handling

- Individual show failures don't block the entire response
- Hotels fall back to city tier estimates if API fails
- Missing travel options cause that show to be skipped
- Empty results return with descriptive error messages

## Project Structure

```
app/
├── api/
│   ├── deals/route.ts        # Main orchestration endpoint
│   ├── hotel/route.ts        # Hotel options
│   ├── tour/route.ts         # Tour dates
│   └── travel/route.ts       # Travel options
├── layout.tsx
└── page.tsx
lib/
├── amadeus.ts               # Flight API
├── directions.ts            # Google Maps directions
├── distance.ts              # Distance calculation
├── hotel.ts                 # Hotel estimates
├── scorer.ts                # Deal ranking
└── ticketmaster.ts          # Tour dates API
types/
└── index.ts                # Type definitions
```
