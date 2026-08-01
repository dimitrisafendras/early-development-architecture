import { cn } from '@/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { dayActivityMeta, dayActivityOrder } from './dayActivity'
import { slotEndTime, formatDuration } from '../lib/schedule'
import type { ScheduleSlot } from '../data'
import { useT } from '../i18n'

/**
 * A day's shape as a row of coloured pills — one per moment, in clock order.
 *
 * The stripe answers "what kind of day is this" without listing twenty rows:
 * where the sleeps fall, how the feeds thin out, whether the afternoon is one
 * long block or four short ones. Two programs for neighbouring ages read as
 * visibly different days here without opening either.
 *
 * **Every pill says what it is on hover.** It was pure decoration before — eight
 * hues with no key anywhere near them, so a stripe of colour was the only thing
 * on a program card that could not be read. A tooltip per pill gives the window,
 * the moment's own name, its kind and its length.
 *
 * Hover is a mouse affordance, so it cannot be the only way to get this: the bar
 * stays `aria-hidden` and {@link DayShapeSummary} carries the same information as
 * text for keyboard and screen-reader users. The triggers render as spans
 * because the bar is often placed inside a card that is itself a button, and a
 * button inside a button is invalid HTML that browsers silently unnest.
 */
export function DayShapeBar({
  slots,
  className,
}: {
  slots: ScheduleSlot[]
  className?: string
}) {
  const t = useT()
  if (!slots.length) return null

  return (
    <TooltipProvider delay={120}>
      <ol className={cn('flex gap-0.5', className)} aria-hidden>
        {slots.map((slot, i) => {
          const meta = dayActivityMeta[slot.type]
          return (
            <li key={i} className="flex min-w-0 flex-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span
                      // `py-1 -my-1` widens the hover target to a comfortable
                      // height without making the visible pill thicker: a 6px
                      // strip is hard to hit on purpose.
                      className="block w-full cursor-default rounded-full py-1 -my-1 transition-opacity hover:opacity-70"
                    >
                      <span className={cn('block h-1.5 w-full rounded-full', meta.bar)} />
                    </span>
                  }
                />
                <TooltipContent>
                  <span className="flex flex-col gap-0.5 text-left">
                    <span className="font-semibold">{slot.title}</span>
                    <span className="tabular-nums opacity-80">
                      {slot.time} – {slotEndTime(slot.time, slot.mins)} ·{' '}
                      {t.fullDay.types[slot.type]} ·{' '}
                      {formatDuration(slot.mins, t.routineLive.hour, t.routineLive.minute)}
                    </span>
                  </span>
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ol>
    </TooltipProvider>
  )
}

/**
 * The same day, counted rather than drawn: "6 milk feeds · 5 sleeps · 3 play".
 *
 * This is the readable half of the pair above — it is what a keyboard or screen
 * reader user gets instead of hovering, and it is also the fastest way for
 * anyone to tell two programs apart, since a count is a fact and a stripe is an
 * impression. Kinds appear in the legend's order so two cards line up.
 */
export function DayShapeSummary({ slots, className }: { slots: ScheduleSlot[]; className?: string }) {
  const t = useT()
  const counts = new Map<string, number>()
  for (const slot of slots) counts.set(slot.type, (counts.get(slot.type) ?? 0) + 1)

  const parts = dayActivityOrder
    .filter((type) => counts.has(type))
    .map((type) => `${counts.get(type)}× ${t.fullDay.types[type]}`)

  if (!parts.length) return null
  return (
    <span className={cn('text-xs leading-relaxed text-muted-foreground', className)}>
      {parts.join(' · ')}
    </span>
  )
}
