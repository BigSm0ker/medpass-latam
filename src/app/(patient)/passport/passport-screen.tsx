"use client";

import { usePollar } from "@pollar/react";
import { PrototypeNotice } from "@/components/prototype-notice";
import { MedPassPollarProvider } from "@/lib/pollar";
import { PassportForm } from "@/features/passport/passport-form";
import { usePassport } from "@/features/passport/use-passport";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
              MedPass LATAM
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Medical passport
            </h1>
          </div>
          <PrototypeNotice />
        </header>
        {children}
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur sm:p-8">
      {children}
    </section>
  );
}

function Inner() {
  const { openLoginModal, isAuthenticated } = usePollar();
  const {
    state,
    saving,
    serverAddress,
    walletAddress,
    pollarReady,
    proveIdentity,
    save,
    signOut,
  } = usePassport();

  return (
    <Shell>
      <Card>
        {state.step === "signed_out" ? (
          <div className="grid gap-4">
            <div>
              <h2 className="text-xl font-semibold">Your passport is private</h2>
              <p className="mt-2 text-slate-600">
                Sign in with your wallet, then sign a one-time message so this server
                can confirm the wallet is yours. The signature authorizes no payment and
                moves no funds.
              </p>
            </div>
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={openLoginModal}
                className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white"
              >
                Sign in with Pollar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void proveIdentity()}
                disabled={!pollarReady}
                className="justify-self-start rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white disabled:opacity-40"
              >
                {pollarReady ? "Confirm it's you" : "Confirming your session…"}
              </button>
            )}
            {walletAddress ? (
              <p className="font-mono text-xs break-all text-slate-500">
                {walletAddress}
              </p>
            ) : null}
          </div>
        ) : null}

        {state.step === "proving" ? (
          <p className="text-slate-600">Waiting for your wallet signature…</p>
        ) : null}

        {state.step === "loading" ? (
          <p className="text-slate-600">Loading your passport…</p>
        ) : null}

        {state.step === "error" ? (
          <div className="grid gap-4">
            <p role="alert" className="font-medium text-red-700">
              {state.message}
            </p>
            <button
              type="button"
              onClick={() => void proveIdentity()}
              className="justify-self-start rounded-xl border border-slate-300 px-4 py-2 font-semibold"
            >
              Try again
            </button>
          </div>
        ) : null}

        {state.step === "ready" ? (
          <div className="grid gap-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-sm text-slate-500">Signed in as</p>
                <p className="font-mono text-xs break-all text-slate-800">
                  {serverAddress}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {state.updatedAt
                    ? `Last saved ${new Date(state.updatedAt).toLocaleString()}`
                    : "Not saved yet — fill this in to create your passport."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
              >
                Sign out
              </button>
            </div>
            <PassportForm
              key={state.updatedAt ?? "unsaved"}
              passport={state.passport}
              saving={saving}
              onSave={save}
            />
          </div>
        ) : null}
      </Card>

      <p className="text-center text-xs text-slate-500">
        All records are fictitious. This prototype is not for clinical use and makes no
        medical claims.
      </p>
    </Shell>
  );
}

export function PassportScreen() {
  return (
    <MedPassPollarProvider>
      <Inner />
    </MedPassPollarProvider>
  );
}
