"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPinned, Navigation2, TimerReset } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { type GoogleAddress, loadGoogleMapsApi } from "@/lib/google-maps";

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
};

const SEA_TAC = {
  label: "Sea-Tac Airport",
  lat: 47.4502,
  lng: -122.3088,
} satisfies GoogleAddress;

export function RouteMapCard({
  pickupAddress,
  dropoffAddress,
  pickupPlace,
  dropoffPlace,
  fallbackCenter,
  onRouteResolved,
  compact = false,
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
            strokeColor: "#e0bf82",
            strokeOpacity: 0.95,
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

      if (!pickupAddress || !dropoffAddress) {
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
          origin: pickupAddress,
          destination: dropoffAddress,
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
        setSummary(null);
        onRouteResolved(null);
        setError(routeError instanceof Error ? routeError.message : "Route failed.");
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

  return (
    <Card
      className={
        compact
          ? "rounded-[1.9rem] border-white/8 bg-[#111217]"
          : "rounded-[2rem] border-white/8 bg-white/[0.03]"
      }
    >
      <CardContent className={compact ? "space-y-4 p-5 font-sans" : "space-y-5 p-6 font-sans"}>
        <div>
          <p className="font-sans text-[0.74rem] uppercase tracking-[0.3em] text-primary/80">
            Route preview
          </p>
          <p className="mt-2 text-sm leading-6 text-white/62">
            {compact
              ? "Live Google route rendering with address autocomplete and drive-time estimation."
              : "Live Google route rendering with address autocomplete and drive-time estimation."}
          </p>
        </div>
        <div
          ref={mapRef}
          className={
            compact
              ? "h-[252px] overflow-hidden rounded-[1.45rem] border border-white/8 bg-black/35"
              : "h-[320px] overflow-hidden rounded-[1.7rem] border border-white/8 bg-black/35"
          }
        />
        <div className={compact ? "grid grid-cols-2 gap-3" : "grid gap-3 md:grid-cols-2"}>
          <div
            className={
              compact
                ? "rounded-[1.2rem] border border-white/8 bg-black/20 p-3.5"
                : "rounded-[1.4rem] border border-white/8 bg-black/20 p-4"
            }
          >
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/50">
              <Navigation2 className="size-4 text-primary" />
              Distance
            </div>
            <div className={compact ? "mt-2 text-xl font-semibold text-white" : "mt-2 text-2xl font-semibold text-white"}>
              {summary ? `${summary.distanceMiles.toFixed(1)} mi` : "Waiting for route"}
            </div>
          </div>
          <div
            className={
              compact
                ? "rounded-[1.2rem] border border-white/8 bg-black/20 p-3.5"
                : "rounded-[1.4rem] border border-white/8 bg-black/20 p-4"
            }
          >
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/50">
              <TimerReset className="size-4 text-primary" />
              Drive time
            </div>
            <div className={compact ? "mt-2 text-xl font-semibold text-white" : "mt-2 text-2xl font-semibold text-white"}>
              {summary ? `${summary.durationMinutes} min` : "Waiting for route"}
            </div>
          </div>
        </div>
        <div
          className={
            compact
              ? "rounded-[1.2rem] border border-white/8 bg-black/20 p-3.5 text-sm leading-6 text-white/62"
              : "rounded-[1.4rem] border border-white/8 bg-black/20 p-4 text-sm leading-7 text-white/62"
          }
        >
          <div className="flex items-start gap-3">
            <MapPinned className="mt-1 size-4 text-primary" />
            <div>
              {summary ? (
                <>
                  <div>{summary.startAddress}</div>
                  <div className="text-white/38">to</div>
                  <div>{summary.endAddress}</div>
                </>
              ) : (
                <div>Choose pickup and drop-off addresses to render the live map route.</div>
              )}
              {error && <div className="mt-2 text-amber-200">{error}</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
