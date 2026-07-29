import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Hourglass } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { cn } from '@/lib/utils'
import { dayActivityMeta as activity, dayActivityOrder as legendOrder } from '../components/dayActivity'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { dayTemplates, dayTemplateForAge, type DayTemplateId } from '../data'
import { activeTimeIndex, slotEndTime, formatDuration } from '../lib/schedule'
import { useT } from '../i18n'

export function FullDay() {
  const t = useT()
  const tf = t.fullDay
  const baby = useBabyAge()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Five sample days now live here — one per age band, birth to three years. The
  // band matching the child on file opens first, and the "now" highlight only
  // means anything on that band, since the others are somebody else's clock.
  const ownBand = dayTemplateForAge(baby?.months ?? null).id
  const [band, setBand] = useState<DayTemplateId>(ownBand)
  useEffect(() => setBand(ownBand), [ownBand])
  const template = dayTemplates.find((d) => d.id === band) ?? dayTemplates[1]
  const slots = template.slots
  const text = tf.days[template.id]
  const isOwnBand = band === ownBand && baby != null
  const activeSlot = activeTimeIndex(slots.map((s) => s.time), now)

  // Deep-link to a slot (e.g. /wiki/full-day#slot-4 from the day's "up next").
  // A short timed scroll survives StrictMode's effect double-invoke and any
  // load-time layout shift (fonts) that would move the target mid-animation.
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    // Retry briefly: on in-app navigation the target may not be laid out yet,
    // and a smooth scroll gets interrupted by the route transition — so jump.
    let tries = 0
    const iv = setInterval(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        // Explicit 'instant' — the global smooth scroll-behavior gets
        // interrupted by the route transition and leaves us at the top.
        el.scrollIntoView({ behavior: 'instant', block: 'center' })
        clearInterval(iv)
      } else if (++tries > 25) clearInterval(iv)
    }, 50)
    return () => clearInterval(iv)
  }, [hash])
  return (
    <section id="full-day">
      {/* Which age's day. The pills are the page's primary control, so they sit
          above the legend, with the age badge trailing them. */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ChoiceGroup
          ariaLabel={tf.bandLabel}
          value={band}
          onChange={setBand}
          options={dayTemplates.map((d) => ({ value: d.id, label: tf.dayLabels[d.id] }))}
        />
        <AgeBadge />
      </div>

      {/* Legend */}
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Eyebrow as="h3" size="md">
          {tf.legendTitle}:
        </Eyebrow>
        {legendOrder.map((type) => {
          const a = activity[type]
          const Icon = a.icon
          return (
            <span key={type} className="inline-flex items-center gap-1.5 text-sm text-foreground">
              <span
                className={cn('inline-flex size-6 items-center justify-center rounded-full', a.dot)}
              >
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
            {slots.map((slot, i) => {
              const a = activity[slot.type]
              const Icon = a.icon
              const last = i === slots.length - 1
              const isNow = isOwnBand && i === activeSlot
              return (
                <li
                  id={`slot-${i}`}
                  key={`${slot.time}-${i}`}
                  className="relative flex scroll-mt-28 gap-4 pb-6 last:pb-0"
                >
                  {/* Connector rail — centred on the dot column (`w-12`) rather
                      than offset by a hand-derived constant, so it stays on the
                      dots if that width ever changes. */}
                  {!last && (
                    <span
                      className="absolute top-11 bottom-0 left-6 w-px -translate-x-1/2 bg-border"
                      aria-hidden
                    />
                  )}
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span
                      className={cn(
                        'inline-flex size-12 items-center justify-center rounded-full',
                        a.dot,
                        // The dot is a filled circle on the card, not a card in a
                        // grid — the offset keeps the ring reading as a halo
                        // instead of a border.
                        isNow && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                  </div>
                  <div
                    className={cn(
                      'min-w-0 flex-1 pt-1',
                      isNow && '-my-1 rounded-xl bg-primary/5 px-3 py-2 ring-1 ring-primary/30',
                    )}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {/* The window, not just the start: "09:00 – 10:15" answers
                          when it happens and how long it runs in one read, with
                          the duration spelled out after it for the long ones. */}
                      <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                        {slot.time} – {slotEndTime(slot.time, slot.mins)}
                      </span>
                      <span className="text-[15px] font-semibold text-foreground">
                        {text[i].title}
                      </span>
                      <Eyebrow as="span" size="sm" tone="inherit" className={a.text}>
                        {tf.types[slot.type]}
                      </Eyebrow>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums text-muted-foreground">
                        <Hourglass className="size-3.5" aria-hidden />
                        <span className="sr-only">{tf.durationLabel}: </span>
                        {formatDuration(slot.mins, t.routineLive.hour, t.routineLive.minute)}
                      </span>
                      {isNow && (
                        <Eyebrow
                          as="span"
                          size="sm"
                          tone="inherit"
                          className="rounded-full bg-primary px-2 py-0.5 text-primary-foreground"
                        >
                          {t.routineLive.nowBadge}
                        </Eyebrow>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                      {text[i].detail}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <p className="mt-6 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        {tf.note}
      </p>
      {/* The lengths are typical middles of published ranges, not stopwatch
          targets — say so next to the timeline that now shows them. */}
      <p className="mt-3 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        {tf.lengthNote}
      </p>
      <p className="mt-6 text-xs text-muted-foreground">{tf.sourcesLabel}</p>
    </section>
  )
}
