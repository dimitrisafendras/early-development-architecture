import { useState, type FormEvent } from 'react'
import { Milk, Copy, Plus, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput, type NumberInputProps } from '@/components/ui/number-input'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { cn } from '@/lib/utils'
import { ChoiceGroup } from './ChoiceGroup'
import { nowDateTimeKey, useDateLocale } from '../lib/dates'
import { useFieldLabels } from '../lib/useFieldLabels'
import { todayKey } from '../lib/schedule'
import type { FeedMethod } from '../lib/db'
import { useT } from '../i18n'

/** Uses the app's locale, not the browser's, so it agrees with the time field. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export interface AddFeedInput {
  fed_at: string
  method: FeedMethod
  amount_ml: number | null
  minutes: number | null
  note: string | null
}

/**
 * Log-a-feed form, shared by the /feed page (full) and the /daily widget
 * (`compact`).
 *
 * Two blocks, never a pile of controls:
 *
 *   1. **the fast path** — a tinted strip naming the previous feed with
 *      `Repeat last` as the one filled primary in the form. Most feeds are the
 *      same as the last one, so the cheapest path owns the loudest button, and
 *      `Copy last` (which only prefills) sits beside it as quiet ghost text.
 *   2. **compose** — one wrapping row that fills its width: method pills, the
 *      amount stepper at a fixed comfortable width, the time picker absorbing
 *      the slack, the optional note collapsed behind a toggle, then `Log feed`
 *      demoted to `secondary` because the strip above already holds the
 *      primary. With no previous feed there is no strip, so `Log feed` becomes
 *      the primary automatically.
 *
 * The note only expands when asked for, and it takes over the slack the time
 * field was absorbing, so opening it never leaves a half-empty row and the
 * default card stays short. Compact drops the time + note fields, stamps the
 * feed at "now", and stacks full-width controls for the day widget's ~270px
 * zone.
 */
export function AddFeedForm({
  last,
  onAdd,
  compact = false,
}: {
  last: { method: FeedMethod; amount_ml: number | null; minutes: number | null; fed_at?: string } | null
  onAdd: (i: AddFeedInput) => Promise<void>
  compact?: boolean
}) {
  const tf = useT().feed
  const locale = useDateLocale()
  const fields = useFieldLabels()
  const lastDetail = !last
    ? ''
    : last.amount_ml != null
      ? `${last.amount_ml} ${tf.mlShort}`
      : last.minutes != null
        ? `${last.minutes} ${tf.minShort}`
        : ''
  const lastTime = last?.fed_at ? fmtTime(last.fed_at, locale) : ''
  const [method, setMethod] = useState<FeedMethod>('bottle')
  const [amount, setAmount] = useState<number | null>(null)
  const [minutes, setMinutes] = useState<number | null>(null)
  const [when, setWhen] = useState(nowDateTimeKey())
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  // Prefill from the previous feed but stamp the time to now.
  function copyLast() {
    if (!last) return
    setMethod(last.method)
    setAmount(last.amount_ml)
    setMinutes(last.minutes)
    setWhen(nowDateTimeKey())
  }

  // One tap: log an identical feed to the last one, stamped now.
  async function submitLast() {
    if (!last) return
    setBusy(true)
    try {
      await onAdd({
        fed_at: new Date().toISOString(),
        method: last.method,
        amount_ml: last.method === 'breast' ? null : last.amount_ml,
        minutes: last.method === 'breast' ? last.minutes : null,
        note: null,
      })
    } finally {
      setBusy(false)
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onAdd({
        fed_at: compact ? new Date().toISOString() : new Date(when).toISOString(),
        method,
        amount_ml: method === 'breast' ? null : amount,
        minutes: method === 'breast' ? minutes : null,
        note: note.trim() || null,
      })
      setAmount(null)
      setMinutes(null)
      setNote('')
      setNoteOpen(false)
      setWhen(nowDateTimeKey())
    } finally {
      setBusy(false)
    }
  }

  // Every control in the compose row — pills, stepper, picker, note, submit —
  // is `md`, the one size at which the whole control set is the same height.
  // See `ui/control-size.ts`: a row is only ever one size.
  const methodTabs = (
    <ChoiceGroup
      ariaLabel={tf.method}
      size="md"
      value={method}
      onChange={setMethod}
      options={(['bottle', 'breast', 'solid'] as const).map((m) => ({ value: m, label: tf[m] }))}
    />
  )

  const isBreast = method === 'breast'
  const amountId = isBreast ? 'f-min' : 'f-amt'
  const amountLabelText = isBreast ? tf.minutesLabel : tf.amountLabel
  /**
   * One source of truth for the stepper's numeric behaviour — breast logs
   * minutes, everything else millilitres — so the two layouts below can differ
   * in presentation without the step scales drifting apart.
   */
  // `unit` + a placeholder drawn from the last feed keep the field from ever
  // reading as an empty box, and hint the amount you probably want.
  // `indicatorMax` is the plausible top of each scale, not a limit — it only
  // drives the value bar on the field's bottom edge, so repeated presses read as
  // accumulating progress. Both scales start naturally at 0, so no `indicatorMin`.
  const amountProps: NumberInputProps = isBreast
    ? {
        id: 'f-min',
        value: minutes,
        onValueChange: setMinutes,
        floor: 0,
        step: 5,
        smallStep: 1,
        largeStep: 15,
        unit: tf.minShort,
        indicatorMax: 45,
        placeholder: last?.minutes != null ? String(last.minutes) : '15',
      }
    : {
        id: 'f-amt',
        value: amount,
        onValueChange: setAmount,
        floor: 0,
        step: 10,
        smallStep: 5,
        largeStep: 50,
        unit: tf.mlShort,
        indicatorMax: 250,
        placeholder: last?.amount_ml != null ? String(last.amount_ml) : '120',
      }

  /** What `Repeat last` will log, so the shortcut is never a blind tap. */
  const lastSummary = last && (
    <>
      {tf.lastFeed}: <span className="font-medium text-foreground">{tf[last.method]}</span>
      {lastDetail && (
        <>
          {' · '}
          <span className="font-medium text-foreground">{lastDetail}</span>
        </>
      )}
      {lastTime && <> · {lastTime}</>}
    </>
  )

  if (compact) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-3">
        {/* The fast path first: read the last feed, tap once, done. */}
        {last && (
          <div className="flex flex-col gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="min-w-0">{lastSummary}</span>
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={copyLast}
                className="-mr-1.5 px-2 text-xs text-muted-foreground"
              >
                <Copy className="mr-1.5 size-3.5" /> {tf.copyLast}
              </Button>
            </div>
            <Button type="button" onClick={submitLast} disabled={busy} className="w-full">
              <Repeat className="mr-2 size-4" /> {tf.repeatLast}
            </Button>
          </div>
        )}
        {methodTabs}
        {/* The stepper gets a row to itself. Sharing one with the submit button
            left ~40px of value between the −/+ caps in the day's ~21rem tool
            zone: unreadable, and impossible to aim a thumb at. The `max-w` is
            the other half of the same problem — in a wide zone a full-bleed
            stepper throws the two caps to opposite edges, so it stops growing
            once it is a comfortable field and stays left-aligned under its
            label. Value is bumped a step: it is this form's whole payload. */}
        <div className="space-y-1.5">
          <Label htmlFor={amountId}>{amountLabelText}</Label>
          <NumberInput {...amountProps} {...fields.stepper} className="max-w-[16rem]" />
        </div>
        {/* Demoted to `secondary` while a one-tap repeat exists above; the only
            filled button here when it doesn't. */}
        <Button
          type="submit"
          variant={last ? 'secondary' : 'default'}
          disabled={busy}
          className="w-full"
        >
          <Milk className="mr-2 size-4" /> {tf.save}
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {last && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-muted/50 p-2 sm:p-2.5">
          <p className="min-w-0 flex-1 px-1 text-xs text-muted-foreground sm:text-[13px]">{lastSummary}</p>
          {/* Reversed on a phone so the primary sits above the quiet prefill;
              side by side (quiet first) once there is room for a row. */}
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            {/* Same size as everything else in the card; the hierarchy is
                carried by the fill, never by being taller. */}
            <Button type="button" variant="ghost" size="md" onClick={copyLast} className="text-muted-foreground">
              <Copy className="mr-2 size-4" /> {tf.copyLast}
            </Button>
            <Button type="button" size="md" onClick={submitLast} disabled={busy}>
              <Repeat className="mr-2 size-4" /> {tf.repeatLast}
            </Button>
          </div>
        </div>
      )}

      {/* One wrapping row, widths by importance rather than a 4-up grid: the
          pills take a row of their own until `xl`, the stepper a fixed
          comfortable field, and whichever of time/note is expanded absorbs the
          slack — so no row is ever left half-empty. */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full xl:w-auto">{methodTabs}</div>

        <div className="w-full space-y-1.5 sm:w-[10rem]">
          <Label htmlFor={amountId}>{amountLabelText}</Label>
          <NumberInput {...amountProps} {...fields.stepper} />
        </div>

        <div
          className={cn(
            'w-full space-y-1.5',
            noteOpen ? 'sm:w-[12rem]' : 'sm:min-w-[12rem] sm:flex-1 lg:max-w-[17rem]',
          )}
        >
          <Label htmlFor="f-when">{tf.timeLabel}</Label>
          <DateTimePicker
            id="f-when"
            size="md"
            value={when}
            onValueChange={setWhen}
            maxDate={todayKey()}
            {...fields.dateTimePicker}
          />
        </div>

        {noteOpen ? (
          <div className="w-full space-y-1.5 sm:min-w-[10rem] sm:flex-1 lg:max-w-[14rem]">
            <Label htmlFor="f-note">{tf.noteLabel}</Label>
            <Input
              id="f-note"
              autoFocus
              size="md"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        ) : (
          /* Optional, so it costs a tap instead of a permanent row. */
          <Button
            type="button"
            variant="ghost"
            aria-expanded={false}
            onClick={() => setNoteOpen(true)}
            className="w-full justify-start px-2 text-muted-foreground sm:w-auto"
          >
            <Plus className="mr-2 size-4" /> {tf.noteLabel}
          </Button>
        )}

        <Button
          type="submit"
          size="md"
          variant={last ? 'secondary' : 'default'}
          disabled={busy}
          className="w-full sm:ml-auto sm:w-auto"
        >
          <Milk className="mr-2 size-4" /> {tf.save}
        </Button>
      </div>
    </form>
  )
}
