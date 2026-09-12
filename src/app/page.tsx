import { ArrowRight, CheckCircle2, ShieldCheck, WalletCards } from "lucide-react";
import { PrototypeNotice } from "@/components/prototype-notice";

const flow = ["Medical passport", "QR request", "Patient consent", "USDC payment"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9fbef_0,transparent_32%),linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-6 py-8 text-slate-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a
            className="text-xl font-bold tracking-tight"
            href="#top"
            aria-label="MedPass LATAM home"
          >
            MedPass <span className="text-emerald-700">LATAM</span>
          </a>
          <PrototypeNotice />
        </header>

        <section
          id="top"
          className="grid flex-1 items-center gap-12 py-20 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              Foundation ready
            </div>
            <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Your health context, carried with consent.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              MedPass LATAM is being built as a portable, patient-controlled bridge
              between healthcare encounters across Latin America—with private data
              off-chain and payments powered by Pollar.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-900/15">
                Phase 0 complete <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="text-sm text-slate-500">
                Product flows begin in Phase 1.
              </span>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/80 bg-white/75 p-7 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-9">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                  Demo path
                </p>
                <h2 className="mt-2 text-2xl font-semibold">One complete story</h2>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                <ShieldCheck aria-hidden="true" className="h-6 w-6" />
              </div>
            </div>
            <ol className="mt-8 space-y-3">
              {flow.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="font-medium">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-950">
              <WalletCards aria-hidden="true" className="h-5 w-5 shrink-0" />
              TestNet first. Mainnet only after explicit human approval.
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
