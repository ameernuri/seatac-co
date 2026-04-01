"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Luggage,
  MapPinned,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  ClientAccountForm,
  type ClientAccountSnapshot,
} from "@/components/client-account-form";
import { GoogleAddressInput } from "@/components/google-address-input";
import { RouteMapCard, type RouteSummary } from "@/components/route-map-card";
import { AddressSwapButton } from "@/components/ui/address-swap-button";
import { BadgeSwitcher } from "@/components/ui/badge-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Route, Vehicle } from "@/db/schema";
import {
  buildBookingTimeOptions,
  resolveInitialBookingSlot,
  type BookingConstraints,
  validateBookingWindow,
} from "@/lib/booking-constraints";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { type GoogleAddress } from "@/lib/google-maps";
import { quoteReservation, type ServiceMode } from "@/lib/quote";
import { extrasCatalog, siteChrome } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";

type Props = {
  bookingConstraints: BookingConstraints;
  vehicles: Vehicle[];
  routes: Route[];
  compact?: boolean;
  landingOnly?: boolean;
  showTitle?: boolean;
  allowFlatRate?: boolean;
  initialClientAccount?: ClientAccountSnapshot | null;
  initialState?: {
    serviceMode?: ServiceMode;
    tripType?: TripType;
    routeSlug?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupDetail?: string;
  };
};

const RESERVE_DRAFT_STORAGE_KEY = "seatac-reserve-draft-v2";

type Step = 1 | 2 | 3 | 4 | 5;
type TripType = "flat" | "distance" | "hourly" | "event";
type VehicleAvailabilityStatus = {
  availableUnits: number;
  nextAvailablePickupAt: string | null;
  reason: string | null;
  reasonType: "available" | "inventory" | "schedule";
};

type CheckoutFieldErrorKey =
  | "customerEmail"
  | "customerFirstName"
  | "customerLastName"
  | "customerPhone"
  | "customerPhoneVerified"
  | "customerPolicyAgreed";

type CheckoutFieldErrors = Partial<Record<CheckoutFieldErrorKey, string>>;

type PricingType = "flat" | "distance" | "hourly";

const pricingTypeConfig: { label: string; value: PricingType }[] = [
  { label: "Flat rate", value: "flat" },
  { label: "Per mile", value: "distance" },
  { label: "Hourly", value: "hourly" },
];

const stepMeta = [
  {
    id: 1 as Step,
    label: "Route",
    cta: "Continue to schedule",
  },
  {
    id: 2 as Step,
    label: "Time",
    cta: "Continue to fit",
  },
  {
    id: 3 as Step,
    label: "Fit",
    cta: "See vehicles",
  },
  {
    id: 4 as Step,
    label: "Vehicle",
    cta: "Continue to checkout",
  },
  {
    id: 5 as Step,
    label: "Checkout",
    cta: "Continue to payment",
  },
] as const;

function pricingTypeFromTripType(tripType: TripType): PricingType {
  if (tripType === "distance") {
    return "distance";
  }

  if (tripType === "hourly" || tripType === "event") {
    return "hourly";
  }

  return "flat";
}

function getEnabledPricingOptions(
  constraints: BookingConstraints,
  options?: { allowFlatRate?: boolean },
) {
  return pricingTypeConfig.filter((option) => {
    if (option.value === "flat") {
      return Boolean(options?.allowFlatRate && constraints.enableFlatPricing);
    }
    if (option.value === "distance") return constraints.enableDistancePricing;
    return constraints.enableHourlyPricing;
  });
}

function coercePricingType(
  requested: PricingType,
  constraints: BookingConstraints,
  prefersPresetRoute: boolean,
  options?: { allowFlatRate?: boolean },
): PricingType {
  const enabledOptions = getEnabledPricingOptions(constraints, options);

  if (enabledOptions.some((option) => option.value === requested)) {
    return requested;
  }

  const preferredFallback =
    prefersPresetRoute
      ? constraints.presetRouteDefaultPricing
      : constraints.customTripDefaultPricing;

  if (enabledOptions.some((option) => option.value === preferredFallback)) {
    return preferredFallback;
  }

  return enabledOptions[0]?.value ?? "flat";
}

function routesForPricingType(routes: Route[], pricingType: PricingType) {
  if (pricingType === "hourly") {
    return routes.filter((route) => route.mode === "hourly");
  }

  return routes.filter(
    (route) => route.mode === "airport" || route.mode === "corporate",
  );
}

type RideExtra = (typeof extrasCatalog)[number];

function formatExtraQuantityLabel(extra: RideExtra, quantity: number) {
  const unitLabel = extra.quantityLabel ?? "item";
  const pluralizedUnit =
    quantity === 1 ? unitLabel : unitLabel.endsWith("s") ? unitLabel : `${unitLabel}s`;

  return `${quantity} ${pluralizedUnit}`;
}

function getVehicleDisplayName(name: string) {
  return name.replace(/^Airport\s+/i, "");
}

function getVehicleImagePosition(name: string) {
  if (/suv/i.test(name)) {
    return "center 28%";
  }

  if (/sprinter/i.test(name) || /van/i.test(name)) {
    return "center 26%";
  }

  return "center center";
}

function RideAdditionCard({
  extra,
  quantity,
  onQuantityChange,
}: {
  extra: RideExtra;
  quantity: number;
  onQuantityChange: (nextQuantity: number) => void;
}) {
  const supportsQuantity = (extra.maxQuantity ?? 1) > 1;
  const checked = quantity > 0;

  if (supportsQuantity) {
    return (
      <div
        className={cn(
          "rounded-xl border p-3 text-left transition",
          checked
            ? "border-[#2d6a4f]/30 bg-[#2d6a4f]/8"
            : "border-[#2d6a4f]/10 bg-white",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#2d6a4f]">
              {formatCurrency(extra.price)} each
            </p>
            <h3 className="mt-1 text-base font-semibold text-[#1a3d34]">{extra.label}</h3>
            <p className="mt-0.5 text-sm leading-5 text-[#5a7a6e]">{extra.detail}</p>
          </div>
          <div className="rounded-full border border-[#2d6a4f]/15 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2d6a4f]">
            {quantity > 0 ? formatExtraQuantityLabel(extra, quantity) : "Optional"}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[#5a7a6e]">
            Up to {extra.maxQuantity} {extra.quantityLabel ?? "items"} per ride.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(quantity - 1, 0))}
              className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4]"
              aria-label={`Remove ${extra.label.toLowerCase()}`}
            >
              <Minus className="size-4" />
            </button>
            <div className="min-w-10 text-center text-sm font-semibold text-[#1a3d34]">
              {quantity}
            </div>
            <button
              type="button"
              onClick={() =>
                onQuantityChange(Math.min(quantity + 1, extra.maxQuantity ?? quantity + 1))
              }
              className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4]"
              aria-label={`Add ${extra.label.toLowerCase()}`}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onQuantityChange(checked ? 0 : 1)}
      className={cn(
        "rounded-xl border p-3 text-left transition",
        checked
          ? "border-[#2d6a4f]/30 bg-[#2d6a4f]/8"
          : "border-[#2d6a4f]/10 bg-white hover:border-[#2d6a4f]/20 hover:bg-[#f8f7f4]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#2d6a4f]">
            {formatCurrency(extra.price)}
          </p>
          <h3 className="mt-1 text-base font-semibold text-[#1a3d34]">{extra.label}</h3>
          <p className="mt-0.5 text-sm leading-5 text-[#5a7a6e]">{extra.detail}</p>
        </div>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onQuantityChange(value ? 1 : 0)}
          className="pointer-events-none mt-0.5 size-5 shrink-0 border-[#2d6a4f]/20 data-checked:bg-[#2d6a4f] data-checked:text-white"
        />
      </div>
    </button>
  );
}

function isSeatacLocation(value?: string | null) {
  return Boolean(value && /sea[- ]?tac|seatac|airport/i.test(value));
}

function defaultRouteForPricingType(routes: Route[], pricingType: PricingType) {
  if (pricingType === "hourly") {
    return routes.find((route) => route.mode === "hourly") ?? null;
  }

  const matchingRoutes = routes.filter((route) => route.mode === "airport");

  const [preferredRoute] = [...matchingRoutes].sort((left, right) => {
    const leftOriginSeatac = isSeatacLocation(left.origin);
    const rightOriginSeatac = isSeatacLocation(right.origin);

    if (leftOriginSeatac !== rightOriginSeatac) {
      return leftOriginSeatac ? -1 : 1;
    }

    const leftDestinationSeatac = isSeatacLocation(left.destination);
    const rightDestinationSeatac = isSeatacLocation(right.destination);

    if (leftDestinationSeatac !== rightDestinationSeatac) {
      return leftDestinationSeatac ? 1 : -1;
    }

    return left.name.localeCompare(right.name);
  });

  return preferredRoute ?? matchingRoutes[0] ?? null;
}

function defaultPickupAddressForPricingType(
  pricingType: PricingType,
  route: Route | null,
) {
  if (pricingType === "flat" || pricingType === "distance") {
    return route?.origin ?? "Sea-Tac Airport";
  }

  if (pricingType === "hourly") {
    return "Sea-Tac Airport";
  }

  return "";
}

function parseDateValue(value: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10;
}

function splitCustomerName(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function combineCustomerName(firstName: string, lastName: string) {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

function formatAddressPreview(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "Not set";
  }

  return trimmed;
}

function coalesceText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function buildChargeSummary(
  labels: string[],
  formatter: (label: string) => string,
) {
  if (labels.length === 0) {
    return "";
  }

  if (labels.length === 1) {
    return formatter(labels[0]);
  }

  if (labels.length === 2) {
    return `${formatter(labels[0])} and ${formatter(labels[1])}`;
  }

  return `${labels.slice(0, -1).map(formatter).join(", ")}, and ${formatter(
    labels[labels.length - 1],
  )}`;
}

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";

  return `${hours}:${minutes}`;
});

function formatTimeChoice(value: string) {
  const [rawHours, rawMinutes] = value.split(":");
  const hours = Number(rawHours);
  const minutes = rawMinutes ?? "00";

  if (!Number.isFinite(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;

  return `${normalizedHours}:${minutes} ${suffix}`;
}

function BookingDateField({
  disabled,
  label,
  value,
  onChange,
  placeholder,
}: {
  disabled?: (date: Date) => boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const selectedDate = parseDateValue(value);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
        {label} <span className="text-[#8aa398]">PT</span>
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-xl border border-[#2d6a4f]/15 bg-white px-4 text-base font-medium text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4]",
            !selectedDate && "text-[#8aa398]",
          )}
        >
          <span>{selectedDate ? format(selectedDate, "MM/dd/yyyy") : placeholder}</span>
          <CalendarDays className="size-4 text-[#2d6a4f]" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-xl border-[#2d6a4f]/15 bg-white p-2 shadow-[0_20px_60px_rgba(45,106,79,0.15)]"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={disabled}
            onSelect={(date) => {
              onChange(date ? formatDateValue(date) : "");
              setOpen(false);
            }}
            className="text-[#1a3d34] [--cell-size:--spacing(9)]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function BookingTimeField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options?: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const timeChoices = options && options.length > 0 ? options : timeOptions;
  const selectedIndex = Math.max(0, timeChoices.indexOf(value));
  const currentValue = timeChoices[selectedIndex] ?? timeChoices[0] ?? value;
  const previousValue = selectedIndex > 0 ? timeChoices[selectedIndex - 1] : null;
  const nextValue =
    selectedIndex >= 0 && selectedIndex < timeChoices.length - 1
      ? timeChoices[selectedIndex + 1]
      : null;

  return (
    <div className="space-y-2">
      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">{label}</Label>
      <div className="flex h-12 items-center gap-2 rounded-xl border border-[#2d6a4f]/15 bg-white p-2">
        <button
          type="button"
          onClick={() => previousValue && onChange(previousValue)}
          disabled={!previousValue}
          className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Earlier ${label.toLowerCase()}`}
        >
          <Minus className="size-4" />
        </button>
        <Select value={currentValue} onValueChange={(next) => next && onChange(next)}>
          <SelectTrigger className="h-10 flex-1 rounded-full border-0 bg-transparent px-4 text-center shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <span className="w-full text-base font-semibold text-[#1a3d34]">
              {formatTimeChoice(currentValue)}
            </span>
          </SelectTrigger>
          <SelectContent className="booking-popup rounded-2xl border-[#2d6a4f]/15 bg-white">
            {timeChoices.map((time) => (
              <SelectItem key={time} value={time} className="text-[#1a3d34]">
                {formatTimeChoice(time)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => nextValue && onChange(nextValue)}
          disabled={!nextValue}
          className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Later ${label.toLowerCase()}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function BookingCounterField({
  label,
  value,
  options,
  singularLabel,
  pluralLabel,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  singularLabel: string;
  pluralLabel?: string;
  onChange: (value: number) => void;
}) {
  const sortedOptions = [...options].sort((left, right) => left - right);
  const currentIndex = Math.max(0, sortedOptions.indexOf(value));
  const currentValue = sortedOptions[currentIndex] ?? sortedOptions[0] ?? value;
  const previousValue = currentIndex > 0 ? sortedOptions[currentIndex - 1] : null;
  const nextValue =
    currentIndex >= 0 && currentIndex < sortedOptions.length - 1
      ? sortedOptions[currentIndex + 1]
      : null;
  const canDecrease = previousValue !== null;
  const canIncrease = nextValue !== null;
  const unitLabel =
    currentValue === 1
      ? singularLabel
      : pluralLabel ?? (singularLabel.endsWith("s") ? singularLabel : `${singularLabel}s`);

  return (
    <div className="space-y-2">
      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">{label}</Label>
      <div className="flex h-12 items-center gap-2 rounded-xl border border-[#2d6a4f]/15 bg-white p-2">
        <button
          type="button"
          onClick={() => previousValue !== null && onChange(previousValue)}
          disabled={!canDecrease}
          className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className="size-4" />
        </button>
        <Select value={String(currentValue)} onValueChange={(next) => next && onChange(Number(next))}>
          <SelectTrigger className="h-10 flex-1 rounded-full border-0 bg-transparent px-4 text-center shadow-none hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
            <div className="flex w-full flex-col items-center leading-none">
              <span className="text-base font-semibold text-[#1a3d34]">{currentValue}</span>
              <span className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#5a7a6e]">
                {unitLabel}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent className="booking-popup rounded-2xl border-[#2d6a4f]/15 bg-white">
            {sortedOptions.map((option) => {
              const optionLabel =
                option === 1
                  ? singularLabel
                  : pluralLabel ??
                    (singularLabel.endsWith("s") ? singularLabel : `${singularLabel}s`);

              return (
                <SelectItem key={option} value={String(option)} className="text-[#1a3d34]">
                  {option} {optionLabel}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <button
          type="button"
          onClick={() => nextValue !== null && onChange(nextValue)}
          disabled={!canIncrease}
          className="grid size-9 place-items-center rounded-full border border-[#2d6a4f]/15 bg-white text-[#1a3d34] transition hover:border-[#2d6a4f]/30 hover:bg-[#f8f7f4] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function getVehicleUseCase(passengerLimit: number) {
  if (passengerLimit <= 3) {
    return "Best for solo travelers, couples, and direct airport runs.";
  }

  if (passengerLimit <= 6) {
    return "Best for families, premium airport pickups, and hotel departures.";
  }

  return "Best for larger groups, cruise departures, and multi-stop transport.";
}

export function ReserveWizard({
  bookingConstraints,
  vehicles,
  routes,
  compact = false,
  landingOnly = false,
  showTitle = true,
  allowFlatRate = false,
  initialClientAccount = null,
  initialState,
}: Props) {
  const initialPickupSlot = resolveInitialBookingSlot(bookingConstraints);
  const initialRoute =
    initialState?.routeSlug
      ? routes.find((route) => route.slug === initialState.routeSlug) ?? null
      : null;
  const requestedInitialPricingType = pricingTypeFromTripType(
    (initialState?.tripType === "event" ? "hourly" : initialState?.tripType) ??
      (initialRoute
        ? bookingConstraints.presetRouteDefaultPricing
        : bookingConstraints.customTripDefaultPricing),
  );
  const initialPricingType = coercePricingType(
    requestedInitialPricingType,
    bookingConstraints,
    Boolean(initialRoute),
    { allowFlatRate },
  );
  const initialTripType: TripType =
    initialPricingType === "hourly" ? "hourly" : initialPricingType;
  const defaultFlatRoute = defaultRouteForPricingType(routes, "flat");
  const initialModeRoute =
    initialPricingType === "flat"
      ? initialRoute ?? defaultFlatRoute
      : initialPricingType === "hourly"
        ? defaultRouteForPricingType(routes, "hourly")
        : null;
  const [step, setStep] = useState<Step>(1);
  const [tripType, setTripType] = useState<TripType>(initialTripType);
  const [routeId, setRouteId] = useState<string>(initialModeRoute?.id ?? "");
  const [pickupAddress, setPickupAddress] = useState(
    coalesceText(
      initialState?.pickupAddress,
      defaultPickupAddressForPricingType(initialPricingType, initialModeRoute),
    ),
  );
  const [dropoffAddress, setDropoffAddress] = useState(
    coalesceText(
      initialState?.dropoffAddress,
      initialModeRoute?.destination,
      defaultFlatRoute?.destination,
    ),
  );
  const [pickupPlace, setPickupPlace] = useState<GoogleAddress | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<GoogleAddress | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [stepOneAttempted, setStepOneAttempted] = useState(false);
  const [flightNumber, setFlightNumber] = useState("");
  const [pickupDate, setPickupDate] = useState(initialPickupSlot.date);
  const [pickupTime, setPickupTime] = useState(initialPickupSlot.time);
  const [returnTrip, setReturnTrip] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("17:00");
  const [passengers, setPassengers] = useState("2");
  const [bags, setBags] = useState("2");
  const [hoursRequested, setHoursRequested] = useState(
    String(bookingConstraints.hourlyMinimumHours),
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const initialCustomerNameParts = splitCustomerName(initialClientAccount?.name ?? "");
  const [customerFirstName, setCustomerFirstName] = useState(
    initialCustomerNameParts.firstName,
  );
  const [customerLastName, setCustomerLastName] = useState(
    initialCustomerNameParts.lastName,
  );
  const [customerEmail, setCustomerEmail] = useState(initialClientAccount?.email ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialClientAccount?.phone ?? "");
  const [customerSmsOptIn, setCustomerSmsOptIn] = useState(
    Boolean(initialClientAccount?.smsOptIn),
  );
  const [customerPolicyAgreed, setCustomerPolicyAgreed] = useState(false);
  const [clientAccount, setClientAccount] = useState<ClientAccountSnapshot | null>(
    initialClientAccount,
  );
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutFieldErrors>({});
  const [notes, setNotes] = useState(initialState?.pickupDetail ?? "");
  const [availableVehicleCounts, setAvailableVehicleCounts] = useState<Record<string, number> | null>(
    null,
  );
  const [vehicleStatuses, setVehicleStatuses] = useState<
    Record<string, VehicleAvailabilityStatus> | null
  >(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const customerName = combineCustomerName(customerFirstName, customerLastName);
  const selectedPricingType = pricingTypeFromTripType(tripType);
  const enabledPricingOptions = useMemo(
    () => getEnabledPricingOptions(bookingConstraints, { allowFlatRate }),
    [allowFlatRate, bookingConstraints],
  );

  const filteredRoutes = useMemo(
    () => routesForPricingType(routes, selectedPricingType),
    [routes, selectedPricingType],
  );
  const pickupSuggestions = useMemo(
    () => [
      "Sea-Tac Airport",
      ...routes.map((route) => route.origin),
      ...routes.map((route) => route.destination),
    ],
    [routes],
  );
  const dropoffSuggestions = useMemo(
    () => routes.map((route) => route.destination),
    [routes],
  );

  const selectedRoute = routeId
    ? filteredRoutes.find((route) => route.id === routeId) ?? null
    : null;

  const availabilityDurationMinutes =
    routeSummary?.durationMinutes ??
    (tripType === "flat" ? selectedRoute?.durationMinutes ?? null : null);
  const compatibleVehicles = vehicles.filter(
    (vehicle) =>
      Number(passengers) <= vehicle.passengersMax && Number(bags) <= vehicle.bagsMax,
  );
  const availableVehicles = compatibleVehicles.filter((vehicle) =>
    availableVehicleCounts ? (availableVehicleCounts[vehicle.id] ?? 0) > 0 : true,
  );
  const baseVehicleFloor = useMemo(() => {
    const basePrices = vehicles
      .map((vehicle) => Number(vehicle.basePrice))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (basePrices.length === 0) {
      return null;
    }

    return Math.min(...basePrices);
  }, [vehicles]);

  const selectedVehicle =
    compatibleVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const selectedVehicleStatus = selectedVehicle
    ? vehicleStatuses?.[selectedVehicle.id] ?? null
    : null;
  const selectedVehicleIsAvailable = selectedVehicleStatus
    ? selectedVehicleStatus.reasonType === "available"
    : availableVehicles.some((vehicle) => vehicle.id === selectedVehicleId);

  const effectiveServiceMode: ServiceMode =
    selectedPricingType === "hourly"
      ? "hourly"
      : selectedRoute?.mode === "corporate"
        ? "corporate"
        : "airport";
  const tripTypeLabel =
    pricingTypeConfig.find((item) => item.value === selectedPricingType)?.label ??
    "Flat rate";
  const routeConfidenceLabel = routeSummary
    ? `${routeSummary.distanceMiles.toFixed(1)} mi • ${routeSummary.durationMinutes} min`
    : tripType === "flat"
      ? "Route ready"
      : "Add both addresses";
  const bookingRouteName =
    tripType === "flat" && selectedRoute
      ? selectedRoute.name
      : [pickupAddress, dropoffAddress].filter(Boolean).join(" to ") || "Custom route";
  const returnTripReady = returnTrip && Boolean(returnDate && returnTime);
  const recommendedVehicleId = useMemo(() => {
    if (availableVehicles.length === 0) {
      return "";
    }

    return [...availableVehicles]
      .map((vehicle) => ({
        total: quoteReservation({
          baseVehicleFloor,
          serviceMode: effectiveServiceMode,
          tripType,
          selectedRoute: tripType === "flat" ? selectedRoute : null,
          selectedVehicle: vehicle,
          passengers: Number(passengers),
          bags: Number(bags),
          hoursRequested: Number(hoursRequested),
          routeDistanceMiles: routeSummary?.distanceMiles ?? null,
          routeDurationMinutes: routeSummary?.durationMinutes ?? null,
          returnTrip: returnTripReady,
          selectedExtras,
          bookingConstraints,
        }).total,
        vehicleId: vehicle.id,
      }))
      .sort((left, right) => left.total - right.total)[0]?.vehicleId;
  }, [
    availableVehicles,
    bags,
    bookingConstraints,
    baseVehicleFloor,
    hoursRequested,
    passengers,
    returnTripReady,
    routeSummary?.distanceMiles,
    routeSummary?.durationMinutes,
    selectedExtras,
    selectedRoute,
    effectiveServiceMode,
    tripType,
  ]);
  const routePreviewLabel =
    tripType === "hourly" || tripType === "event"
      ? pickupAddress || "Hourly service area"
      : bookingRouteName;
  const checkoutPickupPreview = formatAddressPreview(pickupAddress);
  const checkoutDropoffPreview =
    tripType === "hourly" || tripType === "event"
      ? `${hoursRequested} requested hour${hoursRequested === "1" ? "" : "s"}`
      : formatAddressPreview(dropoffAddress);
  const distanceCharges = [
    bookingConstraints.chargeMileageOnDistance && bookingConstraints.perMileFee > 0
      ? "mileage"
      : null,
    bookingConstraints.chargePassengersOnDistance && bookingConstraints.perPassengerFee > 0
      ? "passengers"
      : null,
    bookingConstraints.chargeBagsOnDistance && bookingConstraints.perBagFee > 0
      ? "bags"
      : null,
  ].filter((item): item is "mileage" | "passengers" | "bags" => Boolean(item));
  const pickupAddressError = pickupAddress.trim() ? null : "Enter a pickup address.";
  const dropoffAddressRequired = tripType === "flat" || tripType === "distance";
  const dropoffAddressError =
    dropoffAddressRequired && !dropoffAddress.trim() ? "Enter a drop-off address." : null;
  const routeSelectionError =
    tripType === "flat" && !selectedRoute ? "Choose a flat-rate route." : null;
  const stepOneMissingItems = [
    pickupAddressError ? "pickup address" : null,
    dropoffAddressError ? "drop-off address" : null,
    routeSelectionError ? "flat-rate route" : null,
  ].filter((item): item is string => Boolean(item));
  const stepOneReady = stepOneMissingItems.length === 0;
  const dispatchReadiness = [
    pickupDate ? `Pickup ${pickupDate}` : "Choose pickup date",
    selectedVehicle ? selectedVehicle.name : "Choose vehicle",
    returnTrip ? "Round trip" : "One way",
  ];
  const pickupTimeOptions = useMemo(
    () =>
      buildBookingTimeOptions({
        constraints: bookingConstraints,
        dateValue: pickupDate,
      }),
    [bookingConstraints, pickupDate],
  );
  const hourlyHourOptions = useMemo(() => {
    const baseOptions = [2, 3, 4, 5, 6, 8];
    const minimum = bookingConstraints.hourlyMinimumHours;
    return Array.from(new Set([minimum, ...baseOptions.filter((value) => value >= minimum)])).sort(
      (left, right) => left - right,
    );
  }, [bookingConstraints.hourlyMinimumHours]);
  const returnTimeOptions = useMemo(
    () =>
      buildBookingTimeOptions({
        constraints: bookingConstraints,
        dateValue: returnDate,
      }),
    [bookingConstraints, returnDate],
  );
  const startOfToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const maxBookableDate = useMemo(
    () =>
      new Date(
        Date.now() + bookingConstraints.maxAdvanceDays * 24 * 60 * 60 * 1000,
      ),
    [bookingConstraints.maxAdvanceDays],
  );
  const pickupDateDisabled = useCallback(
    (date: Date) => date < startOfToday || date > maxBookableDate,
    [maxBookableDate, startOfToday],
  );
  const returnDateDisabled = useCallback(
    (date: Date) => {
      const minimumDate = pickupDate
        ? new Date(`${pickupDate}T00:00:00`)
        : startOfToday;

      return date < minimumDate || date > maxBookableDate;
    },
    [maxBookableDate, pickupDate, startOfToday],
  );
  const scheduleValidationMessage = useMemo(() => {
    if (!pickupDate || !pickupTime) {
      return null;
    }

    return validateBookingWindow({
      constraints: bookingConstraints,
      pickupAt: new Date(`${pickupDate}T${pickupTime}:00`),
      returnAt:
        returnTrip && returnDate && returnTime
          ? new Date(`${returnDate}T${returnTime}:00`)
          : null,
    });
  }, [
    bookingConstraints,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    returnTrip,
  ]);

  useEffect(() => {
    if (availableVehicles.length === 0) {
      if (!selectedVehicleId) {
        setSelectedVehicleId("");
      }
      return;
    }

    if (selectedVehicleId && compatibleVehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      return;
    }

    setSelectedVehicleId(recommendedVehicleId ?? "");
  }, [availableVehicles, compatibleVehicles, recommendedVehicleId, selectedVehicleId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const resumeDraft = new URLSearchParams(window.location.search).get("resume") === "1";
      const raw = window.sessionStorage.getItem(RESERVE_DRAFT_STORAGE_KEY);

      if (!resumeDraft) {
        if (raw) {
          window.sessionStorage.removeItem(RESERVE_DRAFT_STORAGE_KEY);
        }
        setDraftLoaded(true);
        return;
      }

      if (!raw) {
        setDraftLoaded(true);
        return;
      }

      const draft = JSON.parse(raw) as Partial<{
        bags: string;
        customerEmail: string;
        customerFirstName: string;
        customerLastName: string;
        customerName: string;
        customerPolicyAgreed: boolean;
        customerPhone: string;
        customerSmsOptIn: boolean;
        dropoffAddress: string;
        flightNumber: string;
        hoursRequested: string;
        notes: string;
        passengers: string;
        pickupAddress: string;
        pickupDate: string;
        pickupTime: string;
        returnDate: string;
        returnTime: string;
        returnTrip: boolean;
        routeId: string;
        selectedExtras: string[];
        selectedVehicleId: string;
        step: Step;
        tripType: TripType;
      }>;

      if (draft.tripType) {
        const restoredPricingType = coercePricingType(
          pricingTypeFromTripType(draft.tripType === "event" ? "hourly" : draft.tripType),
          bookingConstraints,
          typeof draft.routeId === "string" && Boolean(draft.routeId),
          { allowFlatRate },
        );
        setTripType(restoredPricingType === "hourly" ? "hourly" : restoredPricingType);
      }
      if (typeof draft.step === "number") {
        setStep(Math.min(Math.max(draft.step, 1), 5) as Step);
      }
      if (typeof draft.routeId === "string") setRouteId(draft.routeId);
      if (typeof draft.pickupAddress === "string" && draft.pickupAddress.trim()) {
        setPickupAddress(draft.pickupAddress);
      }
      if (typeof draft.dropoffAddress === "string" && draft.dropoffAddress.trim()) {
        setDropoffAddress(draft.dropoffAddress);
      }
      if (typeof draft.flightNumber === "string") setFlightNumber(draft.flightNumber);
      if (typeof draft.pickupDate === "string") setPickupDate(draft.pickupDate);
      if (typeof draft.pickupTime === "string") setPickupTime(draft.pickupTime);
      if (typeof draft.returnTrip === "boolean") setReturnTrip(draft.returnTrip);
      if (typeof draft.returnDate === "string") setReturnDate(draft.returnDate);
      if (typeof draft.returnTime === "string") setReturnTime(draft.returnTime);
      if (typeof draft.passengers === "string") setPassengers(draft.passengers);
      if (typeof draft.bags === "string") setBags(draft.bags);
      if (typeof draft.hoursRequested === "string") {
        setHoursRequested(
          String(
            Math.max(
              Number(draft.hoursRequested) || bookingConstraints.hourlyMinimumHours,
              bookingConstraints.hourlyMinimumHours,
            ),
          ),
        );
      }
      if (typeof draft.selectedVehicleId === "string") {
        setSelectedVehicleId(draft.selectedVehicleId);
      }
      if (Array.isArray(draft.selectedExtras)) setSelectedExtras(draft.selectedExtras);
      if (typeof draft.customerFirstName === "string") {
        setCustomerFirstName(draft.customerFirstName);
      }
      if (typeof draft.customerLastName === "string") {
        setCustomerLastName(draft.customerLastName);
      } else if (typeof draft.customerName === "string") {
        const parsedName = splitCustomerName(draft.customerName);
        setCustomerFirstName(parsedName.firstName);
        setCustomerLastName(parsedName.lastName);
      }
      if (typeof draft.customerEmail === "string") setCustomerEmail(draft.customerEmail);
      if (typeof draft.customerPhone === "string") setCustomerPhone(draft.customerPhone);
      if (typeof draft.customerSmsOptIn === "boolean") {
        setCustomerSmsOptIn(draft.customerSmsOptIn);
      }
      if (typeof draft.customerPolicyAgreed === "boolean") {
        setCustomerPolicyAgreed(draft.customerPolicyAgreed);
      }
      if (typeof draft.notes === "string") setNotes(draft.notes);
    } finally {
      setDraftLoaded(true);
    }
  }, [allowFlatRate, bookingConstraints]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftLoaded) {
      return;
    }

    persistReserveDraft(step);
  }, [
    bags,
    customerEmail,
    customerFirstName,
    customerLastName,
    customerName,
    customerPolicyAgreed,
    customerPhone,
    customerSmsOptIn,
    draftLoaded,
    dropoffAddress,
    flightNumber,
    hoursRequested,
    notes,
    passengers,
    pickupAddress,
    pickupDate,
    pickupTime,
    returnDate,
    returnTime,
    returnTrip,
    routeId,
    selectedExtras,
    selectedVehicleId,
    step,
    tripType,
  ]);

  useEffect(() => {
    if (!draftLoaded || !clientAccount) {
      return;
    }

    setCustomerFirstName((current) => current || splitCustomerName(clientAccount.name || "").firstName);
    setCustomerLastName((current) => current || splitCustomerName(clientAccount.name || "").lastName);
    setCustomerEmail((current) => current || clientAccount.email || "");
    setCustomerPhone((current) => current || clientAccount.phone || "");
    setCustomerSmsOptIn((current) => current || Boolean(clientAccount.smsOptIn));
  }, [clientAccount, draftLoaded]);

  useEffect(() => {
    if (!clientAccount) {
      return;
    }

    if (!customerPhone.trim()) {
      setClientAccount(null);
      return;
    }

    if ((clientAccount.phone ?? "").trim() !== customerPhone.trim()) {
      setClientAccount(null);
    }
  }, [clientAccount, customerPhone]);

  function persistReserveDraft(nextStep: Step) {
    if (typeof window === "undefined") {
      return;
    }

    const draft = {
      bags,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerName,
      customerPolicyAgreed,
      customerPhone,
      customerSmsOptIn,
      dropoffAddress,
      flightNumber,
      hoursRequested,
      notes,
      passengers,
      pickupAddress,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      returnTrip,
      routeId,
      selectedExtras,
      selectedVehicleId,
      step: nextStep,
      tripType,
    };

    window.sessionStorage.setItem(RESERVE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }

  useEffect(() => {
    if (pickupTimeOptions.length === 0) {
      return;
    }

    if (!pickupTimeOptions.includes(pickupTime)) {
      setPickupTime(pickupTimeOptions[0]);
    }
  }, [pickupTime, pickupTimeOptions]);

  useEffect(() => {
    if (!returnTrip || returnTimeOptions.length === 0) {
      return;
    }

    if (!returnTimeOptions.includes(returnTime)) {
      setReturnTime(returnTimeOptions[0]);
    }
  }, [returnTime, returnTimeOptions, returnTrip]);

  useEffect(() => {
    const canCheckAvailability =
      Boolean(pickupDate && pickupTime) &&
      (!returnTrip || Boolean(returnDate && returnTime));

    if (!canCheckAvailability) {
      setAvailableVehicleCounts(null);
      setVehicleStatuses(null);
      setAvailabilityError(null);
      setAvailabilityLoading(false);
      return;
    }

    if (scheduleValidationMessage) {
      setAvailableVehicleCounts(null);
      setVehicleStatuses(null);
      setAvailabilityError(null);
      setAvailabilityLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setAvailabilityLoading(true);

      try {
        const pickupAt = new Date(`${pickupDate}T${pickupTime}:00`).toISOString();
        const returnAt =
          returnTrip && returnDate
            ? new Date(`${returnDate}T${returnTime}:00`).toISOString()
            : null;
        const response = await fetch("/api/vehicle-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            pickupAddress,
            dropoffAddress: dropoffAddress || null,
            pickupAt,
            returnAt,
            returnTrip,
            tripType,
            routeDurationMinutes: availabilityDurationMinutes,
            hoursRequested:
              tripType === "hourly" || tripType === "event"
                ? Number(hoursRequested)
                : null,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          setAvailableVehicleCounts(null);
          setVehicleStatuses(null);
          setAvailabilityError(data.error ?? "Selected schedule is unavailable.");
          return;
        }

        setAvailabilityError(null);
        setAvailableVehicleCounts(data.availableCounts ?? null);
        setVehicleStatuses(data.vehicleStatuses ?? null);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setAvailableVehicleCounts(null);
        setVehicleStatuses(null);
        setAvailabilityError("Live availability could not be checked.");
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      controller.abort();
    };
  }, [
    availabilityDurationMinutes,
    hoursRequested,
    dropoffAddress,
    pickupDate,
    pickupAddress,
    pickupTime,
    returnDate,
    returnTime,
    returnTrip,
    scheduleValidationMessage,
    tripType,
  ]);

  useEffect(() => {
    const coercedPricingType = coercePricingType(
      selectedPricingType,
      bookingConstraints,
      selectedPricingType === "flat",
      { allowFlatRate },
    );

    if (coercedPricingType !== selectedPricingType) {
      setTripType(coercedPricingType === "hourly" ? "hourly" : coercedPricingType);
      return;
    }

    if (selectedPricingType === "flat" && routeId && !selectedRoute) {
      const fallbackRoute = defaultRouteForPricingType(routes, "flat");

      if (fallbackRoute) {
        setRouteId(fallbackRoute.id);
      }
    }

    if (selectedPricingType !== "flat" && routeId) {
      setRouteId("");
    }
  }, [allowFlatRate, bookingConstraints, routeId, routes, selectedPricingType, selectedRoute]);

  const pricing = selectedVehicle
    ? quoteReservation({
        baseVehicleFloor,
        serviceMode: effectiveServiceMode,
        tripType,
        selectedRoute: tripType === "flat" ? selectedRoute : null,
        selectedVehicle,
        passengers: Number(passengers),
        bags: Number(bags),
        hoursRequested: Number(hoursRequested),
        routeDistanceMiles: routeSummary?.distanceMiles ?? null,
        routeDurationMinutes: routeSummary?.durationMinutes ?? null,
        returnTrip: returnTripReady,
        selectedExtras,
        bookingConstraints,
      })
    : null;
  const extraSelections = useMemo(
    () =>
      extrasCatalog
        .map((extra) => {
          const quantity = selectedExtras.filter((entry) => entry === extra.key).length;

          if (quantity === 0) {
            return null;
          }

          return {
            extra,
            quantity,
            total: extra.price * quantity,
          };
        })
        .filter((entry): entry is { extra: RideExtra; quantity: number; total: number } =>
          Boolean(entry),
        ),
    [selectedExtras],
  );
  const checkoutReady =
    customerName.trim().length > 0 &&
    isValidEmail(customerEmail) &&
    isValidPhone(customerPhone) &&
    Boolean(clientAccount) &&
    customerPolicyAgreed &&
    true;

  const activeStep = stepMeta.find((item) => item.id === step) ?? stepMeta[0];
  const extrasSelected = selectedExtras.length;
  const fitReadout =
    compatibleVehicles.length > 0
      ? `${compatibleVehicles.length} vehicle class${
          compatibleVehicles.length === 1 ? "" : "es"
        } can handle ${passengers} passenger${
          passengers === "1" ? "" : "s"
        } and ${bags} bag${bags === "1" ? "" : "s"}.`
      : `No current vehicle fits ${passengers} passenger${
          passengers === "1" ? "" : "s"
        } and ${bags} bag${bags === "1" ? "" : "s"}.`;
  const fitVehiclePreview = compatibleVehicles.slice(0, 3).map((vehicle) => ({
    id: vehicle.id,
    label: vehicle.name,
    detail: `${vehicle.passengersMax} passengers • ${vehicle.bagsMax} bags`,
  }));
  const vehicleOptionSummaries = compatibleVehicles.map((vehicle) => {
    const status = vehicleStatuses?.[vehicle.id] ?? null;
    const availableUnits = status?.availableUnits ?? availableVehicleCounts?.[vehicle.id] ?? null;
    const isAvailable = status ? status.reasonType === "available" : false;
    const quotePreview = quoteReservation({
      baseVehicleFloor,
      serviceMode: effectiveServiceMode,
      tripType,
      selectedRoute: tripType === "flat" ? selectedRoute : null,
      selectedVehicle: vehicle,
      passengers: Number(passengers),
      bags: Number(bags),
      hoursRequested: Number(hoursRequested),
      routeDistanceMiles: routeSummary?.distanceMiles ?? null,
      routeDurationMinutes: routeSummary?.durationMinutes ?? null,
      returnTrip: returnTripReady,
      selectedExtras,
      bookingConstraints,
    });
    const reasonLabel = status
      ? status.reasonType === "schedule"
        ? "Unavailable for this time"
        : status.reasonType === "inventory"
          ? "Fleet already committed"
          : "Available now"
      : availabilityLoading
        ? "Checking live availability"
        : availabilityError
          ? "Availability unavailable"
          : "Waiting for availability";

    return {
      availableUnits,
      isAvailable,
      nextAvailableLabel: status?.nextAvailablePickupAt
        ? formatDateTime(status.nextAvailablePickupAt)
        : null,
      quotePreview,
      reasonLabel,
      status,
      vehicle,
    };
  });
  const nextStepDisabled =
    step === 4 &&
    (!selectedVehicle ||
      !selectedVehicleIsAvailable ||
      availabilityLoading ||
      Boolean(availabilityError) ||
      !vehicleStatuses);
  const summaryRows = [
    {
      label: "Route",
      value: routePreviewLabel,
      detail:
        tripType === "flat"
          ? routeConfidenceLabel
          : tripType === "distance"
            ? "Custom route"
            : `${hoursRequested} requested hour${hoursRequested === "1" ? "" : "s"}`,
      onEdit: () => jumpToStep(1),
    },
    {
      label: "Time",
      value: pickupDate ? `${pickupDate} at ${pickupTime}` : "Choose a pickup time",
      detail:
        returnTrip && returnDate ? `Return ${returnDate} at ${returnTime}` : null,
      onEdit: () => jumpToStep(2),
    },
    {
      label: "Party",
      value: `${passengers} passenger${passengers === "1" ? "" : "s"} • ${bags} bag${bags === "1" ? "" : "s"}`,
      detail: null,
      onEdit: () => jumpToStep(3),
    },
    {
      label: "Vehicle",
      value: selectedVehicle?.name ?? "Choose a vehicle",
      detail: flightNumber ? `Flight ${flightNumber}` : null,
      onEdit: () => jumpToStep(4),
    },
  ];

  function applyRoute(route: Route | null) {
    if (!route) {
      return;
    }

    setRouteId(route.id);

    if (tripType === "flat") {
      setPickupAddress(route.origin);
      setDropoffAddress(route.destination);
      setPickupPlace(null);
      setDropoffPlace(null);
    }
  }

  function handlePricingTypeChange(nextPricingType: PricingType) {
    const safePricingType = coercePricingType(
      nextPricingType,
      bookingConstraints,
      nextPricingType === "flat",
      { allowFlatRate },
    );
    const nextTripType = safePricingType === "hourly" ? "hourly" : safePricingType;
    setTripType(nextTripType);
    setStepOneAttempted(false);

    if (safePricingType === "flat") {
      const nextRoute =
        (routeId
          ? routes.find(
              (route) =>
                route.id === routeId &&
                (route.mode === "airport" || route.mode === "corporate"),
            ) ?? null
          : null) ??
        defaultRouteForPricingType(routes, "flat") ??
        null;

      setRouteId(nextRoute?.id ?? "");
      if (nextRoute) {
        setPickupAddress(nextRoute.origin);
        setDropoffAddress(nextRoute.destination);
      }
      setPickupPlace(null);
      setDropoffPlace(null);
      return;
    }

    if (safePricingType === "hourly") {
      setPickupAddress((current) => current || "Sea-Tac Airport");
      setDropoffAddress("");
      setPickupPlace(null);
      setDropoffPlace(null);
      setHoursRequested(String(Math.max(Number(hoursRequested) || 0, bookingConstraints.hourlyMinimumHours)));
    } else if (safePricingType === "distance") {
      setPickupAddress((current) => current || "Sea-Tac Airport");
      setDropoffAddress((current) => current || defaultFlatRoute?.destination || "");
      setPickupPlace(null);
      setDropoffPlace(null);
    }

    setRouteId("");
  }

  function handleReturnTripChange(nextChecked: boolean) {
    setReturnTrip(nextChecked);

    if (nextChecked) {
      if (!returnDate && pickupDate) {
        const pickup = parseDateValue(pickupDate);
        setReturnDate(pickup ? formatDateValue(addDays(pickup, 1)) : pickupDate);
      }
      if (!returnTime && pickupTime) {
        setReturnTime(pickupTime);
      }
      return;
    }

    setReturnDate("");
  }

  function handlePassengersChange(nextValue: string) {
    setPassengers(nextValue);
    setSelectedVehicleId("");
  }

  function handleBagsChange(nextValue: string) {
    setBags(nextValue);
    setSelectedVehicleId("");
  }

  function handlePickupAddressChange(nextValue: string) {
    setPickupAddress(nextValue);
    setRouteSummary(null);
    setStepOneAttempted(false);

    if (
      tripType === "flat" &&
      selectedRoute &&
      nextValue.trim() !== selectedRoute.origin.trim()
    ) {
      const fallbackPricingType = coercePricingType(
        bookingConstraints.customTripDefaultPricing,
        bookingConstraints,
        false,
        { allowFlatRate },
      );
      setTripType(fallbackPricingType === "hourly" ? "hourly" : fallbackPricingType);
      setRouteId("");
    }
  }

  function handleDropoffAddressChange(nextValue: string) {
    setDropoffAddress(nextValue);
    setRouteSummary(null);
    setStepOneAttempted(false);

    if (
      tripType === "flat" &&
      selectedRoute &&
      nextValue.trim() !== selectedRoute.destination.trim()
    ) {
      const fallbackPricingType = coercePricingType(
        bookingConstraints.customTripDefaultPricing,
        bookingConstraints,
        false,
        { allowFlatRate },
      );
      setTripType(fallbackPricingType === "hourly" ? "hourly" : fallbackPricingType);
      setRouteId("");
    }
  }

  function handleSwapAddresses() {
    if (tripType !== "flat" && tripType !== "distance") {
      return;
    }

    setPickupAddress(dropoffAddress);
    setDropoffAddress(pickupAddress);
    setPickupPlace(dropoffPlace);
    setDropoffPlace(pickupPlace);
    setRouteSummary(null);
    setStepOneAttempted(false);
  }

  function getExtraQuantity(key: string) {
    return selectedExtras.filter((entry) => entry === key).length;
  }

  function setExtraQuantity(key: string, quantity: number) {
    setSelectedExtras((current) => {
      const remaining = current.filter((entry) => entry !== key);

      return [...remaining, ...Array.from({ length: Math.max(quantity, 0) }, () => key)];
    });
  }

  function buildCheckoutErrors() {
    const nextErrors: CheckoutFieldErrors = {};

    if (!customerFirstName.trim()) {
      nextErrors.customerFirstName = "Enter the rider's first name.";
    }

    if (!customerLastName.trim()) {
      nextErrors.customerLastName = "Enter the rider's last name.";
    }

    if (!customerEmail.trim()) {
      nextErrors.customerEmail = "Enter an email for the receipt and updates.";
    } else if (!isValidEmail(customerEmail)) {
      nextErrors.customerEmail = "Enter a valid email address.";
    }

    if (!customerPhone.trim()) {
      nextErrors.customerPhone = "Enter a mobile number for dispatch updates.";
    } else if (!isValidPhone(customerPhone)) {
      nextErrors.customerPhone = "Enter a valid mobile number.";
    } else if (!clientAccount) {
      nextErrors.customerPhoneVerified = "Verify your mobile number before payment.";
    }

    if (!customerPolicyAgreed) {
      nextErrors.customerPolicyAgreed = "Agree to the policy before payment.";
    }

    return nextErrors;
  }

  function validateCheckoutFields(options?: { showToast?: boolean }) {
    const nextErrors = buildCheckoutErrors();
    setCheckoutErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      return true;
    }

    if (options?.showToast !== false) {
      toast.error("Complete the required checkout details.");
    }

    return false;
  }

  function clearCheckoutError(key: CheckoutFieldErrorKey) {
    setCheckoutErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function handleClientAccountSuccess(account: ClientAccountSnapshot) {
    const parsedName = splitCustomerName(account.name || "");
    setClientAccount(account);
    setCustomerFirstName(parsedName.firstName || customerFirstName);
    setCustomerLastName(parsedName.lastName || customerLastName);
    setCustomerEmail(account.email || customerEmail);
    setCustomerPhone(account.phone || customerPhone);
    setCustomerSmsOptIn(Boolean(account.smsOptIn));
    clearCheckoutError("customerPhoneVerified");
    toast.success("Account ready.");
  }

  function jumpToStep(targetStep: Step) {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }

    if (validateStep(step)) {
      setStep(targetStep);
    }
  }

  function validateStep(current: Step) {
    if (current === 1) {
      setStepOneAttempted(true);

      if (pickupAddressError) {
        toast.error(pickupAddressError);
        return false;
      }

      if (routeSelectionError) {
        toast.error(routeSelectionError);
        return false;
      }

      if (dropoffAddressError) {
        toast.error(dropoffAddressError);
        return false;
      }
    }

    if (current === 2) {
      if (!pickupDate) {
        toast.error("Choose a pickup date.");
        return false;
      }

      if (scheduleValidationMessage) {
        toast.error(scheduleValidationMessage);
        return false;
      }

      if (returnTrip && !returnDate) {
        toast.error("Choose a return date.");
        return false;
      }

      if ((tripType === "hourly" || tripType === "event") && !hoursRequested) {
        toast.error("Choose the number of hours requested.");
        return false;
      }
    }

    if (current === 3 && compatibleVehicles.length === 0) {
      toast.error("No vehicle fits this party size.");
      return false;
    }

    if (current === 4 && !selectedVehicle) {
      if (availabilityLoading) {
        toast.error("Live availability is still loading.");
        return false;
      }

      if (availabilityError) {
        toast.error("Live availability must be confirmed before checkout.");
        return false;
      }

      if (!vehicleStatuses) {
        toast.error("Live availability is not ready yet.");
        return false;
      }

      toast.error("Choose a vehicle.");
      return false;
    }

    if (current === 5) {
      if (!clientAccount) {
        toast.error("Verify your phone to attach the booking to your account.");
        return false;
      }

      if (!validateCheckoutFields()) {
        return false;
      }
    }

    return true;
  }

  const handleRouteResolved = useCallback((summary: RouteSummary | null) => {
    setRouteSummary(summary);
  }, []);

  async function submitBooking() {
    if (!selectedVehicle || !pricing) {
      toast.error("Missing reservation details.");
      return;
    }

    if (!validateStep(5) || !validateCheckoutFields()) {
      return;
    }

    setSubmitting(true);

    try {
      const pickupAt = new Date(`${pickupDate}T${pickupTime}:00`).toISOString();
      const returnAt =
        returnTrip && returnDate
          ? new Date(`${returnDate}T${returnTime}:00`).toISOString()
          : null;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceMode: effectiveServiceMode,
          tripType,
          routeId: tripType === "flat" ? selectedRoute?.id ?? null : null,
          routeName: bookingRouteName,
          routeDistanceMiles: routeSummary?.distanceMiles ?? null,
          routeDurationMinutes: routeSummary?.durationMinutes ?? null,
          pickupLabel: pickupAddress,
          pickupAddress: pickupAddress,
          dropoffLabel: dropoffAddress || null,
          dropoffAddress: dropoffAddress || null,
          pickupAt,
          returnAt,
          returnTrip,
          passengers: Number(passengers),
          bags: Number(bags),
          hoursRequested:
            tripType === "hourly" || tripType === "event" ? Number(hoursRequested) : null,
          vehicleId: selectedVehicle.id,
          selectedExtras,
          customerName,
          customerEmail,
          customerPhone,
          customerUserId: clientAccount?.userId ?? null,
          customerSmsOptIn,
          specialInstructions:
            [
              flightNumber.trim() ? `Flight: ${flightNumber.trim()}` : null,
              notes,
            ]
              .filter(Boolean)
              .join(" | ") || null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(data.error ?? "Payment session could not be created.");
        return;
      }

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      toast.error("Stripe checkout URL was not returned.");
    } finally {
      setSubmitting(false);
    }
  }

  if (compact) {
    return (
      <div data-booking-theme="seatac" className="theme-seatac grid gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {step === 1 && (
              <div className="space-y-5">
                <div className="p-1">
                  <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <BadgeSwitcher
                        value={selectedPricingType}
                        onValueChange={(value) => handlePricingTypeChange(value as PricingType)}
                        options={enabledPricingOptions}
                        aria-label="Pricing type"
                        className="w-full rounded-full border border-[#2d6a4f]/12 bg-[#f7f8f5] p-1"
                        itemClassName="flex-1 rounded-full"
                      />
                    </div>
                    {selectedPricingType === "flat" ? (
                      <div className="space-y-2">
                        <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">Route</Label>
                        <Select
                          value={selectedRoute?.id ?? ""}
                          onValueChange={(value) => {
                            if (!value) return;
                            applyRoute(filteredRoutes.find((route) => route.id === value) ?? null);
                          }}
                        >
                          <SelectTrigger className="booking-control h-12 rounded-xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]">
                            <SelectValue placeholder="Choose a route">
                              {selectedRoute?.name ?? ""}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="booking-popup rounded-2xl border-[#2d6a4f]/15 bg-white">
                            {filteredRoutes.map((route) => (
                              <SelectItem key={route.id} value={route.id} className="text-[#1a3d34]">
                                {route.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">Pick Up Address</Label>
                      <GoogleAddressInput
                        id="compact-pickup-address"
                        value={pickupAddress}
                        onChange={handlePickupAddressChange}
                        onResolved={setPickupPlace}
                        placeholder="Enter pick up address"
                        suggestions={pickupSuggestions}
                        className="booking-control h-12 rounded-xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]"
                      />
                      {stepOneAttempted && pickupAddressError ? (
                        <p className="text-sm font-medium text-rose-500">{pickupAddressError}</p>
                      ) : null}
                    </div>

                    {(tripType === "flat" || tripType === "distance") && (
                      <>
                        <AddressSwapButton compact onClick={handleSwapAddresses} />
                        <div className="space-y-2">
                          <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">Drop Off Address</Label>
                          <GoogleAddressInput
                            id="compact-dropoff-address"
                            value={dropoffAddress}
                            onChange={handleDropoffAddressChange}
                            onResolved={setDropoffPlace}
                            placeholder="Enter drop off address"
                            suggestions={dropoffSuggestions}
                            className="booking-control h-12 rounded-xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]"
                          />
                          {stepOneAttempted && dropoffAddressError ? (
                            <p className="text-sm font-medium text-rose-500">
                              {dropoffAddressError}
                            </p>
                          ) : null}
                        </div>
                      </>
                    )}

                      {!stepOneReady ? (
                        <p className="text-sm text-[#8a6736]">
                          {`Still needed: ${stepOneMissingItems.join(", ")}.`}
                        </p>
                      ) : null}

                      {stepOneAttempted && routeSelectionError ? (
                        <p className="text-sm font-medium text-rose-500">{routeSelectionError}</p>
                      ) : null}
                    </div>
                  </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="p-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <BookingDateField
                      label="Pick up date"
                      value={pickupDate}
                      onChange={setPickupDate}
                      placeholder="Select Date"
                      disabled={pickupDateDisabled}
                    />
                    <BookingTimeField
                      label="Pick up time"
                      options={pickupTimeOptions}
                      value={pickupTime}
                      onChange={setPickupTime}
                    />
                  </div>

                  {(tripType === "hourly" || tripType === "event") && (
                    <div className="mt-4">
                      <BookingCounterField
                        label="Hours requested"
                        value={Number(hoursRequested)}
                        options={hourlyHourOptions}
                        singularLabel="hour"
                        onChange={(value) => setHoursRequested(String(value))}
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                      Flight number optional
                    </Label>
                    <Input
                      value={flightNumber}
                      onChange={(event) => setFlightNumber(event.target.value)}
                      className="h-12 rounded-xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] placeholder:text-[#8aa398]"
                      placeholder="Example: AS342 or DL1287"
                    />
                  </div>
                  {scheduleValidationMessage ? (
                    <p className="mt-4 text-sm font-medium text-rose-500">
                      {scheduleValidationMessage}
                    </p>
                  ) : null}

                  <div className="mt-5 border-t border-[#2d6a4f]/10 pt-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="return-trip"
                        checked={returnTrip}
                        onCheckedChange={(checked) => handleReturnTripChange(Boolean(checked))}
                        className="size-5 border-[#2d6a4f]/20 data-checked:bg-[#2d6a4f] data-checked:text-white"
                      />
                      <Label htmlFor="return-trip" className="cursor-pointer text-sm text-[#1a3d34]">
                        Add return ride
                      </Label>
                    </div>
                  </div>

                  {returnTrip && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <BookingDateField
                        label="Return date"
                        value={returnDate}
                        onChange={setReturnDate}
                        placeholder="Select Date"
                        disabled={returnDateDisabled}
                      />
                      <BookingTimeField
                        label="Return time"
                        options={returnTimeOptions}
                        value={returnTime}
                        onChange={setReturnTime}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                <div className="p-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <BookingCounterField
                      label="Passengers"
                      value={Number(passengers)}
                      options={Array.from({ length: 12 }, (_, index) => index + 1)}
                      singularLabel="passenger"
                      onChange={(value) => handlePassengersChange(String(value))}
                    />

                    <BookingCounterField
                      label="Checked bags"
                      value={Number(bags)}
                      options={Array.from({ length: 13 }, (_, index) => index)}
                      singularLabel="checked bag"
                      onChange={(value) => handleBagsChange(String(value))}
                    />
                  </div>

                  <div className="mt-5 px-1 py-1">
                    <p className="text-sm text-[#1a3d34]">{fitReadout}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5a7a6e]">
                      Luggage means full-size checked bags. Carry-ons and personal items are usually easier to fit than this count suggests.
                    </p>
                  </div>
                  {fitVehiclePreview.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {fitVehiclePreview.map((vehicle) => (
                        <div key={vehicle.id} className="border-l-2 border-[#2d6a4f]/15 pl-4 py-1">
                          <p className="text-sm font-medium text-[#1a3d34]">{vehicle.label}</p>
                          <p className="mt-1 text-sm text-[#5a7a6e]">{vehicle.detail}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4">
                {vehicleOptionSummaries.map(
                  ({
                    availableUnits,
                    isAvailable,
                    nextAvailableLabel,
                    quotePreview,
                    reasonLabel,
                    status,
                    vehicle,
                  }) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setSelectedVehicleId(vehicle.id)}
                      className={cn(
                        "relative rounded-2xl border p-5 text-left transition",
                        isAvailable
                          ? selectedVehicle?.id === vehicle.id
                            ? "border-[#2d6a4f]/30 bg-[#2d6a4f]/8"
                            : "border-[#2d6a4f]/10 bg-white hover:border-[#2d6a4f]/20 hover:bg-[#f8f7f4]"
                          : "border-[#2d6a4f]/5 bg-[#f8f7f4]/50 opacity-70",
                      )}
                    >
                    {selectedVehicle?.id === vehicle.id && isAvailable && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#2d6a4f]/16 bg-white/96 px-3 py-1 text-xs uppercase tracking-[0.15em] text-[#2d6a4f] shadow-[0_1px_2px_rgba(13,92,72,0.06)]">
                        <span className="grid size-4 place-items-center rounded-full bg-[#2d6a4f] text-white">
                          <Check className="size-3" />
                        </span>
                        Selected
                      </span>
                    )}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-sans text-[0.65rem] uppercase tracking-[0.2em]",
                            isAvailable ? "text-[#2d6a4f]" : "text-[#8aa398]",
                          )}
                        >
                          {vehicle.passengersMax} pax · {vehicle.bagsMax} bags
                        </p>
                        <h3
                          className={cn(
                            "mt-2 text-xl font-semibold",
                            isAvailable ? "text-[#1a3d34]" : "text-[#8aa398]",
                          )}
                        >
                          {getVehicleDisplayName(vehicle.name)}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#5a7a6e]">
                          {vehicle.summary}
                        </p>
                        <div className="mt-3 space-y-1 text-sm">
                          <p
                            className={cn(
                              "font-medium",
                              isAvailable ? "text-[#1a3d34]" : "text-[#8aa398]",
                            )}
                          >
                            {reasonLabel}
                            {typeof availableUnits === "number" && isAvailable
                              ? ` · ${availableUnits} unit${availableUnits === 1 ? "" : "s"} open`
                              : ""}
                          </p>
                          {!isAvailable && status?.reason ? (
                            <p className="text-[#8aa398]">{status.reason}</p>
                          ) : null}
                          {!isAvailable && nextAvailableLabel ? (
                            <p className="text-[#2d6a4f]/80">
                              Next opening: {nextAvailableLabel}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-sans text-2xl font-semibold text-[#1a3d34]">
                          {formatCurrency(quotePreview.baseFare)}
                        </p>
                        {!isAvailable && (
                          <span className="mt-2 inline-flex rounded-full border border-[#2d6a4f]/10 bg-[#f8f7f4] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[#8aa398]">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                    </button>
                  ),
                )}
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                        First name required
                      </Label>
                      <Input
                        id="checkout-first-name-compact"
                        name="given-name"
                        autoComplete="given-name"
                        value={customerFirstName}
                        onChange={(event) => {
                          setCustomerFirstName(event.target.value);
                          clearCheckoutError("customerFirstName");
                        }}
                        onBlur={() => validateCheckoutFields({ showToast: false })}
                        className={cn(
                          "h-12 rounded-xl bg-white px-4 text-base text-[#1a3d34] placeholder:text-[#8aa398]",
                          checkoutErrors.customerFirstName
                            ? "border-rose-300 focus-visible:ring-rose-200"
                            : "border-[#2d6a4f]/15",
                        )}
                        placeholder="First name"
                      />
                      {checkoutErrors.customerFirstName ? (
                        <p className="text-sm text-rose-600">
                          {checkoutErrors.customerFirstName}
                        </p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                        Last name required
                      </Label>
                      <Input
                        id="checkout-last-name-compact"
                        name="family-name"
                        autoComplete="family-name"
                        value={customerLastName}
                        onChange={(event) => {
                          setCustomerLastName(event.target.value);
                          clearCheckoutError("customerLastName");
                        }}
                        onBlur={() => validateCheckoutFields({ showToast: false })}
                        className={cn(
                          "h-12 rounded-xl bg-white px-4 text-base text-[#1a3d34] placeholder:text-[#8aa398]",
                          checkoutErrors.customerLastName
                            ? "border-rose-300 focus-visible:ring-rose-200"
                            : "border-[#2d6a4f]/15",
                        )}
                        placeholder="Last name"
                      />
                      {checkoutErrors.customerLastName ? (
                        <p className="text-sm text-rose-600">
                          {checkoutErrors.customerLastName}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                      Email required
                    </Label>
                    <Input
                      id="checkout-email-compact"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(event) => {
                        setCustomerEmail(event.target.value);
                        clearCheckoutError("customerEmail");
                      }}
                      onBlur={() => validateCheckoutFields({ showToast: false })}
                      className={cn(
                        "h-12 rounded-xl bg-white px-4 text-base text-[#1a3d34] placeholder:text-[#8aa398]",
                        checkoutErrors.customerEmail
                          ? "border-rose-300 focus-visible:ring-rose-200"
                          : "border-[#2d6a4f]/15",
                      )}
                      placeholder="Enter your email"
                    />
                    {checkoutErrors.customerEmail ? (
                      <p className="text-sm text-rose-600">{checkoutErrors.customerEmail}</p>
                    ) : null}
                  </div>
                  <ClientAccountForm
                    variant="checkout"
                    name={customerName}
                    email={customerEmail}
                    phone={customerPhone}
                    onPhoneChange={(value) => {
                      setCustomerPhone(value);
                      clearCheckoutError("customerPhone");
                      clearCheckoutError("customerPhoneVerified");
                    }}
                    smsOptIn={customerSmsOptIn}
                    policyAgreed={customerPolicyAgreed}
                    onSuccess={handleClientAccountSuccess}
                  />
                  {checkoutErrors.customerPhone ? (
                    <p className="text-sm text-rose-600">{checkoutErrors.customerPhone}</p>
                  ) : null}
                  {checkoutErrors.customerPhoneVerified ? (
                    <p className="text-sm text-rose-600">
                      {checkoutErrors.customerPhoneVerified}
                    </p>
                  ) : null}
                  <div className="space-y-2">
                    <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                      Notes optional
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-28 rounded-xl border-[#2d6a4f]/15 bg-white px-4 py-3 text-base text-[#1a3d34] placeholder:text-[#8aa398]"
                      placeholder="Client name, venue timing, gate code, or special entry notes"
                    />
                  </div>
                  <div className="rounded-xl border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="customer-sms-opt-in-compact"
                        checked={customerSmsOptIn}
                        onCheckedChange={(checked) => {
                          setCustomerSmsOptIn(checked === true);
                        }}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="customer-sms-opt-in-compact"
                          className="cursor-pointer text-sm font-medium text-[#1a3d34]"
                        >
                          Send text confirmations and pickup reminders
                        </Label>
                        <p className="text-sm leading-6 text-[#5a7a6e]">
                          By checking this box, you agree to receive reservation updates from
                          seatac.co at the mobile number above. Message frequency varies. Reply
                          STOP to opt out, HELP for help. Msg & data rates may apply. See our{" "}
                          <Link href="/privacy" className="text-[#0d5c48] underline underline-offset-4">
                            privacy policy
                          </Link>{" "}
                          and{" "}
                          <Link href="/sms-policy" className="text-[#0d5c48] underline underline-offset-4">
                            SMS policy
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[0.7rem] uppercase tracking-[0.2em] text-[#5a7a6e]">
                    Add-ons
                  </Label>
                  <div className="grid gap-2">
                    {extrasCatalog.map((extra) => {
                      return (
                        <RideAdditionCard
                          key={extra.key}
                          extra={extra}
                          quantity={getExtraQuantity(extra.key)}
                          onQuantityChange={(nextQuantity) =>
                            setExtraQuantity(extra.key, nextQuantity)
                          }
                        />
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-[#2d6a4f]/10 bg-[#f8f7f4] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#5a7a6e]">
                        {selectedVehicle ? "Estimated total" : "Choose a vehicle to price"}
                      </span>
                      <strong className="font-sans text-2xl font-semibold text-[#1a3d34]">
                        {selectedVehicle ? formatCurrency(pricing?.total ?? 0) : "Not priced yet"}
                      </strong>
                    </div>
                    {pricing ? (
                      <div className="mt-3 grid gap-2 border-t border-[#2d6a4f]/8 pt-3 text-sm text-[#5a7a6e]">
                        <div className="flex items-center justify-between">
                          <span>Vehicle base</span>
                          <span>{formatCurrency(pricing.baseFare)}</span>
                        </div>
                        {(pricing.mileageCharge ?? 0) > 0 && (
                          <div className="flex items-center justify-between">
                            <span>
                              Mileage ({pricing.routeDistanceMiles.toFixed(1)} mi ×{" "}
                              {formatCurrency(pricing.mileageFee ?? 0)})
                            </span>
                            <span>{formatCurrency(pricing.mileageCharge ?? 0)}</span>
                          </div>
                        )}
                        {(pricing.passengerTotal ?? 0) > 0 && (
                          <div className="flex items-center justify-between">
                            <span>
                              Passengers ({passengers} ×{" "}
                              {formatCurrency(pricing.passengerFee ?? 0)})
                            </span>
                            <span>{formatCurrency(pricing.passengerTotal ?? 0)}</span>
                          </div>
                        )}
                        {(pricing.bagTotal ?? 0) > 0 && (
                          <div className="flex items-center justify-between">
                            <span>
                              Bags ({bags} × {formatCurrency(pricing.bagFee ?? 0)})
                            </span>
                            <span>{formatCurrency(pricing.bagTotal ?? 0)}</span>
                          </div>
                        )}
                        {extraSelections.map(({ extra, quantity, total }) => (
                          <div key={extra.key} className="flex items-center justify-between">
                            <span>
                              {extra.label} ({formatExtraQuantityLabel(extra, quantity)})
                            </span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#2d6a4f]/10 pt-5">
              <div className="flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((step - 1) as Step)}
                    className="h-11 rounded-full border-[#2d6a4f]/15 bg-[#f8f7f4] px-5 text-[#5a7a6e] shadow-none hover:bg-[#2d6a4f]/5 hover:text-[#1a3d34]"
                  >
                    Back
                  </Button>
                )}
                {step < 5 ? (
                  <Button
                    type="button"
                    disabled={nextStepDisabled}
                    onClick={() => {
                      if (validateStep(step)) {
                        setStep((step + 1) as Step);
                      }
                    }}
                    className="h-11 rounded-full bg-[#2d6a4f] px-6 text-sm font-semibold text-white hover:bg-[#2d6a4f]/90"
                  >
                    {activeStep.cta}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={submitBooking}
                      disabled={submitting || !checkoutReady}
                      className="h-11 rounded-full bg-[#2d6a4f] px-6 text-sm font-semibold text-white hover:bg-[#2d6a4f]/90"
                    >
                      {submitting
                        ? "Redirecting..."
                        : pricing
                          ? `Pay ${formatCurrency(pricing.total)} now`
                          : "Pay now"}
                    </Button>
                    {!checkoutReady ? (
                      <p className="text-right text-xs text-[#8aa398]">
                        Complete the required rider details to continue.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden lg:block">
            <RouteMapCard
              compact
              pickupAddress={pickupAddress}
              dropoffAddress={tripType === "hourly" || tripType === "event" ? "" : dropoffAddress}
              pickupPlace={pickupPlace}
              dropoffPlace={dropoffPlace}
              onRouteResolved={handleRouteResolved}
            />
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div
      data-booking-theme="seatac"
      className={cn(
        "theme-seatac grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_21rem]",
        landingOnly && "lg:grid-cols-1",
        compact && "gap-5",
      )}
    >
      {!landingOnly ? (
        <div className={cn("min-w-0 lg:col-span-2", showTitle ? "space-y-5" : "space-y-0")}>
          {showTitle ? (
            <h1 className="max-w-2xl font-display text-4xl leading-[0.96] text-[#1a3d34] md:text-5xl">
              Reserve your ride.
            </h1>
          ) : null}
          <div className="hidden min-w-0 px-2 lg:block">
            <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="relative flex min-w-max items-start gap-6 lg:grid lg:min-w-0 lg:grid-cols-5 lg:gap-4">
                <div className="absolute left-10 right-10 top-[3.1rem] hidden h-px bg-[#2d6a4f]/12 lg:block" />
                {stepMeta.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => jumpToStep(item.id)}
                    className="group flex min-w-[88px] flex-col items-center gap-2 text-center lg:min-w-0"
                  >
                    <span
                      className={cn(
                        "text-sm font-medium tracking-[-0.01em] transition",
                        step === item.id || item.id < step ? "text-[#1a3d34]" : "text-[#8aa398]",
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "relative z-10 grid size-11 place-items-center rounded-full border bg-white text-sm font-semibold transition",
                        step === item.id
                          ? "border-[#2d6a4f] bg-[#2d6a4f] text-white shadow-[0_8px_22px_rgba(45,106,79,0.2)]"
                          : item.id < step
                            ? "border-[#2d6a4f]/28 text-[#2d6a4f]"
                            : "border-[#2d6a4f]/15 text-[#8aa398]",
                      )}
                    >
                      {item.id < step ? <Check className="size-4" /> : item.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-6 lg:p-8">
        <div className="grid gap-5">
          {(step === 1 || landingOnly) && (
            <div className="p-1">
              <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <BadgeSwitcher
                    value={selectedPricingType}
                    onValueChange={(value) => handlePricingTypeChange(value as PricingType)}
                    options={enabledPricingOptions}
                    aria-label="Pricing type"
                    className="w-full rounded-full border border-[#2d6a4f]/12 bg-[#f7f8f5] p-1"
                    itemClassName="flex-1 rounded-full"
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {selectedPricingType === "flat" ? (
                  <div className="space-y-2">
                    <Label className="text-[#5a7a6e]">Route</Label>
                    <Select
                      value={selectedRoute?.id ?? ""}
                      onValueChange={(value) => {
                        if (!value) return;
                        applyRoute(filteredRoutes.find((route) => route.id === value) ?? null);
                      }}
                    >
                      <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]">
                        <SelectValue placeholder="Choose a route">
                          {selectedRoute?.name ?? ""}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="booking-popup rounded-2xl border-[#2d6a4f]/15 bg-white">
                        {filteredRoutes.map((route) => (
                          <SelectItem key={route.id} value={route.id} className="text-[#1a3d34]">
                            {route.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </div>
              <div className="mt-6 grid gap-4">
                <div className="space-y-2">
                  <Label className="text-[#5a7a6e]">Pick up address</Label>
                  <GoogleAddressInput
                    id="pickup-address"
                    value={pickupAddress}
                    onChange={handlePickupAddressChange}
                    onResolved={setPickupPlace}
                    placeholder="Enter pick up address"
                    suggestions={pickupSuggestions}
                    className="booking-control h-14 rounded-2xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]"
                  />
                </div>

                {(tripType === "flat" || tripType === "distance") && (
                  <>
                    <AddressSwapButton onClick={handleSwapAddresses} />
                    <div className="space-y-2">
                      <Label className="text-[#5a7a6e]">Drop off address</Label>
                      <GoogleAddressInput
                        id="dropoff-address"
                        value={dropoffAddress}
                        onChange={handleDropoffAddressChange}
                        onResolved={setDropoffPlace}
                        placeholder="Enter drop off address"
                        suggestions={dropoffSuggestions}
                        className="booking-control h-14 rounded-2xl px-4 text-base border-[#2d6a4f]/15 bg-white text-[#1a3d34]"
                      />
                    </div>
                  </>
                )}
              </div>

              {!stepOneReady ? (
                <p className="mt-5 text-sm text-[#8a6736]">
                  {`Still needed: ${stepOneMissingItems.join(", ")}.`}
                </p>
              ) : null}
              {stepOneAttempted && routeSelectionError ? (
                <p className="mt-3 text-sm font-medium text-rose-500">{routeSelectionError}</p>
              ) : null}
            </div>
          )}

          {!landingOnly && step === 2 && (
            <div className="p-1">
              <div className="max-w-2xl">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-[#2d6a4f]/80">
                  Schedule
                </p>
                <h3 className="mt-3 font-display text-3xl leading-[0.96] text-[#1a3d34] md:text-4xl">
                  Choose the pickup time.
                </h3>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <BookingDateField
                  label="Pickup date"
                  value={pickupDate}
                  onChange={setPickupDate}
                  placeholder="Select Date"
                  disabled={pickupDateDisabled}
                />
                <BookingTimeField
                  label="Pickup time"
                  options={pickupTimeOptions}
                  value={pickupTime}
                  onChange={setPickupTime}
                />

                {(tripType === "hourly" || tripType === "event") && (
                  <div className="md:col-span-2">
                    <BookingCounterField
                      label="Hours requested"
                      value={Number(hoursRequested)}
                      options={hourlyHourOptions}
                      singularLabel="hour"
                      onChange={(value) => setHoursRequested(String(value))}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-[#5a7a6e]">Flight number optional</Label>
                <Input
                  value={flightNumber}
                  onChange={(event) => setFlightNumber(event.target.value)}
                  className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
                  placeholder="Example: AS342 or DL1287"
                />
              </div>

              {scheduleValidationMessage ? (
                <p className="mt-4 text-sm font-medium text-rose-500">
                  {scheduleValidationMessage}
                </p>
              ) : null}

              <div className="mt-5 border-t border-[#2d6a4f]/10 pt-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="return-trip-desktop"
                    checked={returnTrip}
                    onCheckedChange={(checked) => handleReturnTripChange(Boolean(checked))}
                    className="size-5 border-[#2d6a4f]/20 data-checked:bg-[#2d6a4f] data-checked:text-white"
                  />
                  <Label htmlFor="return-trip-desktop" className="cursor-pointer">
                    <p className="font-sans text-[0.76rem] uppercase tracking-[0.26em] text-[#2d6a4f]/80">
                      Return trip
                    </p>
                  </Label>
                </div>
              </div>

                {returnTrip && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <BookingDateField
                      label="Return date"
                      value={returnDate}
                      onChange={setReturnDate}
                      placeholder="Select Date"
                      disabled={returnDateDisabled}
                    />
                    <BookingTimeField
                      label="Return time"
                      options={returnTimeOptions}
                      value={returnTime}
                      onChange={setReturnTime}
                    />
                  </div>
                )}
            </div>
          )}

          {!landingOnly && step === 4 && (
            <div className="grid gap-4">
              <div className="grid items-start gap-3 pt-2 md:grid-cols-3 md:gap-4">
              {vehicleOptionSummaries.map(
                ({
                  availableUnits,
                  isAvailable,
                  nextAvailableLabel,
                  quotePreview,
                  reasonLabel,
                  status,
                  vehicle,
                }) => (
                <button
                  key={vehicle.id}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => isAvailable && setSelectedVehicleId(vehicle.id)}
                  className={cn(
                    "relative self-start overflow-hidden rounded-[1.7rem] border text-left transition",
                    isAvailable
                      ? selectedVehicle?.id === vehicle.id
                        ? "border-[#2d6a4f] bg-[#eef7f2] shadow-[0_20px_42px_rgba(45,106,79,0.24)] ring-2 ring-[#2d6a4f]/22 md:pb-4"
                        : "border-[#2d6a4f]/10 bg-white hover:border-[#2d6a4f]/20 hover:bg-[#f8f7f4] md:mt-4"
                      : "border-[#2d6a4f]/10 bg-[#f8f7f4]/50 opacity-80",
                  )}
                >
                  {selectedVehicle?.id === vehicle.id && isAvailable && (
                    <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/65 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1f5d44] shadow-[0_8px_22px_rgba(13,92,72,0.18)] lg:right-4 lg:top-4 lg:gap-2 lg:px-3 lg:text-xs lg:tracking-[0.15em]">
                      <span className="grid size-4 place-items-center rounded-full bg-[#2d6a4f] text-white shadow-[0_2px_8px_rgba(45,106,79,0.28)]">
                        <Check className="size-3" />
                      </span>
                      <span>Selected</span>
                    </span>
                  )}
                  <div
                    className={cn(
                      "relative h-[12.75rem] overflow-hidden rounded-[inherit] sm:h-[13.5rem] md:h-auto md:overflow-visible",
                      !isAvailable && "grayscale",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-cover md:relative md:h-44",
                        selectedVehicle?.id === vehicle.id
                          ? ""
                          : "sepia-[0.18] saturate-[0.82] brightness-[0.9]",
                      )}
                      style={{
                        backgroundImage: `url(${vehicle.image})`,
                        backgroundPosition: "center center",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10281f]/78 via-[#10281f]/26 to-transparent md:hidden" />
                    <div
                      className={cn(
                        "absolute inset-x-0 bottom-0 z-10 space-y-1.5 p-3 text-white sm:p-3.5 md:static md:space-y-4 md:bg-transparent md:p-5 md:text-inherit",
                        selectedVehicle?.id === vehicle.id ? "text-white" : "text-white/88 md:text-[#1a3d34]/88",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/82 md:text-[#5a7a6e]">
                        <Badge className="rounded-full bg-black/24 px-2 py-1 text-[0.58rem] text-white backdrop-blur-sm md:bg-[#f8f7f4] md:px-3 md:text-[0.68rem] md:text-[#5a7a6e]">
                          {vehicle.passengersMax} pax
                        </Badge>
                        <Badge className="rounded-full bg-black/24 px-2 py-1 text-[0.58rem] text-white backdrop-blur-sm md:bg-[#f8f7f4] md:px-3 md:text-[0.68rem] md:text-[#5a7a6e]">
                          {vehicle.bagsMax} bags
                        </Badge>
                        {!isAvailable && (
                          <Badge className="rounded-full border border-white/16 bg-white/10 px-2 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-white/85 backdrop-blur-sm md:border-[#2d6a4f]/10 md:bg-[#f8f7f4] md:px-3 md:text-[0.68rem] md:tracking-[0.2em] md:text-[#8aa398]">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-sans text-[1.45rem] font-semibold leading-[0.95] text-white sm:text-[1.6rem] md:text-3xl md:text-[#1a3d34]">
                            {getVehicleDisplayName(vehicle.name)}
                          </p>
                          <p
                            className={cn(
                              "mt-2 hidden text-sm leading-5 md:block md:leading-6",
                              selectedVehicle?.id === vehicle.id
                                ? "text-white/82 md:text-[#5a7a6e]"
                                : "text-white/70 md:text-[#5a7a6e]/78",
                            )}
                          >
                            {vehicle.summary}
                          </p>
                        </div>
                      </div>
                      <div className="hidden border-t border-[#2d6a4f]/10 pt-4 md:block">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#5a7a6e]">Base price</span>
                          <span className="font-medium text-[#1a3d34]">
                            {formatCurrency(quotePreview.baseFare)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-sm md:border-t md:border-[#2d6a4f]/10 md:pt-4",
                          selectedVehicle?.id === vehicle.id
                            ? "text-white/80 md:text-[#5a7a6e]"
                            : "text-white/70 md:text-[#5a7a6e]/78",
                        )}
                      >
                        {getVehicleUseCase(vehicle.passengersMax)}
                      </div>
                    </div>
                  </div>
                  {!isAvailable ? (
                    <div className="space-y-3 px-4 pb-4 md:hidden">
                      <div
                        className={cn(
                          "border-t px-0 pt-4 text-sm",
                          status?.reasonType === "schedule"
                            ? "border-amber-500/20 text-amber-800"
                            : "border-[#2d6a4f]/10 text-[#5a7a6e]",
                        )}
                      >
                        <p className="font-medium">{reasonLabel}</p>
                        {status?.reason ? (
                          <p className="mt-2 text-sm leading-6 text-current/80">{status.reason}</p>
                        ) : null}
                        {nextAvailableLabel ? (
                          <p className="mt-2 text-sm text-current/90">
                            Next opening: {nextAvailableLabel}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="hidden space-y-4 p-5 md:block">
                    {!isAvailable && (
                      <div
                        className={cn(
                          "border-t px-0 pt-4 text-sm",
                          status?.reasonType === "schedule"
                            ? "border-amber-500/20 text-amber-800"
                            : "border-[#2d6a4f]/10 text-[#5a7a6e]",
                        )}
                      >
                        <p className="font-medium">{reasonLabel}</p>
                        {status?.reason ? (
                          <p className="mt-2 text-sm leading-6 text-current/80">{status.reason}</p>
                        ) : null}
                        {nextAvailableLabel ? (
                          <p className="mt-2 text-sm text-current/90">
                            Next opening: {nextAvailableLabel}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
                ),
              )}
              </div>
            </div>
          )}

          {!landingOnly && step === 3 && (
            <div className="p-1">
              <div className="max-w-2xl">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-[#2d6a4f]/80">
                  Fit
                </p>
                <h3 className="mt-3 font-display text-3xl leading-[0.96] text-[#1a3d34] md:text-4xl">
                  Set the party size.
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5a7a6e]">
                  Count checked bags here. Carry-ons and personal items usually fit more easily.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <BookingCounterField
                  label="Passengers"
                  value={Number(passengers)}
                  options={Array.from({ length: 12 }, (_, index) => index + 1)}
                  singularLabel="passenger"
                  onChange={(value) => handlePassengersChange(String(value))}
                />

                <BookingCounterField
                  label="Checked bags"
                  value={Number(bags)}
                  options={Array.from({ length: 13 }, (_, index) => index)}
                  singularLabel="checked bag"
                  onChange={(value) => handleBagsChange(String(value))}
                />
              </div>

              <div className="mt-6 border-t border-[#2d6a4f]/10 pt-5">
                <p className="text-sm font-medium text-[#1a3d34]">{fitReadout}</p>
                <p className="mt-2 text-sm leading-6 text-[#5a7a6e]">
                  The next step only shows vehicles that fit this party, checked bags, and live availability.
                </p>
              </div>
              {fitVehiclePreview.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {fitVehiclePreview.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border-l border-[#2d6a4f]/15 pl-4 py-1"
                    >
                      <p className="text-sm font-medium text-[#1a3d34]">{vehicle.label}</p>
                      <p className="mt-1 text-sm leading-6 text-[#5a7a6e]">{vehicle.detail}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {!landingOnly && step === 5 && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[#5a7a6e]">First name required</Label>
                    <Input
                      id="checkout-first-name"
                      name="given-name"
                      autoComplete="given-name"
                      value={customerFirstName}
                      onChange={(event) => {
                        setCustomerFirstName(event.target.value);
                        clearCheckoutError("customerFirstName");
                      }}
                      onBlur={() => validateCheckoutFields({ showToast: false })}
                      className={cn(
                        "h-14 rounded-2xl bg-white px-4 text-base text-[#1a3d34]",
                        checkoutErrors.customerFirstName
                          ? "border-rose-300 focus-visible:ring-rose-200"
                          : "border-[#2d6a4f]/15",
                      )}
                    />
                    {checkoutErrors.customerFirstName ? (
                      <p className="text-sm text-rose-600">
                        {checkoutErrors.customerFirstName}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#5a7a6e]">Last name required</Label>
                    <Input
                      id="checkout-last-name"
                      name="family-name"
                      autoComplete="family-name"
                      value={customerLastName}
                      onChange={(event) => {
                        setCustomerLastName(event.target.value);
                        clearCheckoutError("customerLastName");
                      }}
                      onBlur={() => validateCheckoutFields({ showToast: false })}
                      className={cn(
                        "h-14 rounded-2xl bg-white px-4 text-base text-[#1a3d34]",
                        checkoutErrors.customerLastName
                          ? "border-rose-300 focus-visible:ring-rose-200"
                          : "border-[#2d6a4f]/15",
                      )}
                    />
                    {checkoutErrors.customerLastName ? (
                      <p className="text-sm text-rose-600">
                        {checkoutErrors.customerLastName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#5a7a6e]">Email required</Label>
                  <Input
                    id="checkout-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={customerEmail}
                    onChange={(event) => {
                      setCustomerEmail(event.target.value);
                      clearCheckoutError("customerEmail");
                    }}
                    onBlur={() => validateCheckoutFields({ showToast: false })}
                    className={cn(
                      "h-14 rounded-2xl bg-white px-4 text-base text-[#1a3d34]",
                      checkoutErrors.customerEmail
                        ? "border-rose-300 focus-visible:ring-rose-200"
                        : "border-[#2d6a4f]/15",
                    )}
                  />
                  {checkoutErrors.customerEmail ? (
                    <p className="text-sm text-rose-600">{checkoutErrors.customerEmail}</p>
                  ) : null}
                </div>
                <ClientAccountForm
                  variant="checkout"
                  name={customerName}
                  email={customerEmail}
                  phone={customerPhone}
                  onPhoneChange={(value) => {
                    setCustomerPhone(value);
                    clearCheckoutError("customerPhone");
                    clearCheckoutError("customerPhoneVerified");
                  }}
                  smsOptIn={customerSmsOptIn}
                  policyAgreed={customerPolicyAgreed}
                  onSuccess={handleClientAccountSuccess}
                />
                {checkoutErrors.customerPhone ? (
                  <p className="text-sm text-rose-600">{checkoutErrors.customerPhone}</p>
                ) : null}
                {checkoutErrors.customerPhoneVerified ? (
                  <p className="text-sm text-rose-600">{checkoutErrors.customerPhoneVerified}</p>
                ) : null}
                <div className="space-y-2">
                  <Label className="text-[#5a7a6e]">Trip notes optional</Label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-32 rounded-[1.7rem] border-[#2d6a4f]/15 bg-white px-4 py-3 text-base text-[#1a3d34]"
                    placeholder="Client name, venue timing, gate code, or special entry notes"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[#5a7a6e]">Ride additions</Label>
                <div className="grid gap-3">
                  {extrasCatalog.map((extra) => {
                    return (
                      <RideAdditionCard
                        key={extra.key}
                        extra={extra}
                        quantity={getExtraQuantity(extra.key)}
                        onQuantityChange={(nextQuantity) =>
                          setExtraQuantity(extra.key, nextQuantity)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-[#2d6a4f]/10 pt-6">
          <div className="flex gap-3">
            {!landingOnly && step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((step - 1) as Step)}
                className="booking-secondary-button h-12 rounded-full px-5"
              >
                Back
              </Button>
            )}
            {landingOnly ? (
              <Button
                type="button"
                disabled={!stepOneReady}
                onClick={() => {
                  if (!validateStep(1)) {
                    return;
                  }
                  persistReserveDraft(2);
                  window.location.assign("/reserve?resume=1");
                }}
                className="booking-primary-button h-12 rounded-full px-6"
              >
                Continue to schedule <ChevronRight className="size-4" />
              </Button>
            ) : step < 5 && (
              <Button
                type="button"
                disabled={nextStepDisabled}
                onClick={() => {
                  if (!validateStep(step)) {
                    return;
                  }

                  setStep((step + 1) as Step);
                }}
                className="booking-primary-button h-12 rounded-full px-6"
              >
                {activeStep.cta} <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {!landingOnly ? (
      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-4 rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-5">
            <div className="flex items-end justify-between gap-4">
              <div />
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-[#5a7a6e]">
                  Estimated total
                </p>
                <p className="mt-2 font-sans text-4xl font-semibold text-[#1a3d34]">
                  {selectedVehicle ? formatCurrency(pricing?.total ?? 0) : "Choose a vehicle"}
                </p>
              </div>
            </div>
            <div className="group">
              <RouteMapCard
                compact
                embedded
                pickupAddress={pickupAddress}
                dropoffAddress={tripType === "hourly" || tripType === "event" ? "" : dropoffAddress}
                pickupPlace={pickupPlace}
                dropoffPlace={dropoffPlace}
                onRouteResolved={handleRouteResolved}
              />
            </div>
            <div className="space-y-0">
              {summaryRows
                .filter((row) => row.label !== "Route")
                .map((row, index) => (
                <div
                  key={row.label}
                  className={cn(
                    "group flex items-start gap-3 py-2.5",
                  )}
                >
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm text-[#5a7a6e]">{row.label}</span>
                    <button
                      type="button"
                      onClick={row.onEdit}
                      className="text-[11px] font-medium text-[#2d6a4f]/65 opacity-0 transition-opacity underline underline-offset-4 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="ml-auto min-w-0 text-right">
                    <span className="block text-sm font-medium text-[#1a3d34]">{row.value}</span>
                    {row.detail ? (
                      <span className="hidden text-sm text-[#8aa398] xl:block">{row.detail}</span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {step === 5 ? (
              <div className="space-y-3 pt-2">
                <label
                  htmlFor="customer-sms-opt-in"
                  className="flex cursor-pointer items-start gap-3 py-1"
                >
                  <Checkbox
                    id="customer-sms-opt-in"
                    checked={customerSmsOptIn}
                    onCheckedChange={(checked) => {
                      setCustomerSmsOptIn(checked === true);
                    }}
                    className="mt-0.5 size-5 rounded-md border-[#2d6a4f]/35 bg-white shadow-[0_2px_10px_rgba(45,106,79,0.08)] data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f] [&_[data-slot=checkbox-indicator]>svg]:size-4"
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-[#1a3d34]">
                      Text me confirmations and pickup reminders.
                    </div>
                    <div className="text-sm text-[#5a7a6e]">
                      Optional reservation updates. Reply STOP to opt out.{" "}
                      <Link
                        href="/sms-policy"
                        className="text-[#0d5c48] underline underline-offset-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        SMS policy
                      </Link>
                      .
                    </div>
                  </div>
                </label>
                <div className="space-y-2">
                  <label
                    htmlFor="customer-policy-agreed"
                    className="flex cursor-pointer items-start gap-3 py-1"
                  >
                    <Checkbox
                      id="customer-policy-agreed"
                      checked={customerPolicyAgreed}
                      onCheckedChange={(checked) => {
                        setCustomerPolicyAgreed(checked === true);
                        clearCheckoutError("customerPolicyAgreed");
                      }}
                      className="mt-0.5 size-5 rounded-md border-[#2d6a4f]/35 bg-white shadow-[0_2px_10px_rgba(45,106,79,0.08)] data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f] [&_[data-slot=checkbox-indicator]>svg]:size-4"
                    />
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#1a3d34]">
                        I agree to the booking policies.
                      </div>
                      <div className="text-sm text-[#5a7a6e]">
                        Review the{" "}
                        <Link
                          href="/terms"
                          className="text-[#0d5c48] underline underline-offset-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          terms
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-[#0d5c48] underline underline-offset-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          privacy policy
                        </Link>
                        .
                      </div>
                    </div>
                  </label>
                  {checkoutErrors.customerPolicyAgreed ? (
                    <p className="text-sm text-rose-600">{checkoutErrors.customerPolicyAgreed}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  onClick={submitBooking}
                  disabled={submitting || !checkoutReady}
                  className="booking-primary-button h-14 w-full rounded-full text-lg font-semibold"
                >
                  {submitting
                    ? "Redirecting..."
                    : pricing
                      ? `Pay ${formatCurrency(pricing.total)} now`
                      : "Pay now"}
                </Button>
              </div>
            ) : null}
        </div>
      </aside>
      ) : null}
    </div>
  );
}
