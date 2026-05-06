export interface Show {
  id: string;
  artist: string;
  city: string;
  state: string;
  venue: string;
  date: string;
  lat: number;
  lon: number;
  minPrice: number;
  maxPrice: number;
  ticketUrl: string;
}

export type TravelMode = 'drive' | 'fly';

export interface TravelOption {
  mode: TravelMode;
  cost: number;
  durationMinutes: number;
  miles: number;
}

export interface HotelOption {
  name: string;
  pricePerNight: string;
  lat: number;
  lon: number;
  distanceToVenueMiles: number;
  bookingUrl: string;
}

export interface DealResult {
  show: Show;
  travelOptions: TravelOption[];
  hotelOption: HotelOption;
  totalCost: number;
  rank: number;
  bestDeal?: boolean;
}
