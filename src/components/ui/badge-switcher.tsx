"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeSwitchOption = {
  value: string;
  label: string;
};

type BadgeSwitcherProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: BadgeSwitchOption[];
  className?: string;
  itemClassName?: string;
  "aria-label"?: string;
};

export function BadgeSwitcher({
  value,
  onValueChange,
  options,
  className,
  itemClassName,
  "aria-label": ariaLabel,
}: BadgeSwitcherProps) {
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-2 rounded-[1.25rem] border border-[#2d6a4f]/10 bg-white p-1.5",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-[#2d6a4f] text-white shadow-[0_6px_18px_rgba(45,106,79,0.18)]"
                : "bg-[#f8f7f4] text-[#4f6f64] hover:bg-[#eef4f0] hover:text-[#1a3d34]",
              itemClassName,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
