export const CHECKOUT_BOOKING_HOLD_MINUTES = 31;

export function getActiveBookingHoldCutoff(now = new Date()) {
  return new Date(now.getTime() - CHECKOUT_BOOKING_HOLD_MINUTES * 60 * 1000);
}

export function getStripeCheckoutExpiresAt(now = new Date()) {
  return Math.floor(now.getTime() / 1000) + CHECKOUT_BOOKING_HOLD_MINUTES * 60;
}
