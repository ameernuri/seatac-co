import type { Metadata } from "next";

import { CruiseTerminalPageScreen } from "@/components/cruise-terminal-page-screen";
import { getCruiseTerminalGuide } from "@/lib/cruise-terminals";

const guide = getCruiseTerminalGuide("smith-cove-cruise-terminal-pier-91");

export const metadata: Metadata = {
  title: "Smith Cove Cruise Terminal at Pier 91 | seatac.co",
  description: guide?.description,
};

export const dynamic = "force-dynamic";

export default function SmithCoveCruiseTerminalPage() {
  return <CruiseTerminalPageScreen slug="smith-cove-cruise-terminal-pier-91" />;
}
