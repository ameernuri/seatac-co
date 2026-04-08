"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatacPrimaryButton } from "@/components/ui/seatac-primary-button";
import type { ClientAccountSnapshot } from "@/components/client-account-form";

type Props = {
  returnTo?: string;
};

function isValidIdentifier(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.includes("@")) {
    return /\S+@\S+\.\S+/.test(trimmed);
  }

  return trimmed.replace(/\D/g, "").length >= 10;
}

export function ClientSignInForm({ returnTo = "/reserve?resume=1" }: Props) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [challengeChannel, setChallengeChannel] = useState<"email" | "phone" | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const canSendCode = isValidIdentifier(identifier);
  const codeSent = Boolean(challengeId) && !verified;

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    setChallengeId(null);
    setChallengeChannel(null);
    setCode("");
    setVerified(false);
    setResendCooldown(0);
  }, [identifier]);

  async function handleSendCode() {
    if (!canSendCode || (resendCooldown > 0 && codeSent)) {
      return;
    }

    setSendLoading(true);
    const response = await fetch("/api/client-auth/sign-in/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ identifier }),
    });
    const data = await response.json().catch(() => ({}));
    setSendLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Verification code could not be sent.");
      return;
    }

    setChallengeId(data.challengeId ?? null);
    setChallengeChannel(data.channel === "email" ? "email" : "phone");
    setCode("");
    setResendCooldown(30);
    toast.success(
      data.channel === "email"
        ? `Verification code sent to ${identifier.trim().toLowerCase()}.`
        : "Verification code sent to your phone.",
    );
  }

  async function handleVerify() {
    if (!challengeId || code.trim().length !== 6) {
      return;
    }

    setVerifyLoading(true);
    const response = await fetch("/api/client-auth/sign-in/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        challengeId,
        code,
        identifier,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setVerifyLoading(false);

    if (!response.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Verification failed.");
      return;
    }

    setVerified(true);
    toast.success("Signed in.");
    router.refresh();
    router.push(returnTo);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="font-sans text-4xl font-semibold leading-tight text-[#1a3d34]">
          Sign In
        </h1>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-[#5a7a6e]">Email or mobile number</Label>
          {codeSent ? (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sendLoading || resendCooldown > 0}
              className="text-xs font-medium text-[#2d6a4f] underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
            </button>
          ) : null}
        </div>

        {!verified && codeSent ? (
          <ButtonGroup className="w-full rounded-2xl">
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-14 min-w-0 flex-[1.15] border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
            />
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:z-10"
            />
            <SeatacPrimaryButton
              type="button"
              onClick={handleVerify}
              disabled={verifyLoading || code.trim().length !== 6}
              className="h-14 min-w-40 px-5 shadow-none"
            >
              {verifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Verify
            </SeatacPrimaryButton>
          </ButtonGroup>
        ) : canSendCode ? (
          <ButtonGroup className="w-full rounded-2xl">
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
            />
            {!verified ? (
              <SeatacPrimaryButton
                type="button"
                onClick={handleSendCode}
                disabled={sendLoading}
                className="h-14 min-w-40 px-5 shadow-none"
              >
                {sendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                {codeSent ? "Resend code" : "Send code"}
              </SeatacPrimaryButton>
            ) : (
              <Button
                type="button"
                disabled
                className="h-14 min-w-40 border border-[#2d6a4f]/15 bg-white px-5 text-[#2d6a4f] opacity-100 shadow-none"
              >
                <Check className="size-4" />
                Verified
              </Button>
            )}
          </ButtonGroup>
        ) : (
          <Input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
          />
        )}
        {codeSent && challengeChannel ? (
          <p className="text-xs text-[#5a7a6e]">
            {challengeChannel === "email"
              ? `Code sent to ${identifier.trim().toLowerCase()}. Check spam or promotions if you don’t see it.`
              : "Check your phone for the 6-digit code."}
          </p>
        ) : null}
      </div>

      <div className="text-sm text-[#5a7a6e]">
        Don’t have an account?{" "}
        <Link href="/sign-up" className="text-[#0d5c48] underline underline-offset-4">
          Create one
        </Link>
        .
      </div>
    </div>
  );
}
