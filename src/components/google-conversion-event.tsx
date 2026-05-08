"use client";

import { useEffect } from "react";

type GoogleConversionEventProps = {
  adsConversionLabel?: string;
  adsId?: string;
  currency?: string;
  eventName: string;
  transactionId?: string;
  value?: number;
};

export function GoogleConversionEvent({
  adsConversionLabel,
  adsId = "AW-18023510769",
  currency = "USD",
  eventName,
  transactionId,
  value,
}: GoogleConversionEventProps) {
  useEffect(() => {
    if (typeof window.gtag !== "function") {
      return;
    }

    const storageKey = transactionId
      ? `gtag:${eventName}:${transactionId}`
      : `gtag:${eventName}:${Date.now()}`;

    if (transactionId && window.sessionStorage.getItem(storageKey)) {
      return;
    }

    const eventPayload = {
      currency,
      transaction_id: transactionId,
      value,
    };

    window.gtag("event", eventName, eventPayload);

    if (adsConversionLabel) {
      window.gtag("event", "conversion", {
        ...eventPayload,
        send_to: `${adsId}/${adsConversionLabel}`,
      });
    }

    if (transactionId) {
      window.sessionStorage.setItem(storageKey, "1");
    }
  }, [adsConversionLabel, adsId, currency, eventName, transactionId, value]);

  return null;
}
