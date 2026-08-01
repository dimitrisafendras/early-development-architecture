import { useState } from 'react'
import { CalendarRange, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSection } from './CollapsibleSection'
import { NewProgramForm, type ProgramSource } from './NewProgramForm'
import { DayShapeBar, DayShapeSummary } from './DayShapeBar'
import { dayActivityOrder } from './dayActivity'
import { formatAgeRange, formatAgeLabel } from '../lib/schedule'
import { useSectionOpen } from '../lib/useSectionOpen'
import type { AgeSchedule } from '../store'
import type { DayActivity } from '../data'
import { useT } from '../i18n'

/** The strip runs birth to three years; a program starting later still gets a
 *  visible segment, so the axis stretches rather than clipping it. */
const AXIS_MONTHS = 36

interface Segment {
  from: number
  /** Exclusive; the axis end for the last program. */
  to: number
  band: AgeSchedule | null
}

/**
 * Which day you are editing, drawn as an age axis rather than a grid of cards.
 *
 * Programs are contiguous, non-overlapping spans over the first three years —
 * a one-dimensional structure. The grid of cards made the reader rebuild that
 * timeline in their head from nine start ages, which is exactly the complaint
 * that the different schedules were hard to tell apart. One proportional bar
 * makes "which day is my child on" a glance (the *Now* pin) and "what changes
 * next" the segment to its right.
 *
 * Uncovered stretches are drawn too, as dashed segments — a gap in cover is
 * information (the app falls back to the built-in day there), and selecting one
 * is the fastest way to say "make me a program starting here".
 */
export function ScheduleBands({
  bands,
  activeId,
  babyMonths,
  onSelect,
  onCreate,
  onSeedAll,
  onRemove,
  onChangeFrom,
  onUseBuiltIn,
}: {
  bands: AgeSchedule[]
  activeId: string | null
  babyMonths: number | null
  onSelect: (id: string) => void
  onCreate: (fromMonths: number, source: ProgramSource) => void
  /** Seed one editable day per built-in age band, birth to three. */
  onSeedAll: () => void
  onRemove: (id: string) => void
  onChangeFrom: (id: string, fromMonths: number) => void
  /** Replace this program's day with the built-in one for its start age. */
  onUseBuiltIn: (fromMonths: number) => void
}) {
  const t = useT()
  const ts = t.schedule
  const [creating, setCreating] = useState<number | null>(null)
  // Open by default: this section names the day the rest of the page edits, so
  // folding it away by default would hide the page's own subject.
  const [open, toggle] = useSectionOpen('programs', true)

  /** The program in effect for this child — the last one they have reached. */
  const inUseId =
    babyMonths == null
      ? null
      : [...bands].reverse().find((b) => b.fromMonths <= babyMonths)?.id ?? null

  const activeIndex = bands.findIndex((b) => b.id === activeId)
  const current = activeIndex >= 0 ? bands[activeIndex] : null
  const next = activeIndex >= 0 ? bands[activeIndex + 1] ?? null : null

  const axisEnd = Math.max(AXIS_MONTHS, (bands[bands.length - 1]?.fromMonths ?? 0) + 6)

  // Segments in age order, including the uncovered head before the first
  // program. Every segment gets a floor width so a one-month band stays
  // clickable at 360px.
  const segments: Segment[] = []
  if (bands.length && bands[0].fromMonths > 0) {
    segments.push({ from: 0, to: bands[0].fromMonths, band: null })
  }
  bands.forEach((band, i) => {
    segments.push({ from: band.fromMonths, to: bands[i + 1]?.fromMonths ?? axisEnd, band })
  })

  const rangeOf = (s: Segment) =>
    formatAgeRange(
      s.from,
      s.band && s.to >= axisEnd ? null : s.to,
      t.baby.monthsShort,
      t.baby.yearsShort,
    )

  /**
   * What actually changes at the next program: the counts per activity kind
   * that differ. This is the one sentence a parent planning ahead is asking
   * for — "naps 3 → 2" beats reading two twenty-row days side by side.
   */
  const diffs = (() => {
    if (!current || !next) return []
    const count = (b: AgeSchedule, type: DayActivity) =>
      b.slots.filter((s) => s.type === type).length
    return dayActivityOrder
      .map((type) => ({ type, from: count(current, type), to: count(next, type) }))
      .filter((d) => d.from !== d.to)
  })()

  const create = (fromMonths: number, source: ProgramSource) => {
    onCreate(fromMonths, source)
    setCreating(null)
  }

  return (
    <CollapsibleSection
      title={ts.programsTitle}
      hint={ts.programsHint}
      count={bands.length || undefined}
      open={open}
      onToggle={toggle}
      actions={
        !open && current ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatAgeRange(
              current.fromMonths,
              next?.fromMonths ?? null,
              t.baby.monthsShort,
              t.baby.yearsShort,
            )}
          </span>
        ) : null
      }
    >
      {bands.length === 0 ? (
        // Nothing saved: there is no program to choose between, so the offer is
        // the whole set at once rather than one empty day to fill in by hand.
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm text-muted-foreground">{ts.programsEmpty}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={onSeedAll}>
              <CalendarRange className="mr-2 size-4" /> {ts.bandSeedAll}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCreating(babyMonths ?? 0)}
              className="text-muted-foreground"
            >
              <Plus className="mr-2 size-4" /> {ts.programNew}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* The axis. Segments size themselves by how many months they cover,
              so the newborn weeks read as the sliver they are and the toddler
              years as the long stretch they are. */}
          <div>
            {/* Scrolls within itself on a phone rather than widening the page.
                Nine segments at the 44px touch minimum need ~480px, so below
                that the axis has to give somewhere — and wrapping it to a second
                line would break the one thing it exists to show, which is a
                single continuous run of ages. The shell never scrolls
                horizontally (see CLAUDE.md); this does.

                Not `GlassScrollArea`: that utility fades the *top and bottom*
                edges and its scrollbar is vertical, so on a horizontal axis it
                would fade the wrong two edges. The mask below is its horizontal
                equivalent, and it is dropped from `lg` up where the whole axis
                fits and a fade would be lying about content that isn't there. */}
            <ul
              className="-mx-1 flex items-stretch gap-1 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)] lg:[mask-image:none]"
              aria-label={ts.stripAria}
            >
              {segments.map((seg, i) => {
                const selected = seg.band != null && seg.band.id === activeId
                const months = Math.max(1, seg.to - seg.from)
                return (
                  <li
                    key={i}
                    style={{ flexGrow: months, flexBasis: 0 }}
                    className="min-w-11"
                  >
                    <button
                      type="button"
                      aria-pressed={selected}
                      // The visible label is only the start age, because a
                      // two-month segment has room for nothing else; the full
                      // span is what the control actually means, so it is the
                      // accessible name rather than a `title` a screen reader
                      // may never reach.
                      aria-label={rangeOf(seg)}
                      onClick={() =>
                        seg.band ? onSelect(seg.band.id) : setCreating(seg.from)
                      }
                      className={cn(
                        'flex h-full w-full flex-col justify-between gap-1 rounded-lg border px-1.5 py-2 text-left transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                        seg.band == null
                          ? 'border-dashed border-border text-muted-foreground hover:border-ring hover:bg-accent/30'
                          : selected
                            ? 'border-primary bg-accent/60'
                            : 'border-border bg-card hover:border-ring hover:bg-accent/30',
                      )}
                    >
                      <span className="truncate text-xs font-semibold tabular-nums">
                        {seg.from === 0 && seg.band == null
                          ? '0'
                          : formatAgeLabel(seg.from, t.baby.monthsShort, t.baby.yearsShort)}
                      </span>
                      {seg.band ? (
                        <DayShapeBar slots={seg.band.slots} />
                      ) : (
                        <Plus className="size-3 shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                )
              })}
              <li className="shrink-0">
                <button
                  type="button"
                  aria-label={ts.programNew}
                  title={ts.programNew}
                  onClick={() => setCreating(suggestedStart(bands, babyMonths))}
                  className="flex h-full min-h-14 w-11 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-ring hover:bg-accent/30 hover:text-foreground"
                >
                  <Plus className="size-4" aria-hidden />
                </button>
              </li>
            </ul>

            {/* Where this child is on the axis right now — a marker *on* the
                line, positioned by age, rather than a sentence underneath it.
                As a caption the reader still had to work out where "0 mo" fell
                on a bar whose segments are all different widths. */}
            {babyMonths != null && (
              <div className="relative mt-1.5 h-4" aria-hidden>
                <span
                  className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                  style={{ left: `${Math.min(100, (babyMonths / axisEnd) * 100)}%` }}
                >
                  <span className="h-2 w-px bg-primary" />
                  <span className="size-1.5 rounded-full bg-primary" />
                </span>
              </div>
            )}
            {babyMonths != null && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="sr-only">{ts.stripAria}. </span>
                {ts.stripNow} · {formatAgeLabel(babyMonths, t.baby.monthsShort, t.baby.yearsShort)}
              </p>
            )}
          </div>

          {/* The selected program, in full. Only one day's stripe is expanded at
              a time — nine at once was the thing that made them blur together. */}
          {current && creating == null && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="font-heading text-sm font-semibold">
                    {formatAgeRange(
                      current.fromMonths,
                      next?.fromMonths ?? null,
                      t.baby.monthsShort,
                      t.baby.yearsShort,
                    )}
                  </span>
                  {current.id === inUseId && <Badge variant="soft">{ts.bandInUse}</Badge>}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {ts.blueprintSlots.replace('{n}', String(current.slots.length))}
                </span>
              </div>

              {/* No second stripe here: the selected segment above already
                  draws it, twenty pixels away. The counted summary is the half
                  of the pair that can actually be read. */}
              <DayShapeSummary slots={current.slots} />

              {/* What changes at the next program — the question a parent is
                  really asking when they look ahead. */}
              <p className="text-xs leading-relaxed text-muted-foreground">
                {next ? (
                  <>
                    <span className="font-semibold text-foreground">
                      {ts.nextChangeLabel.replace(
                        '{age}',
                        formatAgeLabel(next.fromMonths, t.baby.monthsShort, t.baby.yearsShort),
                      )}
                      :{' '}
                    </span>
                    {diffs.length
                      ? diffs
                          .map((d) =>
                            ts.diffArrow
                              .replace('{type}', t.fullDay.types[d.type])
                              .replace('{from}', String(d.from))
                              .replace('{to}', String(d.to)),
                          )
                          .join(' · ')
                      : ts.diffNone}
                  </>
                ) : (
                  ts.nextChangeNone.replace(
                    '{age}',
                    formatAgeLabel(current.fromMonths, t.baby.monthsShort, t.baby.yearsShort),
                  )
                )}
              </p>

              <div className="flex flex-wrap items-end gap-3 border-t border-border/70 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="band-from">{ts.bandFromLabel}</Label>
                  <NumberInput
                    id="band-from"
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
                {/* Removing the last program is allowed: with none saved the app
                    falls back to the built-in day for the age, which is a valid
                    state, not an empty one. */}
                {/* The nine built-in days are what the axis already shows, so
                    "start this program again from the researched day for its
                    age" is an action on the program rather than a second
                    catalogue of the same nine. */}
                <Button
                  variant="ghost"
                  onClick={() => onUseBuiltIn(current.fromMonths)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-2 size-4" /> {ts.blueprintUse}
                </Button>
                {/* Confirmed, like every other destructive action here. With
                    autosave there is no undo, and this erases a hand-built day
                    on one ghost-button click. */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!window.confirm(ts.programDeleteConfirm)) return
                    onRemove(current.id)
                  }}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" /> {ts.programDelete}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {creating != null && (
        <div className="mt-3">
          <NewProgramForm
            bands={bands}
            currentBand={current}
            defaultFrom={creating}
            onCreate={create}
            onCancel={() => setCreating(null)}
          />
        </div>
      )}
    </CollapsibleSection>
  )
}

/**
 * The age the "new program" button opens on: the child's own age when nothing
 * claims it — the likeliest reason to be adding one — otherwise a few months
 * past the last program, which is where the next change of shape tends to fall.
 */
function suggestedStart(bands: AgeSchedule[], babyMonths: number | null): number {
  const taken = new Set(bands.map((b) => b.fromMonths))
  if (babyMonths != null && !taken.has(babyMonths)) return babyMonths
  const last = bands.length ? Math.max(...bands.map((b) => b.fromMonths)) : -3
  let next = last + 3
  while (taken.has(next) && next < 36) next += 1
  return Math.min(next, 36)
}
