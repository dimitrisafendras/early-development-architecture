import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Square, ArrowRight, ListChecks, Milk } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge } from '../components/AgeBadge'
import { ProgressRing } from '../components/ProgressRing'
import { dayActivityMeta } from '../components/dayActivity'
import { AddFeedForm } from '../components/AddFeedForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fullDaySchedule, feedingRows, feedingUppers, type DayActivity } from '../data'
import { activeTimeIndex, tummyTargetForAgeMonths, ageInMonths, bandIndex } from '../lib/schedule'
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={t.daily.title} description={t.daily.subtitle} />
        <AgeBadge />
      </div>

      <NowWidget slot={slot} now={now} />

      {/* The one thing to do right now, in sync with the full-day timeline. */}
      {activityType === 'feed' ? (
        <FeedWidget />
      ) : activityType === 'tummy' ? (
        <TummyWidget />
      ) : (
        <ActivityWidget type={activityType} />
      )}

      <LinkCard to={topicPath('daily-routine')} icon={<ListChecks className="size-5" />} label={t.daily.learnRoutine} />
    </main>
  )
}

function formatCountdown(mins: number, h: string, m: string): string {
  const hr = Math.floor(mins / 60)
  const mn = mins % 60
  return hr > 0 ? `${hr}${h} ${mn}${m}` : `${mn}${m}`
}

/** Minutes-past-midnight for an "HH:MM" string. */
function minutesOfDay(hhmm: string): number {
  const m = hhmm.match(/(\d{1,2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

/** "What's now" — sourced from the SAME fullDaySchedule slot the action widget
 *  and the /full-day page use, so it can never contradict them. The signature is
 *  a live progress bar showing how far through the current slot we are, tinted
 *  in the activity's own colour, with a hand-off to the whole-day timeline. */
function NowWidget({ slot, now }: { slot: number; now: Date }) {
  const t = useT()
  const tl = t.routineLive
  const type = fullDaySchedule[slot].type
  const meta = dayActivityMeta[type]
  const Icon = meta.icon
  const nextIdx = (slot + 1) % fullDaySchedule.length
  const nextMeta = dayActivityMeta[fullDaySchedule[nextIdx].type]
  const NextIcon = nextMeta.icon

  const curStart = minutesOfDay(fullDaySchedule[slot].time)
  const nextStart = minutesOfDay(fullDaySchedule[nextIdx].time)
  const span = ((nextStart - curStart + 24 * 60) % (24 * 60)) || 24 * 60
  const cur = now.getHours() * 60 + now.getMinutes()
  const remaining = ((nextStart - cur + 24 * 60) % (24 * 60))
  const pct = Math.min(100, Math.max(2, ((span - remaining) / span) * 100))

  return (
    <Card className="overflow-hidden border-primary/30 bg-primary/5">
      <CardContent className="py-5">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {t.daily.nowTitle}
        </p>

        <div className="flex items-start gap-4">
          <span className={cn('inline-flex size-14 shrink-0 items-center justify-center rounded-2xl', meta.dot)}>
            <Icon className="size-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {t.fullDay.slots[slot].title}
              </span>
              <span className={cn('text-[11px] font-semibold uppercase tracking-wider', meta.text)}>
                {t.fullDay.types[type]}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t.fullDay.slots[slot].detail}</p>
          </div>
        </div>

        {/* Signature: position within the current slot, in the activity's hue. */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-baseline justify-between text-[11px] font-medium tabular-nums text-muted-foreground">
            <span>{fullDaySchedule[slot].time}</span>
            <span className={meta.text}>{formatCountdown(remaining, tl.hour, tl.minute)} {t.daily.timeLeft}</span>
            <span>{fullDaySchedule[nextIdx].time}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn('h-full rounded-full transition-[width] duration-700 ease-out', meta.bar)}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Up next — the prominent hand-off; tap to jump to that slot on the
            whole-day timeline. Tinted in the next activity's own colour. */}
        <Link
          to={`${topicPath('full-day')}#slot-${nextIdx}`}
          className="group mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-xl', nextMeta.dot)}>
            <NextIcon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{tl.upNext}</div>
            <div className="truncate font-heading font-semibold text-foreground">{t.fullDay.slots[nextIdx].title}</div>
          </div>
          <div className="shrink-0 text-right">
            <div className="font-heading text-sm font-semibold tabular-nums text-foreground">
              {fullDaySchedule[nextIdx].time}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {tl.in} {formatCountdown(remaining, tl.hour, tl.minute)}
            </div>
          </div>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
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
        <Link to="/tracker" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
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

        <AddFeedForm compact last={feed.lastFeed} onAdd={feed.add} />

        <Link to="/feed" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
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

/** For a passive (non-tracked) slot, NowWidget already shows the title/detail —
 *  this just offers a way to dig into the relevant Learn topic. */
function ActivityWidget({ type }: { type: DayActivity }) {
  const t = useT()
  const meta = dayActivityMeta[type]
  const Icon = meta.icon
  const topic = activityTopic[type]
  if (!topic) return null
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn('inline-flex size-8 items-center justify-center rounded-full', meta.dot)}>
            <Icon className="size-4" />
          </span>
          {t.fullDay.types[type]}
        </span>
        <Link
          to={topicPath(topic)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t.daily.learnMore} <ArrowRight className="size-3.5" />
        </Link>
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
