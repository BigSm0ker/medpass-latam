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
    title: "La clínica crea un cobro",
    body: "Un monto, un motivo, y solo el contexto de salud que esta visita realmente necesita.",
  },
  {
    icon: QrCode,
    title: "El paciente escanea un código",
    body: "El código lleva solo una referencia aleatoria — sin datos médicos, sin identidad, nada que filtrar.",
  },
  {
    icon: ShieldCheck,
    title: "El paciente decide qué compartir",
    body: "Aprueba algunos elementos, rechaza otros. El acceso expira y puede retirarse en cualquier momento.",
  },
  {
    icon: Wallet,
    title: "El pago se liquida en USDC",
    body: "A través de Pollar, en segundos, desde cualquier lugar — con un recibo que cualquiera puede verificar on-chain.",
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
            Paga la consulta en segundos. Comparte solo lo que el médico necesita.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            En América Latina, muchas consultas todavía se cobran en efectivo: la
            clínica no tiene datáfono, o quien paga es un familiar en otro país.
            MedPass convierte esa visita en un solo código QR — el paciente
            aprueba exactamente qué datos de salud puede ver el proveedor, y paga
            en USDC a través de Pollar.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/charge"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg shadow-slate-900/15"
            >
              Soy proveedor — crear un cobro
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/passport"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 font-semibold"
            >
              Soy paciente — mi pasaporte
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Inicia sesión con un correo o una cuenta de Google; Pollar crea la
            billetera por ti. Para ver el flujo completo, abre la página del
            proveedor en un dispositivo y escanea su QR con otro.
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
            Por qué la capa de consentimiento le importa al pago
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Un proveedor que puede ver las alergias y los medicamentos actuales
            de un paciente antes de atenderlo es un proveedor que vale la pena
            pagar. Pero entregar todo un historial médico para saldar una cuenta
            es un mal trato. MedPass hace que la divulgación sea tan pequeña como
            la visita lo requiere: el proveedor pide elementos específicos, el
            paciente concede un subconjunto, y el acceso expira solo. Los datos de
            salud nunca tocan la blockchain — solo el pago lo hace.
          </p>
        </section>

        <section className="mt-4 rounded-3xl border border-amber-200/80 bg-amber-50/70 p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Qué es real y qué no lo es</h2>
          <p className="mt-3 leading-7 text-amber-950">
            El pago es real: el USDC se mueve en Stellar a través de Pollar, y
            cada recibo enlaza a un explorador público para que lo verifiques tú
            mismo. Los registros médicos son enteramente ficticios. Este es un
            prototipo construido para el Pollar Bounty en el Buildathon
            Cochabamba 2026 — no es un sistema clínico y no hace ninguna
            afirmación médica.
          </p>
        </section>

        <footer className="py-10 text-center text-sm text-slate-500">
          <a
            className="font-semibold text-emerald-800 underline"
            href="https://github.com/BigSm0ker/medpass-latam"
            target="_blank"
            rel="noreferrer"
          >
            Código fuente y notas de ingeniería
          </a>
        </footer>
      </div>
    </main>
  );
}
