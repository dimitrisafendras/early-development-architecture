import { CalendarRange, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eyebrow } from './Eyebrow'
import { dayActivityMeta } from './dayActivity'
import { useFieldLabels } from '../lib/useFieldLabels'
import { formatAgeRange } from '../lib/schedule'
import type { AgeSchedule } from '../store'
import { useT } from '../i18n'

/**
 * Choosing which day you are editing, and making a new one.
 *
 * A child's day is re-shaped several times before three, so a single saved
 * schedule was always going to go stale: the newborn day tuned at six weeks is
 * wrong by eighteen months, and the app would have gone on serving it. Each
 * program covers from its start month until the next one begins, so the
 * effective day follows the child with nobody re-editing anything.
 *
 * **Programs are cards, not chips.** The first version was a row of "From 0 mo"
 * / "From 3 mo" pills, which made the reader do the arithmetic to find out what
 * each one covered — and gave the last one no visible end at all. A card states
 * the range outright, shows the shape of the day inside it, and says which one
 * is in use today, so picking the right one is reading rather than deducing.
 */
export function ScheduleBands({
  bands,
  activeId,
  babyMonths,
  onSelect,
  onAdd,
  onSeedAll,
  onRemove,
  onChangeFrom,
}: {
  bands: AgeSchedule[]
  activeId: string | null
  babyMonths: number | null
  onSelect: (id: string) => void
  onAdd: () => void
  /** Seed one editable day per built-in age band, birth to three. */
  onSeedAll: () => void
  onRemove: (id: string) => void
  onChangeFrom: (id: string, fromMonths: number) => void
}) {
  const t = useT()
  const ts = t.schedule
  const fields = useFieldLabels()

  /** The program in effect for this child — the last one they have reached. */
  const inUseId =
    babyMonths == null
      ? null
      : [...bands].reverse().find((b) => b.fromMonths <= babyMonths)?.id ?? null

  const current = bands.find((b) => b.id === activeId) ?? null
  /** A program ends where the next one starts; the last runs open-ended. */
  const endOf = (index: number) => bands[index + 1]?.fromMonths ?? null

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/40 p-3 sm:p-4">
      <div className="min-w-0">
        <Eyebrow as="span">{ts.programsTitle}</Eyebrow>
        <p className="mt-0.5 text-xs text-muted-foreground">{ts.programsHint}</p>
      </div>

      {bands.length === 0 ? (
        // Nothing saved: there is no program to choose between, so the offer is
        // the whole set at once rather than one empty day to fill in by hand.
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">{ts.programsEmpty}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={onSeedAll}>
              <CalendarRange className="mr-2 size-4" /> {ts.bandSeedAll}
            </Button>
            <Button variant="ghost" onClick={onAdd} className="text-muted-foreground">
              <Plus className="mr-2 size-4" /> {ts.programNew}
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bands.map((band, i) => {
            const selected = band.id === activeId
            return (
              <li key={band.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(band.id)}
                  className={cn(
                    'flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors',
                    selected
                      ? 'border-primary bg-accent/50'
                      : 'border-border bg-card hover:border-ring hover:bg-accent/30',
                  )}
                >
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-heading text-sm font-semibold">
                      {formatAgeRange(band.fromMonths, endOf(i), t.baby.monthsShort, t.baby.yearsShort)}
                    </span>
                    {band.id === inUseId && <Badge variant="soft">{ts.bandInUse}</Badge>}
                  </span>

                  {/* The day's shape at a glance — one tick per moment in its
                      activity's colour. Two programs for neighbouring ages read
                      as different days here without opening either. */}
                  <span className="flex gap-0.5" aria-hidden>
                    {band.slots.map((slot, n) => (
                      <span
                        key={n}
                        className={cn('h-1.5 flex-1 rounded-full', dayActivityMeta[slot.type].bar)}
                      />
                    ))}
                  </span>

                  <span className="text-xs text-muted-foreground tabular-nums">
                    {ts.blueprintSlots.replace('{n}', String(band.slots.length))}
                  </span>
                </button>
              </li>
            )
          })}

          {/* The new-program action sits in the grid as a peer of the programs,
              so "make another one" is where you are already looking. */}
          <li>
            <button
              type="button"
              onClick={onAdd}
              className="flex h-full min-h-24 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-accent/30 hover:text-foreground"
            >
              <Plus className="size-4" />
              {ts.programNew}
            </button>
          </li>
        </ul>
      )}

      {current && (
        <div className="flex flex-wrap items-end gap-3 border-t border-border/70 pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="band-from">{ts.bandFromLabel}</Label>
            <NumberInput
              id="band-from"
              {...fields.stepper}
              size="md"
              value={current.fromMonths}
              floor={0}
              max={36}
              step={1}
              unit={t.baby.monthsShort}
              onValueChange={(v) => onChangeFrom(current.id, v ?? 0)}
              className="w-36"
            />
          </div>
          {/* Removing the last program is allowed: with none saved the app falls
              back to the built-in day for the age, which is a valid state, not
              an empty one. */}
          <Button
            variant="ghost"
            onClick={() => onRemove(current.id)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="mr-2 size-4" /> {ts.programDelete}
          </Button>
        </div>
      )}
    </section>
  )
}
