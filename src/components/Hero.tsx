import { Link } from 'react-router-dom'
import { CheckSquare, Clock, FlaskConical, Moon, Palette, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { heroMetrics } from '../data'
import { useAppStore } from '../store'

export function Hero() {
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)

  return (
    <header className="gradient-hero relative overflow-hidden pb-16 pt-8 text-white">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        {/* Top control bar */}
        <div className="mb-6 flex flex-wrap items-center justify-end gap-4">
          <Link
            to="/design-system"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'text-slate-200 hover:bg-white/10 hover:text-white',
            )}
          >
            <Palette />
            Design System
          </Link>

          {/* Palette (Boy / Girl) segmented control */}
          <div
            className="inline-flex items-center rounded-full border border-white/20 bg-white/10 p-0.5"
            role="group"
            aria-label="Accent palette"
          >
            <button
              type="button"
              onClick={() => setPalette('blue')}
              aria-pressed={palette === 'blue'}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                palette === 'blue'
                  ? 'bg-sky-400 text-slate-900'
                  : 'text-slate-200 hover:text-white',
              )}
            >
              Boy
            </button>
            <button
              type="button"
              onClick={() => setPalette('red')}
              aria-pressed={palette === 'red'}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                palette === 'red'
                  ? 'bg-rose-400 text-slate-900'
                  : 'text-slate-200 hover:text-white',
              )}
            >
              Girl
            </button>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center gap-2">
            <Sun className="size-4 text-slate-300" aria-hidden />
            <Switch
              checked={dark}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
            <Moon className="size-4 text-slate-300" aria-hidden />
          </div>
        </div>

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
            <a
              href="#summary"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 gap-2 bg-amber-400 px-5 text-sm font-bold text-slate-900 hover:bg-amber-300',
              )}
            >
              <CheckSquare />
              Caregiver Checklist
            </a>
            <a
              href="#routine"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-11 gap-2 border-slate-500 bg-slate-800 px-5 text-sm text-white hover:bg-slate-700 hover:text-white dark:border-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700',
              )}
            >
              <Clock />
              Daily Schedule
            </a>
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
