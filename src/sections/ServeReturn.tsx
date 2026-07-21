import { SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SectionHeader } from '../components/SectionHeader'
import { serveReturnSteps, latencyOutcomes, type StepTone, type StatusTone } from '../data'
import { useAppStore, type LatencyMode } from '../store'

const modes: LatencyMode[] = ['optimal', 'delayed', 'none']

/** Soft, theme-aware phase tints — mirrors the DS chip aesthetic. */
const stepStyles: Record<StepTone, { card: string; badge: string }> = {
  // Badge fills carry white text, so they use -700 (light) shades that clear the
  // 4.5:1 AA text contrast; the soft -500/10 card tints are unchanged.
  slate: { card: 'border-slate-500/20 bg-slate-500/5', badge: 'bg-slate-600' },
  amber: { card: 'border-amber-500/25 bg-amber-500/10', badge: 'bg-amber-700' },
  sky: { card: 'border-sky-500/25 bg-sky-500/10', badge: 'bg-sky-700' },
  emerald: { card: 'border-emerald-500/25 bg-emerald-500/10', badge: 'bg-emerald-700' },
}

/** Status semantics for the responsiveness simulator (good / caution / harmful).
 *  Light shades use -700 so tone text on white and white text on the fills both
 *  clear AA; dark theme keeps the lighter -400 text on its dark surfaces. */
const statusStyles: Record<StatusTone, { title: string; button: string }> = {
  success: {
    title: 'text-emerald-700 dark:text-emerald-400',
    button: 'bg-emerald-700 border-emerald-700 text-white hover:bg-emerald-700',
  },
  warning: {
    title: 'text-amber-700 dark:text-amber-400',
    button: 'bg-amber-700 border-amber-700 text-white hover:bg-amber-700',
  },
  danger: {
    title: 'text-rose-700 dark:text-rose-400',
    button: 'bg-rose-700 border-rose-700 text-white hover:bg-rose-700',
  },
}

export function ServeReturn() {
  const latency = useAppStore((s) => s.latency)
  const setLatency = useAppStore((s) => s.setLatency)
  const outcome = latencyOutcomes[latency]

  return (
    <section id="serve-return">
      <SectionHeader
        module={2}
        title='The "Serve and Return" Interaction Loop'
        description="Harvard Center on the Developing Child highlights that social interactions function like a game of tennis. The infant serves a cue; the caregiver immediately returns it."
      />
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {serveReturnSteps.map((step) => {
              const s = stepStyles[step.tone]
              return (
                <div
                  key={step.num}
                  className={cn('flex h-full flex-col rounded-2xl border p-5', s.card)}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-xs font-bold text-white',
                        s.badge,
                      )}
                    >
                      {step.num}
                    </span>
                  </div>
                  <p className="mb-1 font-semibold text-foreground">{step.title}</p>
                  <p className="m-0 text-xs text-muted-foreground">{step.desc}</p>
                  <div className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
                    {step.foot}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-muted p-5">
            <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden />
              Interactive Responsiveness Simulator
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              Select a caregiver response delay to see how timing impacts neural alertness &amp;
              stress hormones:
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {modes.map((mode) => {
                const active = latency === mode
                return (
                  <Button
                    key={mode}
                    variant={active ? 'default' : 'outline'}
                    onClick={() => setLatency(mode)}
                    className={active ? statusStyles[latencyOutcomes[mode].tone].button : undefined}
                  >
                    {latencyOutcomes[mode].buttonLabel}
                  </Button>
                )
              })}
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className={cn('mb-1 font-bold', statusStyles[outcome.tone].title)}>
                {outcome.title}
              </div>
              <p className="m-0 text-[13px] text-muted-foreground">{outcome.desc}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
