export interface City {
  id: number;
  name: string;
  province: string;
  population: string;
  slug: string;
}

export interface Province {
  name: string;
  slug: string;
  cities: City[];
}

export interface Keyword {
  id: number;
  name: string;
  slug: string;
}

export interface Pizzeria {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  vicinity?: string;
  priceLevel?: number;
  types?: string[];
  phoneNumber?: string;
  websiteUri?: string;
  openingHours?: {
    weekdayText?: string[];
    openNow?: boolean;
  };
  googleMapsUrl?: string;
}

export interface SearchResult {
  pizzerias: Pizzeria[];
  totalResults: number;
  nextPageToken?: string;
}

export interface FormSubmission {
  name: string;
  email: string;
  message: string;
  phone?: string;
  city?: string;
  preferredPizzaType?: string;
  howDidYouFindUs?: string;
  newsletterConsent?: boolean;
  userAgent?: string;
  screenSize?: string;
  timezone?: string;
  referrer?: string;
  ipAddress?: string;
  visitTime?: string;
  submittedAt?: string;
  createdAt: Date;
}
