"use client";

import { useCopy } from "@/lib/i18n";

export function PrototypeNotice() {
  const copy = useCopy();

  return (
    <p
      role="note"
      className="rounded-full border border-amber-300/70 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950"
    >
      {copy.prototypeNotice}
    </p>
  );
}
