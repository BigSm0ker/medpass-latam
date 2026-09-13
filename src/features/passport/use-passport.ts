"use client";

import { useCallback, useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import { emptyPassport, type Passport } from "@/schemas/passport";

type LoadState =
  | { step: "signed_out" }
  | { step: "proving" }
  | { step: "loading" }
  | { step: "ready"; passport: Passport; updatedAt: string | null }
  | { step: "error"; message: string };

/**
 * Owns the patient's session-and-passport lifecycle.
 *
 * The Pollar session proves wallet control in the browser; the server session
 * is what actually authorizes reads and writes. They are separate on purpose —
 * being logged in to Pollar is not by itself permission to read a passport, so
 * this hook exchanges the wallet signature for a server session before it will
 * fetch anything.
 */
export function usePassport() {
  const { isAuthenticated, verified, wallet, getClient } = usePollar();
  const [state, setState] = useState<LoadState>({ step: "signed_out" });
  const [saving, setSaving] = useState(false);
  const [serverAddress, setServerAddress] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ step: "loading" });
    const response = await fetch("/api/passport", { cache: "no-store" });

    if (response.status === 401) {
      setServerAddress(null);
      setState({ step: "signed_out" });
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setState({
        step: "error",
        message: body.error ?? "No se pudo cargar tu pasaporte.",
      });
      return;
    }

    const body = (await response.json()) as {
      passport: Passport;
      updatedAt: string | null;
    };
    setState({ step: "ready", passport: body.passport, updatedAt: body.updatedAt });
  }, []);

  /**
   * Exchanges a wallet signature for a server session.
   *
   * Gated on `verified` rather than `isAuthenticated`: a session restored
   * optimistically from storage has not been confirmed by Pollar's server, and
   * asking such a session to sign can fail confusingly.
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
      setServerAddress(body.address);
      await load();
    } catch (error) {
      setState({
        step: "error",
        message: error instanceof Error ? error.message : "Falló el inicio de sesión.",
      });
    }
  }, [verified, wallet?.address, getClient, load]);

  // Pick up an existing server session on mount so a returning patient is not
  // asked to sign again on every reload.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      if (cancelled || !response.ok) return;
      const body = (await response.json()) as { address: string | null };
      if (!body.address) return;
      setServerAddress(body.address);
      await load();
    })();

    return () => {
      cancelled = true;
    };
  }, [load]);

  const save = useCallback(async (passport: Passport) => {
    setSaving(true);
    try {
      const response = await fetch("/api/passport", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passport),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "No se pudo guardar tu pasaporte.");
      }

      const body = (await response.json()) as {
        passport: Passport;
        updatedAt: string | null;
      };
      setState({ step: "ready", passport: body.passport, updatedAt: body.updatedAt });
      return { ok: true as const };
    } catch (error) {
      return {
        ok: false as const,
        message:
          error instanceof Error ? error.message : "No se pudo guardar tu pasaporte.",
      };
    } finally {
      setSaving(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setServerAddress(null);
    setState({ step: "signed_out" });
  }, []);

  return {
    state,
    saving,
    serverAddress,
    walletAddress: wallet?.address ?? null,
    pollarReady: isAuthenticated && verified,
    proveIdentity,
    save,
    signOut,
    reload: load,
    emptyPassport,
  };
}
