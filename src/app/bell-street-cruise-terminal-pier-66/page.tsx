import type { Metadata } from "next";

import { CruiseTerminalPageScreen } from "@/components/cruise-terminal-page-screen";
import { getCruiseTerminalGuide } from "@/lib/cruise-terminals";

const guide = getCruiseTerminalGuide("bell-street-cruise-terminal-pier-66");

export const metadata: Metadata = {
  title: "Bell Street Cruise Terminal at Pier 66 | seatac.co",
  description: guide?.description,
};

export const dynamic = "force-dynamic";

export default function BellStreetCruiseTerminalPage() {
  return <CruiseTerminalPageScreen slug="bell-street-cruise-terminal-pier-66" />;
}
