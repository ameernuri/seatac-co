"use client";

import { useEffect } from "react";

type PhoneClickTrackerProps = {
  adsConversionLabel?: string;
  adsId?: string;
};

function findPhoneLink(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>('a[href^="tel:"]');
}

export function PhoneClickTracker({
  adsConversionLabel,
  adsId = "AW-18023510769",
}: PhoneClickTrackerProps) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const link = findPhoneLink(event.target);

      if (!link || typeof window.gtag !== "function") {
        return;
      }

      const phoneNumber = link.href.replace(/^tel:/, "");
      const eventPayload = {
        event_category: "lead",
        event_label: phoneNumber,
        phone_number: phoneNumber,
      };

      window.gtag("event", "click_to_call", eventPayload);

      if (adsConversionLabel) {
        window.gtag("event", "conversion", {
          ...eventPayload,
          send_to: `${adsId}/${adsConversionLabel}`,
        });
      }
    }

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [adsConversionLabel, adsId]);

  return null;
}
