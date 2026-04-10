export function getVehicleDisplayName(name?: string | null) {
  return (name ?? "").replace(/^Airport\s+/i, "");
}
