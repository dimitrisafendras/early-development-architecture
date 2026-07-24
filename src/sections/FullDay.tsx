import { useEffect, useState, type ComponentType } from 'react'
import { Milk, Moon, ToyBrick, Baby, Bath, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { fullDaySchedule, type DayActivity } from '../data'
import { activeTimeIndex } from '../lib/schedule'
import { useT } from '../i18n'

/** Per-activity icon + soft theme-aware accent (dot background + text). */
const activity: Record<DayActivity, { icon: ComponentType<{ className?: string }>; dot: string; text: string }> = {
  feed: { icon: Milk, dot: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', text: 'text-sky-700 dark:text-sky-400' },
  sleep: { icon: Moon, dot: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-700 dark:text-indigo-400' },
  play: { icon: ToyBrick, dot: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-400' },
  tummy: { icon: Baby, dot: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700 dark:text-emerald-400' },
  care: { icon: Bath, dot: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-700 dark:text-cyan-400' },
  wind: { icon: Sparkles, dot: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-700 dark:text-fuchsia-400' },
}

const legendOrder: DayActivity[] = ['feed', 'sleep', 'play', 'tummy', 'care', 'wind']

export function FullDay() {
  const t = useT()
  const tf = t.fullDay
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const activeSlot = activeTimeIndex(fullDaySchedule.map((s) => s.time), now)
  return (
    <section id="full-day">
      <SectionHeader module={11} title={tf.title} description={tf.description} />

      {/* Legend */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {tf.legendTitle}:
        </span>
        {legendOrder.map((type) => {
          const a = activity[type]
          const Icon = a.icon
          return (
            <span key={type} className="inline-flex items-center gap-1.5 text-sm text-foreground">
              <span className={`inline-flex size-6 items-center justify-center rounded-full ${a.dot}`}>
                <Icon className="size-3.5" />
              </span>
              {tf.types[type]}
            </span>
          )
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardContent>
          <ol className="relative">
            {fullDaySchedule.map((slot, i) => {
              const a = activity[slot.type]
              const Icon = a.icon
              const last = i === fullDaySchedule.length - 1
              const isNow = i === activeSlot
              return (
                <li
                  key={`${slot.time}-${i}`}
                  className={`relative flex gap-4 pb-6 last:pb-0 ${isNow ? 'scroll-mt-28' : ''}`}
                >
                  {/* connector rail */}
                  {!last && (
                    <span className="absolute left-[1.4375rem] top-11 bottom-0 w-px bg-border" aria-hidden />
                  )}
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span
                      className={`inline-flex size-12 items-center justify-center rounded-full ${a.dot} ${
                        isNow ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div
                    className={`min-w-0 flex-1 pt-1 ${
                      isNow ? '-my-1 rounded-lg bg-primary/5 px-3 py-2' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                        {slot.time}
                      </span>
                      <span className="font-semibold text-foreground">{tf.slots[i].title}</span>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${a.text}`}>
                        {tf.types[slot.type]}
                      </span>
                      {isNow && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                          {t.routineLive.nowBadge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {tf.slots[i].detail}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <p className="mt-6 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
        {tf.note}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">{tf.sourcesLabel}</p>
    </section>
  )
}
