import { useMemo, useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'
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
 */
export function SlotPresets({
  months,
  onAdd,
}: {
  months: number | null
  onAdd: (slot: ScheduleSlot) => void
}) {
  const t = useT()
  const ts = t.schedule
  const [open, setOpen] = useState(false)

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
    <section className="rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left outline-none"
      >
        <span className="min-w-0">
          <Eyebrow as="span">{ts.presetsTitle}</Eyebrow>
          <span className="mt-0.5 block text-xs text-muted-foreground">{ts.presetsHint}</span>
        </span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((slot, i) => {
            const meta = dayActivityMeta[slot.type]
            const Icon = meta.icon
            return (
              <li key={`${slot.type}-${slot.title}-${i}`}>
                {/* One tap adds the moment, already typed, titled and timed —
                    the whole point of the palette. It lands at the end of the
                    list, where the caregiver is already looking. */}
                <button
                  type="button"
                  onClick={() => onAdd({ ...slot })}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-ring hover:bg-accent"
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
      )}
    </section>
  )
}
