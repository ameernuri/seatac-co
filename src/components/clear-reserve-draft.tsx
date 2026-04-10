"use client";

import { useEffect } from "react";

export function ClearReserveDraft({ storageKey }: { storageKey: string }) {
  useEffect(() => {
    window.sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return null;
}
