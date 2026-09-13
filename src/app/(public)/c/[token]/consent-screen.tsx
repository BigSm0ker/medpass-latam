"use client";

import { useCallback, useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import { PrototypeNotice } from "@/components/prototype-notice";
import { LanguageToggle } from "@/components/language-toggle";
import { useCopy, useCopyRef } from "@/lib/i18n";
import {
  MEDPASS_STELLAR_NETWORK,
  MedPassPollarProvider,
  buildSettlementPayment,
  explorerUrl,
  findSettlementAsset,
  toSettlementResult,
} from "@/lib/pollar";
import { SignInGate } from "@/features/session/sign-in-gate";
import { useMedPassSession } from "@/features/session/use-medpass-session";
import { type EncounterRequestView, type PassportField } from "@/schemas/encounter";

type Stage = "loading" | "review" | "consenting" | "paying" | "done" | "gone";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-8">
      {children}
    </section>
  );
}

function ConsentFlow({ token }: { token: string }) {
  const copy = useCopy();
  const copyRef = useCopyRef();
  const session = useMedPassSession();
  const { enabledAssets, refreshAssets, sendPayment, network, verified } = usePollar();

  const [request, setRequest] = useState<EncounterRequestView | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [approved, setApproved] = useState<PassportField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ status: string; hash?: string } | null>(
    null,
  );

  // Load the request itself. This needs no session: the patient must be able to
  // see what is being asked before deciding whether to sign in at all.
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch(`/api/encounters/${token}`, { cache: "no-store" });
      if (cancelled) return;

      if (!response.ok) {
        setStage("gone");
        setError(copyRef.current.consent.notFound);
        return;
      }

      const view = (await response.json()) as EncounterRequestView;
      setRequest(view);
      setApproved(view.requestedFields);

      if (view.expired && view.status === "requested") {
        setStage("gone");
        setError(copyRef.current.consent.expired);
      } else if (view.status === "paid") {
        setStage("done");
      } else {
        setStage("review");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, copyRef]);

  useEffect(() => {
    if (verified) void refreshAssets();
  }, [verified, refreshAssets]);

  const toggle = (field: PassportField) =>
    setApproved((current) =>
      current.includes(field)
        ? current.filter((f) => f !== field)
        : [...current, field],
    );

  const respond = useCallback(
    async (decision: "approve" | "reject") => {
      setStage("consenting");
      setError(null);

      try {
        const response = await fetch(`/api/encounters/${token}/consent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision,
            approvedFields: decision === "approve" ? approved : [],
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? copy.consent.couldNotRecord);
        }

        if (decision === "reject") {
          setStage("gone");
          setError(copy.consent.declined);
          return;
        }

        setStage("paying");
      } catch (err) {
        setStage("review");
        setError(err instanceof Error ? err.message : copy.consent.couldNotRecord);
      }
    },
    [token, approved, copy],
  );

  /**
   * Pays the charge.
   *
   * Both the destination and the amount come from the server, never from this
   * page's state — a tampered client must not be able to redirect a real payment
   * or change what is owed.
   */
  const pay = useCallback(async () => {
    setError(null);

    try {
      const prep = await fetch(`/api/encounters/${token}/payment`, {
        cache: "no-store",
      });
      if (!prep.ok) {
        const body = await prep.json().catch(() => ({}));
        throw new Error(body.error ?? copy.consent.couldNotPrepare);
      }
      const { destination, amountUsdc } = (await prep.json()) as {
        destination: string;
        amountUsdc: string;
      };

      const asset =
        enabledAssets.step === "loaded"
          ? findSettlementAsset(enabledAssets.data.assets)
          : null;
      if (!asset) throw new Error(copy.consent.usdcUnavailable);

      const built = buildSettlementPayment({
        destination,
        amount: amountUsdc,
        asset,
        network,
      });
      if (!built.ok) throw new Error(built.message);

      const outcome = toSettlementResult(await sendPayment(built.params));

      await fetch(`/api/encounters/${token}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: outcome.status === "error" ? "error" : outcome.status,
          txHash: outcome.status === "error" ? null : outcome.hash,
          failureReason: outcome.status === "error" ? outcome.message : null,
        }),
      });

      if (outcome.status === "error") throw new Error(outcome.message);

      setReceipt({ status: outcome.status, hash: outcome.hash });
      setStage("done");
    } catch (err) {
      // The patient gets a sentence; the console gets the whole object. A
      // payment that fails on stage is only debuggable if the real shape of the
      // failure survives somewhere, and it does not belong on the receipt.
      console.error("[medpass] payment failed:", err);

      const detail =
        err instanceof Error ? err.message : typeof err === "string" ? err : "";
      setError(
        detail && detail !== "[object Object]" ? detail : copy.consent.paymentFailed,
      );
    }
  }, [token, enabledAssets, sendPayment, network, copy]);

  if (stage === "loading") {
    return (
      <Card>
        <p className="text-slate-600">{copy.consent.loading}</p>
      </Card>
    );
  }

  if (stage === "gone") {
    return (
      <Card>
        <p role="alert" className="text-slate-700">
          {error}
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
          {copy.consent.eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          {request?.providerLabel ?? copy.consent.aProvider}
        </h2>
        <p className="mt-1 text-slate-600">{request?.reason}</p>
        <p className="mt-5 text-4xl font-semibold tracking-tight">
          {request?.amountUsdc}{" "}
          <span className="text-lg font-medium text-slate-500">USDC</span>
        </p>
      </Card>

      {stage === "review" || stage === "consenting" ? (
        <Card>
          <h3 className="text-lg font-semibold">{copy.consent.askingTitle}</h3>
          <p className="mt-1 mb-4 text-sm text-slate-600">{copy.consent.askingBody}</p>

          <ul className="grid gap-2">
            {request?.requestedFields.map((field) => (
              <li key={field}>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={approved.includes(field)}
                    onChange={() => toggle(field)}
                    className="h-4 w-4"
                  />
                  <span className="font-medium">{copy.fields[field]}</span>
                </label>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-slate-500">{copy.consent.accessNote}</p>

          {session.state.step !== "signed_in" ? (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <SignInGate
                state={session.state}
                pollarSignedIn={session.pollarSignedIn}
                pollarReady={session.pollarReady}
                walletAddress={session.walletAddress}
                onOpenLogin={session.openLoginModal}
                onProve={() => void session.proveIdentity()}
                purpose={copy.consent.signInPurpose}
              />
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void respond("approve")}
                disabled={stage === "consenting"}
                className="rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
              >
                {stage === "consenting"
                  ? copy.consent.sharing
                  : copy.consent.shareAndContinue(approved.length)}
              </button>
              <button
                type="button"
                onClick={() => void respond("reject")}
                disabled={stage === "consenting"}
                className="rounded-xl border border-slate-300 px-5 py-2.5 font-semibold disabled:opacity-40"
              >
                {copy.consent.decline}
              </button>
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-4 font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </Card>
      ) : null}

      {stage === "paying" ? (
        <Card>
          <h3 className="text-lg font-semibold">{copy.consent.payTitle}</h3>
          <p className="mt-1 text-sm text-slate-600">{copy.consent.payBody}</p>
          <button
            type="button"
            onClick={() => void pay()}
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white"
          >
            {copy.consent.pay(request?.amountUsdc ?? "")}
          </button>
          {error ? (
            <p role="alert" className="mt-4 font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </Card>
      ) : null}

      {stage === "done" ? (
        <Card>
          <h3 className="text-lg font-semibold text-emerald-800">
            {receipt?.status === "pending"
              ? copy.consent.submitted
              : copy.consent.complete}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {receipt?.status === "pending"
              ? copy.consent.submittedBody
              : copy.consent.completeBody}
          </p>
          {receipt?.hash ? (
            <a
              className="mt-4 inline-block font-semibold text-emerald-800 underline"
              href={explorerUrl(receipt.hash, MEDPASS_STELLAR_NETWORK)}
              target="_blank"
              rel="noreferrer"
            >
              {copy.consent.verifyTx}
            </a>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}

export function ConsentScreen({ token }: { token: string }) {
  const copy = useCopy();

  return (
    <MedPassPollarProvider>
      <main className="min-h-screen bg-[linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-xl gap-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
              {copy.brand}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageToggle />
              <PrototypeNotice />
            </div>
          </header>
          <ConsentFlow token={token} />
          <p className="text-center text-xs text-slate-500">{copy.footerShort}</p>
        </div>
      </main>
    </MedPassPollarProvider>
  );
}
