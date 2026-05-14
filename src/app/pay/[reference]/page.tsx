import type { Metadata } from "next";
import { CalendarDays, Luggage, NotebookPen, Plane, Route, UserRound } from "lucide-react";

import { RouteMapCard } from "@/components/route-map-card";
import { PublicBookingPaymentForm } from "@/components/public-booking-payment-form";
import { SiteBrand } from "@/components/site-brand";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { env } from "@/env";
import {
  formatBookingLocation,
  formatBookingReference,
  formatBookingRoute,
} from "@/lib/booking-display";
import { centsToDollars, formatCurrency, formatDateTime } from "@/lib/format";
import { type RideExtra } from "@/lib/extras-catalog";
import {
  getPublicBookingPaymentDetail,
  PublicBookingPaymentAccessError,
} from "@/lib/public-booking-payments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

type Props = {
  params: Promise<{
    reference: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

function parseStructuredNotes(value: string | null) {
  const lines = value?.split("\n").map((line) => line.trim()).filter(Boolean) ?? [];
  const details = {
    notes: [] as string[],
    returnDropoff: null as string | null,
    returnPickup: null as string | null,
    travelRef: null as string | null,
  };

  for (const line of lines) {
    if (line.startsWith("Travel ref:")) {
      details.travelRef = line.replace("Travel ref:", "").trim() || null;
      continue;
    }

    if (line.startsWith("Return pickup:")) {
      details.returnPickup = line.replace("Return pickup:", "").trim() || null;
      continue;
    }

    if (line.startsWith("Return dropoff:")) {
      details.returnDropoff = line.replace("Return dropoff:", "").trim() || null;
      continue;
    }

    details.notes.push(line);
  }

  return details;
}

function formatDistance(value: unknown) {
  const numeric = typeof value === "string" ? Number(value) : Number(value ?? NaN);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return `${numeric.toFixed(1)} mi`;
}

function formatDuration(value: unknown) {
  const numeric = typeof value === "string" ? Number(value) : Number(value ?? NaN);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  return `${Math.round(numeric)} min`;
}

function buildExtrasSummary(extras: unknown, extrasCatalog: RideExtra[]) {
  const keys = Array.isArray(extras) ? extras.map((value) => String(value)) : [];
  const counts = new Map<string, number>();

  for (const key of keys) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, quantity]) => {
    const match = extrasCatalog.find((extra) => extra.key === key);
    return {
      key,
      label: match?.label ?? key,
      total: (match?.price ?? 0) * quantity,
      quantity,
    };
  });
}

function buildPricingRows(
  pricing: Record<string, unknown>,
  extrasSummary: ReturnType<typeof buildExtrasSummary>,
  invoiceTotal: number,
) {
  const returnTrip = Number(pricing.returnPremium ?? 0);
  const extrasTotal = extrasSummary.reduce((sum, extra) => sum + extra.total, 0);
  const mainTrip = invoiceTotal - (Number.isFinite(returnTrip) && returnTrip > 0 ? returnTrip : 0) - extrasTotal;
  const rows: Array<{ label: string; value: number }> = [];

  if (Number.isFinite(mainTrip) && mainTrip > 0) {
    rows.push({ label: "Main trip", value: mainTrip });
  }

  if (Number.isFinite(returnTrip) && returnTrip > 0) {
    rows.push({ label: "Return trip", value: returnTrip });
  }

  for (const extra of extrasSummary) {
    if (!Number.isFinite(extra.total) || extra.total <= 0) {
      continue;
    }

    rows.push({
      label: extra.quantity > 1 ? `${extra.label} × ${extra.quantity}` : extra.label,
      value: extra.total,
    });
  }

  if (rows.length === 0 && Number.isFinite(invoiceTotal) && invoiceTotal > 0) {
    rows.push({ label: "Trip total", value: invoiceTotal });
  }

  return rows;
}

function InlineStatus({ paymentStatus }: { paymentStatus: string }) {
  const paid = paymentStatus === "paid";

  return (
    <span
      className={
        paid
          ? "rounded-full bg-[#e6f6ef] px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#0f6a56]"
          : "rounded-full bg-[#fff4e6] px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[#9a4f00]"
      }
    >
      {paid ? "Paid" : "Pending"}
    </span>
  );
}

function PaymentSummaryError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-[#f5f7f6] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="border-[#0d5c48]/10 bg-white">
          <CardContent className="space-y-3 px-5 py-5 text-sm leading-6 text-[#48655b]">
            <div className="text-sm font-semibold text-[#17352f]">Payment summary unavailable</div>
            <p>{message}</p>
            <p>
              Dispatch:{" "}
              <a className="font-medium text-[#0f6a56]" href="tel:+12067370808">
                (206) 737-0808
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default async function PublicBookingPaymentPage({
  params,
  searchParams,
}: Props) {
  const { reference } = await params;
  const { token } = await searchParams;

  let detail:
    | Awaited<ReturnType<typeof getPublicBookingPaymentDetail>>
    | null = null;
  let errorMessage: string | null = null;

  try {
    detail = await getPublicBookingPaymentDetail({
      reference,
      token: token ?? null,
    });
  } catch (error) {
    errorMessage =
      error instanceof PublicBookingPaymentAccessError
        ? error.message
        : "This payment summary could not be loaded right now.";
  }

  if (!detail) {
    return (
      <PaymentSummaryError
        message={errorMessage ?? "This payment summary could not be loaded right now."}
      />
    );
  }

  const { booking, extrasCatalog } = detail;
  const pricing =
    booking.pricing && typeof booking.pricing === "object"
      ? (booking.pricing as Record<string, unknown>)
      : {};
  const parsedNotes = parseStructuredNotes(booking.specialInstructions);
  const extrasSummary = buildExtrasSummary(booking.extras, extrasCatalog);
  const pricingRows = buildPricingRows(pricing, extrasSummary, centsToDollars(booking.totalCents));
  const outboundDistance = formatDistance(pricing.routeDistanceMiles);
  const outboundDuration = formatDuration(pricing.routeDurationMinutes);
  const returnDistance = formatDistance(pricing.returnRouteDistanceMiles);
  const returnDuration = formatDuration(pricing.returnRouteDurationMinutes);
  const returnPickupAddress =
    parsedNotes.returnPickup ?? booking.dropoffAddress ?? booking.pickupAddress;
  const returnDropoffAddress = parsedNotes.returnDropoff ?? booking.pickupAddress;
  const amountDue = booking.paymentStatus === "paid" ? booking.totalCents : booking.totalCents;

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-4 py-6 pb-24 md:px-6 md:py-8 lg:pb-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-center lg:justify-start">
          <SiteBrand compact />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <Card className="border-[#0d5c48]/10 bg-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-[0.72rem] uppercase tracking-[0.24em] text-[#6b877e]">
                      Invoice
                    </div>
                    <div className="text-lg font-semibold text-[#17352f]">
                      {formatBookingReference(booking.reference)}
                    </div>
                    <div className="text-sm text-[#5a7a70]">
                      {formatBookingRoute(booking)}
                    </div>
                  </div>
                  <InlineStatus paymentStatus={booking.paymentStatus} />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 text-sm text-[#48655b]">
                    <div className="flex items-center gap-2 font-medium text-[#17352f]">
                      <UserRound className="size-4 text-[#0f6a56]" />
                      Customer
                    </div>
                    <div>{booking.customerName}</div>
                    <div>{booking.customerPhone}</div>
                    <div>{booking.customerEmail}</div>
                  </div>
                  <div className="space-y-1.5 text-sm text-[#48655b]">
                    <div className="flex items-center gap-2 font-medium text-[#17352f]">
                      <Luggage className="size-4 text-[#0f6a56]" />
                      Party
                    </div>
                    <div>{booking.passengers} passengers</div>
                    <div>{booking.bags} bags</div>
                    <div>{booking.vehicleName}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#0d5c48]/10 bg-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
                  <div className="space-y-3 text-sm text-[#48655b]">
                    <div className="flex items-center gap-2 font-medium text-[#17352f]">
                      <Route className="size-4 text-[#0f6a56]" />
                      Outbound
                    </div>
                    <div className="space-y-1.5">
                      <div className="font-medium text-[#17352f]">
                        {formatBookingLocation(booking.pickupLabel || booking.pickupAddress)} to{" "}
                        {formatBookingLocation(booking.dropoffLabel || booking.dropoffAddress)}
                      </div>
                      <div>{booking.pickupAddress}</div>
                      {booking.dropoffAddress ? <div>{booking.dropoffAddress}</div> : null}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 font-medium text-[#17352f]">
                        <CalendarDays className="size-4 text-[#0f6a56]" />
                        Pickup
                      </div>
                      <div>{formatDateTime(booking.pickupAt)}</div>
                      {outboundDistance || outboundDuration ? (
                        <div className="text-[#17352f]">
                          {[outboundDistance, outboundDuration].filter(Boolean).join(" · ")}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="lg:pl-1">
                    <RouteMapCard
                      compact
                      dropoffAddress={booking.dropoffAddress ?? ""}
                      dropoffPlace={null}
                      embedded
                      minimal
                      pickupAddress={booking.pickupAddress}
                      pickupPlace={null}
                    />
                  </div>
                </div>

                {booking.returnAt ? (
                  <>
                    <Separator />
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
                      <div className="space-y-3 text-sm text-[#48655b]">
                        <div className="flex items-center gap-2 font-medium text-[#17352f]">
                          <Plane className="size-4 text-[#0f6a56]" />
                          Return
                        </div>
                        <div className="space-y-1.5">
                          <div className="font-medium text-[#17352f]">
                            {formatBookingLocation(returnPickupAddress)} to{" "}
                            {formatBookingLocation(returnDropoffAddress)}
                          </div>
                          <div>{returnPickupAddress}</div>
                          <div>{returnDropoffAddress}</div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 font-medium text-[#17352f]">
                            <CalendarDays className="size-4 text-[#0f6a56]" />
                            Return
                          </div>
                          <div>{formatDateTime(booking.returnAt)}</div>
                          {returnDistance || returnDuration ? (
                            <div className="text-[#17352f]">
                              {[returnDistance, returnDuration].filter(Boolean).join(" · ")}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="lg:pl-1">
                        <RouteMapCard
                          compact
                          dropoffAddress={returnDropoffAddress}
                          dropoffPlace={null}
                          embedded
                          minimal
                          pickupAddress={returnPickupAddress}
                          pickupPlace={null}
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-[#0d5c48]/10 bg-white">
              <CardContent className="space-y-4 px-5 py-5">
                <div className="space-y-2">
                  {pricingRows.length > 0 ? (
                    <>
                      {pricingRows.map((row) => (
                        <div className="flex items-start justify-between gap-4 text-sm" key={row.label}>
                          <span className="text-[#48655b]">{row.label}</span>
                          <span className="font-medium text-[#17352f]">
                            {row.value > 0
                              ? formatCurrency(row.value)
                              : `-${formatCurrency(Math.abs(row.value))}`}
                          </span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="font-semibold text-[#17352f]">Total</span>
                        <span className="text-base font-semibold text-[#17352f]">
                          {formatCurrency(centsToDollars(booking.totalCents))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[#48655b]">
                      Total only. No detailed pricing lines were saved with this booking.
                    </div>
                  )}
                </div>

                {(parsedNotes.travelRef || parsedNotes.notes.length > 0) ? (
                  <>
                    <Separator />
                    <div className="space-y-2 text-sm text-[#48655b]">
                      {parsedNotes.travelRef ? (
                        <div className="flex items-start gap-2">
                          <Plane className="mt-0.5 size-4 shrink-0 text-[#0f6a56]" />
                          <div>
                            <span className="font-medium text-[#17352f]">Travel ref</span>
                            <div>{parsedNotes.travelRef}</div>
                          </div>
                        </div>
                      ) : null}
                      {parsedNotes.notes.length > 0 ? (
                        <div className="flex items-start gap-2">
                          <NotebookPen className="mt-0.5 size-4 shrink-0 text-[#0f6a56]" />
                          <div>
                            <span className="font-medium text-[#17352f]">Notes</span>
                            <div>{parsedNotes.notes.join(" ")}</div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start" id="payment-card">
            <PublicBookingPaymentForm
              amountCents={booking.totalCents}
              customerName={booking.customerName}
              paymentStatus={booking.paymentStatus}
              reference={booking.reference}
              stripePublishableKey={env.stripePublishableKey}
              token={token}
            />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0d5c48]/10 bg-white/96 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[0.65rem] uppercase tracking-[0.22em] text-[#6b877e]">
              {booking.paymentStatus === "paid" ? "Paid" : "Amount due"}
            </div>
            <div className="truncate text-base font-semibold text-[#17352f]">
              {formatCurrency(centsToDollars(amountDue))}
            </div>
          </div>
          {booking.paymentStatus === "paid" ? (
            <InlineStatus paymentStatus={booking.paymentStatus} />
          ) : (
            <a
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#0f6a56] px-5 text-sm font-semibold text-white"
              href="#payment-card"
            >
              Pay now
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
