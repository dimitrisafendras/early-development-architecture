import { useState, type FormEvent } from 'react'
import { Milk, Copy, Plus, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput, type NumberInputProps } from '@/components/ui/number-input'
import { DateTimePicker } from '@/components/ui/date-time-picker'
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
 * (`compact`). Compact drops the time + note fields, stamps the feed at "now",
 * and lays out as one column of full-width, equal-height controls — method
 * pills, then the amount stepper, then the actions — so it reads top-to-bottom
 * and every target stays thumb-sized inside the day's narrow feed widget.
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
      setWhen(nowDateTimeKey())
    } finally {
      setBusy(false)
    }
  }

  const methodTabs = (
    <ChoiceGroup
      ariaLabel={tf.method}
      size={compact ? 'default' : 'lg'}
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
  // `unit` + a placeholder drawn from the last feed keep the capsule from ever
  // reading as an empty box, and hint the amount you probably want.
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
        placeholder: last?.amount_ml != null ? String(last.amount_ml) : '120',
      }
  const amountControl = <NumberInput {...amountProps} {...fields.stepper} />
  const amountField = (
    <div className="space-y-1.5">
      <Label htmlFor={amountId}>{amountLabelText}</Label>
      {amountControl}
    </div>
  )

  if (compact) {
    return (
      <form onSubmit={submit} className="flex flex-col gap-3">
        {last && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              {tf.lastFeed}: <span className="font-medium text-foreground">{tf[last.method]}</span>
              {lastDetail && <> · {lastDetail}</>}
              {lastTime && <> · {lastTime}</>}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={copyLast}>
              <Copy className="mr-1.5 size-3.5" /> {tf.copyLast}
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
          <NumberInput
            {...amountProps}
            {...fields.stepper}
            className="max-w-[16rem]"
          />
        </div>
        {/* Primary, then the one-tap shortcut: one column of equal-height,
            full-width controls, each its own unambiguous target. */}
        <Button type="submit" disabled={busy} className="w-full">
          <Milk className="mr-2 size-4" /> {tf.save}
        </Button>
        {last && (
          <Button type="button" variant="secondary" onClick={submitLast} disabled={busy} className="w-full">
            <Repeat className="mr-2 size-4" /> {tf.repeatLast}
          </Button>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="col-span-2 space-y-1.5 sm:col-span-4">
        <Label>{tf.method}</Label>
        {methodTabs}
      </div>
      {amountField}
      {/* Full width on a phone — "Today, 23:43" does not fit half a row. */}
      <div className="col-span-2 space-y-1.5 sm:col-span-1">
        <Label htmlFor="f-when">{tf.timeLabel}</Label>
        <DateTimePicker
          id="f-when"
          value={when}
          onValueChange={setWhen}
          maxDate={todayKey()}
          {...fields.dateTimePicker}
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label htmlFor="f-note">{tf.noteLabel}</Label>
        <Input id="f-note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="col-span-2 flex flex-wrap items-end gap-3 sm:col-span-4">
        {last && (
          <Button type="button" variant="secondary" size="lg" onClick={copyLast}>
            <Copy className="mr-2 size-5" /> {tf.copyLast}
          </Button>
        )}
        {last && (
          <Button type="button" variant="secondary" size="lg" onClick={submitLast} disabled={busy}>
            <Repeat className="mr-2 size-5" /> {tf.repeatLast}
          </Button>
        )}
        <Button type="submit" size="lg" disabled={busy}>
          <Plus className="mr-2 size-5" /> {tf.save}
        </Button>
      </div>
    </form>
  )
}
