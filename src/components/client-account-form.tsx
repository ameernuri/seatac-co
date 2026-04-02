"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ClientAccountSnapshot = {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  phoneVerifiedAt: string | Date | null;
  smsOptIn: boolean | null;
};

type SharedProps = {
  onSuccess?: (account: ClientAccountSnapshot) => void;
  returnTo?: string;
};

type FullProps = SharedProps & {
  compact?: boolean;
  initialEmail?: string;
  initialName?: string;
  initialPhone?: string;
  initialSmsOptIn?: boolean;
  variant?: "full";
};

type CheckoutProps = SharedProps & {
  email: string;
  name: string;
  phone: string;
  onPhoneChange: (phone: string) => void;
  policyAgreed: boolean;
  smsOptIn: boolean;
  variant: "checkout";
};

type Props = FullProps | CheckoutProps;

function normalizeClientPhone(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("+")) {
    const normalized = `+${trimmed.slice(1).replace(/\D/g, "")}`;
    return normalized.length >= 11 ? normalized : null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return null;
}

function isEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

function isPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

function splitName(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as { error?: { message?: unknown } }).error?.message === "string"
  ) {
    return (error as { error: { message: string } }).error.message;
  }

  return fallback;
}

export function ClientAccountForm(props: Props) {
  const router = useRouter();
  const variant = props.variant ?? "full";
  const isCheckout = variant === "checkout";
  const checkoutVariantProps = isCheckout ? (props as CheckoutProps) : null;
  const fullVariantProps = isCheckout ? null : (props as FullProps);
  const initialNameParts = splitName(fullVariantProps?.initialName ?? "");
  const [firstName, setFirstName] = useState(initialNameParts.firstName);
  const [lastName, setLastName] = useState(initialNameParts.lastName);
  const [email, setEmail] = useState(fullVariantProps?.initialEmail ?? "");
  const [phone, setPhone] = useState(fullVariantProps?.initialPhone ?? "");
  const [smsOptIn, setSmsOptIn] = useState(fullVariantProps?.initialSmsOptIn ?? false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resolvedName =
    checkoutVariantProps?.name ?? `${firstName} ${lastName}`.trim();
  const resolvedEmail = checkoutVariantProps?.email ?? email;
  const resolvedPhone = checkoutVariantProps?.phone ?? phone;
  const resolvedSmsOptIn = checkoutVariantProps?.smsOptIn ?? smsOptIn;
  const verificationPurpose = isCheckout ? "reserve-account" : "sign-up";
  const normalizedPhone = normalizeClientPhone(resolvedPhone);
  const alreadyVerified = Boolean(verifiedPhone && verifiedPhone === resolvedPhone);
  const canSendCode = isPhone(resolvedPhone);
  const showPhoneAction = alreadyVerified || codeSent || canSendCode;
  const canCompleteSignUp =
    !isCheckout &&
    resolvedName.trim().length >= 2 &&
    isEmail(resolvedEmail) &&
    isPhone(resolvedPhone) &&
    termsAgreed;

  useEffect(() => {
    if (verifiedPhone && verifiedPhone !== resolvedPhone) {
      setVerifiedPhone(null);
      setCodeSent(false);
      setOtpCode("");
      setChallengeId(null);
      setResendCooldown(0);
    }
  }, [resolvedPhone, verifiedPhone]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function fetchAccountSnapshot() {
    const response = await fetch("/api/client-auth/profile", {
      credentials: "same-origin",
    });
    const data = await response.json().catch(() => ({}));
    return data.account as ClientAccountSnapshot | null;
  }

  async function syncProfile() {
    const response = await fetch("/api/client-auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        challengeId,
        email: resolvedEmail,
        name: resolvedName,
        phone: resolvedPhone,
        purpose: verificationPurpose,
        smsOptIn: resolvedSmsOptIn,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error ?? "Account details could not be saved.");
    }

    return data.account as ClientAccountSnapshot | null;
  }

  async function handleSendCode() {
    if (codeSent && resendCooldown > 0) {
      return;
    }

    if (!canSendCode) {
      toast.error("Enter a valid mobile number first.");
      return;
    }

    setSendLoading(true);
    const response = await fetch("/api/client-auth/phone/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        phone: normalizedPhone ?? resolvedPhone,
        purpose: verificationPurpose,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setSendLoading(false);

    if (!response.ok) {
      toast.error(
        typeof data.error === "string"
          ? data.error
          : "Verification code could not be sent.",
      );
      return;
    }

    setChallengeId(data.challengeId ?? null);
    setCodeSent(true);
    setOtpCode("");
    setResendCooldown(30);
    toast.success("Verification code sent.");
  }

  async function handleVerifyCode() {
    if (otpCode.trim().length !== 6) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    if (!challengeId) {
      toast.error("Send a verification code first.");
      return;
    }

    setVerifyLoading(true);
    const response = await fetch("/api/client-auth/phone/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        challengeId,
        code: otpCode,
        phone: normalizedPhone ?? resolvedPhone,
        purpose: verificationPurpose,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setVerifyLoading(false);
      toast.error(
        typeof data.error === "string" ? data.error : "Phone verification failed.",
      );
      return;
    }

    setChallengeId(typeof data.challengeId === "string" ? data.challengeId : challengeId);

    if (isCheckout) {
      try {
        const account = (await syncProfile()) ?? (await fetchAccountSnapshot());
        setVerifiedPhone(resolvedPhone);
        setVerifyLoading(false);
        toast.success("Account ready.");

        if (account && props.onSuccess) {
          props.onSuccess(account);
        }

        router.refresh();

        if (props.returnTo && !props.onSuccess) {
          router.push(props.returnTo);
        }
      } catch (error) {
        setVerifyLoading(false);
        toast.error(extractErrorMessage(error, "Account details could not be saved."));
      }
      return;
    }

    setVerifiedPhone(resolvedPhone);
    setVerifyLoading(false);
    toast.success("Phone verified.");
    setVerificationDialogOpen(false);
  }

  async function handleCompleteSignUp() {
    if (!canCompleteSignUp) {
      if (!termsAgreed) {
        toast.error("Agree to the terms to continue.");
        return;
      }

      toast.error("Complete your details and verify your phone first.");
      return;
    }

    if (!alreadyVerified) {
      setVerificationDialogOpen(true);
      return;
    }

    setSignUpLoading(true);

    try {
      const account = (await syncProfile()) ?? (await fetchAccountSnapshot());
      setSignUpLoading(false);
      toast.success("Account created.");

      if (account && props.onSuccess) {
        props.onSuccess(account);
      }

      router.refresh();

      if (props.returnTo && !props.onSuccess) {
        router.push(props.returnTo);
      }
    } catch (error) {
      setSignUpLoading(false);
      toast.error(extractErrorMessage(error, "Account details could not be saved."));
    }
  }

  if (isCheckout) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-[#5a7a6e]">Mobile number</Label>
          {codeSent && !alreadyVerified ? (
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
        {!alreadyVerified && codeSent ? (
          <ButtonGroup className="w-full rounded-2xl">
            <Input
              autoComplete="tel"
              inputMode="tel"
              value={resolvedPhone}
              onChange={(event) => checkoutVariantProps?.onPhoneChange(event.target.value)}
              className="h-14 min-w-0 flex-[1.15] border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
            />
            <Input
              value={otpCode}
              onChange={(event) =>
                setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:z-10"
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifyLoading || otpCode.trim().length !== 6}
              className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
            >
              {verifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
              Verify
            </Button>
          </ButtonGroup>
        ) : showPhoneAction ? (
          <ButtonGroup className="w-full rounded-2xl">
            <Input
              autoComplete="tel"
              inputMode="tel"
              value={resolvedPhone}
              onChange={(event) => checkoutVariantProps?.onPhoneChange(event.target.value)}
              className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
            />
            {!alreadyVerified ? (
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={sendLoading || !canSendCode}
                className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
              >
                {sendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Send code
              </Button>
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
            autoComplete="tel"
            inputMode="tel"
            value={resolvedPhone}
            onChange={(event) => checkoutVariantProps?.onPhoneChange(event.target.value)}
            className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-[#5a7a6e]">
            First name
          </Label>
          <Input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[#5a7a6e]">
            Last name
          </Label>
          <Input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-[#5a7a6e]">
            Email
          </Label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-[#5a7a6e]">
              Mobile number
            </Label>
            {codeSent && !alreadyVerified ? (
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
          {!alreadyVerified && codeSent ? (
            <ButtonGroup className="w-full rounded-2xl">
              <Input
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-14 min-w-0 flex-[1.15] border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
              />
              <Input
                value={otpCode}
                onChange={(event) =>
                  setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:z-10"
              />
              <Button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifyLoading || otpCode.trim().length !== 6}
                className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
              >
                {verifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Verify
              </Button>
            </ButtonGroup>
          ) : showPhoneAction ? (
            <ButtonGroup className="w-full rounded-2xl">
              <Input
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-14 min-w-0 flex-1 border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34] shadow-none focus-visible:z-10"
              />
              {!alreadyVerified ? (
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendLoading || !canSendCode}
                  className="booking-primary-button h-14 min-w-40 px-5 shadow-none"
                >
                  {sendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                  Send code
                </Button>
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
              autoComplete="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-14 rounded-2xl border-[#2d6a4f]/15 bg-white px-4 text-base text-[#1a3d34]"
            />
          )}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 py-1">
        <Checkbox
          checked={smsOptIn}
          onCheckedChange={(checked) => setSmsOptIn(checked === true)}
          className="mt-0.5 size-5 rounded-md border-[#2d6a4f]/35 bg-white data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f] [&_[data-slot=checkbox-indicator]>svg]:size-4"
        />
        <div className="space-y-1">
          <div className="text-sm font-medium text-[#1a3d34]">
            Send text confirmations and pickup reminders
          </div>
          <div className="text-sm text-[#5a7a6e]">
            By checking this box, you agree to receive reservation updates from seatac.co at the
            mobile number above. Message frequency varies. Reply STOP to opt out, HELP for help.
            Msg &amp; data rates may apply. See our{" "}
            <Link href="/privacy" className="text-[#0d5c48] underline underline-offset-4">
              privacy policy
            </Link>{" "}
            and{" "}
            <Link href="/sms-policy" className="text-[#0d5c48] underline underline-offset-4">
              SMS policy
            </Link>
            .
          </div>
        </div>
      </label>

      <label className="flex cursor-pointer items-start gap-3 py-1">
        <Checkbox
          checked={termsAgreed}
          onCheckedChange={(checked) => setTermsAgreed(checked === true)}
          className="mt-0.5 size-5 rounded-md border-[#2d6a4f]/35 bg-white data-checked:border-[#2d6a4f] data-checked:bg-[#2d6a4f] [&_[data-slot=checkbox-indicator]>svg]:size-4"
        />
        <div className="space-y-1">
          <div className="text-sm font-medium text-[#1a3d34]">
            I agree to the booking policies.
          </div>
          <div className="text-sm text-[#5a7a6e]">
            Review the{" "}
            <Link href="/terms" className="text-[#0d5c48] underline underline-offset-4">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#0d5c48] underline underline-offset-4">
              privacy policy
            </Link>
            .
          </div>
        </div>
      </label>

      <div className="pt-2">
        <Button
          type="button"
          onClick={handleCompleteSignUp}
          disabled={signUpLoading || !canCompleteSignUp}
          className="booking-primary-button h-12 rounded-full px-5"
        >
          {signUpLoading ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign up
        </Button>
      </div>

      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border border-[#2d6a4f]/10 bg-white p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-semibold text-[#1a3d34]">
              Verify your phone
            </DialogTitle>
            <DialogDescription className="text-[#5a7a6e]">
              We’ll text a 6-digit code to {resolvedPhone}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {!codeSent ? (
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={sendLoading || !canSendCode}
                className="booking-primary-button h-12 rounded-full px-5"
              >
                {sendLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                Send code
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="text-xs font-medium text-[#2d6a4f] underline underline-offset-4"
                  >
                    Resend
                  </button>
                </div>
                <div className="flex h-12 w-full overflow-hidden rounded-2xl border border-[#2d6a4f]/15 bg-white">
                  <Input
                    value={otpCode}
                    onChange={(event) =>
                      setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6-digit code"
                    className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 text-base font-medium tracking-[0.2em] text-[#1a3d34] placeholder:tracking-normal focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={verifyLoading || otpCode.trim().length !== 6}
                    className="booking-primary-button h-full min-w-32 rounded-none border-0 border-l border-l-[#2d6a4f]/15 px-5 shadow-none"
                  >
                    {verifyLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Verify
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
