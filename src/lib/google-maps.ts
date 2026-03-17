let googleMapsPromise: Promise<typeof google> | null = null;

declare global {
  interface Window {
    google?: typeof google;
    __pierlimoGoogleMapsReady?: () => void;
  }
}

export async function loadGoogleMapsApi() {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only be loaded in the browser.");
  }

  if (window.google?.maps?.Map && window.google?.maps?.places) {
    return window.google;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-google-maps-loader="true"]',
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(window.google!));
        existing.addEventListener("error", () =>
          reject(new Error("Google Maps failed to load.")),
        );
        return;
      }

      const params = new URLSearchParams({
        key: apiKey,
        libraries: "places",
        loading: "async",
        v: "weekly",
        callback: "__pierlimoGoogleMapsReady",
      });

      if (mapId) {
        params.set("map_ids", mapId);
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsLoader = "true";
      window.__pierlimoGoogleMapsReady = () => {
        resolve(window.google!);
        delete window.__pierlimoGoogleMapsReady;
      };
      script.onerror = () => reject(new Error("Google Maps failed to load."));
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
}

export type GoogleAddress = {
  label: string;
  lat: number;
  lng: number;
};
