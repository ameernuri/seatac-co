import { createHmac } from "crypto";

import { env } from "@/env";

type ExpediaRegionSuggestion = {
  id: string;
  name: string;
  type: string;
};

function hasExpediaRapidCredentials() {
  return Boolean(env.expediaRapidApiKey && env.expediaRapidSharedSecret);
}

function buildRapidAuthorizationHeader() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha512", env.expediaRapidSharedSecret)
    .update(`${env.expediaRapidApiKey}${timestamp}`)
    .digest("hex");

  return `EAN APIKey=${env.expediaRapidApiKey},Signature=${signature},timestamp=${timestamp}`;
}

async function expediaRapidGet(path: string, params: URLSearchParams) {
  const response = await fetch(`${env.expediaRapidBaseUrl}${path}?${params.toString()}`, {
    headers: {
      Authorization: buildRapidAuthorizationHeader(),
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "Customer-Ip": env.expediaRapidCustomerIp,
      "User-Agent": env.expediaRapidUserAgent,
    },
    next: {
      revalidate: 7_200,
    },
  });

  if (!response.ok) {
    throw new Error(`Expedia Rapid request failed: ${response.status}`);
  }

  return response.json();
}

export async function searchExpediaRapidRegions(query: string) {
  if (!hasExpediaRapidCredentials()) {
    return {
      enabled: false,
      suggestions: [] as ExpediaRegionSuggestion[],
      error: "Expedia Rapid credentials are not configured yet.",
    };
  }

  const params = new URLSearchParams({
    query,
    language: "en-US",
  });

  try {
    const raw = await expediaRapidGet(env.expediaRapidRegionsPath, params);
    const suggestions = extractRegionSuggestions(raw).slice(0, 8);

    return {
      enabled: true,
      suggestions,
    };
  } catch (error) {
    return {
      enabled: true,
      suggestions: [] as ExpediaRegionSuggestion[],
      error: error instanceof Error ? error.message : "Expedia Rapid region lookup failed.",
    };
  }
}

function extractRegionSuggestions(payload: unknown): ExpediaRegionSuggestion[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const suggestions: ExpediaRegionSuggestion[] = [];
  const stack: unknown[] = [payload];
  const seen = new Set<unknown>();

  while (stack.length > 0 && suggestions.length < 12) {
    const current = stack.pop();

    if (!current || typeof current !== "object" || seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (Array.isArray(current)) {
      for (const item of current) {
        stack.push(item);
      }

      continue;
    }

    const record = current as Record<string, unknown>;
    const id =
      (typeof record.id === "string" && record.id) ||
      (typeof record.region_id === "string" && record.region_id) ||
      null;
    const name =
      (typeof record.name === "string" && record.name) ||
      (typeof record.regionName === "string" && record.regionName) ||
      null;

    if (id && name) {
      suggestions.push({
        id,
        name,
        type:
          (typeof record.type === "string" && record.type) ||
          (typeof record.category === "string" && record.category) ||
          "region",
      });
    }

    for (const value of Object.values(record)) {
      stack.push(value);
    }
  }

  return suggestions;
}
