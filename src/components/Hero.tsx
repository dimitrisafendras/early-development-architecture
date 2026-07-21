import { CheckSquare, Clock, FlaskConical } from 'lucide-react'
import { GlassButton, GlassSurface } from '@/design-system/components'
import { heroMetrics } from '../data'

export function Hero() {
  return (
    <header className="ds-aurora-brand relative overflow-hidden pb-16 pt-10 text-white">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Headline row */}
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
              <FlaskConical className="size-3.5" aria-hidden />
              Evidence-Based Early Psychology &amp; Neuroscience
            </span>
            <h1 className="m-0 mb-3 font-heading text-4xl font-semibold leading-[1.05] tracking-tight drop-shadow-lg sm:text-6xl">
              The Architecture of Early Development
            </h1>
            <p className="m-0 max-w-xl text-lg leading-relaxed text-white/80 drop-shadow">
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

        {/* Metric tiles — floating glass chips over the media-rich header (DS-permitted).
            The `dark` scope forces the glass dark tint even under the light theme:
            the aurora backdrop is always dark, so a dark frosted tile keeps the
            white label/value text legible in all four theme x palette combos. */}
        <div className="dark mt-10 grid grid-cols-2 gap-4 border-t border-white/15 pt-8 lg:grid-cols-4">
          {heroMetrics.map((metric) => (
            <GlassSurface key={metric.label} radius={20} className="p-4 text-white">
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-white/70">
                {metric.label}
              </div>
              <div className="font-heading text-3xl font-semibold drop-shadow" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="mt-1 text-xs text-white/75">{metric.note}</div>
            </GlassSurface>
          ))}
        </div>
      </div>
    </header>
  )
}
