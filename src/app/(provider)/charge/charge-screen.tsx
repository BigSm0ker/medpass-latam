"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { PrototypeNotice } from "@/components/prototype-notice";
import {
  MedPassPollarProvider,
  explorerUrl,
  MEDPASS_STELLAR_NETWORK,
} from "@/lib/pollar";
import { SignInGate } from "@/features/session/sign-in-gate";
import { useMedPassSession } from "@/features/session/use-medpass-session";
import {
  FIELD_LABELS,
  PASSPORT_FIELDS,
  type DisclosedPassport,
  type PassportField,
} from "@/schemas/encounter";

type Disclosure = {
  encounter: {
    amountUsdc: string;
    status: string;
    consentExpiresAt: string | null;
    approvedFields: PassportField[];
    requestedFields: PassportField[];
  };
  passport: DisclosedPassport;
  payment: { status: string; txHash: string | null } | null;
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-8">
      {children}
    </section>
  );
}

function ChargeConsole() {
  const session = useMedPassSession();
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState("General consultation");
  const [label, setLabel] = useState("Clínica San Martín");
  const [fields, setFields] = useState<PassportField[]>(["blood_type", "allergies"]);
  const [creating, setCreating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState<Disclosure | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);

  const patientUrl = useMemo(
    () =>
      token && typeof window !== "undefined"
        ? `${window.location.origin}/c/${token}`
        : null,
    [token],
  );

  const createCharge = useCallback(async () => {
    setCreating(true);
    setError(null);
    setDisclosure(null);
    setRefusal(null);

    try {
      const response = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsdc: amount,
          reason,
          providerLabel: label,
          requestedFields: fields,
          consentMinutes: 30,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not create the charge.");
      }

      const body = (await response.json()) as { token: string };
      setToken(body.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the charge.");
    } finally {
      setCreating(false);
    }
  }, [amount, reason, label, fields]);

  // Poll for the patient's answer while a charge is open. A clinician should see
  // the record appear without being told to refresh.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const tick = async () => {
      const response = await fetch(`/api/encounters/${token}/disclosure`, {
        cache: "no-store",
      });
      if (cancelled) return;

      if (response.ok) {
        setDisclosure((await response.json()) as Disclosure);
        setRefusal(null);
        return;
      }

      const body = await response.json().catch(() => ({}));
      setDisclosure(null);
      setRefusal(body.error ?? null);
    };

    void tick();
    const timer = setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [token]);

  if (session.state.step !== "signed_in") {
    return (
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Provider sign-in</h2>
        <SignInGate
          state={session.state}
          pollarSignedIn={session.pollarSignedIn}
          pollarReady={session.pollarReady}
          walletAddress={session.walletAddress}
          onOpenLogin={session.openLoginModal}
          onProve={() => void session.proveIdentity()}
          purpose="Sign in so patients can see who is asking, and so the payment reaches your wallet."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">New charge</h2>
          <button
            type="button"
            onClick={() => void session.signOut()}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold"
          >
            Sign out
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Clinic or professional</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Amount (USDC)</span>
            <input
              value={amount}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value.trim())}
              className="rounded-xl border border-slate-300 px-3 py-2 font-mono"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-1 text-sm">
          <span className="font-semibold text-slate-700">Reason</span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-700">
            Information you need from the patient
          </legend>
          <p className="mt-1 mb-3 text-xs text-slate-500">
            Ask for the minimum. The patient approves each item separately and can
            approve fewer than you request.
          </p>
          <div className="flex flex-wrap gap-2">
            {PASSPORT_FIELDS.map((field) => {
              const active = fields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setFields((current) =>
                      current.includes(field)
                        ? current.filter((f) => f !== field)
                        : [...current, field],
                    )
                  }
                  className={
                    active
                      ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  }
                >
                  {FIELD_LABELS[field]}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="mt-4 font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void createCharge()}
          disabled={creating || fields.length === 0}
          className="mt-6 rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          {creating ? "Creating…" : "Create charge and show QR"}
        </button>
      </Card>

      {patientUrl ? (
        <Card>
          <h2 className="text-xl font-semibold">Show this to the patient</h2>
          <p className="mt-2 text-sm text-slate-600">
            The code carries only a random reference. It contains no medical information
            and no patient identity.
          </p>
          <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
            <div className="justify-self-center rounded-2xl bg-white p-4 shadow-inner">
              <QRCodeSVG value={patientUrl} size={196} level="M" />
            </div>
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-slate-700">Or open this link</p>
              <a
                href={patientUrl}
                className="font-mono text-xs break-all text-emerald-800 underline"
              >
                {patientUrl}
              </a>
              <p className="mt-2 text-slate-500">Waiting for the patient to respond…</p>
            </div>
          </div>
        </Card>
      ) : null}

      {refusal ? (
        <Card>
          <p role="status" className="text-slate-700">
            {refusal}
          </p>
        </Card>
      ) : null}

      {disclosure ? (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-semibold">Authorized information</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              {disclosure.encounter.approvedFields.length} of{" "}
              {disclosure.encounter.requestedFields.length} approved
            </span>
          </div>

          {disclosure.encounter.consentExpiresAt ? (
            <p className="mt-1 text-xs text-slate-500">
              Access expires{" "}
              {new Date(disclosure.encounter.consentExpiresAt).toLocaleTimeString()}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-3">
            {disclosure.passport.bloodType !== undefined ? (
              <Row label="Blood type" value={disclosure.passport.bloodType} />
            ) : null}
            {disclosure.passport.allergies ? (
              <Row
                label="Critical allergies"
                value={disclosure.passport.allergies.join(", ")}
              />
            ) : null}
            {disclosure.passport.medications ? (
              <Row
                label="Medications"
                value={disclosure.passport.medications.join(", ")}
              />
            ) : null}
            {disclosure.passport.conditions ? (
              <Row
                label="Conditions"
                value={disclosure.passport.conditions.join(", ")}
              />
            ) : null}
            {disclosure.passport.emergencyContactName !== undefined ? (
              <Row
                label="Emergency contact"
                value={`${disclosure.passport.emergencyContactName ?? "—"} · ${
                  disclosure.passport.emergencyContactPhone ?? "—"
                }`}
              />
            ) : null}
          </dl>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">
              Payment:{" "}
              <strong>
                {disclosure.payment
                  ? disclosure.payment.status
                  : "awaiting the patient"}
              </strong>{" "}
              · {disclosure.encounter.amountUsdc} USDC
            </p>
            {disclosure.payment?.txHash ? (
              <a
                className="mt-1 inline-block text-sm font-semibold text-emerald-800 underline"
                href={explorerUrl(disclosure.payment.txHash, MEDPASS_STELLAR_NETWORK)}
                target="_blank"
                rel="noreferrer"
              >
                View the transaction
              </a>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 rounded-xl bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="text-slate-900">{value || "—"}</dd>
    </div>
  );
}

export function ChargeScreen() {
  return (
    <MedPassPollarProvider>
      <main className="min-h-screen bg-[linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-3xl gap-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                MedPass LATAM
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Provider</h1>
            </div>
            <PrototypeNotice />
          </header>
          <ChargeConsole />
        </div>
      </main>
    </MedPassPollarProvider>
  );
}
