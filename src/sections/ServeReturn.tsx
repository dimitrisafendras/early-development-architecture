import { SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { serveReturnSteps, latencyOutcomes } from '../data'
import { useAppStore, type LatencyMode } from '../store'
import { useT } from '../i18n'

const modes: LatencyMode[] = ['optimal', 'delayed', 'none']


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
              const st = tr.steps[i]
              return (
                /* One tint for all four phases, not four. Each step used to
                   carry its own hue — slate, amber, sky, emerald — for a
                   sequence that is already numbered 1 to 4; the colour said
                   nothing the numeral did not, and put four accent families in a
                   single card. */
                <div key={step.num} className="flex h-full flex-col rounded-xl bg-muted p-4">
                  <span className="mb-3 flex size-7 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
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

          {/* A rule, not a third surface. This was a tinted panel holding
              another panel inside an already-bordered card — three boundaries
              deep, the deepest nesting on the Wiki. The live result below keeps
              its own surface, because it is the thing that changes. */}
          <div className="mt-8 border-t border-border pt-6">
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
