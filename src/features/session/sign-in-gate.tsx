"use client";

import { useCopy } from "@/lib/i18n";
import type { SessionState } from "./use-medpass-session";

/**
 * The shared sign-in prompt.
 *
 * Says in one sentence what signing does and — just as importantly — what it
 * does not do. A wallet signature prompt that appears without explanation reads
 * like a payment request, and a patient who fears it costs money will not sign.
 */
export function SignInGate({
  state,
  pollarSignedIn,
  pollarReady,
  walletAddress,
  onOpenLogin,
  onProve,
  purpose,
}: {
  state: SessionState;
  pollarSignedIn: boolean;
  pollarReady: boolean;
  walletAddress: string | null;
  onOpenLogin: () => void;
  onProve: () => void;
  purpose: string;
}) {
  const copy = useCopy();

  return (
    <div className="grid gap-4">
      <p className="text-slate-600">{purpose}</p>

      {state.step === "error" ? (
        <p role="alert" className="font-medium text-red-700">
          {state.message}
        </p>
      ) : null}

      {!pollarSignedIn ? (
        <button
          type="button"
          onClick={onOpenLogin}
          className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white"
        >
          {copy.signIn.withPollar}
        </button>
      ) : (
        <button
          type="button"
          onClick={onProve}
          disabled={!pollarReady || state.step === "proving"}
          className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          {state.step === "proving"
            ? copy.signIn.waitingWallet
            : pollarReady
              ? copy.signIn.confirmIdentity
              : copy.signIn.confirmingSession}
        </button>
      )}

      <p className="text-xs text-slate-500">{copy.signIn.signatureNote}</p>

      {walletAddress ? (
        <p className="font-mono text-xs break-all text-slate-400">{walletAddress}</p>
      ) : null}
    </div>
  );
}
