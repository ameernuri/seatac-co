const DAY_MS = 86_400_000;

export type StayWindow = {
  checkin: string;
  checkout: string;
  nights: number;
};

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function isIsoDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function parseIsoDate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

export function resolveStayWindow(input?: {
  checkin?: string;
  checkout?: string;
}): StayWindow {
  const today = new Date();
  const fallbackCheckin = new Date(today.getTime() + DAY_MS * 14);
  const fallbackCheckout = new Date(today.getTime() + DAY_MS * 16);

  const requestedCheckin = isIsoDate(input?.checkin) ? parseIsoDate(input!.checkin!) : fallbackCheckin;
  const requestedCheckout = isIsoDate(input?.checkout) ? parseIsoDate(input!.checkout!) : fallbackCheckout;

  const normalizedCheckin =
    requestedCheckin.getTime() <= today.getTime() ? fallbackCheckin : requestedCheckin;
  const normalizedCheckout =
    requestedCheckout.getTime() <= normalizedCheckin.getTime()
      ? new Date(normalizedCheckin.getTime() + DAY_MS * 2)
      : requestedCheckout;

  const nights = Math.max(
    1,
    Math.round((normalizedCheckout.getTime() - normalizedCheckin.getTime()) / DAY_MS),
  );

  return {
    checkin: toIsoDate(normalizedCheckin),
    checkout: toIsoDate(normalizedCheckout),
    nights,
  };
}

export function formatStayWindow(window: StayWindow) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  const checkin = formatter.format(parseIsoDate(window.checkin));
  const checkout = formatter.format(parseIsoDate(window.checkout));
  const nightLabel = window.nights === 1 ? "1 night" : `${window.nights} nights`;

  return `${checkin} - ${checkout} (${nightLabel})`;
}
