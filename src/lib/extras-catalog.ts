import { getSiteThemeContent } from "@/lib/theme";

export const EXTRAS_CATALOG_KEY = "extrasCatalog";

export type RideExtra = {
  detail: string;
  enabled: boolean;
  key: string;
  label: string;
  maxQuantity?: number;
  price: number;
  quantityLabel?: string;
};

function normalizeExtraKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeExtra(
  value: unknown,
  index: number,
): RideExtra | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const label = String(candidate.label ?? "").trim();
  const rawKey = String(candidate.key ?? "").trim();
  const key = normalizeExtraKey(rawKey || label || `extra-${index + 1}`);
  const price = Number(candidate.price);
  const maxQuantity = Number(candidate.maxQuantity);
  const quantityLabel = String(candidate.quantityLabel ?? "").trim();

  if (!label || !key || !Number.isFinite(price) || price < 0) {
    return null;
  }

  return {
    detail: String(candidate.detail ?? "").trim(),
    enabled: candidate.enabled !== false,
    key,
    label,
    maxQuantity:
      Number.isFinite(maxQuantity) && maxQuantity > 1
        ? Math.round(maxQuantity)
        : undefined,
    price: Math.round(price * 100) / 100,
    quantityLabel: quantityLabel || undefined,
  };
}

export function normalizeExtrasCatalog(
  value: unknown,
  fallback: unknown[] = [],
) {
  const source = Array.isArray(value) ? value : fallback;
  const seen = new Set<string>();

  return source.reduce<RideExtra[]>((catalog, entry, index) => {
    const normalized = normalizeExtra(entry, index);

    if (!normalized || seen.has(normalized.key)) {
      return catalog;
    }

    seen.add(normalized.key);
    catalog.push(normalized);
    return catalog;
  }, []);
}

export function getDefaultExtrasCatalog(siteSlug: string) {
  return normalizeExtrasCatalog(getSiteThemeContent(siteSlug).extrasCatalog);
}

export function getEnabledExtrasCatalog(
  value: unknown,
  fallback: unknown[] = [],
) {
  return normalizeExtrasCatalog(value, fallback).filter((extra) => extra.enabled);
}
