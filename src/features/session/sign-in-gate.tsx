"use client";

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
          Iniciar sesión con Pollar
        </button>
      ) : (
        <button
          type="button"
          onClick={onProve}
          disabled={!pollarReady || state.step === "proving"}
          className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          {state.step === "proving"
            ? "Esperando tu billetera…"
            : pollarReady
              ? "Confirmar que eres tú"
              : "Confirmando tu sesión…"}
        </button>
      )}

      <p className="text-xs text-slate-500">
        Firmar demuestra que controlas esta billetera. No autoriza ningún pago ni
        mueve fondos.
      </p>

      {walletAddress ? (
        <p className="font-mono text-xs break-all text-slate-400">{walletAddress}</p>
      ) : null}
    </div>
  );
}
