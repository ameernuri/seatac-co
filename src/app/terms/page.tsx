import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service | seatac.co",
  description:
    "Terms of service for seatac.co reservations, airport ride bookings, and SMS reservation updates.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of service for route guides, bookings, and reservation communications."
      intro={
        <p>
          These terms govern your use of `seatac.co`, including route-planning content, airport
          transfer reservations, and any reservation-related text updates you request. Our
          text-messaging rules are described in the <Link href="/sms-policy" className="text-[#0d5c48] underline underline-offset-4">SMS policy</Link>.
        </p>
      }
      updatedLabel="Updated March 18, 2026"
      asideTitle="Core terms"
      asideItems={[
        "Reservations are subject to availability and payment confirmation",
        "Quoted timing and routing depend on live conditions and dispatch rules",
        "Customers are responsible for accurate pickup and contact information",
        "Text-message consent is optional and reservation-specific",
      ]}
      sections={[
        {
          title: "Booking and availability",
          body: (
            <p>
              Reservation requests submitted through `seatac.co` are subject to vehicle
              availability, scheduling rules, and successful payment processing. A quote or visible
              vehicle option does not guarantee final availability until the booking is created and
              payment is confirmed.
            </p>
          ),
        },
        {
          title: "Customer responsibilities",
          body: (
            <p>
              You are responsible for providing accurate pickup timing, addresses, flight details,
              and contact information. Delays, wrong addresses, or incomplete customer information
              may affect dispatch timing and service delivery.
            </p>
          ),
        },
        {
          title: "Payment and service changes",
          body: (
            <p>
              Payment processing is handled by Stripe. Service changes, cancellations, or disputes
              may be subject to the final service confirmation, provider availability, and payment
              processor requirements. If you need a booking updated, contact us as soon as possible
              at <a className="text-[#0d5c48] underline underline-offset-4" href="mailto:hello@seatac.co">hello@seatac.co</a>.
            </p>
          ),
        },
        {
          title: "Messaging and support",
          body: (
            <p>
              If you opt into reservation text updates during checkout, we may send booking
              confirmations, reminders, and dispatch-related notices. Message frequency varies.
              Message and data rates may apply. You can reply <strong>STOP</strong> to opt out and
              <strong> HELP</strong> for help. See our <Link href="/privacy" className="text-[#0d5c48] underline underline-offset-4">privacy policy</Link> and <Link href="/sms-policy" className="text-[#0d5c48] underline underline-offset-4">SMS policy</Link> for details.
            </p>
          ),
        },
        {
          title: "Content and site use",
          body: (
            <p>
              Airport guides, hotel pages, and route-planning content on `seatac.co` are provided
              to help travelers plan trips into and out of Sea-Tac. You may use the site for lawful
              travel planning and booking activity, but not for scraping, fraudulent reservations,
              or misuse of the booking platform.
            </p>
          ),
        },
      ]}
    />
  );
}
