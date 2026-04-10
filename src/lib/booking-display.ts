type BookingRouteInput = {
  dropoffLabel?: string | null;
  pickupLabel?: string | null;
  reference: string;
  routeName?: string | null;
};

export function formatBookingLocation(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  if (/sea[-\s]?tac|seattle[-\s]tacoma international airport|\(sea\)/i.test(trimmed)) {
    return "Sea-Tac Airport";
  }

  return trimmed.split(",")[0]?.trim() || trimmed;
}

export function formatBookingReference(reference: string) {
  return reference.replace(/^PL-/i, "SC-");
}

export function formatBookingRoute(booking: BookingRouteInput) {
  const pickup = formatBookingLocation(booking.pickupLabel);
  const dropoff = formatBookingLocation(booking.dropoffLabel);

  if (pickup && dropoff) {
    return `${pickup} to ${dropoff}`;
  }

  return booking.routeName || pickup || dropoff || "Custom route";
}
