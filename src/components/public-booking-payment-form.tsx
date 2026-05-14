"use client";

import { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";

type PaymentIntentPayload = {
  amountCents: number;
  bookingId: string;
  bookingReference: string;
  clientSecret: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  paymentIntentId: string;
  paymentStatus: string;
};

function PaymentForm({
  amountCents,
  customerEmail,
  customerName,
  customerPhone,
  onPaid,
  reference,
  token,
}: {
  amountCents: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  onPaid: () => void;
  reference: string;
  token?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState(customerName);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            email: customerEmail,
            name: cardholderName.trim() || customerName,
            phone: customerPhone,
          },
        },
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "The payment could not be confirmed.");
      setSubmitting(false);
      return;
    }

    if (result.paymentIntent?.status !== "succeeded") {
      setError("Stripe has not marked this payment as successful yet.");
      setSubmitting(false);
      return;
    }

    const finalizeResponse = await fetch("/api/public-bookings/payments/finalize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentIntentId: result.paymentIntent.id,
        reference,
        ...(token ? { token } : {}),
      }),
    });
    const finalizePayload = (await finalizeResponse.json().catch(() => ({}))) as {
      error?: string;
    };

    if (!finalizeResponse.ok) {
      setError(finalizePayload.error ?? "The booking could not be marked paid.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    onPaid();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6fbf8] px-4 py-3 text-sm text-[#35584d]">
        <span>Amount due</span>
        <span className="text-lg font-semibold text-[#17352f]">
          {formatCurrency(amountCents / 100)}
        </span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder name</Label>
        <Input
          id="cardholderName"
          value={cardholderName}
          onChange={(event) => setCardholderName(event.target.value)}
        />
      </div>
      <PaymentElement />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button
        className="h-12 w-full rounded-full bg-[#0f6a56] text-base hover:bg-[#0b5645]"
        disabled={!stripe || !elements || submitting}
        type="submit"
      >
        {submitting ? "Processing payment..." : "Pay now"}
      </Button>
    </form>
  );
}

export function PublicBookingPaymentForm({
  amountCents,
  customerName,
  paymentStatus,
  reference,
  stripePublishableKey,
  token,
}: {
  amountCents: number;
  customerName: string;
  paymentStatus: string;
  reference: string;
  stripePublishableKey: string;
  token?: string;
}) {
  const router = useRouter();
  const stripePromise = useMemo(
    () => (stripePublishableKey ? loadStripe(stripePublishableKey) : null),
    [stripePublishableKey],
  );
  const [intent, setIntent] = useState<PaymentIntentPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(paymentStatus !== "paid");

  useEffect(() => {
    let cancelled = false;

    async function loadIntent() {
      if (paymentStatus === "paid") {
        setLoadingIntent(false);
        return;
      }

      const response = await fetch("/api/public-bookings/payments/intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(token ? { reference, token } : { reference }),
      });
      const payload = (await response.json().catch(() => ({}))) as PaymentIntentPayload & {
        error?: string;
      };

      if (cancelled) {
        return;
      }

      if (!response.ok) {
        setError(payload.error ?? "The payment form could not be loaded.");
        setLoadingIntent(false);
        return;
      }

      setIntent(payload);
      setLoadingIntent(false);
    }

    loadIntent().catch(() => {
      if (!cancelled) {
        setError("The payment form could not be loaded.");
        setLoadingIntent(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [paymentStatus, reference, token]);

  if (paymentStatus === "paid") {
    return (
      <Card className="border-[#0d5c48]/10 bg-[#f7faf8]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#17352f]">
            <CheckCircle2 className="size-5 text-[#0f6a56]" />
            Payment received
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-6 text-[#5a7a70]">
          <p>{customerName}, your booking is already paid.</p>
          <p>
            Dispatch has the confirmed reservation and your driver details will follow
            the normal booking flow.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stripePublishableKey) {
    return (
      <Card className="border-[#0d5c48]/10">
        <CardHeader>
          <CardTitle className="text-[#17352f]">Payment unavailable</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-[#5a7a70]">
          Stripe is not ready on this site yet. Please call dispatch to complete payment.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#0d5c48]/10 bg-white">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[#5a7a70]">
          <ShieldCheck className="size-4 text-[#0f6a56]" />
          Secure payment
        </div>
        <CardTitle className="text-2xl text-[#17352f]">
          Pay {formatCurrency(amountCents / 100)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loadingIntent ? (
          <p className="text-sm text-[#5a7a70]">Loading secure payment form...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : intent && stripePromise ? (
          <Elements
            options={{
              clientSecret: intent.clientSecret,
            }}
            stripe={stripePromise}
          >
            <PaymentForm
              amountCents={intent.amountCents}
              customerEmail={intent.customerEmail}
              customerName={intent.customerName}
              customerPhone={intent.customerPhone}
              onPaid={() => {
                router.refresh();
              }}
              reference={reference}
              token={token}
            />
          </Elements>
        ) : null}
      </CardContent>
    </Card>
  );
}
