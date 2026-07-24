import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Square, Radio, ArrowRight, CalendarDays, ListChecks, Milk } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge } from '../components/AgeBadge'
import { ProgressRing } from '../components/ProgressRing'
import { dayActivityMeta } from '../components/dayActivity'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { scheduleBlocks, fullDaySchedule, feedingRows, feedingUppers, type DayActivity } from '../data'
import {
  activeBlockIndex,
  activeTimeIndex,
  minutesUntilBlockStart,
  tummyTargetForAgeMonths,
  ageInMonths,
  bandIndex,
} from '../lib/schedule'
import { topicPath } from '../sections/registry'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker } from '../lib/useTummyTracker'
import { useFeedLog } from '../lib/useFeedLog'
import { useT } from '../i18n'

/** Live clock ticked every 30s — drives both "what's now" and which action
 *  widget the day surfaces, from a single source so they never disagree. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

export default function Daily() {
  const t = useT()
  const now = useNow()
  // Single source of truth for "what's happening now" — the SAME hour-by-hour
  // schedule and index function the /full-day page uses, so the two never
  // disagree. Feed/tummy slots get their interactive tracker; everything else
  // mirrors the full-day row.
  const slot = activeTimeIndex(fullDaySchedule.map((s) => s.time), now)
  const activityType = fullDaySchedule[slot].type

  return (
    <main className="page-px mx-auto flex w-full max-w-5xl flex-col gap-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={t.daily.title} description={t.daily.subtitle} />
        <AgeBadge />
      </div>

      <NowWidget now={now} />

      {/* The one thing to do right now, in sync with the full-day timeline. */}
      {activityType === 'feed' ? (
        <FeedWidget />
      ) : activityType === 'tummy' ? (
        <TummyWidget />
      ) : (
        <ActivityWidget slot={slot} type={activityType} />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LinkCard to={topicPath('full-day')} icon={<CalendarDays className="size-5" />} label={t.daily.fullDayCta} />
        <LinkCard to={topicPath('daily-routine')} icon={<ListChecks className="size-5" />} label={t.daily.learnRoutine} />
      </div>
    </main>
  )
}

function formatCountdown(mins: number, h: string, m: string): string {
  const hr = Math.floor(mins / 60)
  const mn = mins % 60
  return hr > 0 ? `${hr}${h} ${mn}${m}` : `${mn}${m}`
}

function NowWidget({ now }: { now: Date }) {
  const t = useT()
  const tl = t.routineLive
  const active = activeBlockIndex(now)
  const next = (active + 1) % scheduleBlocks.length
  const untilNext = minutesUntilBlockStart(next, now)
  const suggestions = t.routine.blocks[active].items
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-5">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Radio className="size-3.5" /> {t.daily.nowTitle}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{tl.rightNow}</div>
              <div className="font-semibold text-foreground">{t.routine.blocks[active].title}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider">{tl.upNext}</span>
            <ArrowRight className="size-4 shrink-0" />
            <span className="font-medium text-foreground">{t.routine.blocks[next].title}</span>
            <span>· {tl.in} {formatCountdown(untilNext, tl.hour, tl.minute)}</span>
          </div>
        </div>

        {/* Proposed next activities for the current block */}
        <div className="mt-4 border-t border-primary/15 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.daily.suggestedNow}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((item) => (
              <li key={item.strong} className="flex gap-2 text-[13px] text-muted-foreground">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong> {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function TummyWidget() {
  const t = useT()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const target = tummyTargetForAgeMonths(currentBaby ? ageInMonths(currentBaby.birth_date) : null)
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const total = tracker.completedMinutes + runningMin
  const clock = tracker.isRunning
    ? `${String(Math.floor(tracker.elapsedSeconds / 60)).padStart(2, '0')}:${String(tracker.elapsedSeconds % 60).padStart(2, '0')}`
    : null
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <p className="self-start text-[15px] font-semibold text-foreground">{t.daily.tummyTitle}</p>
        <ProgressRing progress={total / target} size={160} stroke={12}>
          <div>
            <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">
              {clock ?? Math.round(total)}
              {!clock && <span className="text-base text-muted-foreground"> / {target}</span>}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {tracker.isRunning ? t.tracker.running : `${Math.round((total / target) * 100)}% ${t.daily.ofTarget}`}
            </div>
          </div>
        </ProgressRing>
        {tracker.isRunning ? (
          <Button variant="destructive" onClick={() => void tracker.stop()}>
            <Square className="mr-2 size-4" /> {t.daily.stopSession}
          </Button>
        ) : (
          <Button onClick={() => void tracker.start()}>
            <Play className="mr-2 size-4" /> {t.daily.startSession}
          </Button>
        )}
        <Link to="/tracker" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
          {t.daily.openTracker} <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

function FeedWidget() {
  const t = useT()
  const { currentBaby } = useBabies()
  const feed = useFeedLog(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const months = currentBaby ? ageInMonths(currentBaby.birth_date) : null
  const range = months != null ? feedingRows[bandIndex(months, feedingUppers)].feedsPerDay : null
  const count = feed.todayFeeds.length

  const mins = feed.minsSinceLast
  const since =
    mins == null
      ? t.feed.never
      : mins >= 60
        ? `${Math.floor(mins / 60)}${t.feed.hourShort} ${mins % 60}${t.feed.minShort}`
        : `${mins} ${t.feed.minShort}`

  const last = feed.lastFeed
  const quickLog = () =>
    void feed.add({
      fed_at: new Date().toISOString(),
      method: last?.method ?? 'bottle',
      amount_ml: last?.amount_ml ?? null,
      minutes: last?.minutes ?? null,
      note: null,
    })

  // Compare today's count against the typical daily range (a guide, not a target).
  let state: 'below' | 'on' | 'above' = 'on'
  let scaleMax = Math.max(count + 1, 1)
  if (range) {
    const [min, max] = range
    state = count < min ? 'below' : count > max ? 'above' : 'on'
    scaleMax = Math.max(max + 2, count + 1, 1)
  }
  const p = (v: number) => Math.min(100, (v / scaleMax) * 100)

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
            <Milk className="size-4 text-primary" /> {t.daily.feedTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {t.feed.sinceLast}: <span className="font-medium text-foreground">{since}</span>
          </p>
        </div>

        <div>
          <p className="font-heading text-sm text-muted-foreground">
            <span className="text-2xl font-semibold tabular-nums text-foreground">{count}</span>
            {range && (
              <>
                {' / ~'}
                {range[0]}–{range[1]}
              </>
            )}{' '}
            {t.feed.progressFeeds}
          </p>
          {range && (
            <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 bg-primary/20"
                style={{ left: `${p(range[0])}%`, width: `${p(range[1]) - p(range[0])}%` }}
              />
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  state === 'on' ? 'bg-emerald-500' : state === 'above' ? 'bg-amber-500' : 'bg-primary',
                )}
                style={{ width: `${p(count)}%` }}
              />
            </div>
          )}
        </div>

        <Button onClick={quickLog} className="self-start">
          <Milk className="mr-2 size-4" /> {t.daily.logFeed}
        </Button>
        <Link to="/feed" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0">
          {t.daily.openFeed} <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

/** Relevant Learn topic for each passive (non-tracked) activity — powers the
 *  "learn more" link on the current-activity card. */
const activityTopic: Partial<Record<DayActivity, string>> = {
  sleep: 'sleep',
  play: 'serve-return',
  care: 'daily-routine',
  wind: 'sleep',
}

function ActivityWidget({ slot, type }: { slot: number; type: DayActivity }) {
  const t = useT()
  const meta = dayActivityMeta[type]
  const Icon = meta.icon
  const topic = activityTopic[type]
  return (
    <Card>
      <CardContent className="flex items-start gap-4 py-6">
        <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-full', meta.dot)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <p className="text-[15px] font-semibold text-foreground">{t.fullDay.slots[slot].title}</p>
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', meta.text)}>
              {t.fullDay.types[type]}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.fullDay.slots[slot].detail}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {topic && (
              <Link
                to={topicPath(topic)}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0"
              >
                {t.daily.learnMore} <ArrowRight className="size-3.5" />
              </Link>
            )}
            <Link
              to={topicPath('full-day')}
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0"
            >
              {t.daily.fullDayCta} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LinkCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</span>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
