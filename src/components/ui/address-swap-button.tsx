"use client";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddressSwapButton({
  className,
  compact = false,
  grouped = false,
  iconOnly = false,
  onClick,
}: {
  className?: string;
  compact?: boolean;
  grouped?: boolean;
  iconOnly?: boolean;
  onClick: () => void;
}) {
  const button = (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-label="Switch pickup and drop-off"
      className={cn(
        grouped
          ? "h-14 rounded-none border-y border-x-0 border-[#2d6a4f]/15 bg-white px-4 text-[#5a7a6e] shadow-none hover:bg-[#f8f7f4]"
          : "rounded-full border-[#2d6a4f]/15 bg-white text-[#5a7a6e] hover:bg-[#f8f7f4]",
        compact ? "h-10 px-4" : grouped ? "h-14 px-4" : "h-11 px-4",
        className,
      )}
    >
      <ArrowRightLeft className={cn("size-4", !iconOnly && "mr-2")} />
      {!iconOnly ? "Switch pickup and drop-off" : null}
    </Button>
  );

  if (grouped) {
    return button;
  }

  return <div className={cn("flex justify-center", className)}>{button}</div>;
}
