"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinned, Navigation2, TimerReset } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { type GoogleAddress, loadGoogleMapsApi } from "@/lib/google-maps";

// Seatac.co theme colors
const SEATAC_GREEN = "#2d6a4f";
const SEATAC_GREEN_LIGHT = "#40916c";

export type RouteSummary = {
  distanceMiles: number;
  durationMinutes: number;
  startAddress: string;
  endAddress: string;
};

type Props = {
  pickupAddress: string;
  dropoffAddress: string;
  pickupPlace: GoogleAddress | null;
  dropoffPlace: GoogleAddress | null;
  fallbackCenter?: GoogleAddress | null;
  onRouteResolved: (summary: RouteSummary | null) => void;
  compact?: boolean;
  embedded?: boolean;
};

const SEA_TAC = {
  label: "Sea-Tac Airport",
  lat: 47.4502,
  lng: -122.3088,
} satisfies GoogleAddress;

function isSpecificAddress(value?: string | null) {
  const normalized = value?.trim();

  if (!normalized) {
    return false;
  }

  return normalized.includes(",") || normalized.length >= 14;
}

export function RouteMapCard({
  pickupAddress,
  dropoffAddress,
  pickupPlace,
  dropoffPlace,
  fallbackCenter,
  onRouteResolved,
  compact = false,
  embedded = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<RouteSummary | null>(null);

  const center = useMemo(
    () => fallbackCenter ?? pickupPlace ?? dropoffPlace ?? SEA_TAC,
    [dropoffPlace, fallbackCenter, pickupPlace],
  );

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapRef.current) {
        return;
      }

      try {
        const googleMaps = await loadGoogleMapsApi();

        if (cancelled || !mapRef.current) {
          return;
        }

        mapInstanceRef.current = new googleMaps.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom: 11,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        rendererRef.current = new googleMaps.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: SEATAC_GREEN,
            strokeOpacity: 0.9,
            strokeWeight: 5,
          },
        });

        setReady(true);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Map failed to load.");
      }
    }

    initMap();

    return () => {
      cancelled = true;
      rendererRef.current?.setMap(null);
      rendererRef.current = null;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    async function renderRoute() {
      if (!ready || !mapInstanceRef.current) {
        return;
      }

      const googleMaps = await loadGoogleMapsApi();

      const origin = pickupPlace
        ? new googleMaps.maps.LatLng(pickupPlace.lat, pickupPlace.lng)
        : isSpecificAddress(pickupAddress)
          ? pickupAddress
          : null;
      const destination = dropoffPlace
        ? new googleMaps.maps.LatLng(dropoffPlace.lat, dropoffPlace.lng)
        : isSpecificAddress(dropoffAddress)
          ? dropoffAddress
          : null;

      if (!origin || !destination) {
        rendererRef.current?.set("directions", null);
        onRouteResolved(null);
        setSummary(null);
        setError(null);

        mapInstanceRef.current.setCenter({ lat: center.lat, lng: center.lng });
        mapInstanceRef.current.setZoom(11);
        return;
      }

      try {
        const directionsService = new googleMaps.maps.DirectionsService();
        const response = await directionsService.route({
          origin,
          destination,
          travelMode: googleMaps.maps.TravelMode.DRIVING,
        });

        rendererRef.current?.setDirections(response);
        const leg = response.routes[0]?.legs[0];

        if (!leg?.distance?.value || !leg.duration?.value) {
          onRouteResolved(null);
          setSummary(null);
          return;
        }

        const nextSummary = {
          distanceMiles: leg.distance.value / 1609.344,
          durationMinutes: Math.round(leg.duration.value / 60),
          startAddress: leg.start_address,
          endAddress: leg.end_address,
        };

        setSummary(nextSummary);
        onRouteResolved(nextSummary);
        setError(null);
      } catch (routeError) {
        rendererRef.current?.set("directions", null);
        setSummary(null);
        onRouteResolved(null);
        setError("Enter a more specific local address to preview the route.");
      }
    }

    renderRoute().catch(() => {
      setSummary(null);
      onRouteResolved(null);
    });
  }, [
    center.label,
    center.lat,
    center.lng,
    dropoffAddress,
    onRouteResolved,
    pickupAddress,
    ready,
  ]);

  const body = (
    <>
      {!embedded ? (
        <div>
          <p className="font-sans text-[0.74rem] uppercase tracking-[0.3em] text-[#0d5c48]">
            Your route
          </p>
        </div>
      ) : null}
        <div
          ref={mapRef}
          className={
            compact
              ? "h-[252px] overflow-hidden rounded-[1.45rem] border border-[#0d5c48]/12 bg-[#f8faf9]"
              : "h-[320px] overflow-hidden rounded-[1.7rem] border border-[#0d5c48]/12 bg-[#f8faf9]"
          }
        />
        <div
          className={
            embedded
              ? compact
                ? "space-y-2 border-t border-[#0d5c48]/10 pt-4 text-sm text-[#5a7a70]"
                : "space-y-2 border-t border-[#0d5c48]/10 pt-5 text-sm text-[#5a7a70]"
              : compact
                ? "grid grid-cols-2 gap-3"
                : "grid gap-3 md:grid-cols-2"
          }
        >
          <div
            className={
              embedded
                ? ""
                : compact
                  ? "rounded-[1.2rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-3.5"
                  : "rounded-[1.4rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-4"
            }
          >
            {embedded ? (
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <span>Distance</span>
                <span className="text-right font-medium text-[#1a3d34]">
                  {summary ? `${summary.distanceMiles.toFixed(1)} mi` : "Waiting"}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#5a7a70]">
                  <Navigation2 className="size-4 text-[#0d5c48]" />
                  Distance
                </div>
                <div
                  className={
                    compact ? "mt-2 text-xl font-semibold text-[#1a3d34]" : "mt-2 text-2xl font-semibold text-[#1a3d34]"
                  }
                >
                  {summary ? `${summary.distanceMiles.toFixed(1)} mi` : "Waiting for route"}
                </div>
              </>
            )}
          </div>
          <div
            className={
              embedded
                ? ""
                : compact
                  ? "rounded-[1.2rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-3.5"
                  : "rounded-[1.4rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-4"
            }
          >
            {embedded ? (
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
                <span>Drive time</span>
                <span className="text-right font-medium text-[#1a3d34]">
                  {summary ? `${summary.durationMinutes} min` : "Waiting"}
                </span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[#5a7a70]">
                  <TimerReset className="size-4 text-[#0d5c48]" />
                  Drive time
                </div>
                <div
                  className={
                    compact ? "mt-2 text-xl font-semibold text-[#1a3d34]" : "mt-2 text-2xl font-semibold text-[#1a3d34]"
                  }
                >
                  {summary ? `${summary.durationMinutes} min` : "Waiting for route"}
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className={
            embedded
              ? compact
                ? "space-y-2 border-t border-[#0d5c48]/10 pt-4 text-sm text-[#5a7a70]"
                : "space-y-2 border-t border-[#0d5c48]/10 pt-5 text-sm text-[#5a7a70]"
              : compact
                ? "rounded-[1.2rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-3.5 text-sm leading-6 text-[#5a7a70]"
                : "rounded-[1.4rem] border border-[#0d5c48]/10 bg-[#f8faf9] p-4 text-sm leading-7 text-[#5a7a70]"
          }
        >
          {embedded ? (
            summary ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 whitespace-nowrap">Pickup</span>
                  <span className="ml-auto max-w-[16rem] text-right text-[#1a3d34]">
                    {summary.startAddress}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 whitespace-nowrap">Drop-off</span>
                  <span className="ml-auto max-w-[16rem] text-right text-[#1a3d34]">
                    {summary.endAddress}
                  </span>
                </div>
                {error ? <div className="text-[#8aa89e]">{error}</div> : null}
              </>
            ) : (
              <div className="text-[#8aa89e]">Choose pickup and drop-off addresses to render the live map route.</div>
            )
          ) : (
            <div className="flex items-start gap-3">
              <MapPinned className="mt-1 size-4 text-[#0d5c48]" />
              <div>
                {summary ? (
                  <>
                    <div className="text-[#1a3d34]">{summary.startAddress}</div>
                    <div className="text-[#8aa89e]">to</div>
                    <div className="text-[#1a3d34]">{summary.endAddress}</div>
                  </>
                ) : (
                  <div>Choose pickup and drop-off addresses to render the live map route.</div>
                )}
                {error && <div className="mt-2 text-[#8aa89e]">{error}</div>}
              </div>
            </div>
          )}
        </div>
    </>
  );

  if (embedded) {
    return <div className={compact ? "space-y-4 font-sans" : "space-y-5 font-sans"}>{body}</div>;
  }

  return (
    <Card
      className={
        compact
          ? "rounded-[1.9rem] border-[#0d5c48]/12 bg-white shadow-[0_4px_24px_rgba(13,92,72,0.08)]"
          : "rounded-[2rem] border-[#0d5c48]/12 bg-white shadow-[0_4px_24px_rgba(13,92,72,0.08)]"
      }
    >
      <CardContent className={compact ? "space-y-4 p-5 font-sans" : "space-y-5 p-6 font-sans"}>
        {body}
      </CardContent>
    </Card>
  );
}
