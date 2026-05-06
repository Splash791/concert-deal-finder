import { z } from 'zod';

export const toursQuerySchema = z.object({
  artist: z.string().min(1, 'Artist name is required').max(255),
  city: z.string().min(1, 'City is required').max(255),
});

export const travelQuerySchema = z.object({
  originLat: z.coerce.number().min(-90).max(90),
  originLon: z.coerce.number().min(-180).max(180),
  destLat: z.coerce.number().min(-90).max(90),
  destLon: z.coerce.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  originCity: z.string().optional(),
  destCity: z.string().optional(),
});

export const hotelQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  city: z.string().optional(),
});

export const dealsQuerySchema = z.object({
  artist: z.string().min(1, 'Artist name is required').max(255),
  city: z.string().min(1, 'City is required').max(255),
});

export type ToursQuery = z.infer<typeof toursQuerySchema>;
export type TravelQuery = z.infer<typeof travelQuerySchema>;
export type HotelQuery = z.infer<typeof hotelQuerySchema>;
export type DealsQuery = z.infer<typeof dealsQuerySchema>;
