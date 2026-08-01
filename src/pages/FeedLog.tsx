import { useState } from 'react'
import { Milk, Trash2, Baby as BabyIcon, Utensils, Clock, Hash, Pencil, Check } from 'lucide-react'
import { useBabyAge } from '../components/AgeBadge'
import { AddFeedForm } from '../components/AddFeedForm'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import { FeedProgress } from '../components/FeedProgress'
import { StatTile } from '../components/StatTile'
import { WidgetPage, WidgetCard, WidgetStatGrid, WidgetSplit } from '../components/WidgetPage'
import { FeedWeekChart } from '../components/charts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { useBabies } from '../lib/useBabies'
import { useFeedLog, type FeedEntry } from '../lib/useFeedLog'
import { useFieldLabels } from '../lib/useFieldLabels'
import { bandIndex, todayKey } from '../lib/schedule'
import { dateTimeKeyFromISO, formatDateKey, isoFromDateTimeKey, useDateLocale } from '../lib/dates'
import { feedingRows, feedingUppers } from '../data'
import type { FeedMethod } from '../lib/db'
import { useT } from '../i18n'

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
          <CardContent className="flex flex-col gap-4">
            {/* Progress against the day's expected range sits with the form it
                frames, so only the quick tiles stand above the input — but as
                one line and a hairline bar, not a titled block: it is the
                reason to log, not the thing you came to do. */}
            {feedsRange && <FeedProgress count={feed.todayFeeds.length} range={feedsRange} />}
            <AddFeedForm last={feed.lastFeed} onAdd={feed.add} />
            {/* The card's single footnote — the age guide and its disclaimer,
                which used to be two competing hint lines. */}
            {guideAmount && (
              <p className="text-xs text-muted-foreground">
                {tf.guide.replace('{amount}', guideAmount)} {tf.progressNote}
              </p>
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

/**
 * One feed in today's list. Tap the pencil to edit method / amount / when
 * inline; saving persists via `onSave` (local-first, syncs when signed in).
 *
 * "When" is a full date **and** time, not a time alone. The row used to hold the
 * entry's calendar day fixed and rewrite only its clock time, so a feed logged
 * just after midnight — or stamped onto the wrong day by a stale form — could
 * never be moved back. The list here is today's, so correcting the date does
 * remove the row from view; that is the edit succeeding, not failing.
 */
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
  const [when, setWhen] = useState(dateTimeKeyFromISO(entry.fed_at))
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    try {
      await onSave({
        fed_at: isoFromDateTimeKey(when),
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
          {/* The entry-time treatment: heading face, semibold, tabular, sized by
              its row. Shared verbatim with the "last feed" line in
              `AddFeedForm` — the same fact was `font-bold` here and plain muted
              text there. `font-semibold` because that is the weight every other
              clock time in the app uses. */}
          <span className="font-heading font-semibold tabular-nums text-foreground">
            {fmtTime(entry.fed_at, locale)}
          </span>
          {/* The shared pill, not a hand-rolled one: `Badge` is `rounded-full`
              and carries the app's 26px `soft` tint, which re-tints with the
              palette. */}
          <Badge variant="soft">{tf[entry.method]}</Badge>
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
      <SegmentedGroup
        ariaLabel={tf.method}
        value={method}
        onValueChange={setMethod}
        options={(['bottle', 'breast', 'solid'] as const).map((m) => ({ value: m, label: tf[m] }))}
      />
      <div className="flex flex-wrap items-end gap-3">
        {/* The same control the log form uses (`AddFeedForm`), so logging a feed
            and correcting one are the same interaction — and so the date is
            reachable at all. `maxDate` matches the form's: a feed cannot have
            happened tomorrow. Wider than the old `w-32` time box because the
            trigger now carries a date as well. */}
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor={`f-when-${entry.id}`}>{tf.timeLabel}</Label>
          <DateTimePicker
            id={`f-when-${entry.id}`}
            value={when}
            onValueChange={setWhen}
            maxDate={todayKey()}
            {...fields.dateTimePicker}
          />
        </div>
        <div className="min-w-[8rem] flex-1 space-y-1.5">
          <Label>{method === 'breast' ? tf.minutesLabel : tf.amountLabel}</Label>
          {/* Same plausible scales as the log form, so the value bar means the
              same thing whether you are logging a feed or editing one. */}
          {method === 'breast' ? (
            <NumberInput
              value={minutes}
              onValueChange={setMinutes}
              floor={0}
              step={5}
              smallStep={1}
              unit={tf.minShort}
              indicatorMax={45}
              {...fields.stepper}
            />
          ) : (
            <NumberInput
              value={amount}
              onValueChange={setAmount}
              floor={0}
              step={10}
              smallStep={5}
              unit={tf.mlShort}
              indicatorMax={250}
              {...fields.stepper}
            />
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
