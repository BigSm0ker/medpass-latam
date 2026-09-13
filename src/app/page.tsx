"use client";

import Link from "next/link";
import { ArrowRight, QrCode, ShieldCheck, Stethoscope, Wallet } from "lucide-react";
import { PrototypeNotice } from "@/components/prototype-notice";
import { LanguageToggle } from "@/components/language-toggle";
import { useCopy } from "@/lib/i18n";

/**
 * The landing page.
 *
 * Written for someone who has two minutes and no context. It leads with the
 * payment problem because that is what the product does on the day: a clinic
 * charges, a patient pays. The consent layer is presented as what makes that
 * payment safe to accept, not as the headline.
 *
 * The icons live here and the words live in the dictionary — a translation
 * should never be able to change which illustration a step gets.
 */
const stepIcons = [Stethoscope, QrCode, ShieldCheck, Wallet] as const;

export default function Home() {
  const copy = useCopy();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9fbef_0,transparent_34%),linear-gradient(135deg,#f8fffc_0%,#eef8ff_100%)] px-5 py-8 text-slate-950 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-tight">
            MedPass <span className="text-emerald-700">LATAM</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <PrototypeNotice />
          </div>
        </header>

        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
            {copy.landing.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            {copy.landing.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {copy.landing.lede}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/charge"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-900/15"
            >
              {copy.landing.providerCta}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/passport"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 font-semibold"
            >
              {copy.landing.patientCta}
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">{copy.landing.howTo}</p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {copy.landing.steps.map((step, index) => {
            const Icon = stepIcons[index] ?? Stethoscope;
            return (
              <article
                key={step.title}
                className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg shadow-emerald-950/5 backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <h2 className="font-semibold">
                    <span className="text-slate-400">{index + 1}. </span>
                    {step.title}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-10 rounded-3xl border border-white/80 bg-white/80 p-6 shadow-lg shadow-emerald-950/5 backdrop-blur sm:p-8">
          <h2 className="text-xl font-semibold">{copy.landing.whyTitle}</h2>
          <p className="mt-3 leading-7 text-slate-600">{copy.landing.whyBody}</p>
        </section>

        <section className="mt-4 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">{copy.landing.realTitle}</h2>
          <p className="mt-3 leading-7 text-amber-950">{copy.landing.realBody}</p>
        </section>

        <footer className="py-10 text-center text-sm text-slate-500">
          <a
            className="font-semibold text-emerald-800 underline"
            href="https://github.com/BigSm0ker/medpass-latam"
            target="_blank"
            rel="noreferrer"
          >
            {copy.landing.sourceLink}
          </a>
        </footer>
      </div>
    </main>
  );
}
