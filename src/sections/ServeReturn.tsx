import { SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { statusTone, tone } from '../lib/tone'
import { serveReturnSteps, latencyOutcomes, type StepTone } from '../data'
import { useAppStore, type LatencyMode } from '../store'
import { useT } from '../i18n'

const modes: LatencyMode[] = ['optimal', 'delayed', 'none']

/** Per-phase tint + step badge. The first phase is the infant's own serve — it
 *  carries no hue, so it takes the neutral tokens rather than an off-palette
 *  slate that belongs to no theme. */
const stepStyles: Record<StepTone, { panel: string; badge: string }> = {
  slate: { panel: 'bg-muted', badge: 'bg-foreground text-background' },
  amber: { panel: tone.amber.soft, badge: tone.amber.fill },
  sky: { panel: tone.sky.soft, badge: tone.sky.fill },
  emerald: { panel: tone.emerald.soft, badge: tone.emerald.fill },
}

export function ServeReturn() {
  const latency = useAppStore((s) => s.latency)
  const setLatency = useAppStore((s) => s.setLatency)
  const t = useT()
  const tr = t.serveReturn
  const outcome = latencyOutcomes[latency]

  return (
    <section id="serve-return">
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serveReturnSteps.map((step, i) => {
              const s = stepStyles[step.tone]
              const st = tr.steps[i]
              return (
                <div
                  key={step.num}
                  className={cn('flex h-full flex-col rounded-xl p-4', s.panel)}
                >
                  <span
                    className={cn(
                      'mb-3 flex size-7 items-center justify-center rounded-full text-xs font-bold',
                      s.badge,
                    )}
                  >
                    {step.num}
                  </span>
                  <p className="mb-1 text-[15px] font-semibold text-foreground">{st.title}</p>
                  <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{st.desc}</p>
                  <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    {st.foot}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 rounded-xl bg-muted p-4">
            <p className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-primary" aria-hidden />
              {tr.simulatorTitle}
            </p>
            <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
              {tr.simulatorPrompt}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {modes.map((mode) => {
                const active = latency === mode
                return (
                  <Button
                    key={mode}
                    variant={active ? 'default' : 'outline'}
                    onClick={() => setLatency(mode)}
                    className={active ? statusTone[latencyOutcomes[mode].tone].fill : undefined}
                  >
                    {tr.outcomes[mode].buttonLabel}
                  </Button>
                )
              })}
            </div>
            <div className="rounded-xl bg-card p-4 ring-1 ring-border">
              <p
                className={cn(
                  'mb-1 text-[15px] font-semibold',
                  statusTone[outcome.tone].text,
                )}
              >
                {tr.outcomes[latency].title}
              </p>
              <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                {tr.outcomes[latency].desc}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
