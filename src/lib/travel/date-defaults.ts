function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString().slice(0, 16);
}

export function getDateOffset(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return formatDate(value);
}

export function getDateTimeOffset(days: number, hours = 0) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  value.setUTCHours(value.getUTCHours() + hours, 0, 0, 0);
  return formatDateTime(value);
}
