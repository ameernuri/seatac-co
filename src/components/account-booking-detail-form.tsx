"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  bookingReference: string;
  initialSmsOptIn: boolean;
  initialSpecialInstructions: string;
};

export function AccountBookingDetailForm({
  bookingReference,
  initialSmsOptIn,
  initialSpecialInstructions,
}: Props) {
  const [customerSmsOptIn, setCustomerSmsOptIn] = useState(initialSmsOptIn);
  const [specialInstructions, setSpecialInstructions] = useState(
    initialSpecialInstructions,
  );
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const response = await fetch(
        `/api/client-auth/bookings/${encodeURIComponent(bookingReference)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            customerSmsOptIn,
            specialInstructions: specialInstructions.trim() || null,
          }),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(
          typeof data.error === "string"
            ? data.error
            : "Booking changes could not be saved.",
        );
        return;
      }

      toast.success("Booking updated.");
    });
  }

  return (
    <div className="space-y-6 rounded-[1.7rem] border border-[#2d6a4f]/10 bg-white p-6">
      <div className="space-y-1">
        <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
          Manage booking
        </p>
        <p className="text-sm leading-6 text-[#5a7a6e]">
          Update rider notes or SMS updates here. For route or timing changes, contact dispatch.
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-[1.4rem] border border-[#2d6a4f]/10 bg-[#f7faf8] px-4 py-4 text-[#1a3d34]">
        <Checkbox
          checked={customerSmsOptIn}
          onCheckedChange={(checked) => setCustomerSmsOptIn(Boolean(checked))}
          className="mt-1 size-5 rounded-md border-[#2d6a4f]/18 data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f]"
        />
        <span className="space-y-1">
          <span className="block text-base font-semibold">Text confirmations and pickup reminders</span>
          <span className="block text-sm text-[#5a7a6e]">
            Keep reservation updates coming to your verified mobile number.
          </span>
        </span>
      </label>

      <div className="space-y-3">
        <div>
          <p className="text-[0.76rem] uppercase tracking-[0.28em] text-[#5a7a6e]">
            Trip notes
          </p>
        </div>
        <Textarea
          value={specialInstructions}
          onChange={(event) => setSpecialInstructions(event.target.value)}
          placeholder="Client name, venue timing, gate code, or special entry notes"
          className="min-h-32 rounded-[1.4rem] border-[#2d6a4f]/12 px-4 py-4 text-base text-[#1a3d34] placeholder:text-[#6f8b80]"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SeatacPrimaryButton
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="h-12 px-6"
        >
          {isPending ? "Saving..." : "Save changes"}
        </SeatacPrimaryButton>
      </div>
    </div>
  );
}
