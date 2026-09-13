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
  type EncounterHistoryItem,
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

const STATUS_LABELS: Record<string, string> = {
  requested: "Esperando al paciente",
  consented: "Aprobado, falta el pago",
  rejected: "Rechazado",
  paid: "Pagado",
  revoked: "Acceso revocado",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "confirmando en la red",
  success: "completado",
  error: "falló",
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
  const [reason, setReason] = useState("Consulta general");
  const [label, setLabel] = useState("Clínica San Martín");
  const [fields, setFields] = useState<PassportField[]>(["blood_type", "allergies"]);
  const [creating, setCreating] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState<Disclosure | null>(null);
  const [refusal, setRefusal] = useState<string | null>(null);
  const [history, setHistory] = useState<EncounterHistoryItem[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

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
        throw new Error(body.error ?? "No se pudo crear el cobro.");
      }

      const body = (await response.json()) as { token: string };
      setToken(body.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el cobro.");
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

  // A provider's charge history — what makes this a tool used every day rather
  // than a one-shot demo. Refetched periodically so a payment that just
  // completed shows up without a manual reload.
  useEffect(() => {
    if (session.state.step !== "signed_in") return;

    let cancelled = false;
    const tick = async () => {
      const response = await fetch("/api/encounters/history", { cache: "no-store" });
      if (cancelled || !response.ok) return;
      const body = (await response.json()) as { history: EncounterHistoryItem[] };
      setHistory(body.history);
      setHistoryLoaded(true);
    };

    void tick();
    const timer = setInterval(() => void tick(), 6000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session.state.step]);

  if (session.state.step !== "signed_in") {
    return (
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Inicio de sesión del proveedor</h2>
        <SignInGate
          state={session.state}
          pollarSignedIn={session.pollarSignedIn}
          pollarReady={session.pollarReady}
          walletAddress={session.walletAddress}
          onOpenLogin={session.openLoginModal}
          onProve={() => void session.proveIdentity()}
          purpose="Inicia sesión para que los pacientes vean quién pregunta, y para que el pago llegue a tu billetera."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">Nuevo cobro</h2>
          <button
            type="button"
            onClick={() => void session.signOut()}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Clínica o profesional</span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Monto (USDC)</span>
            <input
              value={amount}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value.trim())}
              className="rounded-xl border border-slate-300 px-3 py-2 font-mono"
            />
          </label>
        </div>

        <label className="mt-4 grid gap-1 text-sm">
          <span className="font-semibold text-slate-700">Motivo</span>
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-700">
            Información que necesitas del paciente
          </legend>
          <p className="mt-1 mb-3 text-xs text-slate-500">
            Pide lo mínimo. El paciente aprueba cada elemento por separado y puede
            aprobar menos de lo que pediste.
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
          {creating ? "Creando…" : "Crear cobro y mostrar QR"}
        </button>
      </Card>

      {patientUrl ? (
        <Card>
          <h2 className="text-xl font-semibold">Muéstrale esto al paciente</h2>
          <p className="mt-2 text-sm text-slate-600">
            El código lleva solo una referencia aleatoria. No contiene información
            médica ni la identidad del paciente.
          </p>
          <div className="mt-5 grid items-center gap-5 sm:grid-cols-[auto_1fr]">
            <div className="justify-self-center rounded-2xl bg-white p-4 shadow-inner">
              <QRCodeSVG value={patientUrl} size={196} level="M" />
            </div>
            <div className="grid gap-2 text-sm">
              <p className="font-semibold text-slate-700">O abre este enlace</p>
              <a
                href={patientUrl}
                className="font-mono text-xs break-all text-emerald-800 underline"
              >
                {patientUrl}
              </a>
              <p className="mt-2 text-slate-500">Esperando la respuesta del paciente…</p>
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
            <h2 className="text-xl font-semibold">Información autorizada</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
              {disclosure.encounter.approvedFields.length} de{" "}
              {disclosure.encounter.requestedFields.length} aprobados
            </span>
          </div>

          {disclosure.encounter.consentExpiresAt ? (
            <p className="mt-1 text-xs text-slate-500">
              El acceso expira a las{" "}
              {new Date(disclosure.encounter.consentExpiresAt).toLocaleTimeString()}
            </p>
          ) : null}

          <dl className="mt-4 grid gap-3">
            {disclosure.passport.bloodType !== undefined ? (
              <Row label="Tipo de sangre" value={disclosure.passport.bloodType} />
            ) : null}
            {disclosure.passport.allergies ? (
              <Row
                label="Alergias críticas"
                value={disclosure.passport.allergies.join(", ")}
              />
            ) : null}
            {disclosure.passport.medications ? (
              <Row
                label="Medicamentos"
                value={disclosure.passport.medications.join(", ")}
              />
            ) : null}
            {disclosure.passport.conditions ? (
              <Row
                label="Condiciones"
                value={disclosure.passport.conditions.join(", ")}
              />
            ) : null}
            {disclosure.passport.emergencyContactName !== undefined ? (
              <Row
                label="Contacto de emergencia"
                value={`${disclosure.passport.emergencyContactName ?? "—"} · ${
                  disclosure.passport.emergencyContactPhone ?? "—"
                }`}
              />
            ) : null}
          </dl>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">
              Pago:{" "}
              <strong>
                {disclosure.payment
                  ? (PAYMENT_STATUS_LABELS[disclosure.payment.status] ??
                    disclosure.payment.status)
                  : "esperando al paciente"}
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
                Ver la transacción
              </a>
            ) : null}
          </div>
        </Card>
      ) : null}

      {historyLoaded ? (
        <Card>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Historial de cobros</h2>
            <span className="text-xs text-slate-500">
              {history.length === 0
                ? "Todavía no hay cobros"
                : `${history.length} más recientes`}
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Cada cobro que has creado, con lo que el paciente aprobó y un enlace
            verificable al pago on-chain cuando existe.
          </p>

          {history.length === 0 ? (
            <p className="text-sm text-slate-500">
              Crea tu primer cobro arriba para verlo aparecer aquí.
            </p>
          ) : (
            <ul className="grid gap-3">
              {history.map((item) => (
                <li
                  key={item.token}
                  className="grid gap-2 rounded-xl border border-slate-200 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.reason ?? item.providerLabel ?? "Consulta"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()} ·{" "}
                      {item.approvedFields.length} de {item.requestedFields.length}{" "}
                      campos aprobados
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {item.amountUsdc} USDC
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                    {item.payment?.txHash ? (
                      <a
                        href={explorerUrl(item.payment.txHash, MEDPASS_STELLAR_NETWORK)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-800 underline"
                      >
                        Ver transacción
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
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
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Proveedor</h1>
            </div>
            <PrototypeNotice />
          </header>
          <ChargeConsole />
        </div>
      </main>
    </MedPassPollarProvider>
  );
}
