export type LocationType = 'address' | 'service_area' | 'online';

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  priceSuffix?: string; // e.g. "per hour", "starting", "per room", "each"
  description?: string;
}

export interface DaySchedule {
  open: boolean;
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface WeeklyAvailability {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  notes?: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  category: string;
  tagline?: string;
  locationType: LocationType;
  address?: string;       // Used if locationType === 'address'
  serviceArea?: string;   // Used if locationType === 'service_area'
  photos: string[];
  startingPrice: number;
  pricingUnit?: string;
  services: ServiceItem[];
  availability: WeeklyAvailability;
  phone?: string;
  email?: string;
  status: 'published' | 'draft';
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export const CATEGORIES = [
  'All',
  'Landscaping & Outdoors',
  'Crafts & Woodwork',
  'Artisan Bakery & Food',
  'Wellness & Spa',
  'Automotive Detailing',
  'Home & Renovation',
  'Creative & Photo',
  'Pet & Animal Care'
] as const;

export type Category = (typeof CATEGORIES)[number];
