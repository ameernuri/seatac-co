"use client";

import { ArrowRightLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AddressSwapButton({
  className,
  compact = false,
  onClick,
}: {
  className?: string;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        className={cn(
          "rounded-full border-[#2d6a4f]/15 bg-white text-[#5a7a6e] hover:bg-[#f8f7f4]",
          compact ? "h-10 px-4" : "h-11 px-4",
        )}
      >
        <ArrowRightLeft className="mr-2 size-4" />
        Switch pickup and drop-off
      </Button>
    </div>
  );
}
