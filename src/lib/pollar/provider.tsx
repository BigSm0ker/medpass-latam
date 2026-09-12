"use client";

import { useMemo, type ReactNode } from "react";
import { PollarProvider } from "@pollar/react";
import "@pollar/react/styles.css";
import { hasClientPollarKey } from "@/lib/env/client";
import { createPollarClientConfig } from "./config";

/**
 * Shown instead of the wallet UI when no publishable key is configured.
 *
 * An earlier version rendered `children` bare in this case, which was a defect:
 * every consumer of this provider calls `usePollar()`, and that hook throws
 * without a provider above it. The build surfaced it first — CI has no
 * environment variables, so prerendering took this branch and crashed — but the
 * same thing would have happened at runtime on any deployment missing the key,
 * which is worse because it would have hit a user.
 *
 * Failing visibly here is the point. A silently degraded page would leave
 * someone clicking a sign-in button that can never work.
 */
function PollarUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-10">
      <section className="max-w-md rounded-3xl border border-amber-200 bg-amber-50/80 p-6 text-center sm:p-8">
        <h1 className="text-xl font-semibold text-amber-950">
          Wallet features are unavailable
        </h1>
        <p className="mt-3 leading-7 text-amber-900">
          This deployment has no Pollar publishable key configured, so sign-in and
          payments cannot run. Everything else about the project is unaffected.
        </p>
        <p className="mt-4 text-sm text-amber-800">
          If you are running this yourself, set{" "}
          <code className="font-mono">NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY</code> and
          rebuild — the value is inlined at build time, not read at runtime.
        </p>
      </section>
    </main>
  );
}

/**
 * The application's single Pollar mounting point.
 *
 * `PollarProvider` constructs its client on mount and locks it for the lifetime
 * of the component, so the configuration is memoized rather than rebuilt on
 * every render.
 */
export function MedPassPollarProvider({ children }: { children: ReactNode }) {
  const configured = hasClientPollarKey();
  const config = useMemo(
    () => (configured ? createPollarClientConfig() : null),
    [configured],
  );

  if (!config) {
    return <PollarUnavailable />;
  }

  return <PollarProvider client={config}>{children}</PollarProvider>;
}
