import type { ReactNode } from 'react'

type AuthLayoutProps = {
  badge: string
  title: string
  description: string
  highlights: string[]
  children: ReactNode
}

function AuthLayout({ badge, title, description, highlights, children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-text-inverse">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,1))]" />
      <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-success/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center px-6 py-12 sm:px-10 lg:px-12">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-text-secondary shadow-lg shadow-slate-950/20 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {badge}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-lg text-base leading-7 text-text-secondary sm:text-lg">
                {description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-text-secondary shadow-lg shadow-slate-950/15 backdrop-blur"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 pb-12 pt-0 sm:px-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  )
}

export default AuthLayout