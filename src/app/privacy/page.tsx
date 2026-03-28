import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | seatac.co",
  description:
    "Privacy policy for seatac.co, including booking information, SMS reservation updates, and customer support data handling.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy policy for airport planning, reservations, and SMS updates."
      intro={
        <p>
          `seatac.co` uses booking details, contact information, and on-site activity to deliver
          airport transportation reservations, travel-planning content, and reservation updates. If
          you opt into text messages during checkout, that consent only applies to the reservation
          updates described in our <Link href="/sms-policy" className="text-[#0d5c48] underline underline-offset-4">SMS policy</Link>.
        </p>
      }
      updatedLabel="Updated March 18, 2026"
      asideTitle="What this page covers"
      asideItems={[
        "What customer data is collected during browsing and booking",
        "How booking and payment data is used",
        "How reservation text messages work",
        "How to contact us about privacy requests",
      ]}
      sections={[
        {
          title: "Information we collect",
          body: (
            <p>
              We collect the details you provide when you browse hotel and route pages, submit a
              reservation, or contact us for support. That may include your name, email address,
              mobile number, pickup and drop-off details, flight or trip notes, selected vehicle,
              and payment-related metadata returned by our payment processor.
            </p>
          ),
        },
        {
          title: "How we use information",
          body: (
            <p>
              We use customer information to quote rides, validate availability, create bookings,
              process payment, coordinate dispatch, send booking confirmations, send pickup
              reminders when you opt in, and respond to service issues. We also use aggregated site
              activity to improve route pages, hotel guides, and booking flow performance.
            </p>
          ),
        },
        {
          title: "Payments and service providers",
          body: (
            <p>
              Payments are processed through Stripe. Reservation text messages are sent through
              Twilio. Mapping and route estimation may rely on Google services. These providers may
              process limited data needed to complete the requested service, but they do so under
              their own terms and privacy policies.
            </p>
          ),
        },
        {
          title: "SMS reservation updates",
          body: (
            <p>
              If you check the SMS consent box during checkout, we may send reservation
              confirmations, dispatch-related updates, and pickup reminders to the mobile number
              you provided. We do not treat that checkbox as consent for general marketing. You can
              reply <strong>STOP</strong> to opt out or <strong>HELP</strong> for help.
            </p>
          ),
        },
        {
          title: "SMS and mobile data sharing",
          body: (
            <p>
              SMS consent is not shared with third parties or affiliates for their marketing or
              promotional purposes. Mobile numbers and reservation-related messaging data are used
              only to deliver the ride updates, support, and service communications requested by
              the customer.
            </p>
          ),
        },
        {
          title: "Your choices and contact",
          body: (
            <p>
              You can choose not to opt into text messaging, and you can request updates to your
              booking contact details by emailing <a className="text-[#0d5c48] underline underline-offset-4" href="mailto:hello@seatac.co">hello@seatac.co</a> or calling <a className="text-[#0d5c48] underline underline-offset-4" href="tel:+12067370808">(206) 737-0808</a>. We will handle reasonable privacy requests in line with applicable law.
            </p>
          ),
        },
      ]}
    />
  );
}
