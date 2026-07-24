import { useState, type FormEvent } from 'react'
import { Milk, Copy, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { FeedMethod } from '../lib/db'
import { useT } from '../i18n'

function localNow(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
 * (`compact`). Compact drops the time + note fields and the copy-last button,
 * stamps the feed at "now", and lays out as a single tight column so it fits
 * inside the day's feed widget.
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
  const lastDetail = !last
    ? ''
    : last.amount_ml != null
      ? `${last.amount_ml} ${tf.mlShort}`
      : last.minutes != null
        ? `${last.minutes} ${tf.minShort}`
        : ''
  const lastTime = last?.fed_at ? fmtTime(last.fed_at) : ''
  const [method, setMethod] = useState<FeedMethod>('bottle')
  const [amount, setAmount] = useState('')
  const [minutes, setMinutes] = useState('')
  const [when, setWhen] = useState(localNow())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  // Prefill from the previous feed but stamp the time to now.
  function copyLast() {
    if (!last) return
    setMethod(last.method)
    setAmount(last.amount_ml != null ? String(last.amount_ml) : '')
    setMinutes(last.minutes != null ? String(last.minutes) : '')
    setWhen(localNow())
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onAdd({
        fed_at: compact ? new Date().toISOString() : new Date(when).toISOString(),
        method,
        amount_ml: method === 'breast' ? null : amount ? Number(amount) : null,
        minutes: method === 'breast' ? (minutes ? Number(minutes) : null) : null,
        note: note.trim() || null,
      })
      setAmount('')
      setMinutes('')
      setNote('')
      setWhen(localNow())
    } finally {
      setBusy(false)
    }
  }

  const methodTabs = (
    <div className="flex flex-wrap gap-2">
      {(['bottle', 'breast', 'solid'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMethod(m)}
          className={cn(
            // min-h on phones so each pill is a real touch target, collapsing
            // to the tighter desktop height from `sm` up.
            'inline-flex min-h-11 items-center rounded-full font-medium transition-colors sm:min-h-9',
            compact ? 'px-3.5 text-[13px]' : 'px-4 text-sm',
            method === m
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent',
          )}
        >
          {tf[m]}
        </button>
      ))}
    </div>
  )

  const amountField =
    method === 'breast' ? (
      <div className="space-y-1.5">
        <Label htmlFor="f-min">{tf.minutesLabel}</Label>
        <Input id="f-min" type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
      </div>
    ) : (
      <div className="space-y-1.5">
        <Label htmlFor="f-amt">{tf.amountLabel}</Label>
        <Input id="f-amt" type="number" min="0" step="5" value={amount} onChange={(e) => setAmount(e.target.value)} />
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
        <div className="flex items-end gap-2">
          <div className="flex-1">{amountField}</div>
          <Button type="submit" disabled={busy}>
            <Milk className="mr-2 size-4" /> {tf.save}
          </Button>
        </div>
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
      <div className="space-y-1.5">
        <Label htmlFor="f-when">{tf.timeLabel}</Label>
        <Input id="f-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
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
        <Button type="submit" size="lg" disabled={busy}>
          <Plus className="mr-2 size-5" /> {tf.save}
        </Button>
      </div>
    </form>
  )
}
