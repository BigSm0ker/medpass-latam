"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePollar } from "@pollar/react";
import { PrototypeNotice } from "@/components/prototype-notice";
import {
  MEDPASS_STELLAR_NETWORK,
  MedPassPollarProvider,
  buildSettlementPayment,
  canSettle,
  claimSettlementFaucet,
  explorerUrl,
  findSettlementAsset,
  findSettlementBalance,
  listSettlementFaucets,
  toSettlementResult,
  type ClaimableRule,
  type SettlementResult,
} from "@/lib/pollar";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold tracking-[0.14em] text-slate-500 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 py-2 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-mono text-sm break-all text-slate-900">{value}</span>
    </div>
  );
}

function SpikeConsole() {
  const {
    isAuthenticated,
    verified,
    wallet,
    network,
    login,
    logout,
    openLoginModal,
    walletBalance,
    refreshWalletBalance,
    enabledAssets,
    refreshAssets,
    setTrustline,
    sendPayment,
    txHistory,
    getClient,
  } = usePollar();

  const [rules, setRules] = useState<ClaimableRule[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");
  const [result, setResult] = useState<SettlementResult | null>(null);

  const note = useCallback((message: string) => {
    setLog((entries) =>
      [`${new Date().toLocaleTimeString()} — ${message}`, ...entries].slice(0, 12),
    );
  }, []);

  // Load wallet-scoped state once the session is server-verified. Gating on
  // `verified` rather than `isAuthenticated` avoids firing requests against an
  // optimistically restored session that the server has not confirmed.
  useEffect(() => {
    if (!verified) return;
    void refreshWalletBalance();
    void refreshAssets();
  }, [verified, refreshWalletBalance, refreshAssets]);

  const settlementAsset = useMemo(
    () =>
      enabledAssets.step === "loaded"
        ? findSettlementAsset(enabledAssets.data.assets)
        : null,
    [enabledAssets],
  );

  const settlementBalance = useMemo(() => {
    if (walletBalance.step !== "loaded" || !settlementAsset) return null;
    return findSettlementBalance(walletBalance.data.balances, settlementAsset);
  }, [walletBalance, settlementAsset]);

  const loadRules = useCallback(async () => {
    setBusy("rules");
    try {
      setRules(await listSettlementFaucets(getClient()));
      note("Loaded distribution rules.");
    } catch (error) {
      note(
        error instanceof Error ? error.message : "Failed to load distribution rules.",
      );
    } finally {
      setBusy(null);
    }
  }, [getClient, note]);

  const claim = useCallback(
    async (ruleId: string) => {
      setBusy(ruleId);
      const outcome = await claimSettlementFaucet(getClient(), ruleId);
      note(
        outcome.status === "claimed"
          ? `Claimed ${outcome.amount} ${outcome.assetCode}${outcome.txHash ? ` (${outcome.txHash})` : ""}.`
          : `Claim failed: ${outcome.message}`,
      );
      if (outcome.status === "claimed") {
        await refreshWalletBalance();
        await loadRules();
      }
      setBusy(null);
    },
    [getClient, note, refreshWalletBalance, loadRules],
  );

  const establishTrustline = useCallback(async () => {
    if (!settlementAsset) return;
    setBusy("trustline");
    const outcome = await setTrustline({
      code: settlementAsset.code,
      issuer: settlementAsset.issuer,
    });
    note(
      `Trustline: ${outcome.status}${outcome.status === "error" ? ` — ${outcome.details ?? ""}` : ""}`,
    );
    await refreshAssets();
    setBusy(null);
  }, [settlementAsset, setTrustline, refreshAssets, note]);

  const pay = useCallback(async () => {
    if (!settlementAsset) return;

    const request = buildSettlementPayment({
      destination,
      amount,
      asset: settlementAsset,
      network,
    });

    if (!request.ok) {
      setResult({ status: "error", message: request.message });
      note(`Rejected before submission: ${request.reason}`);
      return;
    }

    setBusy("pay");
    setResult(null);
    try {
      const outcome = toSettlementResult(await sendPayment(request.params));
      setResult(outcome);
      note(
        outcome.status === "error"
          ? `Payment error: ${outcome.message}`
          : `Payment ${outcome.status}: ${outcome.hash}`,
      );
      await refreshWalletBalance();
    } catch (error) {
      const message = error instanceof Error ? error.message : "The payment failed.";
      setResult({ status: "error", message });
      note(`Payment threw: ${message}`);
    } finally {
      setBusy(null);
    }
  }, [
    settlementAsset,
    destination,
    amount,
    network,
    sendPayment,
    refreshWalletBalance,
    note,
  ]);

  const affordable = canSettle(settlementBalance?.available, amount);

  return (
    <div className="mx-auto grid max-w-5xl gap-5 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Pollar spike — Phase 1
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Development-only. Network is pinned to{" "}
            <strong>{MEDPASS_STELLAR_NETWORK}</strong>
            {MEDPASS_STELLAR_NETWORK === "mainnet"
              ? " — anything submitted from here moves real funds."
              : "; Mainnet requires explicit approval."}
          </p>
        </div>
        <PrototypeNotice />
      </header>

      <Section title="Session">
        <Row label="Authenticated" value={String(isAuthenticated)} />
        <Row label="Server verified" value={String(verified)} />
        <Row label="Network (SDK)" value={network} />
        <Row label="Wallet custody" value={wallet?.custody ?? "—"} />
        <Row label="Wallet provider" value={wallet?.provider ?? "—"} />
        <Row label="Address" value={wallet?.address ?? "—"} />
        <Row label="Exists on Stellar" value={String(wallet?.existsOnStellar ?? "—")} />
        <div className="mt-4 flex flex-wrap gap-2">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={openLoginModal}
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Open login modal
              </button>
              <button
                type="button"
                onClick={() => login({ provider: "google" })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Login with Google
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold"
            >
              Log out
            </button>
          )}
        </div>
      </Section>

      <Section title="Balance and assets">
        <Row label="Balance state" value={walletBalance.step} />
        <Row label="Assets state" value={enabledAssets.step} />
        <Row
          label="USDC issuer"
          value={settlementAsset ? settlementAsset.issuer : "not enabled for this app"}
        />
        <Row
          label="Trustline"
          value={
            settlementAsset
              ? `${settlementAsset.trustlineEstablished ? "established" : "missing"}${settlementAsset.sponsored ? " (sponsored)" : ""}`
              : "—"
          }
        />
        <Row label="USDC held" value={settlementBalance?.balance ?? "—"} />
        <Row label="USDC spendable" value={settlementBalance?.available ?? "—"} />
        {walletBalance.step === "error" ? (
          <p className="mt-2 text-sm text-red-700">{walletBalance.message}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refreshWalletBalance()}
            disabled={!verified}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Refresh balance
          </button>
          <button
            type="button"
            onClick={() => void refreshAssets()}
            disabled={!verified}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Refresh assets
          </button>
          {settlementAsset && !settlementAsset.trustlineEstablished ? (
            <button
              type="button"
              onClick={() => void establishTrustline()}
              disabled={busy === "trustline"}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {busy === "trustline" ? "Establishing…" : "Establish USDC trustline"}
            </button>
          ) : null}
        </div>
      </Section>

      {/*
        Both sections below are TestNet instruments: distribution rules are a
        faucet that does not exist on Mainnet, and the payment form submits a
        transfer with no confirmation step. Harmless against play money; on
        Mainnet the same button moves real funds irreversibly on one click, so
        the pinned network gates them rather than a reviewer's memory.
      */}
      {MEDPASS_STELLAR_NETWORK === "testnet" ? (
        <>
          <Section title="TestNet asset acquisition (distribution rules)">
            <button
              type="button"
              onClick={() => void loadRules()}
              disabled={!verified || busy === "rules"}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              {busy === "rules" ? "Loading…" : "List distribution rules"}
            </button>
            {rules?.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No distribution rules configured for this application.
              </p>
            ) : null}
            <ul className="mt-3 grid gap-2">
              {rules?.map((rule) => (
                <li
                  key={rule.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2"
                >
                  <span className="text-sm">
                    {rule.name} — {rule.amount} {rule.assetCode}
                    {rule.claimable
                      ? ""
                      : ` (unavailable${rule.reason ? `: ${rule.reason}` : ""})`}
                  </span>
                  <button
                    type="button"
                    onClick={() => void claim(rule.id)}
                    disabled={!rule.claimable || busy === rule.id}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {busy === rule.id ? "Claiming…" : "Claim"}
                  </button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="TestNet USDC payment">
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Destination (Stellar public key)</span>
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value.trim())}
                  placeholder="G..."
                  className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-slate-600">Amount (USDC)</span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.trim())}
                  inputMode="decimal"
                  className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                />
              </label>
            </div>
            {!affordable && settlementBalance ? (
              <p className="mt-2 text-sm text-amber-800">
                Spendable USDC does not cover this amount.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void pay()}
              disabled={!verified || !settlementAsset || busy === "pay"}
              className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {busy === "pay" ? "Submitting…" : "Send TestNet payment"}
            </button>

            {result ? (
              <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
                <Row label="Status" value={result.status} />
                {result.status !== "error" ? (
                  <>
                    <Row label="Hash" value={result.hash} />
                    <a
                      className="mt-2 inline-block font-semibold text-emerald-800 underline"
                      href={explorerUrl(result.hash, network)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Stellar Expert
                    </a>
                  </>
                ) : (
                  <p className="text-red-700">{result.message}</p>
                )}
              </div>
            ) : null}
          </Section>
        </>
      ) : (
        <Section title="TestNet-only tools">
          <p className="text-sm text-amber-800">
            The faucet and the raw payment form are hidden because this build is pinned
            to <strong>{MEDPASS_STELLAR_NETWORK}</strong>. A payment here would move
            real funds with no confirmation. Use the product flow — open a charge on{" "}
            <code className="font-mono">/charge</code> and pay it from the QR — which
            states the amount and destination before anything is signed.
          </p>
        </Section>
      )}

      <Section title="Transaction history">
        <Row label="History state" value={txHistory.step} />
        <Row
          label="Records"
          value={
            txHistory.step === "loaded" ? String(txHistory.data.records.length) : "—"
          }
        />
        <button
          type="button"
          onClick={() => void getClient().fetchTxHistory()}
          disabled={!verified}
          className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Fetch history
        </button>
      </Section>

      <Section title="Activity log">
        {log.length === 0 ? (
          <p className="text-sm text-slate-500">No activity yet.</p>
        ) : (
          <ul className="grid gap-1 font-mono text-xs text-slate-700">
            {log.map((entry, index) => (
              <li key={`${entry}-${index}`}>{entry}</li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

export function PollarSpike() {
  return (
    <MedPassPollarProvider>
      <SpikeConsole />
    </MedPassPollarProvider>
  );
}
