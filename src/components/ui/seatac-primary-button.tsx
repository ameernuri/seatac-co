"use client";

import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CommonProps = {
  children: ReactNode;
  className?: string;
  emphasis?: "default" | "cta";
};

type LinkProps = CommonProps & {
  href: string;
};

type ButtonProps = CommonProps & Omit<ComponentProps<typeof Button>, "children"> & {
  href?: never;
};

export function SeatacPrimaryButton(props: LinkProps | ButtonProps) {
  const emphasis = props.emphasis ?? "default";
  const className = cn(
    "seatac-primary-button inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white transition-all",
    emphasis === "cta" ? "seatac-primary-button--cta" : "seatac-primary-button--default",
    props.className,
  );

  if (typeof (props as LinkProps).href === "string") {
    return (
      <a href={(props as LinkProps).href} className={className}>
        {props.children}
      </a>
    );
  }

  const { children, ...buttonProps } = props;

  return (
    <Button {...buttonProps} className={className}>
      {children}
    </Button>
  );
}
