import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown, Trash2, Plus, RotateCcw, Check, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageFrame } from '../components/PageFrame'
import { EmptyState } from '../components/EmptyState'
import { ActivityField } from '../components/ActivityField'
import { SlotPresets } from '../components/SlotPresets'
import { DayBlueprints } from '../components/DayBlueprints'
import { ScheduleBands } from '../components/ScheduleBands'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { TimePicker } from '@/components/ui/time-picker'
import { Label } from '@/components/ui/label'
import { dayActivityMeta, dayActivityOrder } from '../components/dayActivity'
import { useSortableList, reorder } from '../lib/useSortableList'
import type { DayActivity } from '../data'
import { dayTemplates, defaultSlotMins, type ScheduleSlot } from '../data'
import { useSchedule, buildDefaultSchedule, buildScheduleFromTemplate, scheduleForAge } from '../lib/useSchedule'
import { useBabyAge } from '../components/AgeBadge'
import { useFieldLabels } from '../lib/useFieldLabels'
import { useAppStore, sortSchedules, type AgeSchedule } from '../store'
import { useT } from '../i18n'

export default function Schedule() {
  const t = useT()
  const ts = t.schedule
  const customSchedules = useAppStore((s) => s.customSchedules)
  const setCustomSchedules = useAppStore((s) => s.setCustomSchedules)
  // Resetting goes back to the built-in day for *this child's age*, not to the
  // 3–6 month one — the app now ships five sample days.
  const baby = useBabyAge()
  const months = baby?.months ?? null
  const initial = useSchedule()

  /**
   * Which band is being edited.
   *
   * Opens on the one governing the child today, because that is the day the
   * caregiver is living in; with nothing saved yet it is `null` and the rows
   * below are the built-in day, which saving turns into the first band.
   */
  const [activeId, setActiveId] = useState<string | null>(
    () => scheduleForAge(customSchedules, months)?.id ?? customSchedules[0]?.id ?? null,
  )
  const [rows, setRows] = useState<ScheduleSlot[]>(initial)
  const [saved, setSaved] = useState(false)

  const dirty = () => setSaved(false)
  const patch = (i: number, p: Partial<ScheduleSlot>) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...p } : row)))
    dirty()
  }
  const move = (i: number, dir: -1 | 1) => {
    setRows((r) => {
      const j = i + dir
      if (j < 0 || j >= r.length) return r
      const next = [...r]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    dirty()
  }
  const remove = (i: number) => {
    setRows((r) => r.filter((_, idx) => idx !== i))
    dirty()
  }
  const add = () => {
    // A new moment starts at the typical length for its kind rather than at 0 —
    // an empty duration would render as an already-finished activity. The title
    // is the activity's own name rather than blank, so a just-added row already
    // says what it is; `titleIsDefault` below keeps it in step until it's edited.
    setRows((r) => [
      ...r,
      { time: '12:00', type: 'feed', mins: defaultSlotMins.feed, title: t.fullDay.types.feed, detail: '' },
    ])
    dirty()
  }
  const addPreset = (slot: ScheduleSlot) => {
    setRows((r) => [...r, slot])
    dirty()
  }
  /** Replace the whole day with a built-in blueprint (confirmed by the caller). */
  const loadBlueprint = (slots: ScheduleSlot[]) => {
    setRows(slots)
    dirty()
  }
  /**
   * Every title the app itself wrote: the seven generic activity names plus the
   * built-in day's own moments for this age.
   *
   * A row is renamed when its activity changes only if its title is in here.
   * Matching just the generic names was too narrow — almost every row starts
   * life as a built-in moment like "Floor play & serve-return", so switching
   * its type left a nap called "Floor play". Matching nothing at all would be
   * worse: it would overwrite "Dad's turn".
   */
  const appWrittenTitles = useMemo(() => {
    const titles = new Set<string>(dayActivityOrder.map((a) => t.fullDay.types[a]))
    for (const slot of buildDefaultSchedule(t, months)) titles.add(slot.title)
    return titles
  }, [t, months])

  /** Commit of a drag — see `useSortableList`, which reorders only on release. */
  const onReorder = useCallback((from: number, to: number) => {
    setRows((r) => reorder(r, from, to))
    setSaved(false)
  }, [])
  const sortable = useSortableList(rows.length, onReorder)
  /**
   * Save into the band being edited, creating the first one if none exists.
   *
   * A first save with no bands starts at 0 months rather than at the child's
   * current age: the day on screen came from the built-in schedule, the parent
   * has just made it theirs, and dating it "from 9 months" would leave a
   * younger sibling — or a re-read of the same child's history — with no cover.
   */
  const save = () => {
    if (!activeId) {
      const band: AgeSchedule = { id: newBandId(), fromMonths: 0, slots: rows }
      setCustomSchedules([band])
      setActiveId(band.id)
    } else {
      setCustomSchedules(
        customSchedules.map((b) => (b.id === activeId ? { ...b, slots: rows } : b)),
      )
    }
    setSaved(true)
  }
  const reset = () => {
    if (!window.confirm(ts.resetConfirm)) return
    // Drops only the band being edited; the others still cover their own ages.
    setCustomSchedules(customSchedules.filter((b) => b.id !== activeId))
    setActiveId(null)
    setRows(buildDefaultSchedule(t, months))
    setSaved(true)
  }

  /** Switch bands, loading that band's day into the editor. */
  const selectBand = (id: string) => {
    const band = customSchedules.find((b) => b.id === id)
    if (!band) return
    setActiveId(id)
    setRows(band.slots.length ? band.slots : buildDefaultSchedule(t, band.fromMonths))
    setSaved(true)
  }

  /**
   * A new band starts where the child is now and is seeded with the built-in
   * day for that age — an empty band would make "add" feel like a delete.
   */
  const addBand = () => {
    const from = months ?? 0
    const taken = new Set(customSchedules.map((b) => b.fromMonths))
    let fromMonths = from
    while (taken.has(fromMonths)) fromMonths += 1
    const band: AgeSchedule = {
      id: newBandId(),
      fromMonths,
      slots: buildDefaultSchedule(t, fromMonths),
    }
    const next = sortSchedules([...customSchedules, band])
    setCustomSchedules(next)
    setActiveId(band.id)
    setRows(band.slots)
    setSaved(true)
  }

  /**
   * Seed one editable day per built-in age band, covering birth to three.
   *
   * `upperMonths` on the previous template is this one's start, so the five
   * bands tile the timeline with no gap and no overlap — the same partition the
   * app already uses to choose a sample day, now made editable. Offered instead
   * of "add a day" while nothing is saved: starting from five real days beats
   * starting from one and discovering at 13 months that the nap never changed.
   */
  const seedAllBands = () => {
    let from = 0
    const bands: AgeSchedule[] = dayTemplates.map((template) => {
      const band: AgeSchedule = {
        id: newBandId(),
        fromMonths: from,
        slots: buildScheduleFromTemplate(t, template),
      }
      from = template.upperMonths
      return band
    })
    setCustomSchedules(bands)
    const current = scheduleForAge(bands, months) ?? bands[0]
    setActiveId(current.id)
    setRows(current.slots)
    setSaved(true)
  }

  const removeBand = (id: string) => {
    const next = customSchedules.filter((b) => b.id !== id)
    setCustomSchedules(next)
    const fallback = scheduleForAge(next, months) ?? next[0] ?? null
    setActiveId(fallback?.id ?? null)
    setRows(fallback?.slots.length ? fallback.slots : buildDefaultSchedule(t, months))
    setSaved(true)
  }

  const changeBandFrom = (id: string, fromMonths: number) => {
    setCustomSchedules(
      customSchedules.map((b) => (b.id === id ? { ...b, fromMonths } : b)),
    )
    setSaved(true)
  }

  return (
    <PageFrame
      title={ts.title}
      // Under the header, never above it: as the first child it pushed the title
      // ~44px lower than every other route's. Hidden from `xl`, where the SideNav
      // rail is always on screen and already offers the way back.
      toolbar={
        <Button
          variant="ghost"
          size="sm"
          render={<Link to="/" />}
          nativeButton={false}
          className="w-fit text-muted-foreground xl:hidden"
        >
          <ArrowLeft /> {ts.done}
        </Button>
      }
    >
      <ScheduleBands
        bands={customSchedules}
        activeId={activeId}
        babyMonths={months}
        onSelect={selectBand}
        onAdd={addBand}
        onSeedAll={seedAllBands}
        onRemove={removeBand}
        onChangeFrom={changeBandFrom}
      />

      {rows.length === 0 ? (
        <EmptyState>{ts.empty}</EmptyState>
      ) : (
        // `gap-4`: the one card-stack gap. This was the tightest stack in the app
        // at `gap-3`, against `gap-8` for the same stack on /family.
        <ol className="flex flex-col gap-4">
          {rows.map((row, i) => {
            const isDragging = sortable.draggingIndex === i
            return (
              <li
                key={i}
                ref={sortable.register(i)}
                // The dragged card rides the pointer; the rest slide by one slot
                // to open the gap it will land in. Nothing is reordered until
                // release — this is the preview, not the state.
                style={{
                  transform: isDragging
                    ? `translateY(${sortable.offsetY}px)`
                    : shiftFor(i, sortable.draggingIndex, sortable.overIndex),
                }}
                className={cn(
                  'transition-[transform] duration-150',
                  isDragging && 'relative z-10 transition-none',
                )}
              >
                <SlotRow
                  row={row}
                  index={i}
                  first={i === 0}
                  last={i === rows.length - 1}
                  dragging={isDragging}
                  appWrittenTitles={appWrittenTitles}
                  onGrip={sortable.start(i)}
                  onPatch={(p) => patch(i, p)}
                  onMove={(dir) => move(i, dir)}
                  onRemove={() => remove(i)}
                />
              </li>
            )
          })}
        </ol>
      )}

      <SlotPresets months={months} onAdd={addPreset} />

      <DayBlueprints months={months} onLoad={loadBlueprint} />

      {/* Pulled up against the list it annotates — as a plain frame child it got
          the full block gap above *and* below and read as orphaned. */}
      {/* One annotation block, not two frame children: the notes belong to the
          list above them, so they share its pull-up and sit a line apart from
          each other rather than a full block gap. The second one gives the
          typical lengths — otherwise the duration is a number the caregiver has
          to invent. */}
      <div className="-mt-3 space-y-1.5 text-xs leading-relaxed text-muted-foreground sm:-mt-5">
        <p>{ts.orderNote}</p>
        <p>{ts.durationNote}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
        <Button variant="secondary" onClick={add}>
          <Plus className="mr-2 size-4" /> {ts.addSlot}
        </Button>
        <Button onClick={save}>
          {saved ? <Check className="mr-2 size-4" /> : null}
          {saved ? ts.saved : ts.save}
        </Button>
        <Button
          variant="ghost"
          onClick={reset}
          className="ml-auto text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="mr-2 size-4" /> {ts.reset}
        </Button>
      </div>
    </PageFrame>
  )
}

/** Ids only need to be unique within one device's saved list. */
function newBandId(): string {
  return `band-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * How far a row slides to preview where the dragged card will land.
 *
 * By its own height rather than the dragged card's: the exact geometry is only
 * needed on commit, which `useSortableList` computes from live measurements.
 * This is the hint, and one card's height is within a few pixels of another's.
 */
function shiftFor(index: number, dragging: number | null, over: number | null): string {
  if (dragging === null || over === null || index === dragging) return 'none'
  if (dragging < over && index > dragging && index <= over) return 'translateY(-100%)'
  if (dragging > over && index < dragging && index >= over) return 'translateY(100%)'
  return 'none'
}

function SlotRow({
  row,
  index,
  first,
  last,
  dragging,
  appWrittenTitles,
  onGrip,
  onPatch,
  onMove,
  onRemove,
}: {
  row: ScheduleSlot
  /** Stable id source for the row's labels — the time value is not one: it
   *  changes on every keystroke, so `htmlFor` pointed at a moving target. */
  index: number
  first: boolean
  last: boolean
  dragging: boolean
  /** Titles the app authored — see the set built in `Schedule`. */
  appWrittenTitles: Set<string>
  onGrip: (event: React.PointerEvent) => void
  onPatch: (p: Partial<ScheduleSlot>) => void
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const t = useT()
  const ts = t.schedule
  const fields = useFieldLabels()

  /**
   * Changing the activity renames the moment — but only while the name is still
   * one the app wrote. "Feed" → pick Sleep → "Sleep / nap" is what you want;
   * "Dad's turn" → pick Sleep → "Sleep / nap" would be the app throwing away
   * something typed by hand, so a title that matches no activity's name is
   * treated as the caregiver's and left alone.
   */
  const titleIsDefault = row.title.trim() === '' || appWrittenTitles.has(row.title)
  const tool = dayActivityMeta[row.type].tool

  const changeType = (type: DayActivity) => {
    onPatch({
      type,
      ...(titleIsDefault ? { title: t.fullDay.types[type] } : null),
      // A slot still at its kind's typical length follows the new kind; an
      // edited duration is the caregiver's and stays.
      ...(row.mins === defaultSlotMins[row.type] ? { mins: defaultSlotMins[type] } : null),
    })
  }

  return (
    <Card className={cn(dragging && 'border-ring shadow-lg')}>
      <CardContent className="flex flex-col gap-4">
        {/* One field for what the moment *is* — the activity and its name were
            two separate controls (seven unlabelled pills, then a "Title" box),
            which asked the same question twice. */}
        <div className="flex items-end gap-2">
          {/* Grip, not a control: dragging is unreachable by keyboard and says
              nothing to a screen reader, so it is hidden from both and the ↑/↓
              buttons below are the accessible path. Removing them because a
              drag handle exists would make reordering mouse-only. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onPointerDown={onGrip}
            title={ts.dragHint}
            className="mb-0.5 shrink-0 cursor-grab touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>

          <div className="min-w-0 flex-1 space-y-1.5">
            <Label htmlFor={`slot-what-${index}`}>{ts.whatLabel}</Label>
            <ActivityField
              id={`slot-what-${index}`}
              size="md"
              type={row.type}
              title={row.title}
              placeholder={ts.titlePlaceholder}
              onTypeChange={changeType}
              onTitleChange={(title) => onPatch({ title })}
            />
            {/* The moment and the tool that records it, joined. The association
                lives on `dayActivityMeta`, so this line appears wherever an
                activity has a logger and stays silent where none exists —
                nothing here knows which route belongs to which kind. */}
            {tool && (
              <Link
                to={tool.to}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {ts.logsIn.replace('{tool}', tool.label(t))}
                <ArrowRight className="size-3" aria-hidden />
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`slot-time-${index}`}>{ts.timeLabel}</Label>
            {/* The DS picker, not `<input type="time">`. The native control's
                appearance belongs to the browser, so it ignored the app's
                24-hour pinning and rendered "07:00 AM" beside a schedule that
                is 24-hour everywhere else — and it ignored both themes. */}
            <TimePicker
              id={`slot-time-${index}`}
              size="md"
              value={row.time}
              onValueChange={(time) => onPatch({ time })}
              className="w-32"
              {...fields.timePicker}
            />
          </div>

          {/* How long, beside when — the day is only followable if a moment says
              both. `md`, matching the time field in the same row (never a height
              patched by className). */}
          <div className="space-y-1.5">
            <Label htmlFor={`slot-mins-${index}`}>{ts.durationLabel}</Label>
            <NumberInput
              id={`slot-mins-${index}`}
              {...fields.stepper}
              size="md"
              value={row.mins}
              floor={1}
              max={720}
              step={5}
              unit={t.tracker.minutesShort}
              onValueChange={(v) => onPatch({ mins: v ?? defaultSlotMins[row.type] })}
              className="w-36"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.moveUp}
              disabled={first}
              onClick={() => onMove(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.moveDown}
              disabled={last}
              onClick={() => onMove(1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.remove}
              onClick={onRemove}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
