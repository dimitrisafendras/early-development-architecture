import { useState } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { useFieldLabels } from '../lib/useFieldLabels'
import { isoFromDateTimeKey, joinDateTimeKey, toDateKey, timeKeyFromISO } from '../lib/dates'
import { todayKey } from '../lib/schedule'
import { useT } from '../i18n'

/**
 * `HH:MM` for a date, floored to the picker's five-minute step.
 *
 * Flooring matters, and rounding would be a bug: `TimePicker` offers minutes in
 * steps of five, so a draft of 01:14 *displays* as 01:15 — a stop time one
 * minute in the future, which the form would then refuse to save while showing
 * the user nothing they had chosen. Flooring keeps the value the field shows and
 * the value the form validates the same thing.
 */
function timeKey(d: Date, step = 5): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(Math.floor(d.getMinutes() / step) * step).padStart(2, '0')
  return `${h}:${m}`
}

/** A session's three fields, as the form uses them. */
export interface SessionDraft {
  date: string
  start: string
  end: string
}

/** A draft for a session that has not happened yet: today, an hour ago to now,
 *  so the common case ("I forgot to time the one just now") is two taps. */
export function newSessionDraft(): SessionDraft {
  const now = new Date()
  const before = new Date(now.getTime() - 10 * 60000)
  return { date: toDateKey(now), start: timeKey(before), end: timeKey(now) }
}

/** A draft seeded from a session already on file, for editing it. */
export function draftFromSession(session: { started_at: string; ended_at: string }): SessionDraft {
  return {
    date: toDateKey(new Date(session.started_at)),
    start: timeKeyFromISO(session.started_at),
    end: timeKeyFromISO(session.ended_at),
  }
}

/**
 * When a session happened: one date and two times.
 *
 * Shared by the edit row and the "log a past session" form, which is the whole
 * reason it exists — they ask the same three questions, enforce the same rule,
 * and would otherwise be two copies drifting apart the way the tummy widget and
 * the tracker page already did once.
 *
 * The rule: **stop must come after start.** A stop at or before the start yields
 * a zero or negative duration, and every reading downstream — the day's total,
 * the bar, the weekly chart, the streak — would take it at face value. Cheaper
 * to refuse the save than to sanitise it in each of them. Save is disabled and
 * the reason is stated, because a dead button with no explanation beside it is
 * the form failing silently.
 */
export function SessionFields({
  idPrefix,
  draft,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  runningSince,
}: {
  /** Namespaces the field ids, so several of these can coexist in one list. */
  idPrefix: string
  draft: SessionDraft
  onChange: (draft: SessionDraft) => void
  onSubmit: (startedAt: string, endedAt: string) => Promise<void> | void
  onCancel: () => void
  submitLabel: string
  /** When a session is running, the moment it started — see `clashes`. */
  runningSince?: Date | null
}) {
  const t = useT()
  const fields = useFieldLabels()
  const [busy, setBusy] = useState(false)
  // `HH:MM` is zero-padded and fixed-width, so it orders correctly as a string.
  const ordered = draft.end > draft.start

  const startsAt = new Date(isoFromDateTimeKey(joinDateTimeKey(draft.date, draft.start)))
  const endsAt = new Date(isoFromDateTimeKey(joinDateTimeKey(draft.date, draft.end)))

  // A session cannot have finished in the future. The date picker capped the
  // *day*, which let today's row claim time that has not happened yet — and
  // "today 45 / 60 min" describing the next two hours is the kind of number
  // every other reading on the page then trusts.
  const inFuture = endsAt.getTime() > Date.now()

  // Nor can it overlap the session running right now: those minutes get banked
  // again on Stop, so the same time would be counted twice. This is the one
  // overlap worth refusing — two *closed* sessions overlapping is usually a
  // parent backfilling approximate times, and blocking that would make the form
  // an argument.
  const clashes =
    runningSince != null && endsAt.getTime() > runningSince.getTime() && startsAt.getTime() < Date.now()

  const valid = ordered && !inFuture && !clashes

  async function submit() {
    if (!valid) return
    setBusy(true)
    try {
      await onSubmit(
        isoFromDateTimeKey(joinDateTimeKey(draft.date, draft.start)),
        isoFromDateTimeKey(joinDateTimeKey(draft.date, draft.end)),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
        {/* Date first: it scopes the two times that follow, and reading the row
            in the other order asks "09:15 on which day?". */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-date`}>{t.common.date}</Label>
          <DatePicker
            id={`${idPrefix}-date`}
            value={draft.date}
            onValueChange={(date) => onChange({ ...draft, date })}
            max={todayKey()}
            className="w-40"
            {...fields.datePicker}
          />
        </div>
        {/* The DS pickers, not `<input type="time">`: the native control's
            appearance is the browser's, so it ignored the app's 24-hour clock
            and both themes. `invalid` marks the stop field rather than the start
            one — stop is the value that has to move. */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-start`}>{t.tracker.start}</Label>
          <TimePicker
            id={`${idPrefix}-start`}
            value={draft.start}
            onValueChange={(start) => onChange({ ...draft, start })}
            className="w-32"
            {...fields.timePicker}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-end`}>{t.tracker.stop}</Label>
          <TimePicker
            id={`${idPrefix}-end`}
            value={draft.end}
            onValueChange={(end) => onChange({ ...draft, end })}
            invalid={!valid}
            className="w-32"
            {...fields.timePicker}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={submit} disabled={busy || !valid}>
            <Check className="mr-1.5 size-4" /> {submitLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t.common.cancel}
          </Button>
        </div>
      </div>
      {/* Always says why Save is dead. A disabled button with no reason beside
          it is the form failing silently. */}
      {!ordered && <p className="text-xs text-destructive">{t.tracker.endBeforeStart}</p>}
      {ordered && inFuture && (
        <p className="text-xs text-destructive">{t.tracker.endInFuture}</p>
      )}
      {ordered && !inFuture && clashes && (
        <p className="text-xs text-destructive">{t.tracker.overlapsRunning}</p>
      )}
    </div>
  )
}
