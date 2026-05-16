import { Check } from 'lucide-react'

type StepItem = {
  id: string
  title: string
  description: string
}

const steps: StepItem[] = [
  {
    id: '01',
    title: 'Inscription rapide',
    description: 'Creez votre compte en moins de deux minutes avec une verification simple.',
  },
  {
    id: '02',
    title: 'Creation de Wallet',
    description:
      'Votre wallet numerique est initialise automatiquement avec votre compte SmartWallet.',
  },
  {
    id: '03',
    title: 'Transactions instantanees',
    description:
      "Envoyez, recevez et suivez votre argent en temps reel depuis un tableau de bord unique.",
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">Comment ca marche ?</h2>
          <p className="mt-4 max-w-xl text-lg text-slate-400">
            Trois etapes simples pour demarrer vite et garder le controle sur votre argent.
          </p>

          <div className="mt-10 space-y-5">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-all duration-300 hover:border-cyan-500/40 hover:bg-slate-900"
              >
                {index < steps.length - 1 ? (
                  <span className="pointer-events-none absolute -bottom-6 left-6 h-6 w-px bg-slate-700" />
                ) : null}

                <div className="flex items-start gap-4">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sm font-semibold text-cyan-400 transition-colors group-hover:border-cyan-400/60">
                    {step.id}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-100">{step.title}</h3>
                    <p className="mt-1 text-slate-400">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-1 backdrop-blur-md">
          <div className="flex aspect-square items-center justify-center rounded-[22px] border border-slate-800 bg-linear-to-br from-cyan-500/10 to-blue-500/10">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-500/15 text-cyan-300">
                <Check className="h-10 w-10" />
              </div>
              <p className="text-2xl font-bold text-slate-100">Pret en un clic</p>
              <p className="mt-2 text-slate-400">Configuration terminee a 100%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks