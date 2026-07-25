import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Play,
  Square,
  ArrowRight,
  Milk,
  BookOpen,
  Clock,
  Timer,
  ShieldCheck,
  LocateFixed,
  Pencil,
} from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { AgeBadge } from '../components/AgeBadge'
import { Eyebrow } from '../components/Eyebrow'
import { ProgressRing } from '../components/ProgressRing'
import { dayActivityMeta } from '../components/dayActivity'
import { AddFeedForm } from '../components/AddFeedForm'
import { Card, CardContent } from '@/components/ui/card'
import { WidgetCard } from '../components/WidgetPage'
import { Button } from '@/components/ui/button'
import { GlassButton, GlassScrollArea, type GlassScrollAreaHandle } from '@/design-system/components'
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
    // `fill` is the only thing this dashboard needs beyond the shared frame: the
    // frame takes the scroll column's height so the grid below can shrink inside
    // it and the cards scroll internally. Everything else — width, gutter,
    // padding, the header row, the gap — is the frame's, so this page's title now
    // sits at the same X *and* Y as every other route's (it used to sit 20px
    // higher on a phone, from a hand-rolled `py-5 sm:py-10`).
    <PageFrame fill title={t.day.title} description={t.day.subtitle} aside={<AgeBadge />}>
      {/* Two cards, no more: the day's schedule as the left rail, and the moment
          (what's now + the tool for it, the thing you actually act on) beside it.
          Fixed height at lg so switching activities never makes the page jump —
          each card scrolls internally instead. On mobile the moment card still
          leads; `order` only kicks in once they sit side by side. */}
      {/* `grid-rows-[minmax(0,1fr)]` lets the single row shrink below its content
          so the cards take the row's height and scroll inside; an `auto` row would
          grow to the full schedule list and push the page past the viewport. */}
      <div className="grid grid-cols-1 gap-6 lg:min-h-[24rem] lg:flex-1 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] xl:min-h-0">
        <div className="min-h-0 lg:order-2">
          <MomentCard
            schedule={schedule}
            slot={activeIdx}
            isNow={activeIdx === currentSlot}
            now={now}
            onSelectSlot={selectSlot}
            onJumpToNow={() => setSelected(null)}
          />
        </div>
        <div className="min-h-0 lg:order-1">
          <Timeline
            schedule={schedule}
            currentSlot={currentSlot}
            activeIdx={activeIdx}
            onSelect={selectSlot}
          />
        </div>
      </div>
    </PageFrame>
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

/* ---------------------------------------------------------------- moment card */

/** The one live surface for the active moment: what it is, how far through it we
 *  are (the ring), what's next, and — in the same card — the tool for it. The
 *  moment is described exactly once, so "now" and the thing you do about it are
 *  never split across two cards. Shows the previewed slot when the caregiver taps
 *  another one on the timeline, with the live-only bits (pulse, progress ring,
 *  countdown) swapped for a "selected" treatment. */
function MomentCard({
  schedule,
  slot,
  isNow,
  now,
  onSelectSlot,
  onJumpToNow,
}: {
  schedule: ScheduleSlot[]
  slot: number
  isNow: boolean
  now: Date
  onSelectSlot: (i: number) => void
  onJumpToNow: () => void
}) {
  const t = useT()
  const tl = t.routineLive
  const cur = schedule[slot]
  const type = cur.type
  const meta = dayActivityMeta[type]
  const Icon = meta.icon
  // `remaining`/`pct` only mean anything for the live slot; a previewed slot uses
  // the same hand-off but shows the next slot's clock time instead of a countdown.
  const { nextIdx, remaining, pct } = slotProgress(schedule, slot, now)
  const next = schedule[nextIdx]
  const nextMeta = dayActivityMeta[next.type]
  const NextIcon = nextMeta.icon
  const a = meta.accent

  return (
    <Card
      className="relative flex h-full min-h-0 flex-col overflow-hidden ring-foreground/10 shadow-[0_24px_60px_-32px_rgb(0_0_0/0.45)]"
      style={{ borderColor: `${a}40` }}
    >
      {/* Ambient wash in the moment's own hue — a warm corner light top-right and
          a fainter one bottom-left, so the whole card takes the activity's colour
          and quietly re-tints as the day moves on. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `radial-gradient(115% 95% at 100% 0%, ${a}30 0%, transparent 62%), radial-gradient(85% 75% at 0% 100%, ${a}1a 0%, transparent 58%)`,
        }}
      />
      {/* Hairline edge light along the top — the lift that makes it read as glass
          without using the glass material on a content surface. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/10" />
      {/* The live moment's progress, drawn as the card's top edge. */}
      {isNow && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-foreground/[0.06]">
          <div
            className="h-full rounded-r-full transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${a}59, ${a})` }}
          />
        </div>
      )}

      <CardContent className="relative flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            {isNow ? (
              <Eyebrow tone="inherit" className={cn('flex items-center gap-2', meta.text)}>
                <span className="relative flex size-2">
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:hidden"
                    style={{ backgroundColor: a }}
                  />
                  <span className="relative inline-flex size-2 rounded-full" style={{ backgroundColor: a }} />
                </span>
                {t.daily.nowTitle}
              </Eyebrow>
            ) : (
              <>
                {/* Same eyebrow size/tracking as the live branch above, so the
                    label doesn't change weight or letterspacing as you select a
                    different slot. */}
                <Eyebrow
                  as="span"
                  tone="muted"
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1"
                >
                  <Clock className="size-3.5" /> {t.day.panelSelectedTag}
                </Eyebrow>
                <Button variant="link" size="sm" onClick={onJumpToNow} className="h-auto p-0">
                  {t.day.jumpToNow}
                </Button>
              </>
            )}
          </div>

        </div>

        {/* A compact moment strip, then the tool filling everything below it —
            so the card has no dead middle whatever the activity's tool is. */}
        <div className="flex items-center gap-4">
            {/* Ring-wrapped icon = identity + progress in one mark, in the
                activity's hue; the previewed state keeps the same 84px footprint
                (a soft halo instead of the ring) so nothing shifts. */}
            {isNow ? (
              <ProgressRing progress={pct / 100} size={72} stroke={6} accent={a}>
                <span className={cn('inline-flex size-[3rem] items-center justify-center rounded-2xl', meta.dot)}>
                  <Icon className="size-6" />
                </span>
              </ProgressRing>
            ) : (
              <span
                className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${a}12` }}
              >
                <span className={cn('inline-flex size-[3rem] items-center justify-center rounded-2xl', meta.dot)}>
                  <Icon className="size-6" />
                </span>
              </span>
            )}
            {/* Type + countdown on one line, then the title. The slot's detail
                lives in the schedule beside this card — no need to repeat it. */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Eyebrow as="span" tone="inherit" className={meta.text}>
                  {t.fullDay.types[type]}
                </Eyebrow>
                {isNow ? (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                      meta.text,
                    )}
                    style={{ backgroundColor: `${a}1f` }}
                  >
                    <Timer className="size-3.5" />
                    {formatCountdown(remaining, tl.hour, tl.minute)} {t.daily.timeLeft}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    <Clock className="size-3.5" />
                    {cur.time}
                  </span>
                )}
              </div>
            <div className="mt-1 font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground">
              {cur.title}
            </div>
          </div>

          {/* Up-next hand-off, condensed to a square on the title's line: the
              next activity's mark over its time. The full title rides along as
              the accessible name / tooltip, since a square has no room for it. */}
          <button
            type="button"
            onClick={() => onSelectSlot(nextIdx)}
            title={`${tl.upNext}: ${next.title} · ${next.time}`}
            aria-label={`${tl.upNext}: ${next.title}, ${next.time}`}
            className="group flex size-14 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-card/80 outline-none ring-1 ring-foreground/10 transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-card hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            <span className={cn('inline-flex size-7 items-center justify-center rounded-lg', nextMeta.dot)}>
              <NextIcon className="size-4" />
            </span>
            <span className="text-[10px] font-semibold tabular-nums leading-none text-muted-foreground">
              {next.time}
            </span>
          </button>
        </div>

        <MomentTool type={type} isNow={isNow} accent={a} />
      </CardContent>
    </Card>
  )
}

/** The tool zone of the moment card: the widget for this activity (or the useful
 *  thing to read when there's no timer), plus the hand-off into the Wiki. Its own
 *  sub-surface below the moment strip, filling the rest of the card and scrolling
 *  internally so a tall tool never stretches it. */
function MomentTool({ type, isNow, accent }: { type: DayActivity; isNow: boolean; accent: string }) {
  const t = useT()
  return (
    // `lg:flex-1` fills the card's remaining height once the card is
    // height-capped; on mobile the card grows with the tool instead of
    // scrolling it.
    // A real `Card`, not a look-alike: this used to hand-roll `rounded-2xl … p-4
    // ring-1 ring-foreground/10`, i.e. a Card at 18px radius nested inside a real
    // Card at 14px — two different corner radii 16px apart in one composition.
    <Card className="flex min-h-0 flex-col shadow-[0_14px_36px_-22px_rgb(0_0_0/0.5)] lg:flex-1">
      <CardContent className="flex min-h-0 flex-1 flex-col">
        {isNow && (
          <Eyebrow tone="muted" className="mb-3 flex items-center gap-2">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
            {t.day.panelToolHint}
          </Eyebrow>
        )}
        {/* Capped measure — the tool zone is now full card width, and a stretched
            form/paragraph reads worse than one that keeps a comfortable column. */}
        <GlassScrollArea className="-mx-1 max-w-2xl px-1">
          {type === 'feed' ? (
            <FeedWidget />
          ) : type === 'tummy' ? (
            <TummyWidget />
          ) : type === 'sleep' ? (
            <SafeSleepInfo />
          ) : (
            <TopicInfo type={type} />
          )}
        </GlassScrollArea>
        <Link
          to={wikiPath(typeWiki[type])}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <BookOpen className="size-4" /> {t.day.learnFull}
          <ArrowRight className="size-3.5" />
        </Link>
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
    // `WidgetCard` rather than a hand-rolled Card + title: this card's title used
    // to be an *eyebrow* (12px, 0.16em tracking) while the MomentCard beside it
    // carried a 15px semibold title — two different kinds of type doing the same
    // job, side by side on the app's landing screen.
    <WidgetCard
      className="flex h-full min-h-0 flex-col"
      contentClassName="flex min-h-0 flex-1 flex-col"
      title={t.day.scheduleTitle}
      meta={
        <Link
          to="/schedule"
          className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Pencil className="size-3.5" /> {t.day.editSchedule}
        </Link>
      }
    >
        <GlassScrollArea
          ref={areaRef}
          className="max-h-[21rem] lg:max-h-none"
          overlay={
            !nowInView && (
              /* A floating control over content — the one place on this page the
                 glass material belongs (per the Liquid Glass guidance). */
              <GlassButton
                size="sm"
                onClick={recenter}
                className="pointer-events-auto text-xs font-semibold"
              >
                <LocateFixed className="size-3.5 text-primary" /> {t.day.jumpToNow}
              </GlassButton>
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
                  {/* Centred on the `w-12` dot column rather than the hand-derived
                      `left-[1.4375rem]` it used to use — that constant silently
                      de-centred the rail the moment the dot changed size. */}
                  {!last && (
                    <span
                      className="absolute left-6 top-11 bottom-0 w-px -translate-x-1/2 bg-border"
                      aria-hidden
                    />
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
                      {/* `gap-y-1` matters in Greek: these four items wrap, and
                          without it the wrapped lines collapse to a 0px gutter. */}
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-heading text-sm font-semibold tabular-nums text-foreground">
                          {slot.time}
                        </span>
                        <span className="font-semibold text-foreground">{slot.title}</span>
                        <Eyebrow as="span" tone="inherit" className={a.text}>
                          {t.fullDay.types[slot.type]}
                        </Eyebrow>
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
    </WidgetCard>
  )
}

/* ------------------------------------------------------------------- info */

/** For sleep / wind-down slots: the non-negotiable safe-sleep rules. Flat — the
 *  tool zone around it already provides the surface. */
function SafeSleepInfo() {
  const t = useT()
  return (
    <div>
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
    <div>
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
              <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">{clock}</span>
              <Eyebrow
                as="span"
                tone="inherit"
                className="mt-2 text-emerald-600 dark:text-emerald-400"
              >
                {t.tracker.running}
              </Eyebrow>
            </>
          ) : (
            <>
              <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">
                {Math.round(total)}
                <span className="text-sm font-medium text-muted-foreground">/{target}</span>
              </span>
              <Eyebrow as="span" tone="muted" className="mt-1">
                {t.daily.tummyMinutes}
              </Eyebrow>
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

