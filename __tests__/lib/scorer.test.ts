import { rankDeals } from '@/lib/scorer';
import { DealResult } from '@/types';

const mockShow = {
  id: '1',
  artist: 'Test Artist',
  city: 'New York',
  state: 'NY',
  venue: 'Madison Square Garden',
  date: '2024-06-15',
  lat: 40.7505,
  lon: -73.9934,
  minPrice: 100,
  maxPrice: 300,
  ticketUrl: 'https://example.com',
};

const mockHotel = {
  name: 'Test Hotel',
  pricePerNight: '$150',
  lat: 40.7505,
  lon: -73.9934,
  distanceToVenueMiles: 1,
  bookingUrl: 'https://booking.com',
};

describe('rankDeals', () => {
  it('ranks deals by total cost', () => {
    const deals: DealResult[] = [
      {
        show: mockShow,
        travelOptions: [{ mode: 'drive', cost: 500, durationMinutes: 360, miles: 750 }],
        hotelOption: mockHotel,
        totalCost: 0,
        rank: 0,
      },
      {
        show: { ...mockShow, id: '2' },
        travelOptions: [{ mode: 'fly', cost: 200, durationMinutes: 240, miles: 0 }],
        hotelOption: mockHotel,
        totalCost: 0,
        rank: 0,
      },
    ];

    const ranked = rankDeals(deals);

    expect(ranked[0].rank).toBe(0);
    expect(ranked[1].rank).toBe(1);
    expect(ranked[0].bestDeal).toBe(true);
    expect(ranked[1].bestDeal).toBeUndefined();
  });

  it('calculates total cost correctly', () => {
    const deals: DealResult[] = [
      {
        show: { ...mockShow, minPrice: 100 },
        travelOptions: [{ mode: 'drive', cost: 500, durationMinutes: 360, miles: 750 }],
        hotelOption: { ...mockHotel, pricePerNight: '$200' },
        totalCost: 0,
        rank: 0,
      },
    ];

    const ranked = rankDeals(deals);

    expect(ranked[0].totalCost).toBe(100 + 500 + 200);
  });

  it('uses cheapest travel option for cost calculation', () => {
    const deals: DealResult[] = [
      {
        show: { ...mockShow, minPrice: 50 },
        travelOptions: [
          { mode: 'fly', cost: 400, durationMinutes: 240, miles: 0 },
          { mode: 'drive', cost: 300, durationMinutes: 360, miles: 450 },
        ],
        hotelOption: { ...mockHotel, pricePerNight: '$100' },
        totalCost: 0,
        rank: 0,
      },
    ];

    const ranked = rankDeals(deals);

    expect(ranked[0].totalCost).toBe(50 + 300 + 100);
  });
});
