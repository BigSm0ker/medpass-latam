"use client";

import { useMemo, type ReactNode } from "react";
import { PollarProvider } from "@pollar/react";
import "@pollar/react/styles.css";
import { hasClientPollarKey } from "@/lib/env/client";
import { createPollarClientConfig } from "./config";

/**
 * The application's single Pollar mounting point.
 *
 * `PollarProvider` constructs its client on mount and locks it for the
 * lifetime of the component, so the configuration is memoized to avoid
 * rebuilding it on every render.
 *
 * When no publishable key is configured the provider is skipped entirely and
 * the subtree renders without Pollar rather than crashing. The demo's medical
 * pages must stay reachable even when wallet features are unavailable.
 */
export function MedPassPollarProvider({ children }: { children: ReactNode }) {
  const configured = hasClientPollarKey();
  const config = useMemo(
    () => (configured ? createPollarClientConfig() : null),
    [configured],
  );

  if (!config) {
    return <>{children}</>;
  }

  return <PollarProvider client={config}>{children}</PollarProvider>;
}
