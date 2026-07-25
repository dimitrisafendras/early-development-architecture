import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Square,
  ArrowRight,
  Milk,
  BookOpen,
  Clock,
  ShieldCheck,
  LocateFixed,
  Pencil,
} from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge } from '../components/AgeBadge'
import { ProgressRing } from '../components/ProgressRing'
import { dayActivityMeta } from '../components/dayActivity'
import { AddFeedForm } from '../components/AddFeedForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GlassScrollArea, type GlassScrollAreaHandle } from '@/design-system/components'
import { cn } from '@/lib/utils'
import { feedingRows, feedingUppers, type DayActivity, type ScheduleSlot } from '../data'
import { activeTimeIndex, tummyTargetForAgeMonths, ageInMonths, bandIndex } from '../lib/schedule'
import { useSchedule } from '../lib/useSchedule'
import { wikiPath, findTopic } from '../sections/registry'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker } from '../lib/useTummyTracker'
import { useFeedLog } from '../lib/useFeedLog'
import { useT } from '../i18n'

/** Live clock ticked every 30s — the single source for "what's now" and which
 *  slot the panel defaults to, so the timeline and panel never disagree. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/** Wiki topic each activity maps to, for the panel's "learn more" link + info. */
const typeWiki: Record<DayActivity, string> = {
  feed: 'feeding',
  sleep: 'sleep',
  play: 'serve-return',
  tummy: 'tummy-time',
  care: 'bathing',
  wind: 'soothing',
}

export default function Day() {
  const t = useT()
  const now = useNow()
  const schedule = useSchedule()
  // The live current slot, shared with the timeline highlight and the "now"
  // banner. `selected` lets the caregiver preview any other slot's panel; null
  // means "follow the clock".
  const currentSlot = activeTimeIndex(
    schedule.map((s) => s.time),
    now,
  )
  const [selected, setSelected] = useState<number | null>(null)
  const activeIdx = selected ?? currentSlot
  // Selecting the live slot clears the override so the panel resumes following
  // the clock; any other slot is a sticky preview.
  const selectSlot = (i: number) => setSelected(i === currentSlot ? null : i)

  return (
    <main className="mx-auto w-full max-w-6xl page-px py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title={t.day.title} description={t.day.subtitle} />
        <AgeBadge />
      </div>

      <NowHero schedule={schedule} currentSlot={currentSlot} now={now} onSelectSlot={selectSlot} />

      {/* Fixed-height split so the page never jumps as you switch activities:
          both columns are the same stable height and scroll internally when a
          tool (e.g. the feed form) is taller than the frame. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:h-[34rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-h-0">
          <Timeline
            schedule={schedule}
            currentSlot={currentSlot}
            activeIdx={activeIdx}
            onSelect={selectSlot}
          />
        </div>
        <div className="min-h-0">
          <ActivityPanel
            schedule={schedule}
            slot={activeIdx}
            isNow={activeIdx === currentSlot}
            onJumpToNow={() => setSelected(null)}
          />
        </div>
      </div>
    </main>
  )
}

/* ------------------------------------------------------------------ helpers */

function formatCountdown(mins: number, h: string, m: string): string {
  const hr = Math.floor(mins / 60)
  const mn = mins % 60
  return hr > 0 ? `${hr}${h} ${mn}${m}` : `${mn}${m}`
}

function minutesOfDay(hhmm: string): number {
  const m = hhmm.match(/(\d{1,2}):(\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0
}

/** Minutes remaining in the slot at `idx` and how far through it we are (0–100). */
function slotProgress(schedule: ScheduleSlot[], idx: number, now: Date) {
  const nextIdx = (idx + 1) % schedule.length
  const curStart = minutesOfDay(schedule[idx].time)
  const nextStart = minutesOfDay(schedule[nextIdx].time)
  const span = ((nextStart - curStart + 24 * 60) % (24 * 60)) || 24 * 60
  const cur = now.getHours() * 60 + now.getMinutes()
  const remaining = (nextStart - cur + 24 * 60) % (24 * 60)
  const pct = Math.min(100, Math.max(2, ((span - remaining) / span) * 100))
  return { nextIdx, remaining, pct }
}

/* ------------------------------------------------------------------ now hero */

/** The single live "now" surface — what's happening, how far through it we are
 *  (the ring around the icon), and the hand-off to what's next. This is the ONLY
 *  place the day announces "now"; the activity panel stays a lean tool surface so
 *  the moment is never described twice on one screen. */
function NowHero({
  schedule,
  currentSlot,
  now,
  onSelectSlot,
}: {
  schedule: ScheduleSlot[]
  currentSlot: number
  now: Date
  onSelectSlot: (i: number) => void
}) {
  const t = useT()
  const tl = t.routineLive
  const slot = schedule[currentSlot]
  const type = slot.type
  const meta = dayActivityMeta[type]
  const Icon = meta.icon
  const { nextIdx, remaining, pct } = slotProgress(schedule, currentSlot, now)
  const next = schedule[nextIdx]
  const nextMeta = dayActivityMeta[next.type]
  const NextIcon = nextMeta.icon

  return (
    <Card className="relative mt-6 overflow-hidden border-primary/30 bg-primary/5">
      {/* Soft activity-hued glow so the hero takes on the current moment's colour. */}
      <div
        aria-hidden
        className={cn('pointer-events-none absolute -right-16 -top-24 size-64 rounded-full opacity-40 blur-3xl', meta.dot)}
      />
      <CardContent className="relative py-6">
        <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          {t.daily.nowTitle}
        </p>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Ring-wrapped activity icon = identity + progress in one compact mark. */}
          <div className="flex items-center gap-4 sm:flex-1">
            <ProgressRing progress={pct / 100} size={76} stroke={6}>
              <span className={cn('inline-flex size-[3.25rem] items-center justify-center rounded-2xl', meta.dot)}>
                <Icon className="size-7" />
              </span>
            </ProgressRing>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
                  {slot.title}
                </span>
                <span className={cn('text-[11px] font-semibold uppercase tracking-wider', meta.text)}>
                  {t.fullDay.types[type]}
                </span>
              </div>
              <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted-foreground">{slot.detail}</p>
              <p className="mt-1.5 text-[13px] font-medium tabular-nums">
                <span className={meta.text}>{formatCountdown(remaining, tl.hour, tl.minute)}</span>{' '}
                <span className="text-muted-foreground">{t.daily.timeLeft}</span>
              </p>
            </div>
          </div>

          {/* Up-next hand-off — full width on mobile, jumps timeline + panel to it. */}
          <button
            type="button"
            onClick={() => onSelectSlot(nextIdx)}
            className="group flex w-full shrink-0 items-center gap-3 rounded-2xl border border-border bg-card/70 p-3 text-left outline-none transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/70 sm:w-auto"
          >
            <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-xl', nextMeta.dot)}>
              <NextIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {tl.upNext}
              </div>
              <div className="truncate font-heading text-sm font-semibold text-foreground">{next.title}</div>
              <div className="text-[11px] tabular-nums text-muted-foreground">
                {next.time} · {tl.in} {formatCountdown(remaining, tl.hour, tl.minute)}
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ timeline */

function Timeline({
  schedule,
  currentSlot,
  activeIdx,
  onSelect,
}: {
  schedule: ScheduleSlot[]
  currentSlot: number
  activeIdx: number
  onSelect: (i: number) => void
}) {
  const t = useT()
  const areaRef = useRef<GlassScrollAreaHandle>(null)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
  const didCenter = useRef(false)
  const [nowInView, setNowInView] = useState(true)

  // Keep the active slot vertically centered, so the current moment always shows
  // with the slot before and after it in view (instant on first paint, smooth
  // after). The GlassScrollArea contains the scroll to itself — the page never
  // jumps.
  useEffect(() => {
    areaRef.current?.centerChild(itemRefs.current[activeIdx], didCenter.current ? 'smooth' : 'auto')
    didCenter.current = true
  }, [activeIdx])

  // Reveal the "jump to now" control only while the NOW slot is scrolled away.
  useEffect(() => {
    const root = areaRef.current?.getViewport()
    const el = itemRefs.current[currentSlot]
    if (!root || !el) return
    const io = new IntersectionObserver(([e]) => setNowInView(e.intersectionRatio >= 0.75), {
      root,
      threshold: [0, 0.75, 1],
    })
    io.observe(el)
    return () => io.disconnect()
  }, [currentSlot])

  const recenter = () => {
    onSelect(currentSlot)
    areaRef.current?.centerChild(itemRefs.current[currentSlot], 'smooth')
  }

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.day.scheduleTitle}
          </p>
          <Link
            to="/schedule"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            <Pencil className="size-3.5" /> {t.day.editSchedule}
          </Link>
        </div>
        <GlassScrollArea
          ref={areaRef}
          className="max-h-[21rem] lg:max-h-none"
          overlay={
            !nowInView && (
              <button
                type="button"
                onClick={recenter}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card/85 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
              >
                <LocateFixed className="size-3.5 text-primary" /> {t.day.jumpToNow}
              </button>
            )
          }
        >
          <ol className="relative px-1.5">
            {schedule.map((slot, i) => {
              const a = dayActivityMeta[slot.type]
              const Icon = a.icon
              const last = i === schedule.length - 1
              const isNow = i === currentSlot
              const isSelected = i === activeIdx
              return (
                <li
                  key={`${slot.time}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="relative flex gap-4 pb-5 last:pb-0"
                >
                  {!last && (
                    <span className="absolute left-[1.4375rem] top-11 bottom-0 w-px bg-border" aria-hidden />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-pressed={isSelected}
                    className="group flex flex-1 items-start gap-4 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center">
                      <span
                        className={cn(
                          'inline-flex size-12 items-center justify-center rounded-full transition-shadow',
                          a.dot,
                          isNow && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1 rounded-lg px-3 py-2 transition-colors',
                        isSelected ? 'bg-primary/5 ring-1 ring-primary/30' : 'group-hover:bg-muted',
                      )}
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-heading text-sm font-bold tabular-nums text-foreground">
                          {slot.time}
                        </span>
                        <span className="font-semibold text-foreground">{slot.title}</span>
                        <span className={cn('text-[11px] font-semibold uppercase tracking-wider', a.text)}>
                          {t.fullDay.types[slot.type]}
                        </span>
                        {isNow && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            {t.routineLive.nowBadge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        {slot.detail}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ol>
        </GlassScrollArea>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ panel */

function ActivityPanel({
  schedule,
  slot,
  isNow,
  onJumpToNow,
}: {
  schedule: ScheduleSlot[]
  slot: number
  isNow: boolean
  onJumpToNow: () => void
}) {
  const t = useT()
  const type = schedule[slot].type
  const meta = dayActivityMeta[type]
  const Icon = meta.icon

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-6">
        {/* Header. When this is the live slot the NowHero above already owns the
            "now" identity + detail + progress, so we stay lean and lead straight
            into the tool. When previewing another slot we show its full context. */}
        {isNow ? (
          <div className="flex items-center gap-3">
            <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-2xl', meta.dot)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="font-heading text-base font-semibold tracking-tight text-foreground">
                {schedule[slot].title}
              </div>
              <div className="text-xs font-medium tabular-nums text-muted-foreground">
                {schedule[slot].time} · {t.day.panelToolHint}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Clock className="size-3.5" /> {t.day.panelSelectedTag}
              </span>
              <button
                type="button"
                onClick={onJumpToNow}
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {t.day.jumpToNow}
              </button>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <span className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-2xl', meta.dot)}>
                <Icon className="size-6" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                    {schedule[slot].title}
                  </span>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {schedule[slot].time}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {schedule[slot].detail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The tool, or useful info when there's no tool for this activity. */}
        {type === 'feed' ? (
          <FeedWidget />
        ) : type === 'tummy' ? (
          <TummyWidget />
        ) : type === 'sleep' ? (
          <SafeSleepInfo />
        ) : (
          <TopicInfo type={type} />
        )}

        {/* Learn-more hand-off into the Wiki. */}
        <Link
          to={wikiPath(typeWiki[type])}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <BookOpen className="size-4" /> {t.day.learnFull}
          <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

/** For sleep / wind-down slots: the non-negotiable safe-sleep rules. */
function SafeSleepInfo() {
  const t = useT()
  return (
    <div className="rounded-2xl border border-border bg-muted/50 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <ShieldCheck className="size-4 text-primary" /> {t.sleep.safeTitle}
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {t.sleep.safe.map((rule, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span>
              <span className="font-medium text-foreground">{rule.title}.</span>{' '}
              <span className="text-muted-foreground">{rule.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** For play / care slots: a short "what helps" note drawn from the topic blurb. */
function TopicInfo({ type }: { type: DayActivity }) {
  const t = useT()
  const topic = findTopic(typeWiki[type])
  return (
    <div className="rounded-2xl border border-border bg-muted/50 p-4">
      <p className="text-sm font-semibold text-foreground">{t.day.noTool}</p>
      {topic && (
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{topic.blurb(t)}</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ tools */

function TummyWidget() {
  const t = useT()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const target = tummyTargetForAgeMonths(currentBaby ? ageInMonths(currentBaby.birth_date) : null)
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const total = tracker.completedMinutes + runningMin
  const pct = Math.round((total / target) * 100)
  const done = total >= target
  const clock = tracker.isRunning
    ? `${String(Math.floor(tracker.elapsedSeconds / 60)).padStart(2, '0')}:${String(tracker.elapsedSeconds % 60).padStart(2, '0')}`
    : null
  return (
    <div className="relative flex flex-col items-center gap-4 py-1">
      {/* Soft emerald wash so the ring reads as "tummy" even at 0% — never a
          dead grey donut. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1 mx-auto size-36 rounded-full bg-emerald-500/10 blur-2xl"
      />
      <ProgressRing progress={total / target} size={140} stroke={11} accent="#10b981" complete={done}>
        <div className="flex flex-col items-center leading-none">
          {clock ? (
            <>
              <span className="font-heading text-[1.7rem] font-semibold tabular-nums text-foreground">{clock}</span>
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t.tracker.running}
              </span>
            </>
          ) : (
            <>
              <span className="font-heading text-[2rem] font-semibold tabular-nums text-foreground">
                {Math.round(total)}
                <span className="text-lg font-normal text-muted-foreground">/{target}</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t.daily.tummyMinutes}
              </span>
            </>
          )}
        </div>
      </ProgressRing>

      <p className="-mt-0.5 text-xs font-medium">
        {done ? (
          <span className="text-emerald-600 dark:text-emerald-400">{t.daily.tummyDone}</span>
        ) : (
          <span className="text-muted-foreground">
            <span className="tabular-nums text-foreground">{pct}%</span> {t.daily.ofTarget}
          </span>
        )}
      </p>

      {tracker.isRunning ? (
        <Button variant="destructive" className="w-44" onClick={() => void tracker.stop()}>
          <Square className="mr-2 size-4" /> {t.daily.stopSession}
        </Button>
      ) : (
        <Button className="w-44" onClick={() => void tracker.start()}>
          <Play className="mr-2 size-4" /> {t.daily.startSession}
        </Button>
      )}
      <Link
        to="/tracker"
        className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-primary hover:underline sm:min-h-0"
      >
        {t.daily.openTracker} <ArrowRight className="size-3.5" />
      </Link>
    </div>
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

  let state: 'below' | 'on' | 'above' = 'on'
  let scaleMax = Math.max(count + 1, 1)
  if (range) {
    const [min, max] = range
    state = count < min ? 'below' : count > max ? 'above' : 'on'
    scaleMax = Math.max(max + 2, count + 1, 1)
  }
  const p = (v: number) => Math.min(100, (v / scaleMax) * 100)

  return (
    <div className="flex flex-col gap-4">
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

      <Link
        to="/feed"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0"
      >
        {t.daily.openFeed} <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}

