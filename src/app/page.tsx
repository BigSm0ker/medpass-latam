import Link from "next/link";
import { ArrowRight, QrCode, ShieldCheck, Stethoscope, Wallet } from "lucide-react";
import { PrototypeNotice } from "@/components/prototype-notice";

/**
 * The landing page.
 *
 * Written for someone who has two minutes and no context. It leads with the
 * payment problem because that is what the product does on the day: a clinic
 * charges, a patient pays. The consent layer is presented as what makes that
 * payment safe to accept, not as the headline.
 */
const steps = [
  {
    icon: Stethoscope,
    title: "The clinic creates a charge",
    body: "An amount, a reason, and only the health context this visit actually needs.",
  },
  {
    icon: QrCode,
    title: "The patient scans one code",
    body: "The code carries a random reference — no medical data, no identity, nothing to leak.",
  },
  {
    icon: ShieldCheck,
    title: "The patient decides what to share",
    body: "Approve some items, refuse others. Access expires, and can be withdrawn at any time.",
  },
  {
    icon: Wallet,
    title: "Payment settles in USDC",
    body: "Through Pollar, in seconds, from anywhere — with a receipt anyone can verify on-chain.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9fbef_0,transparent_34%),linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-8 text-slate-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-tight">
            MedPass <span className="text-emerald-700">LATAM</span>
          </span>
          <PrototypeNotice />
        </header>

        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
            Pagos de salud con consentimiento
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Pay the clinic in seconds. Share only what the doctor needs.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Across Latin America, plenty of consultations are still settled in cash: the
            clinic has no card terminal, or the person paying is a relative in another
            country. MedPass turns that visit into one QR code — the patient approves
            exactly which health details the provider may see, and pays in USDC through
            Pollar.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/charge"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-900/15"
            >
              I&apos;m a provider — create a charge
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/passport"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 font-semibold"
            >
              I&apos;m a patient — my passport
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Sign in with an email or Google account; Pollar creates the wallet for you.
            To see the whole flow, open the provider page on one device and scan its QR
            with another.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg shadow-emerald-950/5 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                  <step.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h2 className="font-semibold">
                  <span className="text-slate-400">{index + 1}. </span>
                  {step.title}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur sm:p-8">
          <h2 className="text-xl font-semibold">
            Why the consent layer matters to the payment
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            A provider who can see a patient&apos;s allergies and current medications
            before treating them is a provider worth paying. But handing over a whole
            medical history to settle a bill is a bad trade. MedPass makes the
            disclosure as small as the visit requires: the provider asks for specific
            items, the patient grants a subset, and access expires on its own. Health
            data never touches the blockchain — only the payment does.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">What is real, and what is not</h2>
          <p className="mt-3 leading-7 text-amber-950">
            The payment is real: USDC moves on Stellar through Pollar, and every receipt
            links to a public explorer so you can check it yourself. The medical records
            are entirely fictitious. This is a prototype built for the Pollar Bounty at
            Buildathon Cochabamba 2026 — it is not a clinical system and makes no
            medical claims.
          </p>
        </section>

        <footer className="py-10 text-center text-sm text-slate-500">
          <a
            className="font-semibold text-emerald-800 underline"
            href="https://github.com/BigSm0ker/medpass-latam"
            target="_blank"
            rel="noreferrer"
          >
            Source code and engineering notes
          </a>
        </footer>
      </div>
    </main>
  );
}
