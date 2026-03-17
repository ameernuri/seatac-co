"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import { loadGoogleMapsApi, type GoogleAddress } from "@/lib/google-maps";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onResolved: (value: GoogleAddress | null) => void;
  placeholder: string;
  className?: string;
};

export function GoogleAddressInput({
  id,
  value,
  onChange,
  onResolved,
  placeholder,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;
    let listener: google.maps.MapsEventListener | null = null;

    async function attachAutocomplete() {
      const element = inputRef.current;

      if (!element) {
        return;
      }

      const googleMaps = await loadGoogleMapsApi();
      autocomplete = new googleMaps.maps.places.Autocomplete(element, {
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "geometry", "name"],
      });

      listener = autocomplete.addListener("place_changed", () => {
        const place = autocomplete?.getPlace();
        const location = place?.geometry?.location;

        if (!place || !location) {
          onResolved(null);
          return;
        }

        const label = place.formatted_address || place.name || element.value;
        onChange(label);
        onResolved({
          label,
          lat: location.lat(),
          lng: location.lng(),
        });
      });
    }

    attachAutocomplete().catch(() => {
      onResolved(null);
    });

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [onChange, onResolved]);

  return (
    <Input
      id={id}
      ref={inputRef}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
        onResolved(null);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
