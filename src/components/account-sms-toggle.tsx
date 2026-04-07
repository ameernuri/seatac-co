"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

type Props = {
  initialChecked: boolean;
  phone: string | null;
  phoneVerified: boolean;
};

export function AccountSmsToggle({ initialChecked, phone, phoneVerified }: Props) {
  const [checked, setChecked] = useState(initialChecked);
  const [isPending, startTransition] = useTransition();

  const disabled = !phone || !phoneVerified;

  return (
    <div className="space-y-2 rounded-[1.7rem] border border-[#d7e6de] bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#1a3d34]">Text confirmations and pickup reminders</p>
          <p className="text-sm text-[#5a7a6e]">
            {disabled
              ? "Verify a mobile number first to manage SMS updates."
              : "Use the verified number on your account for reservation updates."}
          </p>
        </div>
        <Switch
          checked={checked}
          disabled={disabled || isPending}
          onCheckedChange={(nextChecked) => {
            const previous = checked;
            setChecked(nextChecked);

            startTransition(async () => {
              try {
                const response = await fetch("/api/client-auth/preferences", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  credentials: "same-origin",
                  body: JSON.stringify({ smsOptIn: nextChecked }),
                });
                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                  throw new Error(
                    typeof data.error === "string"
                      ? data.error
                      : "SMS preference could not be updated.",
                  );
                }

                toast.success(nextChecked ? "SMS reminders enabled." : "SMS reminders turned off.");
              } catch (error) {
                setChecked(previous);
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "SMS preference could not be updated.",
                );
              }
            });
          }}
        />
      </div>
      {checked && !disabled ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#2d6a4f]">
          <Check className="size-4" />
          Sending to {phone}
        </div>
      ) : null}
    </div>
  );
}
