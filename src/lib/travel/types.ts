export type TravelVertical =
  | "flights"
  | "hotels"
  | "rides"
  | "parking"
  | "cruises";

export type ProviderKey =
  | "booking_demand"
  | "skyscanner"
  | "expedia_rapid"
  | "transferz"
  | "parkwhiz"
  | "vesselfinder";

export type ProviderCheckoutMode =
  | "redirect"
  | "provider_managed"
  | "content_only"
  | "data_feed";

export type ProviderStatus = {
  key: ProviderKey;
  name: string;
  verticals: TravelVertical[];
  enabled: boolean;
  checkoutMode: ProviderCheckoutMode;
  notes: string;
};

export type SearchMeta = {
  providerEnabled: boolean;
  providerName: string;
  searchUrl?: string | null;
  error?: string | null;
};

export type FlightSearchInput = {
  originIata: string;
  destinationIata: string;
  departDate: string;
  returnDate?: string | null;
  adults?: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
};

export type FlightOffer = {
  provider: ProviderKey;
  title: string;
  originIata: string;
  destinationIata: string;
  departDate: string;
  returnDate?: string | null;
  price?: number | null;
  currency?: string | null;
  carrierName?: string | null;
  deepLinkUrl?: string | null;
  durationMinutes?: number | null;
  stops?: number | null;
};

export type HotelSearchInput = {
  destination: string;
  checkin: string;
  checkout: string;
  adults?: number;
  rooms?: number;
  query?: string | null;
};

export type HotelOffer = {
  provider: ProviderKey;
  name: string;
  neighborhood?: string | null;
  checkin: string;
  checkout: string;
  totalPrice?: number | null;
  nightlyRate?: number | null;
  currency?: string | null;
  deepLinkUrl?: string | null;
  sourceId?: string | number | null;
};

export type RideSearchInput = {
  pickupLabel: string;
  dropoffLabel: string;
  pickupAt: string;
  passengers?: number;
};

export type RideOffer = {
  provider: ProviderKey;
  title: string;
  pickupLabel: string;
  dropoffLabel: string;
  pickupAt: string;
  totalPrice?: number | null;
  currency?: string | null;
  vehicleType?: string | null;
  durationMinutes?: number | null;
  deepLinkUrl?: string | null;
};

export type ParkingSearchInput = {
  locationLabel: string;
  latitude: number;
  longitude: number;
  startsAt: string;
  endsAt: string;
};

export type ParkingOffer = {
  provider: ProviderKey;
  title: string;
  locationLabel: string;
  startsAt: string;
  endsAt: string;
  totalPrice?: number | null;
  currency?: string | null;
  distanceMiles?: number | null;
  deepLinkUrl?: string | null;
};

export type CruiseScheduleEntry = {
  provider: ProviderKey;
  shipName: string;
  lineName?: string | null;
  terminalName: string;
  terminalSlug: string;
  arrivingAt?: string | null;
  departingAt?: string | null;
  status?: string | null;
  sourceUrl?: string | null;
};
