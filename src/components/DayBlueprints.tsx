import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eyebrow } from './Eyebrow'
import { dayActivityMeta } from './dayActivity'
import { buildScheduleFromTemplate } from '../lib/useSchedule'
import { dayTemplates, dayTemplateForAge, type ScheduleSlot } from '../data'
import { useT } from '../i18n'

/**
 * The five built-in sample days, birth to three, as loadable blueprints.
 *
 * The editor could already *reset* to the day for the current age, but that was
 * the only one reachable and it was spelled "Reset" — a caregiver with a
 * six-month-old could not look at what the one-nap day will become, let alone
 * start from it. Here every band is visible with the age it is written for, its
 * shape summarised by activity, and one action to load it.
 *
 * The band matching the child's age is marked rather than filtered to: seeing
 * what comes next is most of the value, and a parent planning the 2-to-1 nap
 * switch is looking at the band *above* theirs.
 */
export function DayBlueprints({
  months,
  onLoad,
}: {
  months: number | null
  onLoad: (slots: ScheduleSlot[]) => void
}) {
  const t = useT()
  const ts = t.schedule
  const [open, setOpen] = useState(false)
  const currentId = dayTemplateForAge(months).id

  return (
    <section className="rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left outline-none"
      >
        <span className="min-w-0">
          <Eyebrow as="span">{ts.blueprintsTitle}</Eyebrow>
          <span className="mt-0.5 block text-xs text-muted-foreground">{ts.blueprintsHint}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {dayTemplates.map((template) => {
            const slots = buildScheduleFromTemplate(t, template)
            const isCurrent = template.id === currentId
            return (
              <li
                key={template.id}
                className={cn(
                  'flex flex-col gap-2.5 rounded-lg border p-3',
                  isCurrent ? 'border-ring bg-accent/40' : 'border-border bg-card',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="font-heading text-sm font-semibold">
                      {t.fullDay.dayLabels[template.id]}
                    </span>
                    {isCurrent && <Badge variant="soft">{ts.blueprintCurrent}</Badge>}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {ts.blueprintSlots.replace('{n}', String(slots.length))}
                  </span>
                </div>

                {/* The day's shape at a glance: one tick per moment, in its
                    activity's colour and in clock order. Reads as a stripe of
                    the day — where the sleeps fall, how the feeds thin out —
                    without listing fourteen rows inside a picker. */}
                <ol className="flex flex-wrap gap-1" aria-hidden>
                  {slots.map((slot, i) => (
                    <li
                      key={i}
                      title={`${slot.time} · ${slot.title}`}
                      className={cn('h-1.5 flex-1 rounded-full', dayActivityMeta[slot.type].bar)}
                    />
                  ))}
                </ol>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    if (!window.confirm(ts.blueprintConfirm)) return
                    onLoad(slots)
                  }}
                >
                  {ts.blueprintUse}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
