"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Luggage,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { GoogleAddressInput } from "@/components/google-address-input";
import { RouteMapCard, type RouteSummary } from "@/components/route-map-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
  describeBookingConstraints,
  resolveInitialBookingSlot,
  type BookingConstraints,
  validateBookingWindow,
} from "@/lib/booking-constraints";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { type GoogleAddress } from "@/lib/google-maps";
import { quoteReservation, type ServiceMode } from "@/lib/quote";
import { extrasCatalog } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Props = {
  bookingConstraints: BookingConstraints;
  vehicles: Vehicle[];
  routes: Route[];
  compact?: boolean;
  initialState?: {
    serviceMode?: ServiceMode;
    tripType?: TripType;
    routeSlug?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    pickupDetail?: string;
  };
};

type Step = 1 | 2 | 3 | 4 | 5;
type TripType = "flat" | "distance" | "hourly" | "event";
type VehicleAvailabilityStatus = {
  availableUnits: number;
  nextAvailablePickupAt: string | null;
  reason: string | null;
  reasonType: "available" | "inventory" | "schedule";
};

const serviceModeConfig: { key: ServiceMode; title: string; detail: string }[] = [
  {
    key: "airport",
    title: "Airport",
    detail: "Sea-Tac pickups and departures",
  },
  {
    key: "corporate",
    title: "Corporate",
    detail: "Bellevue, downtown, and executive travel",
  },
  {
    key: "hourly",
    title: "Hourly",
    detail: "Chauffeur by the hour",
  },
  {
    key: "events",
    title: "Events",
    detail: "Private evenings and wedding transport",
  },
];

const stepMeta = [
  {
    id: 1 as Step,
    label: "Route",
    eyebrow: "Service, route, and addresses",
    cta: "Continue to schedule",
  },
  {
    id: 2 as Step,
    label: "Time",
    eyebrow: "Pickup, return, and service window",
    cta: "Continue to fit",
  },
  {
    id: 3 as Step,
    label: "Fit",
    eyebrow: "Passengers and luggage fit",
    cta: "See vehicles",
  },
  {
    id: 4 as Step,
    label: "Vehicle",
    eyebrow: "Only live available vehicles",
    cta: "Continue to checkout",
  },
  {
    id: 5 as Step,
    label: "Checkout",
    eyebrow: "Review, extras, and payment details",
    cta: "Continue to payment",
  },
] as const;

const tripTypeOptions: Record<ServiceMode, { value: TripType; label: string }[]> = {
  airport: [
    { value: "flat", label: "Flat rate" },
    { value: "distance", label: "Distance" },
  ],
  corporate: [
    { value: "flat", label: "Flat rate" },
    { value: "distance", label: "Distance" },
  ],
  hourly: [{ value: "hourly", label: "Hourly" }],
  events: [
    { value: "event", label: "Event hourly" },
    { value: "distance", label: "Distance" },
  ],
};

function defaultTripTypeForMode(mode: ServiceMode): TripType {
  return tripTypeOptions[mode][0]?.value ?? "flat";
}

function defaultRouteForMode(routes: Route[], mode: ServiceMode) {
  return routes.find((route) =>
    mode === "hourly" || mode === "events" ? route.mode === "hourly" : route.mode === mode,
  );
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

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = String(Math.floor(index / 2)).padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";

  return `${hours}:${minutes}`;
});

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

  return (
    <div className="space-y-2">
      <Label className="booking-field-label">{label}</Label>
      <Popover>
        <PopoverTrigger
          className={cn(
            "booking-date-trigger booking-control flex w-full items-center justify-between px-4 text-base font-medium transition",
            !selectedDate && "is-placeholder",
          )}
        >
          <span>{selectedDate ? format(selectedDate, "MM/dd/yyyy") : placeholder}</span>
          <CalendarDays className="size-4 text-[#d8bb88]" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="booking-popup booking-calendar-popover w-auto p-2"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={disabled}
            onSelect={(date) => onChange(date ? formatDateValue(date) : "")}
            className="booking-calendar text-[#f5efe5] [--cell-size:--spacing(9)]"
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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger className="booking-control h-[3.25rem] w-full px-4 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="booking-popup">
          {timeChoices.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ReserveWizard({
  bookingConstraints,
  vehicles,
  routes,
  compact = false,
  initialState,
}: Props) {
  const initialPickupSlot = resolveInitialBookingSlot(bookingConstraints);
  const initialRoute =
    initialState?.routeSlug
      ? routes.find((route) => route.slug === initialState.routeSlug) ?? null
      : null;
  const initialServiceMode =
    initialState?.serviceMode ??
    ((initialRoute?.mode as ServiceMode | undefined) ?? "airport");
  const initialTripType =
    initialState?.tripType ??
    (initialRoute ? "flat" : defaultTripTypeForMode(initialServiceMode));
  const initialModeRoute =
    initialRoute ?? defaultRouteForMode(routes, initialServiceMode) ?? null;
  const [step, setStep] = useState<Step>(1);
  const [serviceMode, setServiceMode] = useState<ServiceMode>(initialServiceMode);
  const [tripType, setTripType] = useState<TripType>(initialTripType);
  const [routeId, setRouteId] = useState<string>(initialModeRoute?.id ?? "");
  const [pickupAddress, setPickupAddress] = useState(
    initialState?.pickupAddress ?? initialModeRoute?.origin ?? "",
  );
  const [dropoffAddress, setDropoffAddress] = useState(
    initialState?.dropoffAddress ?? initialModeRoute?.destination ?? "",
  );
  const [pickupPlace, setPickupPlace] = useState<GoogleAddress | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<GoogleAddress | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const [pickupDetail, setPickupDetail] = useState(
    initialState?.pickupDetail ?? "Flight number or venue entrance",
  );
  const [pickupDate, setPickupDate] = useState(initialPickupSlot.date);
  const [pickupTime, setPickupTime] = useState(initialPickupSlot.time);
  const [returnTrip, setReturnTrip] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("17:00");
  const [passengers, setPassengers] = useState("2");
  const [bags, setBags] = useState("2");
  const [hoursRequested, setHoursRequested] = useState("3");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id ?? "");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [availableVehicleCounts, setAvailableVehicleCounts] = useState<Record<string, number> | null>(
    null,
  );
  const [vehicleStatuses, setVehicleStatuses] = useState<
    Record<string, VehicleAvailabilityStatus> | null
  >(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredRoutes = useMemo(
    () =>
      routes.filter((route) =>
        serviceMode === "hourly" || serviceMode === "events"
          ? route.mode === "hourly"
          : route.mode === serviceMode,
      ),
    [routes, serviceMode],
  );

  const selectedRoute =
    filteredRoutes.find((route) => route.id === routeId) ?? filteredRoutes[0] ?? null;

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

  const selectedVehicle =
    availableVehicles.find((vehicle) => vehicle.id === selectedVehicleId) ??
    availableVehicles[0] ??
    null;

  const serviceModeLabel =
    serviceModeConfig.find((item) => item.key === serviceMode)?.title ?? "Airport";
  const tripTypeLabel =
    tripTypeOptions[serviceMode].find((item) => item.value === tripType)?.label ??
    "Flat rate";
  const routeConfidenceLabel = routeSummary
    ? `${routeSummary.distanceMiles.toFixed(1)} mi • ${routeSummary.durationMinutes} min`
    : tripType === "flat"
      ? "Preset route selected"
      : "Waiting for live route";
  const bookingRouteName =
    tripType === "flat" && selectedRoute
      ? selectedRoute.name
      : [pickupAddress, dropoffAddress].filter(Boolean).join(" to ") || "Custom route";
  const routePreviewLabel =
    tripType === "hourly" || tripType === "event"
      ? pickupAddress || "Hourly service area"
      : bookingRouteName;
  const dispatchReadiness = [
    pickupDate ? "Timing locked" : "Timing pending",
    selectedVehicle ? selectedVehicle.name : "Vehicle pending",
    returnTrip ? "Return leg added" : "One-way service",
  ];
  const pickupTimeOptions = useMemo(
    () =>
      buildBookingTimeOptions({
        constraints: bookingConstraints,
        dateValue: pickupDate,
      }),
    [bookingConstraints, pickupDate],
  );
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
    if (!availableVehicles.some((vehicle) => vehicle.id === selectedVehicleId)) {
      setSelectedVehicleId(availableVehicles[0]?.id ?? "");
    }
  }, [availableVehicles, selectedVehicleId]);

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
    if (!selectedRoute) {
      const fallbackRoute = defaultRouteForMode(routes, serviceMode);
      if (fallbackRoute) {
        setRouteId(fallbackRoute.id);
      }
    }
  }, [routes, selectedRoute, serviceMode]);

  const pricing = selectedVehicle
    ? quoteReservation({
        serviceMode,
        tripType,
        selectedRoute: tripType === "flat" ? selectedRoute : null,
        selectedVehicle,
        passengers: Number(passengers),
        bags: Number(bags),
        hoursRequested: Number(hoursRequested),
        routeDistanceMiles: routeSummary?.distanceMiles ?? null,
        routeDurationMinutes: routeSummary?.durationMinutes ?? null,
        returnTrip,
        selectedExtras,
      })
    : null;

  const activeStep = stepMeta.find((item) => item.id === step) ?? stepMeta[0];
  const extrasSelected = selectedExtras.length;
  const vehicleAvailabilityMessage = availabilityError
    ? availabilityError
    : availabilityLoading
      ? "Checking live fleet availability for the selected schedule..."
      : availableVehicles.length > 0
        ? `${availableVehicles.length} vehicle class${
            availableVehicles.length === 1 ? "" : "es"
          } are open for this schedule.`
        : compatibleVehicles.length > 0
          ? "No compatible vehicles are open for that time window. Adjust the schedule to see the next openings."
          : "No vehicles fit the current passenger and luggage count.";
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
  const vehicleOptionSummaries = compatibleVehicles.map((vehicle) => {
    const status = vehicleStatuses?.[vehicle.id] ?? null;
    const availableUnits = status?.availableUnits ?? availableVehicleCounts?.[vehicle.id] ?? null;
    const isAvailable = status ? status.reasonType === "available" : false;
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
      reasonLabel,
      status,
      vehicle,
    };
  });
  const reservationHeadline =
    tripType === "flat"
      ? "Choose a live route, lock timing, and move into dispatch."
      : "Build the trip details the way a real chauffeur request is taken.";
  const nextStepDisabled =
    step === 4 &&
    (!selectedVehicle || availabilityLoading || Boolean(availabilityError) || !vehicleStatuses);

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

  function handleModeChange(nextMode: ServiceMode) {
    const nextTripType = defaultTripTypeForMode(nextMode);
    const nextRoute = defaultRouteForMode(routes, nextMode) ?? null;

    setServiceMode(nextMode);
    setTripType(nextTripType);
    setRouteId(nextRoute?.id ?? "");
    setPickupPlace(null);
    setDropoffPlace(null);
    setRouteSummary(null);

    if (nextRoute) {
      setPickupAddress(nextRoute.origin);
      setDropoffAddress(nextTripType === "flat" ? nextRoute.destination : "");
    } else {
      setPickupAddress("");
      setDropoffAddress("");
    }
  }

  function handleTripTypeChange(nextType: TripType) {
    setTripType(nextType);
    setRouteSummary(null);

    if (nextType === "flat" && selectedRoute) {
      setPickupAddress(selectedRoute.origin);
      setDropoffAddress(selectedRoute.destination);
      setPickupPlace(null);
      setDropoffPlace(null);
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
  }

  function toggleExtra(key: string, checked: boolean) {
    if (checked) {
      setSelectedExtras((current) => [...current, key]);
      return;
    }

    setSelectedExtras((current) => current.filter((entry) => entry !== key));
  }

  function validateStep(current: Step) {
    if (current === 1) {
      if (!pickupAddress) {
        toast.error("Enter a pickup address.");
        return false;
      }

      if (tripType === "flat" && !selectedRoute) {
        toast.error("Choose a flat-rate route.");
        return false;
      }

      if ((tripType === "distance" || tripType === "flat") && !dropoffAddress) {
        toast.error("Enter a drop-off address.");
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
      if (!customerName || !customerEmail || !customerPhone) {
        toast.error("Complete the customer details.");
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

    if (!validateStep(5)) {
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
          serviceMode,
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
          specialInstructions: [pickupDetail, notes].filter(Boolean).join(" | ") || null,
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
      <div data-booking-theme="pierlimo" className="theme-pierlimo grid gap-6">
        <div className="grid gap-6 border-b border-white/8 pb-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
            <div>
              <p className="font-sans text-[0.76rem] uppercase tracking-[0.35em] text-[#ebd2ac]">
                Live reservation engine
              </p>
              <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.4rem,4.9vw,4.9rem)] leading-[0.92] text-[#f5efe5]">
                Plan the route, confirm the vehicle, and send the ride.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#b9b1a4]">
                Built for Sea-Tac transfers, corporate routes, hourly service, and event bookings.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceModeConfig.map((mode) => (
                <Button
                  key={mode.key}
                  type="button"
                  variant="outline"
                  onClick={() => handleModeChange(mode.key)}
                  className={cn(
                    "h-auto min-h-11 justify-center rounded-full border px-5 py-3 font-sans text-[0.68rem] uppercase tracking-[0.22em] shadow-none",
                    serviceMode === mode.key
                      ? "border-[#d6b67a]/45 bg-[#1b1c22] text-[#f5efe5]"
                      : "border-white/10 bg-white/[0.03] text-[#f5efe5] hover:bg-white/[0.06]",
                  )}
                >
                  {mode.title}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-5">
            {stepMeta.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id <= step || validateStep(step)) {
                    setStep(item.id);
                  }
                }}
                className="relative text-center"
              >
                {index < stepMeta.length - 1 && (
                  <span className="absolute left-[calc(50%+1.5rem)] top-6 hidden h-px w-[calc(100%-3rem)] bg-white/10 md:block" />
                )}
                <span
                  className={cn(
                    "relative z-10 mx-auto grid size-12 place-items-center rounded-full border text-base font-semibold transition",
                    step === item.id
                      ? "border-[#ebd2ac] bg-[#ebd2ac] text-[#111113]"
                      : "border-white/12 bg-white/[0.03] text-[#f5efe5]",
                  )}
                >
                  {item.id}
                </span>
                <span className="mt-3 block font-sans text-[0.68rem] uppercase tracking-[0.24em] text-[#f5efe5]">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            {step === 1 && (
              <div className="space-y-5">
                <div className="rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={tripType}
                        onValueChange={(value) => {
                          if (value) {
                            handleTripTypeChange(value as TripType);
                          }
                        }}
                      >
                          <SelectTrigger className="booking-control h-[3.25rem] w-full px-4 text-base">
                            <SelectValue>{tripTypeLabel}</SelectValue>
                          </SelectTrigger>
                        <SelectContent className="booking-popup">
                          {tripTypeOptions[serviceMode].map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {tripType !== "flat" && (
                      <div className="space-y-2">
                        <Label>Pickup detail</Label>
                        <Input
                          value={pickupDetail}
                          onChange={(event) => setPickupDetail(event.target.value)}
                          className="booking-control h-[3.25rem] px-4 text-base"
                          placeholder="Flight number, venue, or hotel"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Pick up address</Label>
                      <GoogleAddressInput
                        id="compact-pickup-address"
                        value={pickupAddress}
                        onChange={setPickupAddress}
                        onResolved={setPickupPlace}
                        placeholder="Enter Pick Up Address"
                        className="booking-control h-[3.25rem] px-4 text-base"
                      />
                    </div>

                    {(tripType === "flat" || tripType === "distance") && (
                      <div className="space-y-2">
                        <Label>Drop off address</Label>
                        <GoogleAddressInput
                          id="compact-dropoff-address"
                          value={dropoffAddress}
                          onChange={setDropoffAddress}
                          onResolved={setDropoffPlace}
                          placeholder="Enter Drop Off Address"
                          className="booking-control h-[3.25rem] px-4 text-base"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4 text-sm leading-7 text-[#b9b1a4]">
                    Route first. Once the addresses are locked, the next step narrows the calendar to valid service windows only.
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4">
                <div className="rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
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
                    <div className="mt-4 space-y-2">
                      <Label>Hours requested</Label>
                      <Select
                        value={hoursRequested}
                        onValueChange={(value) => {
                          if (value) {
                            setHoursRequested(value);
                          }
                        }}
                      >
                        <SelectTrigger className="booking-control h-[3.25rem] w-full px-4 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="booking-popup">
                          {[2, 3, 4, 5, 6, 8].map((hours) => (
                            <SelectItem key={hours} value={String(hours)}>
                              {hours} hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <p className="mt-4 text-sm text-[#b9b1a4]">
                    {describeBookingConstraints(bookingConstraints)}
                  </p>
                  {scheduleValidationMessage ? (
                    <p className="mt-2 text-sm font-medium text-rose-300">
                      {scheduleValidationMessage}
                    </p>
                  ) : null}

                  <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={returnTrip}
                        onCheckedChange={(checked) => setReturnTrip(Boolean(checked))}
                        className="size-5 border-white/20 data-checked:bg-[#ebd2ac] data-checked:text-[#111113]"
                      />
                      <Label>Book return trip</Label>
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
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                <div className="rounded-[1.7rem] border border-white/8 bg-black/20 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Passengers</Label>
                      <Select
                        value={passengers}
                        onValueChange={(value) => value && setPassengers(value)}
                      >
                        <SelectTrigger className="booking-control h-[3.25rem] w-full px-4 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="booking-popup">
                          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Bags</Label>
                      <Select
                        value={bags}
                        onValueChange={(value) => value && setBags(value)}
                      >
                        <SelectTrigger className="booking-control h-[3.25rem] w-full px-4 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="booking-popup">
                          {Array.from({ length: 12 }, (_, index) => index).map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-4 py-4">
                    <p className="text-sm text-[#f5efe5]">{fitReadout}</p>
                    <p className="mt-2 text-sm leading-6 text-[#b9b1a4]">
                      Vehicles are filtered after this step, so dispatch classes that do not fit never appear as choices.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4">
                <div className="rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-[#b9b1a4]">
                  {vehicleAvailabilityMessage}
                </div>
                {vehicleOptionSummaries.map(
                  ({
                    availableUnits,
                    isAvailable,
                    nextAvailableLabel,
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
                        "rounded-[1.5rem] border p-5 text-left transition",
                        isAvailable
                          ? selectedVehicle?.id === vehicle.id
                            ? "border-[#d6b67a]/50 bg-[#17181d]"
                            : "border-white/8 bg-black/20 hover:border-white/16"
                          : "border-white/6 bg-black/10 opacity-75",
                      )}
                    >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={cn(
                            "font-sans text-[0.68rem] uppercase tracking-[0.26em]",
                            isAvailable ? "text-[#ebd2ac]" : "text-[#9f9a90]",
                          )}
                        >
                          {vehicle.passengersMax} pax · {vehicle.bagsMax} bags
                        </p>
                        <h3
                          className={cn(
                            "mt-3 text-[1.35rem] font-semibold",
                            isAvailable ? "text-[#f5efe5]" : "text-[#d8d0c4]",
                          )}
                        >
                          {vehicle.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#b9b1a4]">
                          {vehicle.summary}
                        </p>
                        <div className="mt-4 space-y-2 text-sm">
                          <p
                            className={cn(
                              "font-medium",
                              isAvailable ? "text-[#f5efe5]" : "text-[#d8d0c4]",
                            )}
                          >
                            {reasonLabel}
                            {typeof availableUnits === "number" && isAvailable
                              ? ` · ${availableUnits} unit${availableUnits === 1 ? "" : "s"} open`
                              : ""}
                          </p>
                          {!isAvailable && status?.reason ? (
                            <p className="text-[#b9b1a4]">{status.reason}</p>
                          ) : null}
                          {!isAvailable && nextAvailableLabel ? (
                            <p className="text-[#ebd2ac]">
                              Next opening: {nextAvailableLabel}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-sans text-3xl font-semibold text-[#f5efe5]">
                          {formatCurrency(Number(vehicle.basePrice))}
                        </p>
                        {selectedVehicle?.id === vehicle.id && isAvailable && (
                          <span className="mt-3 inline-flex rounded-full border border-[#d6b67a]/30 bg-[#ebd2ac]/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#ebd2ac]">
                            Selected
                          </span>
                        )}
                        {!isAvailable && (
                          <span className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/60">
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-sans text-[0.72rem] uppercase tracking-[0.26em] text-[#ebd2ac]">
                      Full name
                    </Label>
                    <Input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="h-[3.25rem] rounded-[1rem] border-white/10 bg-[#08090d] px-4 text-base text-[#f5efe5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans text-[0.72rem] uppercase tracking-[0.26em] text-[#ebd2ac]">
                      Email
                    </Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      className="h-[3.25rem] rounded-[1rem] border-white/10 bg-[#08090d] px-4 text-base text-[#f5efe5]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans text-[0.72rem] uppercase tracking-[0.26em] text-[#ebd2ac]">
                      Mobile
                    </Label>
                    <Input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      className="h-[3.25rem] rounded-[1rem] border-white/10 bg-[#08090d] px-4 text-base text-[#f5efe5]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid gap-3">
                    {extrasCatalog.map((extra) => {
                      const checked = selectedExtras.includes(extra.key);

                      return (
                        <button
                          key={extra.key}
                          type="button"
                          onClick={() => toggleExtra(extra.key, !checked)}
                          className={cn(
                            "rounded-[1.2rem] border p-4 text-left transition",
                            checked
                              ? "border-[#d6b67a]/50 bg-[#17181d]"
                              : "border-white/8 bg-black/20 hover:border-white/16",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-[#ebd2ac]">
                                {formatCurrency(extra.price)}
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-[#f5efe5]">
                                {extra.label}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-[#b9b1a4]">
                                {extra.detail}
                              </p>
                            </div>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => toggleExtra(extra.key, Boolean(value))}
                              className="pointer-events-none mt-1 size-5 border-white/20 data-checked:bg-[#ebd2ac] data-checked:text-[#111113]"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans text-[0.72rem] uppercase tracking-[0.26em] text-[#ebd2ac]">
                      Trip notes
                    </Label>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-40 rounded-[1.2rem] border-white/10 bg-[#08090d] px-4 py-3 text-base text-[#f5efe5]"
                      placeholder="Flight number, client name, venue timing, or special entry notes"
                    />
                  </div>
                  <div className="rounded-[1.2rem] border border-white/8 bg-black/20 p-4 text-sm text-[#b9b1a4]">
                    <div className="flex items-center justify-between">
                      <span>Estimated total</span>
                      <strong className="font-sans text-3xl font-semibold text-[#f5efe5]">
                        {formatCurrency(pricing?.total ?? 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
              <div className="font-sans text-[0.72rem] uppercase tracking-[0.26em] text-[#b9b1a4]">
                {activeStep.eyebrow}
              </div>
              <div className="flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep((step - 1) as Step)}
                    className="h-12 rounded-full border-white/12 bg-white/[0.03] px-5 text-[#f5efe5] shadow-none hover:bg-white/[0.06]"
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
                    className="booking-primary-button h-12 rounded-full px-6 text-[#111113]"
                  >
                    {activeStep.cta}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={submitBooking}
                    disabled={submitting}
                    className="booking-primary-button h-12 rounded-full px-6 text-[#111113]"
                  >
                    {submitting ? "Redirecting..." : "Pay now"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
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
      data-booking-theme="pierlimo"
      className={cn(
        "theme-pierlimo grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_24rem]",
        compact && "gap-5",
      )}
    >
      <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 border-b border-white/8 pb-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="font-sans text-[0.76rem] uppercase tracking-[0.35em] text-primary/80">
                Live reservation engine
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-5xl leading-[0.92] text-white md:text-6xl">
                {reservationHeadline}
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/66">
                The reservation panel is structured to feel closer to a real
                chauffeur intake: route presets, service mode context, live map
                feedback, and a running quote that stays visible as dispatch details
                tighten.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[
                  `${serviceModeLabel} service`,
                  routeConfidenceLabel,
                  returnTrip ? "Return leg active" : "One-way booking",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/62"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceModeConfig.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => handleModeChange(mode.key)}
                  className={cn(
                    "rounded-[1.5rem] border px-5 py-3 text-left transition",
                    serviceMode === mode.key
                      ? "border-primary/60 bg-primary/16 text-white shadow-[0_18px_50px_rgba(214,182,122,0.12)]"
                      : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/20 hover:bg-white/[0.06]",
                  )}
                >
                  <div className="font-sans text-[0.7rem] uppercase tracking-[0.26em]">
                    {mode.title}
                  </div>
                  <div className="mt-1 text-sm leading-6">{mode.detail}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {stepMeta.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id <= step || validateStep(step)) {
                    setStep(item.id);
                  }
                }}
                className="group text-left"
              >
                <div className="rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-4 transition group-hover:border-white/14">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "grid size-12 place-items-center rounded-full border text-base font-semibold transition",
                        step === item.id
                          ? "border-primary bg-primary text-[#111]"
                          : "border-white/12 bg-white/[0.03] text-white/72 group-hover:border-white/24",
                      )}
                    >
                      {item.id}
                    </div>
                    <div>
                      <div className="font-sans text-[0.72rem] uppercase tracking-[0.24em] text-white/55">
                        {item.eyebrow}
                      </div>
                      <div className="mt-1 text-sm font-medium text-white/88">
                        {item.label}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 pt-7">
          {step === 1 && (
            <div className="grid gap-5">
              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                      Dispatch presets
                    </p>
                    <h3 className="mt-3 font-display text-4xl leading-[0.95] text-white">
                      Start from a real route, or switch to a custom trip.
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
                      Flat-rate airport and corporate corridors behave like preset
                      dispatch lanes. Distance trips stay flexible, but still quote
                      off the live map once pickup and drop-off are entered.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/46">
                        Estimated total
                      </p>
                      <p className="mt-2 font-display text-4xl text-white">
                        {formatCurrency(pricing?.total ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/46">
                        Route confidence
                      </p>
                      <p className="mt-2 text-base text-white/82">
                        {routeConfidenceLabel}
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/46">
                        Dispatch tempo
                      </p>
                      <p className="mt-2 text-base text-white/82">
                        {selectedVehicle
                          ? `${selectedVehicle.name} ready`
                          : "Vehicle suggested next"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {filteredRoutes.slice(0, 5).map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => applyRoute(route)}
                      className={cn(
                        "rounded-full border px-4 py-3 text-left transition",
                        selectedRoute?.id === route.id && tripType === "flat"
                          ? "border-primary/55 bg-primary/[0.1] text-white"
                          : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/18 hover:bg-white/[0.06]",
                      )}
                    >
                      <div className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-primary/80">
                        {route.mode}
                      </div>
                      <div className="mt-1 text-sm font-medium">{route.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
                <div className="space-y-5">
                  <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                          Service shape
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/62">
                          Pick the trip logic first, then either lock a preset lane or type the route live.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/62">
                        {tripTypeLabel}
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={tripType}
                          onValueChange={(value) => {
                            if (value) {
                              handleTripTypeChange(value as TripType);
                            }
                          }}
                        >
                          <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base">
                            <SelectValue>{tripTypeLabel}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="booking-popup rounded-2xl">
                            {tripTypeOptions[serviceMode].map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {tripType === "flat" ? (
                        <div className="space-y-2">
                          <Label>Flat-rate route</Label>
                          <Select
                            value={selectedRoute?.id ?? ""}
                            onValueChange={(value) => {
                              if (!value) {
                                return;
                              }

                              applyRoute(filteredRoutes.find((route) => route.id === value) ?? null);
                            }}
                          >
                            <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base">
                              <SelectValue placeholder="Choose a route">
                                {selectedRoute?.name ?? ""}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="booking-popup rounded-2xl">
                              {filteredRoutes.map((route) => (
                                <SelectItem key={route.id} value={route.id}>
                                  {route.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Pickup detail</Label>
                          <Input
                            value={pickupDetail}
                            onChange={(event) => setPickupDetail(event.target.value)}
                            className="booking-control h-14 rounded-2xl px-4 text-base"
                            placeholder="Flight number, hotel, or venue entrance"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                          Route entry
                        </p>
                        <p className="mt-2 text-sm leading-7 text-white/62">
                          Enter the exact addresses the chauffeur will see on dispatch.
                        </p>
                      </div>
                      {(tripType === "flat" || tripType === "distance") && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSwapAddresses}
                          className="h-11 rounded-full border-white/12 bg-white/[0.03] px-4 text-white hover:bg-white/[0.06]"
                        >
                          <ArrowRightLeft className="mr-2 size-4" />
                          Swap
                        </Button>
                      )}
                    </div>

                    <div className="mt-5 grid gap-4">
                      <div className="space-y-2">
                        <Label>Pick up address</Label>
                        <GoogleAddressInput
                          id="pickup-address"
                          value={pickupAddress}
                          onChange={setPickupAddress}
                          onResolved={setPickupPlace}
                          placeholder="Enter pick up address"
                          className="booking-control h-14 rounded-2xl px-4 text-base"
                        />
                      </div>

                      {(tripType === "flat" || tripType === "distance") && (
                        <div className="space-y-2">
                          <Label>Drop off address</Label>
                          <GoogleAddressInput
                            id="dropoff-address"
                            value={dropoffAddress}
                            onChange={setDropoffAddress}
                            onResolved={setDropoffPlace}
                            placeholder="Enter drop off address"
                            className="booking-control h-14 rounded-2xl px-4 text-base"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                    <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                      Funnel order
                    </p>
                    <p className="mt-2 text-sm leading-7 text-white/62">
                      This intake now moves like dispatch: route first, then schedule, then party fit, and only then does the live fleet open up.
                    </p>
                    <div className="mt-4 grid gap-4">
                      <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                        <MapPinned className="mt-1 size-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-white">Route comes first</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">
                            Lock the addresses and service shape before touching schedule or vehicle.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                        <Clock3 className="mt-1 size-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-white">Time is validated next</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">
                            Operating hours, lead time, and booking horizon are enforced before party fit and inventory.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-primary/[0.06] p-5">
                    <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                      Route memo
                    </p>
                    <div className="mt-4 grid gap-4">
                      <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                        <BriefcaseBusiness className="mt-1 size-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-white">Use case</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">
                            {serviceMode === "airport"
                              ? "Best for Sea-Tac arrivals, hotel departures, and direct terminal runs."
                              : serviceMode === "corporate"
                                ? "Tuned for Bellevue meetings, downtown pickups, and executive transfers."
                                : serviceMode === "hourly"
                                  ? "Structured for blocks of chauffeured time with waiting built into the quote."
                                  : "Best for venue windows, evening movement, and wedding transport."}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                        <ArrowRightLeft className="mt-1 size-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-white">Current route</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">
                            {bookingRouteName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                  Schedule window
                </p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  Choose a valid pickup window before the party fit and live inventory are unlocked.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Pickup date</Label>
                    <BookingDateField
                      label="Pickup date"
                      value={pickupDate}
                      onChange={setPickupDate}
                      placeholder="Select Date"
                      disabled={pickupDateDisabled}
                    />
                  </div>
                  <BookingTimeField
                    label="Pickup time"
                    options={pickupTimeOptions}
                    value={pickupTime}
                    onChange={setPickupTime}
                  />

                  {(tripType === "hourly" || tripType === "event") && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Hours requested</Label>
                      <Select
                        value={hoursRequested}
                        onValueChange={(value) => {
                          if (value) {
                            setHoursRequested(value);
                          }
                        }}
                      >
                        <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="booking-popup rounded-2xl">
                          {[2, 3, 4, 5, 6, 8].map((hours) => (
                            <SelectItem key={hours} value={String(hours)}>
                              {hours} hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={returnTrip}
                      onCheckedChange={(checked) => setReturnTrip(Boolean(checked))}
                      className="size-5 border-white/20 data-checked:bg-primary data-checked:text-[#111]"
                    />
                    <div>
                      <p className="font-sans text-[0.76rem] uppercase tracking-[0.26em] text-primary/80">
                        Return trip
                      </p>
                      <p className="text-sm text-white/68">
                        Add the return leg now and dispatch will mirror the timing.
                      </p>
                    </div>
                  </div>

                  {returnTrip && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Return date</Label>
                        <BookingDateField
                          label="Return date"
                          value={returnDate}
                          onChange={setReturnDate}
                          placeholder="Select Date"
                          disabled={returnDateDisabled}
                        />
                      </div>
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

              <div className="space-y-5">
                <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                  <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                    Booking rules
                  </p>
                  <div className="mt-4 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                    <p className="text-sm leading-7 text-white/62">
                      {describeBookingConstraints(bookingConstraints)}
                    </p>
                    {scheduleValidationMessage ? (
                      <p className="mt-2 text-sm font-medium text-rose-300">
                        {scheduleValidationMessage}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-primary/[0.06] p-5">
                  <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                    Schedule memo
                  </p>
                  <div className="mt-4 grid gap-4">
                    <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                      <CalendarDays className="mt-1 size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-white">Pickup window</p>
                        <p className="mt-1 text-sm leading-6 text-white/62">
                          {pickupDate ? `${pickupDate} at ${pickupTime}` : "Choose a pickup window"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                      <Clock3 className="mt-1 size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-white">Route confidence</p>
                        <p className="mt-1 text-sm leading-6 text-white/62">
                          {routeConfidenceLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-4">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/64">
                {vehicleAvailabilityMessage}
              </div>
              <div className="grid gap-4 xl:grid-cols-3">
              {vehicleOptionSummaries.map(
                ({
                  availableUnits,
                  isAvailable,
                  nextAvailableLabel,
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
                    "overflow-hidden rounded-[1.7rem] border text-left transition",
                    isAvailable
                      ? selectedVehicle?.id === vehicle.id
                        ? "border-primary/55 bg-primary/[0.08]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
                      : "border-white/10 bg-white/[0.02] opacity-80",
                  )}
                >
                  <div
                    className={cn(
                      "h-44 bg-cover bg-center",
                      !isAvailable && "grayscale",
                    )}
                    style={{ backgroundImage: `url(${vehicle.image})` }}
                  />
                  <div className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-sans text-3xl font-semibold text-white">{vehicle.name}</p>
                        <p className="mt-2 text-sm leading-6 text-white/62">
                          {vehicle.summary}
                        </p>
                      </div>
                      {selectedVehicle?.id === vehicle.id && isAvailable && (
                        <span className="grid size-9 place-items-center rounded-full bg-primary text-[#111]">
                          <Check className="size-4" />
                        </span>
                      )}
                      {!isAvailable && (
                        <Badge className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-white/62">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-white/58">
                      <Badge className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.68rem] text-white/72">
                        {vehicle.passengersMax} pax
                      </Badge>
                      <Badge className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.68rem] text-white/72">
                        {vehicle.bagsMax} bags
                      </Badge>
                      <Badge className="rounded-full bg-white/[0.06] px-3 py-1 text-[0.68rem] text-white/72">
                        from {formatCurrency(Number(vehicle.basePrice))}
                      </Badge>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/64">
                      Best for {vehicle.passengersMax <= 3 ? "airport executives and direct hotel runs" : vehicle.passengersMax <= 6 ? "corporate groups, families, and premium airport service" : "event movement, group transport, and multi-stop service"}.
                    </div>
                    <div
                      className={cn(
                        "rounded-[1.2rem] border px-4 py-3 text-sm",
                        isAvailable
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
                          : status?.reasonType === "schedule"
                            ? "border-amber-400/20 bg-amber-500/10 text-amber-100"
                            : "border-white/10 bg-white/[0.04] text-white/72",
                      )}
                    >
                      <p className="font-medium">
                        {reasonLabel}
                        {typeof availableUnits === "number" && isAvailable
                          ? ` · ${availableUnits} unit${availableUnits === 1 ? "" : "s"} open`
                          : ""}
                      </p>
                      {!isAvailable && status?.reason ? (
                        <p className="mt-2 text-sm leading-6 text-current/80">{status.reason}</p>
                      ) : null}
                      {!isAvailable && nextAvailableLabel ? (
                        <p className="mt-2 text-sm text-current/90">
                          Next opening: {nextAvailableLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
                ),
              )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                  Party fit
                </p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  Set the actual passenger and luggage count before the vehicle step opens.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Passengers</Label>
                    <Select
                      value={passengers}
                      onValueChange={(value) => {
                        if (value) {
                          setPassengers(value);
                        }
                      }}
                    >
                      <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="booking-popup rounded-2xl">
                        {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value} passenger{value === 1 ? "" : "s"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bags</Label>
                    <Select
                      value={bags}
                      onValueChange={(value) => {
                        if (value) {
                          setBags(value);
                        }
                      }}
                    >
                      <SelectTrigger className="booking-control h-14 w-full rounded-2xl px-4 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="booking-popup rounded-2xl">
                        {Array.from({ length: 12 }, (_, index) => index).map((value) => (
                          <SelectItem key={value} value={String(value)}>
                            {value} bag{value === 1 ? "" : "s"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/8 bg-gradient-to-br from-white/[0.05] to-primary/[0.06] p-5">
                <p className="font-sans text-[0.72rem] uppercase tracking-[0.3em] text-primary/78">
                  Fit memo
                </p>
                <div className="mt-4 grid gap-4">
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                    <Users className="mt-1 size-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-white">Compatibility</p>
                      <p className="mt-1 text-sm leading-6 text-white/62">{fitReadout}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
                    <Luggage className="mt-1 size-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-white">Next step</p>
                      <p className="mt-1 text-sm leading-6 text-white/62">
                        The vehicle list only shows classes that fit this party and are still available.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-black/35 px-4 text-base text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-black/35 px-4 text-base text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="h-14 rounded-2xl border-white/10 bg-black/35 px-4 text-base text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trip notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-32 rounded-[1.7rem] border-white/10 bg-black/35 px-4 py-3 text-base text-white"
                    placeholder="Flight number, client name, venue timing, or special entry notes"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Ride additions</Label>
                  <div className="grid gap-3">
                    {extrasCatalog.map((extra) => {
                      const checked = selectedExtras.includes(extra.key);

                      return (
                        <button
                          key={extra.key}
                          type="button"
                          onClick={() => toggleExtra(extra.key, !checked)}
                          className={cn(
                            "rounded-[1.2rem] border p-4 text-left transition",
                            checked
                              ? "border-primary/55 bg-primary/[0.08]"
                              : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-sans text-[0.66rem] uppercase tracking-[0.24em] text-primary/80">
                                {formatCurrency(extra.price)}
                              </p>
                              <p className="mt-2 text-lg font-semibold text-white">
                                {extra.label}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-white/62">
                                {extra.detail}
                              </p>
                            </div>
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleExtra(extra.key, Boolean(value))
                              }
                              className="pointer-events-none mt-1 size-5 border-white/20 data-checked:bg-primary data-checked:text-[#111]"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Card className="rounded-[1.9rem] border-white/10 bg-white/[0.03]">
                <CardContent className="space-y-5 p-6">
                  <div>
                    <p className="font-sans text-[0.74rem] uppercase tracking-[0.3em] text-primary/80">
                      Reservation preview
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      {selectedVehicle?.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      {bookingRouteName} • {pickupDate || "Choose a date"} at{" "}
                      {pickupTime}
                    </p>
                  </div>
                  <Separator className="bg-white/8" />
                  <div className="grid gap-3 text-sm text-white/72">
                    <div className="flex items-center justify-between">
                      <span>Base fare</span>
                      <span>{formatCurrency(pricing?.baseFare ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Route distance</span>
                      <span>
                        {pricing?.routeDistanceMiles
                          ? `${pricing.routeDistanceMiles.toFixed(1)} mi`
                          : "Flat or hourly"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Return trip</span>
                      <span>{formatCurrency(pricing?.returnPremium ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Extras</span>
                      <span>{formatCurrency(pricing?.extrasTotal ?? 0)}</span>
                    </div>
                  </div>
                  <Separator className="bg-white/8" />
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-sans text-[0.74rem] uppercase tracking-[0.3em] text-white/48">
                        Estimated total
                      </p>
                      <p className="mt-2 font-sans text-5xl font-semibold text-white">
                        {formatCurrency(pricing?.total ?? 0)}
                      </p>
                    </div>
                    <div className="space-y-2 text-right text-sm text-white/60">
                      <div className="flex items-center justify-end gap-2">
                        <ShieldCheck className="size-4 text-primary" />
                        Dispatch reviewed
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Clock3 className="size-4 text-primary" />
                        Instant booking capture
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={submitBooking}
                    disabled={submitting}
                    className="booking-primary-button h-14 w-full rounded-full text-lg font-semibold"
                  >
                    {submitting ? "Redirecting..." : "Pay now"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6">
          <div className="flex items-center gap-3 text-sm text-white/58">
            <Sparkles className="size-4 text-primary" />
            {activeStep.eyebrow}
          </div>
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep((step - 1) as Step)}
                className="booking-secondary-button h-12 rounded-full px-5"
              >
                Back
              </Button>
            )}
            {step < 5 && (
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

      <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
        <Card className="rounded-[2rem] border-white/8 bg-white/[0.03]">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-[0.74rem] uppercase tracking-[0.3em] text-primary/80">
                  Live quote board
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  Built to keep the fare, route, class, and dispatch status visible while the trip is being shaped.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-white/44">
                  Estimated total
                </p>
                <p className="mt-2 font-sans text-5xl font-semibold text-white">
                  {formatCurrency(pricing?.total ?? 0)}
                </p>
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-primary/18 bg-gradient-to-br from-primary/[0.12] to-transparent p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">Selected service</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{serviceModeLabel}</p>
                </div>
                <Badge className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.66rem] uppercase tracking-[0.22em] text-white/72">
                  {tripTypeLabel}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {dispatchReadiness.map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-white/62"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/46">
                  <Users className="size-3.5 text-primary" />
                  Party
                </div>
                <p className="mt-2 text-base font-semibold text-white">
                  {passengers} passenger{passengers === "1" ? "" : "s"} • {bags} bag{bags === "1" ? "" : "s"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/46">
                  <Luggage className="size-3.5 text-primary" />
                  Vehicle class
                </div>
                <p className="mt-2 text-base font-semibold text-white">
                  {selectedVehicle?.name ?? "Select a vehicle"}
                </p>
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-white/8 bg-black/30 p-4">
              <div className="flex items-start gap-3">
                <MapPinned className="mt-1 size-4 text-primary" />
                <div className="text-sm leading-7 text-white/72">
                  <div className="font-medium text-white/90">{routePreviewLabel}</div>
                  {(tripType === "flat" || tripType === "distance") && (
                    <div className="mt-2 text-white/52">{routeConfidenceLabel}</div>
                  )}
                  {(tripType === "hourly" || tripType === "event") && (
                    <div className="mt-2 text-white/52">{hoursRequested} requested hour{hoursRequested === "1" ? "" : "s"}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-3 text-sm text-white/66">
              <div className="flex items-center justify-between">
                <span>Base fare</span>
                <span>{formatCurrency(pricing?.baseFare ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Extras selected</span>
                <span>{extrasSelected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Return trip premium</span>
                <span>{formatCurrency(pricing?.returnPremium ?? 0)}</span>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/8 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/46">Dispatch sequence</p>
              <div className="mt-4 space-y-3">
                {stepMeta.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "grid size-8 place-items-center rounded-full border text-xs font-semibold",
                        item.id <= step
                          ? "border-primary/60 bg-primary/18 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/40",
                      )}
                    >
                      {item.id}
                    </div>
                    <div className="text-sm text-white/72">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <RouteMapCard
          pickupAddress={pickupAddress}
          dropoffAddress={tripType === "hourly" || tripType === "event" ? "" : dropoffAddress}
          pickupPlace={pickupPlace}
          dropoffPlace={dropoffPlace}
          onRouteResolved={handleRouteResolved}
        />
      </aside>
    </div>
  );
}
