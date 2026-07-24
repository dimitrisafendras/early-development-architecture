import { Milk, Trash2, Baby as BabyIcon, Utensils, Clock, Hash } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { AddFeedForm } from '../components/AddFeedForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBabies } from '../lib/useBabies'
import { useFeedLog } from '../lib/useFeedLog'
import { bandIndex } from '../lib/schedule'
import { useDateLocale } from '../lib/dates'
import { feedingRows, feedingUppers } from '../data'
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 page-px py-10">
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
          value={feed.lastFeed ? fmtTime(feed.lastFeed.fed_at, locale) : tf.never}
        />
      </div>

      {feedsRange && <FeedProgress count={feed.todayFeeds.length} range={feedsRange} tf={tf} />}

      <Card>
        <CardContent>
          <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Milk className="size-4 text-primary" /> {tf.add}
          </p>
          <AddFeedForm last={feed.lastFeed} onAdd={feed.add} />
          {guideAmount && (
            <p className="mt-3 text-xs text-muted-foreground">{tf.guide.replace('{amount}', guideAmount)}</p>
          )}
        </CardContent>
      </Card>

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
                      {fmtTime(f.fed_at, locale)}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={tf.delete}
                      onClick={() => void feed.remove(f.id)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
    <Card>
      <CardContent className="py-4">
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
      </CardContent>
    </Card>
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
          <span className="shrink-0 text-primary">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <div className="mt-1 truncate font-heading text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
