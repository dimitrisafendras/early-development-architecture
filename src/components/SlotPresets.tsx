import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { dayActivityMeta } from './dayActivity'
import { buildDefaultSchedule } from '../lib/useSchedule'
import type { ScheduleSlot } from '../data'
import { useT } from '../i18n'

/**
 * Ready-made moments to build a day from, as tappable cards.
 *
 * **The library is the built-in day, not a second list.** The app already ships
 * an age-banded schedule (`buildDefaultSchedule`) whose moments have real
 * titles, types and typical durations, translated in both locales. Offering
 * *those* as presets costs no new content, and every suggestion is already
 * right for this child's age — a hand-written library would be a second set of
 * strings to translate and would drift from the day the app actually
 * recommends.
 *
 * Deduplicated by title: the built-in day repeats "Feed" many times, and a
 * palette that lists the same card six times is a worse palette.
 *
 * Plain content, no shell: the folding section around it belongs to the page
 * (`CollapsibleSection`), so this used to carry a second, differently-styled
 * collapse of its own inside the first one.
 */
export function SlotPresets({
  months,
  onAdd,
}: {
  months: number | null
  onAdd: (slot: ScheduleSlot) => void
}) {
  const t = useT()

  const presets = useMemo(() => {
    const seen = new Set<string>()
    return buildDefaultSchedule(t, months).filter((slot) => {
      const key = `${slot.type}:${slot.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [t, months])

  if (presets.length === 0) return null

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((slot, i) => {
        const meta = dayActivityMeta[slot.type]
        const Icon = meta.icon
        return (
          <li key={`${slot.type}-${slot.title}-${i}`}>
            {/* One tap adds the moment, already typed, titled and timed — the
                whole point of the palette. It files itself into the day at the
                time it carries, rather than landing at the bottom of the list. */}
            <button
              type="button"
              onClick={() => onAdd({ ...slot })}
              className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors outline-none hover:border-ring hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', meta.dot)}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{slot.title}</span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {slot.time} · {slot.mins} {t.tracker.minutesShort}
                </span>
              </span>
              <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
