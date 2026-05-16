import { BarChart3, Shield, Zap } from 'lucide-react'
import type { ComponentType } from 'react'

type FeatureItem = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

const featureItems: FeatureItem[] = [
  {
    icon: Shield,
    title: 'Securite JWT',
    description:
      'Authentification robuste basee sur JWT avec protection de bout en bout pour vos donnees financieres.',
  },
  {
    icon: Zap,
    title: 'Transferts SW-XXXX',
    description:
      "Envoyez de l'argent en quelques secondes grace au format de compte unique SmartWallet SW-XXXX.",
  },
  {
    icon: BarChart3,
    title: 'Analytics intelligents',
    description:
      'Suivez vos flux financiers en temps reel avec des indicateurs clairs et actionnables.',
  },
]

function Features() {
  return (
    <section id="features" className="bg-slate-950/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-100 md:text-4xl">
            Pourquoi choisir SmartWallet ?
          </h2>
          <p className="mt-4 text-slate-400">
            Une experience fintech moderne, securisee et concue pour aller vite.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureItems.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-7 shadow-[0_12px_30px_-18px_rgba(34,211,238,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-cyan-400 transition-colors group-hover:border-cyan-400/50 group-hover:bg-cyan-500/10">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
              <p className="mt-3 leading-relaxed text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features