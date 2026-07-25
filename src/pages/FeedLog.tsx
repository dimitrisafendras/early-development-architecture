import { useState } from 'react'
import { Milk, Trash2, Baby as BabyIcon, Utensils, Clock, Hash, Pencil, Check } from 'lucide-react'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { AddFeedForm } from '../components/AddFeedForm'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { StatTile } from '../components/StatTile'
import { WidgetPage, WidgetCard, WidgetStatGrid, WidgetSplit } from '../components/WidgetPage'
import { FeedWeekChart } from '../components/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useBabies } from '../lib/useBabies'
import { useFeedLog, type FeedEntry } from '../lib/useFeedLog'
import { useFieldLabels } from '../lib/useFieldLabels'
import { bandIndex, todayKey } from '../lib/schedule'
import { formatDateKey, useDateLocale } from '../lib/dates'
import { feedingRows, feedingUppers } from '../data'
import type { FeedMethod } from '../lib/db'
import { useT } from '../i18n'

/** "HH:MM" for a time input, from an ISO timestamp (app locale-independent). */
function timeOfDay(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
/** Re-stamp an ISO timestamp's time-of-day (same calendar day) from "HH:MM". */
function withTimeOfDay(iso: string, hhmm: string): string {
  const d = new Date(iso)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.toISOString()
}

/** Uses the app's locale, not the browser's, so it agrees with the time field. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function FeedLog() {
  const t = useT()
  const tf = t.feed
  const { currentBaby } = useBabies()
  const locale = useDateLocale()
  const baby = useBabyAge()
  const feed = useFeedLog(currentBaby?.id ?? null, currentBaby?.household_id ?? null)

  const sinceText =
    feed.minsSinceLast == null
      ? tf.never
      : feed.minsSinceLast >= 60
        ? `${Math.floor(feed.minsSinceLast / 60)}${tf.hourShort} ${feed.minsSinceLast % 60}${tf.minShort}`
        : `${feed.minsSinceLast} ${tf.minShort}`

  const band = baby ? bandIndex(baby.months, feedingUppers) : null
  const guideAmount = band != null ? t.feeding.rows[band].amount : null
  const feedsRange = band != null ? feedingRows[band].feedsPerDay : null

  // Last 7 days of volume + feed count, oldest → newest, for the week chart.
  const week = (() => {
    const days: { key: string; ml: number; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ key: todayKey(d), ml: 0, count: 0 })
    }
    for (const f of feed.feeds) {
      const bucket = days.find((d) => d.key === todayKey(new Date(f.fed_at)))
      if (bucket) {
        bucket.ml += f.amount_ml ?? 0
        bucket.count += 1
      }
    }
    return days
  })()

  const todayCard = (
    <WidgetCard
      icon={<Utensils />}
      title={tf.todayTitle}
      footer={
        <span className="text-xs text-muted-foreground">{feed.signedIn ? tf.synced : tf.localOnly}</span>
      }
    >
      {feed.todayFeeds.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tf.none}</p>
      ) : (
        <ul className="divide-y divide-border">
          {feed.todayFeeds.map((f) => (
            <FeedRow
              key={f.id}
              entry={f}
              onSave={(patch) => feed.update(f.id, patch)}
              onRemove={() => feed.remove(f.id)}
            />
          ))}
        </ul>
      )}
    </WidgetCard>
  )

  return (
    <WidgetPage
      title={tf.title}
      description={tf.subtitle}
      aside={<AgeBadge />}
      inputLabel={tf.add}
      glance={
        <>
          <WidgetStatGrid>
            <StatTile icon={<Milk className="size-4" />} label={tf.totalToday} value={`${Math.round(feed.todayMl)}`} unit={tf.mlShort} />
            <StatTile icon={<Hash className="size-4" />} label={tf.countToday} value={`${feed.todayFeeds.length}`} />
            <StatTile icon={<Clock className="size-4" />} label={tf.sinceLast} value={sinceText} />
            <StatTile
              icon={<BabyIcon className="size-4" />}
              label={tf.lastFeed}
              value={feed.lastFeed ? fmtTime(feed.lastFeed.fed_at, locale) : tf.never}
            />
          </WidgetStatGrid>
        </>
      }
      input={
        <Card>
          <CardContent>
            {/* Progress against the day's expected range sits with the form it
                frames, so only the quick tiles stand above the input. */}
            {feedsRange && (
              <div className="mb-5">
                <FeedProgress count={feed.todayFeeds.length} range={feedsRange} tf={tf} />
              </div>
            )}
            <AddFeedForm last={feed.lastFeed} onAdd={feed.add} />
            {guideAmount && (
              <p className="mt-3 text-xs text-muted-foreground">{tf.guide.replace('{amount}', guideAmount)}</p>
            )}
          </CardContent>
        </Card>
      }
      detail={
        feed.feeds.length > 0 ? (
          <WidgetSplit>
            {todayCard}
            <WidgetCard icon={<Milk />} title={t.tracker.weekTitle}>
              <FeedWeekChart
                labels={week.map((d) => formatDateKey(d.key, locale, { weekday: 'short' }))}
                ml={week.map((d) => Math.round(d.ml))}
                counts={week.map((d) => d.count)}
                mlLabel={tf.mlShort}
                feedsLabel={tf.progressFeeds}
              />
            </WidgetCard>
          </WidgetSplit>
        ) : (
          todayCard
        )
      }
    />
  )
}

/** One feed in today's list. Tap the pencil to edit method / amount / time
 *  inline; saving persists via `onSave` (local-first, syncs when signed in). */
function FeedRow({
  entry,
  onSave,
  onRemove,
}: {
  entry: FeedEntry
  onSave: (patch: { fed_at: string; method: FeedMethod; amount_ml: number | null; minutes: number | null }) => Promise<void>
  onRemove: () => void
}) {
  const t = useT()
  const tf = t.feed
  const locale = useDateLocale()
  const fields = useFieldLabels()
  const [editing, setEditing] = useState(false)
  const [method, setMethod] = useState<FeedMethod>(entry.method)
  const [amount, setAmount] = useState<number | null>(entry.amount_ml)
  const [minutes, setMinutes] = useState<number | null>(entry.minutes)
  const [time, setTime] = useState(timeOfDay(entry.fed_at))
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await onSave({
        fed_at: withTimeOfDay(entry.fed_at, time),
        method,
        amount_ml: method === 'breast' ? null : amount,
        minutes: method === 'breast' ? minutes : null,
      })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
        <span className="flex items-center gap-3">
          <span className="font-heading font-bold tabular-nums text-foreground">
            {fmtTime(entry.fed_at, locale)}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {tf[entry.method]}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="mr-1.5 font-semibold text-foreground">
            {entry.amount_ml != null ? `${entry.amount_ml} ${tf.mlShort}` : ''}
            {entry.minutes != null ? `${entry.amount_ml != null ? ' · ' : ''}${entry.minutes} ${tf.minShort}` : ''}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.common.edit}
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={tf.delete}
            onClick={onRemove}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-3 py-3">
      <ChoiceGroup
        ariaLabel={tf.method}
        value={method}
        onChange={setMethod}
        options={(['bottle', 'breast', 'solid'] as const).map((m) => ({ value: m, label: tf[m] }))}
      />
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label>{tf.timeLabel}</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-32 tabular-nums"
          />
        </div>
        <div className="min-w-[8rem] flex-1 space-y-1.5">
          <Label>{method === 'breast' ? tf.minutesLabel : tf.amountLabel}</Label>
          {method === 'breast' ? (
            <NumberInput value={minutes} onValueChange={setMinutes} floor={0} step={5} smallStep={1} {...fields.stepper} />
          ) : (
            <NumberInput value={amount} onValueChange={setAmount} floor={0} step={10} smallStep={5} {...fields.stepper} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={save} disabled={busy}>
            <Check className="mr-1.5 size-4" /> {t.common.save}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            {t.common.cancel}
          </Button>
        </div>
      </div>
    </li>
  )
}

function FeedProgress({
  count,
  range,
  tf,
}: {
  count: number
  range: [number, number]
  tf: ReturnType<typeof useT>['feed']
}) {
  const [min, max] = range
  const state = count < min ? 'below' : count > max ? 'above' : 'on'
  const status = state === 'below' ? tf.progressBelow : state === 'above' ? tf.progressAbove : tf.progressOnTrack
  // Scale so the typical zone and current count always fit with headroom.
  const scaleMax = Math.max(max + 2, count + 1, 1)
  const p = (v: number) => Math.min(100, (v / scaleMax) * 100)

  return (
    /* Flat — it sits inside the input card, and glass/cards never stack. */
    <div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Utensils className="size-4 text-primary" /> {tf.progressTitle}
          </p>
          <p className="font-heading text-sm text-muted-foreground">
            <span className="text-lg font-semibold tabular-nums text-foreground">{count}</span>
            {' / ~'}
            {min}–{max} {tf.progressFeeds}
          </p>
        </div>
        <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 bg-primary/20"
            style={{ left: `${p(min)}%`, width: `${p(max) - p(min)}%` }}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              state === 'on' ? 'bg-emerald-500' : state === 'above' ? 'bg-amber-500' : 'bg-primary',
            )}
            style={{ width: `${p(count)}%` }}
          />
        </div>
        <p
          className={cn(
            'mt-2 text-sm',
            state === 'on' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
          )}
        >
          {status}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{tf.progressNote}</p>
      </div>
    </div>
  )
}
