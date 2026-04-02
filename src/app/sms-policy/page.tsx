import type { Metadata } from "next";
import Link from "next/link";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "SMS Policy | seatac.co",
  description:
    "SMS policy for seatac.co reservation confirmations, pickup reminders, STOP/HELP support, and consent handling.",
};

export default function SmsPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="SMS policy"
      title="How seatac.co uses text messages for reservation updates."
      intro={
        <p>
          We use SMS for reservation-related updates only when a customer actively opts in during
          sign-up or checkout. This page explains what messages we send, how consent works, and
          how to opt out or request help. For broader data handling, see our{" "}
          <Link href="/privacy" className="text-[#0d5c48] underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      }
      updatedLabel="Updated March 18, 2026"
      asideTitle="At a glance"
      asideItems={[
        "Opt-in happens through an unchecked box on sign-up or checkout",
        "Current use is reservation-related, not promotional",
        "Reply STOP to opt out and HELP for help",
        "Message frequency varies by booking activity",
      ]}
      sections={[
        {
          title: "What messages we send",
          body: (
            <p>
              Current text messages are limited to one-time verification codes, booking
              confirmations after payment, dispatch updates related to a booked ride, and pickup
              reminders. We do not use this consent for newsletters, broad promotions, or
              unrelated marketing.
            </p>
          ),
        },
        {
          title: "How opt-in works",
          body: (
            <p>
              Customers can optionally agree to SMS on the sign-up page or during checkout by
              checking an unchecked consent box next to the mobile number field. The current
              consent language states: “I agree to receive reservation text messages from
              seatac.co.” Supporting copy explains that messages may include one-time codes,
              booking confirmations, pickup reminders, and trip updates, and that customers can
              reply STOP to opt out or HELP for help. Message frequency varies. Msg &amp; data
              rates may apply.
            </p>
          ),
        },
        {
          title: "Opt-out and support",
          body: (
            <p>
              Customers can reply <strong>STOP</strong> to stop text messages or <strong>HELP</strong> for help. Customers can also contact support at <a className="text-[#0d5c48] underline underline-offset-4" href="mailto:hello@seatac.co">hello@seatac.co</a> or <a className="text-[#0d5c48] underline underline-offset-4" href="tel:+12067370808">(206) 737-0808</a>.
            </p>
          ),
        },
        {
          title: "How messaging data is handled",
          body: (
            <p>
              SMS consent is not shared with third parties or affiliates for their marketing or
              promotional purposes. Mobile numbers and reservation messaging data are used only for
              the booking updates and customer support requested through seatac.co.
            </p>
          ),
        },
        {
          title: "Message frequency and charges",
          body: (
            <p>
              Message frequency varies based on booking activity. Most customers should expect a
              confirmation and, if configured, a reminder before pickup. Standard message and data
              rates may apply depending on the mobile carrier plan.
            </p>
          ),
        },
        {
          title: "Future subscriber messaging",
          body: (
            <p>
              If `seatac.co` later launches subscriber or promotional text programs, those messages
              will use separate consent language and separate compliance handling. The current
              reservation checkbox does not authorize that future marketing category.
            </p>
          ),
        },
      ]}
    />
  );
}
