import { useState, type FormEvent } from 'react'
import { Milk, Trash2, Baby as BabyIcon, Utensils, Clock, Hash } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useBabies } from '../lib/useBabies'
import { useFeedLog } from '../lib/useFeedLog'
import { bandIndex } from '../lib/schedule'
import { feedingUppers } from '../data'
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

export default function FeedLog() {
  const t = useT()
  const tf = t.feed
  const { currentBaby } = useBabies()
  const baby = useBabyAge()
  const feed = useFeedLog(currentBaby?.id ?? null, currentBaby?.household_id ?? null)

  const sinceText =
    feed.minsSinceLast == null
      ? tf.never
      : feed.minsSinceLast >= 60
        ? `${Math.floor(feed.minsSinceLast / 60)}${tf.hourShort} ${feed.minsSinceLast % 60}${tf.minShort}`
        : `${feed.minsSinceLast} ${tf.minShort}`

  const guideAmount = baby ? t.feeding.rows[bandIndex(baby.months, feedingUppers)].amount : null

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={tf.title} description={tf.subtitle} />
        <AgeBadge />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<Milk className="size-4" />} label={tf.totalToday} value={`${Math.round(feed.todayMl)}`} unit={tf.mlShort} />
        <Stat icon={<Hash className="size-4" />} label={tf.countToday} value={`${feed.todayFeeds.length}`} />
        <Stat icon={<Clock className="size-4" />} label={tf.sinceLast} value={sinceText} />
        <Stat
          icon={<BabyIcon className="size-4" />}
          label={tf.lastFeed}
          value={feed.lastFeed ? fmtTime(feed.lastFeed.fed_at) : tf.never}
        />
      </div>

      <AddFeedForm
        guide={guideAmount ? tf.guide.replace('{amount}', guideAmount) : null}
        onAdd={feed.add}
      />

      {/* Today list */}
      <Card>
        <CardContent>
          <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Utensils className="size-4 text-primary" /> {tf.todayTitle}
          </p>
          {feed.todayFeeds.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tf.none}</p>
          ) : (
            <ul className="divide-y divide-border">
              {feed.todayFeeds.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="font-heading font-bold tabular-nums text-foreground">
                      {fmtTime(f.fed_at)}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {tf[f.method]}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {f.amount_ml != null ? `${f.amount_ml} ${tf.mlShort}` : ''}
                      {f.minutes != null ? `${f.amount_ml != null ? ' · ' : ''}${f.minutes} ${tf.minShort}` : ''}
                    </span>
                    <button
                      type="button"
                      aria-label="delete"
                      onClick={() => void feed.remove(f.id)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
            {feed.signedIn ? tf.synced : tf.localOnly}
          </p>
        </CardContent>
      </Card>
    </main>
  )
}

function Stat({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <div className="mt-1 truncate font-heading text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}

function AddFeedForm({
  guide,
  onAdd,
}: {
  guide: string | null
  onAdd: (i: {
    fed_at: string
    method: FeedMethod
    amount_ml: number | null
    minutes: number | null
    note: string | null
  }) => Promise<void>
}) {
  const t = useT()
  const tf = t.feed
  const [method, setMethod] = useState<FeedMethod>('bottle')
  const [amount, setAmount] = useState('')
  const [minutes, setMinutes] = useState('')
  const [when, setWhen] = useState(localNow())
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await onAdd({
        fed_at: new Date(when).toISOString(),
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

  return (
    <Card>
      <CardContent>
        <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <Milk className="size-4 text-primary" /> {tf.add}
        </p>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-2 space-y-1.5 sm:col-span-4">
            <Label>{tf.method}</Label>
            <div className="flex gap-2">
              {(['bottle', 'breast', 'solid'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    method === m
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  {tf[m]}
                </button>
              ))}
            </div>
          </div>
          {method === 'breast' ? (
            <div className="space-y-1.5">
              <Label htmlFor="f-min">{tf.minutesLabel}</Label>
              <Input id="f-min" type="number" min="0" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="f-amt">{tf.amountLabel}</Label>
              <Input id="f-amt" type="number" min="0" step="5" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="f-when">{tf.timeLabel}</Label>
            <Input id="f-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="f-note">{tf.noteLabel}</Label>
            <Input id="f-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="col-span-2 flex items-end sm:col-span-4">
            <Button type="submit" disabled={busy}>
              {tf.save}
            </Button>
          </div>
        </form>
        {guide && <p className="mt-3 text-xs text-muted-foreground">{guide}</p>}
      </CardContent>
    </Card>
  )
}
