import { DealResult } from '@/types';

export function rankDeals(deals: DealResult[]): DealResult[] {
  const withCosts = deals.map((deal) => {
    const cheapestTravel = Math.min(...deal.travelOptions.map((t) => t.cost));
    const hotelPrice = parseFloat(deal.hotelOption.pricePerNight.replace('$', '') || '0');
    const totalCost = deal.show.minPrice + cheapestTravel + hotelPrice;

    return {
      ...deal,
      totalCost,
    };
  });

  const sorted = withCosts.sort((a, b) => a.totalCost - b.totalCost);

  return sorted.map((deal, index) => ({
    ...deal,
    rank: index,
    bestDeal: index === 0,
  }));
}
