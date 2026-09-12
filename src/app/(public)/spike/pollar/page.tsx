import { notFound } from "next/navigation";
import { PollarSpike } from "./pollar-spike";

/**
 * Phase 1 technical spike.
 *
 * This route exists to prove the Pollar TestNet path, not to ship. It is
 * removed from production builds so the public demo cannot expose a faucet
 * claim or a raw payment form.
 */
export default function PollarSpikePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <PollarSpike />;
}
