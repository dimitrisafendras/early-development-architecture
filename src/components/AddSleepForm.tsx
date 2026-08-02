import { useState } from 'react'
import { Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFieldLabels } from '../lib/useFieldLabels'
import { dateTimeKeyFromISO, isoFromDateTimeKey } from '../lib/dates'
import { useT } from '../i18n'

/**
 * Log a sleep that has already finished.
 *
 * The other half of the sleep log, and the one that gets used more: nobody is
 * awake at 05:40 to press "they woke up", so a night is nearly always entered
 * afterwards with both ends known. Both times are full date-and-time pickers
 * rather than clock times — a night starts on one date and ends on another, and
 * a picker that only edits the clock cannot express that at all.
 *
 * Shared between `/sleep` and the Day dashboard. `compact` drops the optional
 * note, which is the one field a dashboard has no room for and nobody fills in
 * at 3am; it changes nothing else, because a form that asks for different facts
 * in two places is two forms.
 *
 * `idPrefix` exists because both screens can be mounted at once — the dashboard
 * renders this inside the moment card while `/sleep` is a route away — and two
 * `<label for="sleep-start">` in one document point at whichever input the
 * browser finds first.
 */
export function AddSleepForm({
  onAdd,
  compact = false,
  idPrefix = 'sleep',
}: {
  onAdd: (input: { started_at: string; ended_at: string; note: string | null }) => Promise<void>
  compact?: boolean
  idPrefix?: string
}) {
  const t = useT()
  const tsl = t.sleepLog
  const fields = useFieldLabels()
  // An hour ago to now, not now to now: the form opens on a *valid* sleep, so
  // it does not greet the caregiver with its own validation error, and an hour
  // is the shape of the thing being logged.
  const [start, setStart] = useState(() =>
    dateTimeKeyFromISO(new Date(Date.now() - 60 * 60_000).toISOString()),
  )
  const [end, setEnd] = useState(() => dateTimeKeyFromISO(new Date().toISOString()))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const startISO = isoFromDateTimeKey(start)
  const endISO = isoFromDateTimeKey(end)
  // Both checks refuse rather than clamp: a wrong time is a fact about the
  // night, and silently moving it would file a sleep the caregiver never had.
  const error =
    new Date(endISO).getTime() > Date.now()
      ? tsl.endInFuture
      : new Date(endISO).getTime() <= new Date(startISO).getTime()
        ? tsl.endBeforeStart
        : null

  async function submit() {
    if (error) return
    setBusy(true)
    try {
      await onAdd({ started_at: startISO, ended_at: endISO, note: note.trim() || null })
      setNote('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor={`${idPrefix}-start`}>{tsl.startLabel}</Label>
          <DateTimePicker
            id={`${idPrefix}-start`}
            size="md"
            value={start}
            onValueChange={setStart}
            {...fields.dateTimePicker}
          />
        </div>
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor={`${idPrefix}-end`}>{tsl.endLabel}</Label>
          {/* The *end* is what is wrong in both cases — it is either before the
              start or in the future — so that is the field that carries the
              invalid state, not both of them. */}
          <DateTimePicker
            id={`${idPrefix}-end`}
            size="md"
            value={end}
            onValueChange={setEnd}
            invalid={Boolean(error)}
            {...fields.dateTimePicker}
          />
        </div>
        {!compact && (
          <div className="min-w-[10rem] flex-1 space-y-1.5">
            <Label htmlFor={`${idPrefix}-note`}>{tsl.noteLabel}</Label>
            <Input
              id={`${idPrefix}-note`}
              size="md"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
        <Button size="md" disabled={busy || Boolean(error)} onClick={() => void submit()}>
          <Timer /> {tsl.save}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
