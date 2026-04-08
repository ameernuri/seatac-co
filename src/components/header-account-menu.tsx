"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type HeaderAccountMenuProps = {
  label: string;
};

export function HeaderAccountMenu({ label }: HeaderAccountMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      const result = await fetch("/api/client-auth/sign-out", {
        method: "POST",
        credentials: "include",
      });

      if (!result.ok) {
        throw new Error("Sign out failed");
      }

      router.push("/");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="site-topbar-account-trigger">
        <span>{label}</span>
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={<Link href="/account/bookings" className="w-full" />}
          className="w-full cursor-pointer"
        >
          <UserCircle2 className="size-4" />
          My bookings
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href="/account" className="w-full" />}
          className="w-full cursor-pointer"
        >
          <UserCircle2 className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          className="w-full cursor-pointer justify-start"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
