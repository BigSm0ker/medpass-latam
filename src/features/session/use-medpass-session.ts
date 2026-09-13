"use client";

import { useCallback, useEffect, useState } from "react";
import { usePollar } from "@pollar/react";

/**
 * The server session, shared by every role.
 *
 * Extracted from the passport hook so the provider and consent screens reuse the
 * exact same proof-of-identity path. There is one way to become authenticated in
 * this product: sign a server-issued challenge with the Pollar wallet.
 */
export type SessionState =
  | { step: "anonymous" }
  | { step: "proving" }
  | { step: "signed_in"; address: string }
  | { step: "error"; message: string };

export function useMedPassSession() {
  const { isAuthenticated, verified, wallet, getClient, openLoginModal } = usePollar();
  const [state, setState] = useState<SessionState>({ step: "anonymous" });

  const refresh = useCallback(async () => {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) return;
    const body = (await response.json()) as { address: string | null };
    setState(
      body.address
        ? { step: "signed_in", address: body.address }
        : { step: "anonymous" },
    );
  }, []);

  // Pick up an existing server session on mount, so a returning user is not asked
  // to sign again on every page. Written as an inline async task rather than a
  // call to `refresh` so the state update happens after an await boundary.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (cancelled || !response.ok) return;

      const body = (await response.json()) as { address: string | null };
      if (cancelled) return;

      setState(
        body.address
          ? { step: "signed_in", address: body.address }
          : { step: "anonymous" },
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Exchanges a wallet signature for a server session.
   *
   * Gated on `verified` rather than `isAuthenticated`: a session restored
   * optimistically from browser storage has not been confirmed by Pollar's
   * server, and asking it to sign fails in confusing ways.
   */
  const proveIdentity = useCallback(async () => {
    if (!verified || !wallet?.address) return;

    setState({ step: "proving" });
    try {
      const challenge = await fetch("/api/auth/challenge", { cache: "no-store" });
      if (!challenge.ok) throw new Error("No se pudo iniciar el proceso de acceso.");
      const { message, token } = (await challenge.json()) as {
        message: string;
        token: string;
      };

      const proof = await getClient().stellar.sep53.signMessage(message);
      if (proof.status !== "signed") {
        throw new Error(proof.details ?? "Tu billetera no firmó la solicitud.");
      }

      const verify = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          signature: proof.signature,
          signerAddress: proof.signerAddress,
        }),
      });

      if (!verify.ok) {
        const body = await verify.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo verificar el inicio de sesión.");
      }

      const body = (await verify.json()) as { address: string };
      setState({ step: "signed_in", address: body.address });
    } catch (error) {
      setState({
        step: "error",
        message: error instanceof Error ? error.message : "Falló el inicio de sesión.",
      });
    }
  }, [verified, wallet?.address, getClient]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setState({ step: "anonymous" });
  }, []);

  return {
    state,
    walletAddress: wallet?.address ?? null,
    pollarSignedIn: isAuthenticated,
    pollarReady: isAuthenticated && verified,
    openLoginModal,
    proveIdentity,
    signOut,
    refresh,
  };
}
