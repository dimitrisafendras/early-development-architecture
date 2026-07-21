import { SlidersHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SectionHeader } from '../components/SectionHeader'
import { serveReturnSteps, latencyOutcomes } from '../data'
import { useAppStore, type LatencyMode } from '../store'

const modes: LatencyMode[] = ['optimal', 'delayed', 'none']

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
            {serveReturnSteps.map((step) => (
              <div
                key={step.num}
                className="flex h-full flex-col rounded-2xl border p-5"
                style={{ background: step.bg, borderColor: step.border }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: step.badge }}
                  >
                    {step.num}
                  </span>
                </div>
                <p className="mb-1 font-semibold text-slate-800">{step.title}</p>
                <p className="m-0 text-xs text-slate-600">{step.desc}</p>
                <div
                  className="mt-3 border-t pt-3 text-[11px] text-slate-500"
                  style={{ borderColor: step.border }}
                >
                  {step.foot}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-muted p-5">
            <p className="mb-2 flex items-center gap-2 font-semibold text-foreground">
              <SlidersHorizontal className="size-4 text-sky-500" aria-hidden />
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
                    style={
                      active
                        ? {
                            background: latencyOutcomes[mode].buttonColor,
                            borderColor: latencyOutcomes[mode].buttonColor,
                            color: '#fff',
                          }
                        : undefined
                    }
                  >
                    {latencyOutcomes[mode].buttonLabel}
                  </Button>
                )
              })}
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-1 font-bold" style={{ color: outcome.color }}>
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
