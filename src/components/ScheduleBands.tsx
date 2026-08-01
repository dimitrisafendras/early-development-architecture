import { useState } from 'react'
import { CalendarRange, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { LiveBadge, LiveDot } from '@/components/ui/live-badge'
import { CollapsibleSection } from './CollapsibleSection'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import { NewProgramForm, type ProgramSource } from './NewProgramForm'
import { DayShapeBar, DayShapeSummary } from './DayShapeBar'
import { dayActivityOrder } from './dayActivity'
import { cn } from '@/lib/utils'
import { formatAgeRange, formatAgeLabel, activityTargetForAge } from '../lib/schedule'
import { useSectionOpen } from '../lib/useSectionOpen'
import type { AgeSchedule } from '../store'
import type { DayActivity } from '../data'
import { useT } from '../i18n'

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
  onClearAll,
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
  /** Clear every program and return to the empty state. */
  onClearAll: () => void
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

  const rangeOf = (band: AgeSchedule, index: number) =>
    formatAgeRange(
      band.fromMonths,
      bands[index + 1]?.fromMonths ?? null,
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
        <>
          {!open && current && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatAgeRange(
                current.fromMonths,
                next?.fromMonths ?? null,
                t.baby.monthsShort,
                t.baby.yearsShort,
              )}
            </span>
          )}
          {/* Getting back to nothing took nine deletions. It belongs on the set,
              not on any one program — and only when there is a set. */}
          {open && bands.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!window.confirm(ts.clearAllConfirm)) return
                onClearAll()
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 size-4" /> {ts.clearAll}
            </Button>
          )}
        </>
      }
    >
      {bands.length === 0 ? (
        // Nothing saved: there is no program to choose between, so the offer is
        // the whole set at once rather than one empty day to fill in by hand.
        <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4 text-center">
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
          {/* One control with nine positions, not nine buttons.
              This was a grid of 96×56px tiles, then a row of detached pills —
              both of which said "nine things" when the truth is one axis of
              ages with a current position. `SegmentedGroup` says it in the
              shape: a recessed track, and a thumb that travels to the program
              you pick. The day's shape moved to the panel below, where there
              is room to read it. */}
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedGroup
              ariaLabel={ts.stripAria}
              size="md"
              value={activeId ?? ''}
              onValueChange={onSelect}
              options={bands.map((band, i) => ({
                value: band.id,
                ariaLabel: rangeOf(band, i),
                label: (
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    {band.id === inUseId && (
                      // The child's position, on the control rather than under
                      // it. A pin placed by `age / axisEnd` was only ever right
                      // while segment widths were proportional to months.
                      // `currentColor`, not `bg-primary`: on the selected item
                      // the thumb *is* primary, so a primary dot on top of it
                      // disappears.
                      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
                    )}
                    {formatAgeLabel(band.fromMonths, t.baby.monthsShort, t.baby.yearsShort)}
                  </span>
                ),
              }))}
            />
            <Button
              variant="ghost"
              size="md"
              onClick={() => setCreating(suggestedStart(bands, babyMonths))}
              className="text-muted-foreground"
            >
              <Plus className="mr-2 size-4" /> {ts.programNew}
            </Button>
          </div>

          {/* What the marked chip means — the quiet half of the same live fact
              the badge below states in full. It uses the same `LiveDot`, so the
              dot on the chip, the dot here and the dot in the badge are visibly
              one thing rather than three similar circles.

              Rendered for every program, not only while the in-use one is
              unselected: making it conditional would move the panel under it up
              and down by a line as you step along the axis, and this legend is
              the least important thing on the page to be causing that. */}
          {babyMonths != null && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LiveDot className="text-primary" />
              {ts.stripNow} · {formatAgeLabel(babyMonths, t.baby.monthsShort, t.baby.yearsShort)}
            </p>
          )}

          {/* The selected program, in full. Only one day's stripe is expanded at
              a time — nine at once was the thing that made them blur together. */}
          {/* The documented sub-panel inside a Card: 14px radius, muted ground,
              no border. It was a second bordered card drawn inside the first
              with a different radius and padding. */}
          {current && creating == null && (
            <div className="flex flex-col gap-3 rounded-xl bg-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Held at the badge's own height whether or not the badge is
                    there. The badge is 26px against a 22px line, so the panel
                    grew by 4px on exactly one program of the nine — and stepping
                    along the axis nudged everything below it. */}
                <span data-slot="band-heading" className="flex min-h-6.5 items-center gap-2">
                  <span className="text-[15px] font-semibold">
                    {formatAgeRange(
                      current.fromMonths,
                      next?.fromMonths ?? null,
                      t.baby.monthsShort,
                      t.baby.yearsShort,
                    )}
                  </span>
                  {/* The one live fact on this page, and now the only thing on
                      it that moves. As a plain <Badge> it was the same shape as
                      the counts and the tags around it — a label saying "now"
                      that looked no more current than "15 moments". */}
                  {current.id === inUseId && babyMonths != null && (
                    <LiveBadge
                      detail={formatAgeLabel(babyMonths, t.baby.monthsShort, t.baby.yearsShort)}
                    >
                      {ts.bandInUse}
                    </LiveBadge>
                  )}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {ts.blueprintSlots.replace('{n}', String(current.slots.length))}
                </span>
              </div>

              <DayShapeBar slots={current.slots} dense />
              <DayShapeSummary slots={current.slots} />

              {/* The age guidance, checked against the day being authored.
                  This is where the age target belongs: `/tracker` measures the
                  caregiver against their own plan, so the plan itself has to be
                  measured against something, and here is where it can still be
                  changed. It reads the program's *own* start age, not the
                  child's — the day for 0–2 months is judged as a 0–2 month day
                  whoever is looking at it. */}
              <ActivityCheck band={current} />

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
                <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onUseBuiltIn(current.fromMonths)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="mr-2 size-4" /> {ts.resetThisDay}
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
 * How the day's own movement minutes compare with the guidance for its age.
 *
 * A day program can plan far more or far less than the age band asks for, and
 * until this line existed nothing said so anywhere: `/tracker` now measures the
 * caregiver against their plan rather than against the guidance, which is only
 * defensible if the plan itself is checked somewhere — and the only useful
 * somewhere is here, next to the day while it can still be edited.
 *
 * Silent when the day plans none of this kind of moment: a program with no
 * tummy time is a deliberate shape (a night-heavy newborn day, say), not a
 * shortfall to nag about.
 */
function ActivityCheck({ band }: { band: AgeSchedule }) {
  const t = useT()
  const { mins: target, kind } = activityTargetForAge(band.fromMonths)
  const slots = band.slots.filter((slot) => slot.type === (kind === 'movement' ? 'active' : 'tummy'))
  if (!slots.length) return null

  const planned = slots.reduce((sum, slot) => sum + slot.mins, 0)
  const short = planned < target
  return (
    <p className={cn('text-xs', short ? 'text-warning' : 'text-muted-foreground')}>
      {(short ? t.schedule.activityShort : t.schedule.activityOk)
        .replace('{planned}', String(planned))
        .replace('{target}', String(target))
        .replace('{kind}', t.fullDay.types[kind === 'movement' ? 'active' : 'tummy'])}
    </p>
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
