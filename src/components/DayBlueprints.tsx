import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DayShapeBar, DayShapeSummary } from './DayShapeBar'
import { buildScheduleFromTemplate } from '../lib/useSchedule'
import { dayTemplates, dayTemplateForAge, templateStartMonths, type ScheduleSlot } from '../data'
import { formatAgeRange } from '../lib/schedule'
import { useT } from '../i18n'

/**
 * The nine built-in sample days, birth to three, as loadable blueprints.
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
 *
 * Plain content, no shell: the page wraps this in a `CollapsibleSection`, so the
 * collapse this used to carry itself would now be a fold inside a fold.
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
  const currentId = dayTemplateForAge(months).id

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {dayTemplates.map((template, i) => {
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
                  {/* The range, derived from where the next band starts, rather
                      than a second hand-written label that could disagree. */}
                  {formatAgeRange(
                    templateStartMonths(i),
                    template.upperMonths >= 999 ? null : template.upperMonths,
                    t.baby.monthsShort,
                    t.baby.yearsShort,
                  )}
                </span>
                {isCurrent && <Badge variant="soft">{ts.blueprintCurrent}</Badge>}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {ts.blueprintSlots.replace('{n}', String(slots.length))}
              </span>
            </div>

            {/* The day's shape at a glance, every pill readable on hover. */}
            <DayShapeBar slots={slots} />
            <DayShapeSummary slots={slots} />

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
  )
}
