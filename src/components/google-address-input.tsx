"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { loadGoogleMapsApi, type GoogleAddress } from "@/lib/google-maps";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onResolved: (value: GoogleAddress | null) => void;
  placeholder: string;
  className?: string;
  suggestions?: string[];
};

type SuggestionItem =
  | {
      kind: "common";
      key: string;
      title: string;
      subtitle?: string;
      value: string;
    }
  | {
      kind: "prediction";
      key: string;
      title: string;
      subtitle?: string;
      placeId: string;
      value: string;
    };

export function GoogleAddressInput({
  id,
  value,
  onChange,
  onResolved,
  placeholder,
  className,
  suggestions = [],
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onResolvedRef = useRef(onResolved);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const [focused, setFocused] = useState(false);
  const [predictionItems, setPredictionItems] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onResolvedRef.current = onResolved;
  }, [onChange, onResolved]);

  const commonItems = useMemo<SuggestionItem[]>(
    () =>
      Array.from(new Set(suggestions.map((item) => item.trim()).filter(Boolean)))
        .slice(0, 8)
        .map((suggestion) => ({
          kind: "common" as const,
          key: `common-${suggestion}`,
          title: suggestion,
          value: suggestion,
        })),
    [suggestions],
  );

  useEffect(() => {
    let active = true;

    async function attachServices() {
      const googleMaps = await loadGoogleMapsApi();

      if (!active) {
        return;
      }

      autocompleteServiceRef.current = new googleMaps.maps.places.AutocompleteService();
      placesServiceRef.current = new googleMaps.maps.places.PlacesService(document.createElement("div"));
    }

    attachServices().catch(() => {
      autocompleteServiceRef.current = null;
      placesServiceRef.current = null;
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!focused) {
      return;
    }

    const query = value.trim();

    if (!query) {
      setPredictionItems([]);
      return;
    }

    const service = autocompleteServiceRef.current;

    if (!service) {
      setPredictionItems([]);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      service.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: "us" },
        },
        (predictions, status) => {
          if (!active) {
            return;
          }

          if (
            status !== google.maps.places.PlacesServiceStatus.OK ||
            !predictions?.length
          ) {
            setPredictionItems([]);
            return;
          }

          setPredictionItems(
            predictions.slice(0, 6).map((prediction) => ({
              kind: "prediction" as const,
              key: prediction.place_id,
              title:
                prediction.structured_formatting?.main_text ||
                prediction.description,
              subtitle: prediction.structured_formatting?.secondary_text,
              placeId: prediction.place_id,
              value: prediction.description,
            })),
          );
        },
      );
    }, 120);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [focused, value]);

  const visibleItems =
    value.trim() === "" ? commonItems : predictionItems;

  async function selectPrediction(placeId: string, fallbackValue: string) {
    const service = placesServiceRef.current;

    if (!service) {
      onChangeRef.current(fallbackValue);
      onResolvedRef.current(null);
      setFocused(false);
      return;
    }

    service.getDetails(
      {
        placeId,
        fields: ["formatted_address", "geometry", "name"],
      },
      (place, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place?.geometry?.location
        ) {
          onChangeRef.current(fallbackValue);
          onResolvedRef.current(null);
          setFocused(false);
          return;
        }

        const label = place.formatted_address || place.name || fallbackValue;
        onChangeRef.current(label);
        onResolvedRef.current({
          label,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setFocused(false);
      },
    );
  }

  function selectCommon(value: string) {
    onChangeRef.current(value);
    onResolvedRef.current(null);
    setFocused(false);
  }

  return (
    <div className="relative">
      <Input
        id={id}
        ref={inputRef}
        value={value}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setFocused(false), 120);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          onResolved(null);
        }}
        placeholder={placeholder}
        className={cn("seatac-address-input", className)}
      />
      {focused && visibleItems.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-40 rounded-2xl border border-[#1a3d34]/8 bg-white p-2 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          {value.trim() === "" ? (
            <p className="px-3 pb-2 pt-1 text-[0.68rem] uppercase tracking-[0.22em] text-[#5a7a6e]">
              Common places
            </p>
          ) : null}
          <div className="grid gap-1">
            {visibleItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  if (item.kind === "common") {
                    selectCommon(item.value);
                    return;
                  }
                  void selectPrediction(item.placeId, item.value);
                }}
                className="rounded-xl px-3 py-3 text-left transition hover:bg-[#f4f7f3]"
              >
                <div className="text-sm font-semibold text-[#1a3d34]">
                  {item.title}
                </div>
                {item.subtitle ? (
                  <div className="mt-1 text-sm text-[#6f887e]">{item.subtitle}</div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
