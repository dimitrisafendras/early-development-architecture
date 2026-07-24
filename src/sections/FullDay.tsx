import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { dayActivityMeta as activity, dayActivityOrder as legendOrder } from '../components/dayActivity'
import { fullDaySchedule } from '../data'
import { activeTimeIndex } from '../lib/schedule'
import { useT } from '../i18n'

export function FullDay() {
  const t = useT()
  const tf = t.fullDay
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const activeSlot = activeTimeIndex(fullDaySchedule.map((s) => s.time), now)

  // Deep-link to a slot (e.g. /topic/full-day#slot-4 from the day's "up next").
  // rAF lets it win over the route-change scroll-to-top on the same commit.
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    if (!el) return
    const id = requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    return () => cancelAnimationFrame(id)
  }, [hash])
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
                  id={`slot-${i}`}
                  key={`${slot.time}-${i}`}
                  className="relative flex scroll-mt-28 gap-4 pb-6 last:pb-0"
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
