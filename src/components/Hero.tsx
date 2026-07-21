import { CheckSquare, Clock, FlaskConical } from 'lucide-react'
import { GlassButton } from '@/design-system/components'
import { heroMetrics } from '../data'

export function Hero() {
  return (
    <header className="gradient-hero relative overflow-hidden pb-16 pt-8 text-white">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Headline row */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-600/20 px-3 py-1 text-sm font-semibold text-sky-100">
              <FlaskConical className="size-4 text-amber-400" aria-hidden />
              Evidence-Based Early Psychology &amp; Neuroscience
            </span>
            <h1 className="m-0 mb-2 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
              The Architecture of Early Development
            </h1>
            <p className="m-0 max-w-xl text-[17px] leading-relaxed text-slate-300">
              A comprehensive visual infographic mapping neurobiological foundations, acoustic
              language scaffolding, tummy time optimization, and daily caregiver routines.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <GlassButton tone="primary" size="lg" render={<a href="#summary" />}>
              <CheckSquare />
              Caregiver Checklist
            </GlassButton>
            <GlassButton size="lg" className="text-white" render={<a href="#routine" />}>
              <Clock />
              Daily Schedule
            </GlassButton>
          </div>
        </div>

        {/* Metric cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-600/60 pt-8 lg:grid-cols-4">
          {heroMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 backdrop-blur-md"
            >
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {metric.label}
              </div>
              <div className="text-3xl font-extrabold" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="mt-1 text-xs text-slate-300">{metric.note}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
