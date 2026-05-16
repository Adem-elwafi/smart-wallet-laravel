import { ArrowRight, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'

function HomePage() {
  const navigate = useNavigate()

  const hasToken = useMemo(() => Boolean(localStorage.getItem('token')), [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: rotateY(20deg) rotateX(10deg) translateY(0px); }
          50% { transform: rotateY(26deg) rotateX(15deg) translateY(-16px); }
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/90 text-white">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold tracking-tight">SmartWallet</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#features" className="text-slate-400 transition-colors hover:text-cyan-300">
              Fonctionnalites
            </a>
            <a href="#how-it-works" className="text-slate-400 transition-colors hover:text-cyan-300">
              Comment ca marche
            </a>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-slate-300 transition-colors hover:text-white"
            >
              Connexion
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="rounded-full bg-cyan-500 px-5 py-2 text-white transition-colors hover:bg-cyan-400"
            >
              S inscrire
            </button>

            {hasToken ? (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-full border border-cyan-400/60 bg-cyan-500/10 px-5 py-2 text-cyan-200 transition-colors hover:bg-cyan-500/20"
              >
                Tableau de bord
              </button>
            ) : null}
          </div>
        </nav>
      </header>

      <main>
        <section className="px-6 pb-24 pt-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
                Gerez votre argent a la vitesse <span className="text-cyan-400">de la pensee.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
                Une experience fintech nouvelle generation, securisee et ultra intuitive pour piloter vos finances.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  Commencer
                  <ArrowRight className="h-5 w-5" />
                </button>
                {hasToken ? (
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-4 font-medium text-slate-200 backdrop-blur-md transition-colors hover:border-cyan-500/50 hover:text-cyan-200"
                  >
                    Aller au dashboard
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex justify-center py-8 lg:py-0">
              <div className="perspective-[1000px]">
                <div
                  className="relative h-50 w-[320px] rounded-2xl border border-cyan-300/20 bg-linear-to-br from-cyan-500 to-blue-600 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
                  style={{
                    transformStyle: 'preserve-3d',
                    animation: 'floatCard 6s ease-in-out infinite',
                  }}
                >
                  <span className="absolute left-7 top-9 h-8 w-11 rounded bg-linear-to-br from-amber-200 to-amber-500" />
                  <span className="absolute bottom-8 left-7 text-sm tracking-[0.35em] text-white/90">
                    •••• •••• •••• 8888
                  </span>
                  <span className="absolute right-8 top-8 text-lg font-semibold italic text-white/60">VISA</span>
                  <span className="absolute bottom-8 right-8 h-10 w-10 rounded-full border-2 border-white/25" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Features />
        <HowItWorks />
      </main>
    </div>
  )
}

export default HomePage