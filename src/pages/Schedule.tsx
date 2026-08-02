import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Trash2, Plus, Check, AlertTriangle } from 'lucide-react'
import { GlassScrollArea } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { PageFrame } from '../components/PageFrame'
import { EmptyState } from '../components/EmptyState'
import { ActivityField } from '../components/ActivityField'
import { SlotPresets } from '../components/SlotPresets'
import { ScheduleBands } from '../components/ScheduleBands'
import type { ProgramSource } from '../components/NewProgramForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Button, buttonVariants } from '@/components/ui/button'
import { NumberInput } from '@/components/ui/number-input'
import { TimePicker } from '@/components/ui/time-picker'
import { Label } from '@/components/ui/label'
import { dayActivityMeta, dayActivityOrder } from '../components/dayActivity'
import type { DayActivity } from '../data'
import { dayTemplates, defaultSlotMins, type ScheduleSlot } from '../data'
import {
  useSchedule,
  buildDefaultSchedule,
  buildScheduleFromTemplate,
  localizeSlot,
  scheduleForAge,
} from '../lib/useSchedule'
import { useBabyAge } from '../components/AgeBadge'
import { useFieldLabels } from '../lib/useFieldLabels'
import { slotEndTime, sortByClock, overlapMinutes, formatAgeRange, firstFreeTime } from '../lib/schedule'
import { useAppStore, sortSchedules, type AgeSchedule } from '../store'
import { useT } from '../i18n'

/**
 * A row in the editor: a slot plus an identity that survives re-sorting.
 *
 * The list re-files itself whenever a time changes, and React reuses DOM by key
 * — so with `key={index}` the focused time field would suddenly be showing a
 * *different* moment under the caret, and every `htmlFor` would re-bind to the
 * wrong row. The uid is editor-only and stripped before saving; it never enters
 * the store, so no migration is needed.
 */
interface Row extends ScheduleSlot {
  uid: string
}

let uidSeq = 0
function toRows(slots: ScheduleSlot[]): Row[] {
  return slots.map((slot) => ({ ...slot, uid: `row-${uidSeq++}` }))
}
function toSlots(rows: Row[]): ScheduleSlot[] {
  return rows.map(({ uid: _uid, ...slot }) => slot)
}

export default function Schedule() {
  const t = useT()
  const ts = t.schedule
  const customSchedules = useAppStore((s) => s.customSchedules)
  const setCustomSchedules = useAppStore((s) => s.setCustomSchedules)
  const baby = useBabyAge()
  const months = baby?.months ?? null
  const initial = useSchedule()
  const fields = useFieldLabels()

  /**
   * Which program is being edited. Opens on the one governing the child today,
   * because that is the day the caregiver is living in; with nothing saved it is
   * `null` and the rows below are the built-in day, which the first edit turns
   * into a program.
   */
  const [activeId, setActiveId] = useState<string | null>(
    () => scheduleForAge(customSchedules, months)?.id ?? customSchedules[0]?.id ?? null,
  )
  const [rows, setRows] = useState<Row[]>(() => sortByClock(toRows(initial)))

  /** The add-moment form. Local, not persisted — a popover is a transaction. */
  const [adding, setAdding] = useState(false)
  /**
   * The time the next moment will be added at.
   *
   * Asked once, at the top of the form, rather than left to be corrected on the
   * row afterwards: "when" is the only thing every one of these adds needs and
   * the only thing neither the kind nor the preset can supply. It re-seeds from
   * the day's first free minute each time the form opens, so the common case
   * needs no input at all.
   */
  const [addTime, setAddTime] = useState('09:00')
  /** The row just added — scrolled to, focused and briefly lit. See `insert`. */
  const [flashUid, setFlashUid] = useState<string | null>(null)

  /** The age span of the program on screen, for the day card's own header. */
  const activeRange = useMemo(() => {
    const i = customSchedules.findIndex((b) => b.id === activeId)
    if (i < 0) return ts.builtInDay
    return formatAgeRange(
      customSchedules[i].fromMonths,
      customSchedules[i + 1]?.fromMonths ?? null,
      t.baby.monthsShort,
      t.baby.yearsShort,
    )
  }, [customSchedules, activeId, t, ts.builtInDay])

  /**
   * Every title the app itself wrote: the eight generic activity names plus the
   * built-in day's own moments for this age. A row is renamed when its activity
   * changes only if its title is in here — matching just the generic names left
   * a nap called "Floor play", and matching nothing would overwrite "Dad's turn".
   */
  const appWrittenTitles = useMemo(() => {
    const titles = new Set<string>(dayActivityOrder.map((a) => t.fullDay.types[a]))
    for (const template of dayTemplates) {
      for (const slot of buildScheduleFromTemplate(t, template)) titles.add(slot.title)
    }
    return titles
  }, [t])

  /**
   * Autosave.
   *
   * The explicit Save button was not just slow — switching programs replaced the
   * rows outright, so any unsaved edit was silently thrown away with no warning
   * and no undo. Writing on change removes that whole class of loss, and the
   * store is local-first, so a write is a local write.
   *
   * It writes only after a real edit, tracked by `edited`. Two cheaper-looking
   * guards were tried and both saved a program nobody had touched: a "skip the
   * first effect" flag, which React's development double-invoke walks straight
   * past, and a content comparison against the built-in day — which fails
   * because the child's age arrives asynchronously, so the rows start as the
   * default day for *no known age* and legitimately change once the age loads.
   * Neither of those is an edit. Only an edit is.
   */
  const [savedAt, setSavedAt] = useState(false)
  const [edited, setEdited] = useState(false)

  /**
   * The latest editor state, so unmount can flush from *live* values.
   *
   * A captured "pending write" closure is not enough: the effect that would
   * capture it runs after render, so leaving the page in the same tick as the
   * last keystroke flushed a closure from *before* that keystroke — writing back
   * stale rows and losing the edit anyway. A ref updated during render is always
   * current by the time the cleanup runs.
   */
  const latest = useRef({ rows, activeId, edited })
  latest.current = { rows, activeId, edited }

  useEffect(() => {
    if (!edited) return
    const stored = activeId ? customSchedules.find((b) => b.id === activeId)?.slots : null
    if (stored && sameSlots(stored, toSlots(rows))) return

    const write = () => {
      if (!activeId) {
        // First edit with nothing saved starts the program at 0 months rather
        // than at the child's current age: the day on screen came from the
        // built-in schedule, and dating it "from 9 months" would leave a younger
        // sibling — or a re-read of this child's own history — with no cover.
        const band: AgeSchedule = { id: newBandId(), fromMonths: 0, slots: toSlots(rows) }
        setCustomSchedules([band])
        setActiveId(band.id)
      } else {
        setCustomSchedules(
          useAppStore
            .getState()
            .customSchedules.map((b) => (b.id === activeId ? { ...b, slots: toSlots(rows) } : b)),
        )
      }
      setSavedAt(true)
    }
    const id = setTimeout(write, 400)
    return () => clearTimeout(id)
  }, [rows, edited, activeId, customSchedules])

  /**
   * Write whatever is on screen right now, debounce or no debounce.
   *
   * Two things can end the editing session before the 400 ms timer fires:
   * unmounting (leaving the route) and the tab going away (closed, reloaded, or
   * backgrounded on a phone). The second is the one that actually loses work —
   * no React cleanup runs at all — so `pagehide` has to be listened for
   * directly. `pagehide` rather than `beforeunload`: it is the event that fires
   * on iOS when Safari freezes a backgrounded tab, which is exactly the moment a
   * caregiver switches away mid-edit.
   */
  const flush = useCallback(() => {
    const { rows: r, activeId: id, edited: dirty } = latest.current
    if (!dirty) return
    const slots = toSlots(r)
    const store = useAppStore.getState()
    const all = store.customSchedules
    if (!id) {
      if (!all.length) store.setCustomSchedules([{ id: newBandId(), fromMonths: 0, slots }])
      return
    }
    const stored = all.find((b) => b.id === id)?.slots
    if (stored && sameSlots(stored, slots)) return
    store.setCustomSchedules(all.map((b) => (b.id === id ? { ...b, slots } : b)))
  }, [])

  useEffect(() => {
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

  /** Load a set of rows into the editor. The autosave stays quiet on its own:
   *  what is loaded matches what is stored, so there is nothing to write. */
  const load = (slots: ScheduleSlot[], id: string | null) => {
    setActiveId(id)
    // Stored slots come out of the store with the words they were saved with;
    // the editor shows them in the language the app is in, like every other
    // reader of a saved program.
    setRows(sortByClock(toRows(slots.map((s) => localizeSlot(t, s)))))
    setSavedAt(true)
    setEdited(false)
  }

  /**
   * While nothing is saved, the rows *are* the built-in day — so they have to
   * follow it when the child's age finally loads, or the editor sits on the day
   * for the wrong band until the page is reopened. Skipped the moment the
   * caregiver edits anything, which is the point at which the rows become
   * theirs rather than the app's.
   */
  useEffect(() => {
    if (activeId || edited) return
    setRows(sortByClock(toRows(buildDefaultSchedule(t, months))))
  }, [activeId, edited, t, months])

  /**
   * Keyed by uid, not index, and wrapped so the identity is stable across
   * renders: with 28 rows — each holding a popover, a time picker and a number
   * field — a fresh closure per render meant one keystroke in one title
   * re-rendered the entire day.
   */
  const patch = useCallback((uid: string, p: Partial<ScheduleSlot>) => {
    setSavedAt(false)
    setEdited(true)
    setRows((r) => r.map((row) => (row.uid === uid ? { ...row, ...p } : row)))
  }, [])
  /**
   * Re-file the list a moment after a time changes, never on the change itself.
   *
   * The picker commits hour and minute as two separate choices, so sorting
   * immediately would slide the row out from under the finger between them. The
   * pause lets the whole edit land first; `sortByClock` returns the same array
   * when nothing moved, so a settle that changes no order costs nothing.
   */
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const settle = useCallback(() => {
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => setRows((r) => sortByClock(r)), 700)
  }, [])
  useEffect(() => () => clearTimeout(settleTimer.current), [])

  const remove = useCallback((uid: string) => {
    setSavedAt(false)
    setEdited(true)
    setRows((r) => r.filter((row) => row.uid !== uid))
  }, [])

  /**
   * Add one moment, and then *show* it.
   *
   * There is no "insert between": with clock time as the only ordering, adding
   * a moment at a time *is* inserting it. The cost of that is that a new moment
   * files itself into the middle of a twenty-odd row list — so the add used to
   * end with the popover closing and nothing else visibly happening, leaving
   * the caregiver to scan the day for the row they had just created. Every add
   * now hands the new row its own uid to the effect below, which scrolls to it,
   * puts the caret in its name and lights it for a moment.
   */
  const insert = (slot: ScheduleSlot) => {
    const [row] = toRows([slot])
    setSavedAt(false)
    setEdited(true)
    setRows((r) => sortByClock([...r, row]))
    setAdding(false)
    setFlashUid(row.uid)
  }

  /** Add a moment of a kind, at the chosen time, with that kind's own name and
   *  typical length. This replaced a "Blank moment" button that was neither: it
   *  hard-coded a feed, and placed it after the array's last row — which on a
   *  clock-sorted day is the night feed, so it proposed half past two. */
  const insertType = (type: DayActivity) => {
    insert({
      time: addTime,
      type,
      mins: defaultSlotMins[type],
      title: t.fullDay.types[type],
      detail: '',
    })
  }

  /**
   * Take the caregiver to the moment they just added.
   *
   * Focus alone would scroll it into view, but only just into view — at the
   * very edge of the scroll container, under the shell's own chrome. Scrolling
   * it to the middle first and then focusing with `preventScroll` keeps the new
   * row where it can be read together with the moments around it, which is the
   * thing being decided.
   */
  useEffect(() => {
    if (!flashUid) return
    const el = document.getElementById(`slot-what-${flashUid}`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    el?.focus({ preventScroll: true })
    const id = setTimeout(() => setFlashUid(null), 1800)
    return () => clearTimeout(id)
  }, [flashUid])

  /**
   * Give the open program the built-in day written for its own start age.
   *
   * This is all that survived of the "Day blueprints" section, which was a
   * second grid of the same nine days sitting under the axis that already shows
   * them — two pickers competing for one decision. Replacing a day belongs to
   * the program being replaced, not to a catalogue.
   */
  const useBuiltInDay = (fromMonths: number) => {
    if (!window.confirm(ts.blueprintConfirm)) return
    setSavedAt(false)
    setEdited(true)
    setRows(sortByClock(toRows(buildDefaultSchedule(t, fromMonths))))
  }

  /** Switch programs, loading that program's day into the editor. */
  const selectBand = (id: string) => {
    const band = customSchedules.find((b) => b.id === id)
    if (!band) return
    load(band.slots.length ? band.slots : buildDefaultSchedule(t, band.fromMonths), id)
  }

  /**
   * Create a program at a chosen age, from a chosen starting point. Both are the
   * caller's — `NewProgramForm` asks for them.
   */
  const createBand = (fromMonths: number, source: ProgramSource) => {
    const slots =
      source === 'empty'
        ? []
        : source === 'copy'
          ? // A slot is flat, so a shallow copy per row is enough to keep the new
            // program from sharing objects with the one it was copied from.
            (customSchedules.find((b) => b.id === activeId)?.slots ?? []).map((slot) => ({ ...slot }))
          : buildDefaultSchedule(t, fromMonths)
    const band: AgeSchedule = { id: newBandId(), fromMonths, slots }
    setCustomSchedules(sortSchedules([...customSchedules, band]))
    load(slots, band.id)
  }

  /**
   * Seed one editable day per built-in age band, birth to three.
   *
   * `upperMonths` on the previous template is this one's start, so the nine
   * programs tile the timeline with no gap and no overlap — the same partition
   * the app already uses to choose a sample day, now editable.
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
    load(current.slots, current.id)
  }

  /**
   * Clear every program and go back to the empty state.
   *
   * With no programs saved the app falls back to the built-in day for the
   * child's age — a valid state, not a broken one — and the empty state offers
   * the whole set again. Without this, starting over meant deleting nine
   * programs one at a time.
   */
  const clearAllBands = () => {
    setCustomSchedules([])
    load(buildDefaultSchedule(t, months), null)
  }

  const removeBand = (id: string) => {
    const next = customSchedules.filter((b) => b.id !== id)
    setCustomSchedules(next)
    const fallback = scheduleForAge(next, months) ?? next[0] ?? null
    load(
      fallback?.slots.length ? fallback.slots : buildDefaultSchedule(t, months),
      fallback?.id ?? null,
    )
  }

  /**
   * Move a program's start age.
   *
   * Re-sorts, and refuses an age another program already starts at. Neither was
   * done before, and both matter: the programs list is required to be in age
   * order (`scheduleForAge` walks it in order and `ScheduleBands` derives each
   * span from its neighbour), so stepping one past the next program produced
   * segments running backwards and ranges that lied — and stepping onto an
   * exact match created the duplicate `NewProgramForm` exists to prevent.
   */
  const changeBandFrom = (id: string, fromMonths: number) => {
    if (customSchedules.some((b) => b.id !== id && b.fromMonths === fromMonths)) return
    setCustomSchedules(
      sortSchedules(customSchedules.map((b) => (b.id === id ? { ...b, fromMonths } : b))),
    )
  }

  return (
    <PageFrame
      title={ts.title}
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
        onCreate={createBand}
        onSeedAll={seedAllBands}
        onRemove={removeBand}
        onChangeFrom={changeBandFrom}
        onUseBuiltIn={useBuiltInDay}
        onClearAll={clearAllBands}
      />

      {/* The day itself: one card holding a divided list, not twenty cards. A
          full day is twenty-odd moments, and twenty cards was six screens of
          form for something that has to be read as a single rhythm. */}
      {rows.length === 0 ? (
        <EmptyState>{ts.empty}</EmptyState>
      ) : (
        <Card>
          {/* Which program this day belongs to. Without it the two blocks read
              as unrelated, and the answer to "whose day am I editing" lived
              only in the other card. */}
          {/* Add lives here, at the top, not under the list. A day is twenty-odd
              rows; a button in the card's footer meant scrolling the whole day
              to reach the control that adds to it, and then scrolling back to
              find where the new moment had filed itself. */}
          <CardHeader className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
              <CardTitle>{activeRange}</CardTitle>
              <span className="text-xs text-muted-foreground tabular-nums">
                {ts.blueprintSlots.replace('{n}', String(rows.length))}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Two questions, in the order they are actually answered: when,
                  then what. Both used to be guesses the form made for you and
                  you undid on the row afterwards. */}
              <Popover
                open={adding}
                onOpenChange={(open) => {
                  if (open) setAddTime(firstFreeTime(rows))
                  setAdding(open)
                }}
              >
                {/* Classes on the trigger, not `render={<Button/>}`: `Button` is
                    a plain function component, so the render prop has no ref to
                    attach and React warns on every mount. */}
                <PopoverTrigger className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  <Plus className="mr-2 size-4" /> {ts.addSlot}
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  // Capped and split into a fixed head and a scrolling tail: at
                  // full height the form is taller than the room under its own
                  // trigger, so it flipped above the header and had its Time
                  // field clipped off the top of the window. The time and the
                  // eight kinds stay put; only the preset list scrolls.
                  className="flex max-h-[min(28rem,calc(100svh-4rem))] w-[min(23rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0"
                >
                  <div className="space-y-1.5 p-3">
                    <Label htmlFor="add-time">{ts.timeLabel}</Label>
                    <TimePicker
                      id="add-time"
                      size="md"
                      value={addTime}
                      onValueChange={setAddTime}
                      className="w-full"
                      {...fields.timePicker}
                    />
                    <p className="text-xs text-muted-foreground">{ts.sortNote}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 p-3">
                    <Label>{ts.whatLabel}</Label>
                    {/* One tap per kind, named and coloured. The eight kinds are
                        a closed set, so they belong on the surface rather than
                        behind a picker inside a picker. */}
                    <div className="flex flex-wrap gap-1.5">
                      {dayActivityOrder.map((type) => {
                        const meta = dayActivityMeta[type]
                        const Icon = meta.icon
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => insertType(type)}
                            // A rounded square like every other control in this
                            // popover; a capsule here was the odd corner out
                            // beside the time field and the preset rows.
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border py-1.5 pr-2.5 pl-2 text-xs font-medium transition-colors outline-none hover:border-ring hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <Icon className={cn('size-3.5', meta.text)} aria-hidden />
                            {t.fullDay.types[type]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <Separator />
                  {/* The named moments of the built-in day for this age — the
                      same tap, but arriving with a real title and a typical
                      length. They take the time chosen above rather than the one
                      they were written with, which is what used to drop a preset
                      feed straight on top of the existing 07:00 feed. */}
                  {/* `GlassScrollArea`, not a bare `overflow-y-auto`: this list
                      is twenty-odd presets in a popover barely taller than four
                      of them, and a hard-cut edge with a hidden scrollbar gives
                      no sign there is more. It is the app's one in-card scroll
                      region utility — edge fades and a frosted, self-hiding bar
                      — and every other scrolling list already uses it. */}
                  <div className="min-h-0 flex-1 p-3">
                    <p className="pb-2 text-xs text-muted-foreground">{ts.presetsHint}</p>
                    <GlassScrollArea className="max-h-[15rem]">
                      <SlotPresets
                        months={months}
                        time={addTime}
                        listClassName="grid-cols-1"
                        onAdd={insert}
                      />
                    </GlassScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
              {/* Autosave is invisible by design, so it has to speak: a live
                  region is the only evidence a screen-reader user gets that the
                  Save button they used to press is no longer needed. */}
              <span
                role="status"
                aria-live="polite"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                {savedAt && <Check className="size-3.5" aria-hidden />}
                {savedAt ? ts.saved : ts.autoSaved}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ol id="day-moments" className="divide-y divide-border/70">
              {rows.map((row, i) => (
                <SlotRow
                  key={row.uid}
                  row={row}
                  next={rows[i + 1]}
                  appWrittenTitles={appWrittenTitles}
                  flash={row.uid === flashUid}
                  onPatch={patch}
                  onSettle={settle}
                  onRemove={remove}
                />
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

    </PageFrame>
  )
}

/**
 * Whether two days are the same, field for field.
 *
 * Cheap enough to run on every keystroke — a day is a couple of dozen flat
 * objects — and it is what keeps the autosave from writing back what it just
 * read, which would mark an untouched program as edited.
 */
function sameSlots(a: ScheduleSlot[], b: ScheduleSlot[]): boolean {
  return (
    a.length === b.length &&
    a.every((slot, i) => {
      const other = b[i]
      return (
        slot.time === other.time &&
        slot.type === other.type &&
        slot.mins === other.mins &&
        slot.title === other.title &&
        slot.detail === other.detail
      )
    })
  )
}

/** Ids only need to be unique within one device's saved list. */
function newBandId(): string {
  return `band-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * One moment in the day.
 *
 * Memoised, and given callbacks that are stable across renders, because a day
 * is up to 28 of these and each one holds a popover, a time picker and a number
 * field — without this, one keystroke in one title re-rendered all of them.
 */
const SlotRow = memo(function SlotRow({
  row,
  next,
  appWrittenTitles,
  flash,
  onPatch,
  onSettle,
  onRemove,
}: {
  row: Row
  /** The moment after this one, for the overlap check. */
  next: Row | undefined
  appWrittenTitles: Set<string>
  /** Just added: lit briefly so the row can be found in a twenty-row day. */
  flash: boolean
  onPatch: (uid: string, p: Partial<ScheduleSlot>) => void
  onSettle: () => void
  onRemove: (uid: string) => void
}) {
  const t = useT()
  const ts = t.schedule
  const fields = useFieldLabels()
  const meta = dayActivityMeta[row.type]
  const tool = meta.tool

  /**
   * Changing the activity renames the moment — but only while the name is still
   * one the app wrote. "Feed" → pick Sleep → "Sleep / nap" is what you want;
   * "Dad's turn" → pick Sleep → "Sleep / nap" would throw away something typed
   * by hand, so a title matching no app-written name is left alone.
   */
  const titleIsDefault = row.title.trim() === '' || appWrittenTitles.has(row.title)

  const changeType = (type: DayActivity) => {
    onPatch(row.uid, {
      type,
      // Renaming to the new kind's generic name drops the moment key with it: the
      // words no longer describe that moment, so re-deriving them would put the
      // old name back the next time the language changed.
      ...(titleIsDefault ? { title: t.fullDay.types[type], moment: undefined } : null),
      // A slot still at its kind's typical length follows the new kind; an
      // edited duration is the caregiver's and stays.
      ...(row.mins === defaultSlotMins[row.type] ? { mins: defaultSlotMins[type] } : null),
    })
  }

  const overlap = next ? overlapMinutes(row, next) : 0
  const warningId = `slot-overlap-${row.uid}`

  return (
    // Lit instantly, faded out slowly: arriving at once is what makes it
    // findable, and leaving over half a second is what keeps it from reading as
    // a row that has permanently changed colour. A wash rather than a ring — a
    // ring on a divided list draws a second line beside the dividers.
    <li className={cn('transition-colors duration-500', flash && 'bg-primary/8 duration-0')}>
      <div className="flex gap-3 px-4 py-3">
        {/* The activity's colour as a rail down the row. This is what makes a
            twenty-row day scannable without reading a word — the sleep blocks
            and the feed cadence show up as a vertical stripe. */}
        <span className={cn('w-1 shrink-0 rounded-full', meta.bar)} aria-hidden />

        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
          {/* Phone: the "what" gets its own full-width line and the timing sits
              below it. From `sm` the whole moment is one line. */}
          <div className="order-1 min-w-0 flex-1 basis-auto space-y-1.5 sm:order-2 sm:min-w-48 sm:basis-0">
            <Label htmlFor={`slot-what-${row.uid}`} className="sr-only">
              {ts.whatLabel}
            </Label>
            <ActivityField
              id={`slot-what-${row.uid}`}
              size="md"
              type={row.type}
              title={row.title}
              placeholder={ts.titlePlaceholder}
              onTypeChange={changeType}
              // `moment: undefined` — the row's words are the caregiver's from
              // here on. Leaving the key attached would let the next language
              // switch resolve the moment again and overwrite what they typed.
              onTitleChange={(title) => onPatch(row.uid, { title, moment: undefined })}
            />
          </div>

          <div className="order-3 space-y-1.5 sm:order-1">
            <Label htmlFor={`slot-time-${row.uid}`} className="sr-only">
              {ts.timeLabel}
            </Label>
            <TimePicker
              id={`slot-time-${row.uid}`}
              size="md"
              value={row.time}
              onValueChange={(time) => {
                onPatch(row.uid, { time })
                onSettle()
              }}
              aria-describedby={overlap > 0 ? warningId : undefined}
              className="w-28"
              {...fields.timePicker}
            />
          </div>

          <div className="order-4 space-y-1.5 sm:order-3">
            <Label htmlFor={`slot-mins-${row.uid}`} className="sr-only">
              {ts.durationLabel}
            </Label>
            <NumberInput
              id={`slot-mins-${row.uid}`}
              {...fields.stepper}
              size="md"
              value={row.mins}
              floor={1}
              max={720}
              step={5}
              unit={t.tracker.minutesShort}
              aria-describedby={overlap > 0 ? warningId : undefined}
              onValueChange={(v) => onPatch(row.uid, { mins: v ?? defaultSlotMins[row.type] })}
              // `w-40`, not `w-32`: the two steppers and the unit take a fixed
              // 110px of it, so at 128px the field a caregiver actually taps into
              // was 18px wide — narrower than the digits it holds, and narrower
              // still with the Greek unit beside them.
              className="w-40"
            />
          </div>

          <div className="order-2 flex items-center gap-1 sm:order-4 sm:ml-auto">
            {/* The end time, computed. Times and durations are only followable
                if the reader never has to do the arithmetic themselves. */}
            <span className="mr-1 hidden text-xs text-muted-foreground tabular-nums sm:inline">
              {ts.endsAt.replace('{time}', slotEndTime(row.time, row.mins))}
            </span>
            {/* The moment and the tool that records it, joined. The association
                lives on `dayActivityMeta`, so this appears wherever an activity
                has a logger and stays silent where none exists. A `Button` with
                `render`, not a hand-rolled link: beside the delete button it has
                to be the same size, and `size="icon"` is 44px on a phone where a
                bare `size-8` link was 32. */}
            {/* Every row reserves this slot, whether or not the activity has a
                logger. Rendering the link only when one exists let the delete
                button slide left on sleep, play, care and wind-down rows, so no
                two rows in the list lined up — the cheapest possible way to make
                a tidy table look untidy. */}
            {tool ? (
              <Link
                to={tool.to}
                aria-label={ts.logsIn.replace('{tool}', tool.label(t))}
                title={ts.logsIn.replace('{tool}', tool.label(t))}
                // `buttonVariants`, not `<Button render={<Link/>}>`: the Base UI
                // button renders `<a role="button">`, which tells a screen
                // reader "button" for something that navigates and drops every
                // link affordance with it. Borrowing the classes keeps the
                // control scale (44px on a phone, 32 from `sm`, matching the
                // delete button beside it) and leaves the link a link.
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'text-muted-foreground hover:text-foreground',
                )}
              >
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className="size-11 shrink-0 sm:size-8" aria-hidden />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={ts.remove}
              onClick={() => onRemove(row.uid)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* A moment that runs into the next one. Flagged, never blocked: a real
          day has slack, and a caregiver mid-edit has a baby on one arm. It is a
          live region and is named by the two fields that cause it, so it is not
          a sentence only sighted users discover. */}
      {overlap > 0 && (
        <p
          id={warningId}
          role="status"
          className="flex items-center gap-1.5 px-4 pb-2 text-xs text-warning"
        >
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          {ts.overlap.replace('{n}', String(overlap))}
        </p>
      )}
    </li>
  )
})
