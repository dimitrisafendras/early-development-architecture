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
  Check,
} from 'lucide-react'
import { PageFrame } from '../components/PageFrame'
import { Eyebrow } from '../components/Eyebrow'
import { ProgressRing } from '../components/ProgressRing'
import { dayActivityMeta } from '../components/dayActivity'
import { AddFeedForm } from '../components/AddFeedForm'
import { FeedProgress } from '../components/FeedProgress'
import { Card, CardContent } from '@/components/ui/card'
import { WidgetCard } from '../components/WidgetPage'
import { Button } from '@/components/ui/button'
import { GlassButton, GlassScrollArea, type GlassScrollAreaHandle } from '@dimitrisafendras/liquid-glass'
import { cn } from '@/lib/utils'
import { feedingRows, feedingUppers, type DayActivity, type ScheduleSlot } from '../data'
import {
  activeTimeIndex,
  slotTiming,
  formatDuration,
  activityTargetForAge,
  ageInMonths,
  bandIndex,
} from '../lib/schedule'
import { useSchedule } from '../lib/useSchedule'
import { useNow } from '../lib/useNow'
import { wikiPath, findTopic } from '../sections/registry'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker } from '../lib/useTummyTracker'
import { useFeedLog } from '../lib/useFeedLog'
import { useT } from '../i18n'

/** Wiki topic each activity maps to, for the panel's "learn more" link + info. */
const typeWiki: Record<DayActivity, string> = {
  feed: 'feeding',
  meal: 'feeding',
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
    // No `description` here: "the whole day at a glance" restated the page it sat
    // on and cost a line of the one viewport this dashboard gets. The header band
    // carries live status instead — see `TodayStrip`.
    // No `description` and no `aside`: the header band now carries who this is,
    // how old they are and today's progress (see `HeaderStatus`), which is what
    // the orientation line and the age badge were each half-doing.
    <PageFrame fill title={t.day.title}>
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
            now={now}
            onSelect={selectSlot}
          />
        </div>
      </div>
    </PageFrame>
  )
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
  // `remaining`/`pct`/`running` only mean anything for the live slot; a previewed
  // slot uses the same hand-off but shows its own clock window instead of a
  // countdown. All of it comes from the slot's own `mins`, so "20m left" is time
  // left *of the feed*, not time until whatever is next on the list.
  const { nextIdx, mins, endTime, remaining, untilNext, pct, running } = slotTiming(schedule, slot, now)
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
              {/* Type, then the moment's *time*: how long it takes and — live —
                  how much of that is left. The two facts the schedule used to
                  leave out, side by side with the name of the activity. */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <Eyebrow as="span" tone="inherit" className={meta.text}>
                  {t.fullDay.types[type]}
                </Eyebrow>
                {isNow && running ? (
                  // "left of 3h 30m", never a bare countdown: the remainder only
                  // means something against the length it is a remainder of.
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums',
                      meta.text,
                    )}
                    style={{ backgroundColor: `${a}1f` }}
                  >
                    <Timer className="size-3.5" />
                    {formatDuration(remaining, tl.hour, tl.minute)} {t.daily.timeLeft} {t.day.ofDuration}{' '}
                    {formatDuration(mins, tl.hour, tl.minute)}
                  </span>
                ) : isNow ? (
                  // The activity's window has passed but the next one hasn't
                  // started: say when it does rather than freeze a spent countdown.
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    <Timer className="size-3.5" />
                    {t.day.nextIn} {formatDuration(untilNext, tl.hour, tl.minute)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    <Clock className="size-3.5" />
                    <span className="sr-only">{t.day.durationLabel}: </span>
                    {cur.time} – {endTime} · {formatDuration(mins, tl.hour, tl.minute)}
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
  now,
  onSelect,
}: {
  schedule: ScheduleSlot[]
  currentSlot: number
  activeIdx: number
  now: Date
  onSelect: (i: number) => void
}) {
  const t = useT()
  const tl = t.routineLive
  // How far through the live slot we are — drives both the ring around the NOW
  // dot and how much of the rail segment leaving it is filled in. Measured
  // against the slot's own length, so the arc completes when the activity is
  // done rather than when the next one happens to start.
  const livePct = slotTiming(schedule, currentSlot, now).pct
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
              const isPast = i < currentSlot
              const isSelected = i === activeIdx
              const nextAccent = dayActivityMeta[schedule[(i + 1) % schedule.length].type].accent
              // The one thing the old rail never said: how much of the day is
              // behind you. Segments before NOW are filled solid, the segment
              // leaving NOW fills live, everything after stays unlit.
              const fill = isPast ? 100 : isNow ? livePct : 0
              return (
                <li
                  key={`${slot.time}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="relative flex gap-3.5 pb-6 last:pb-1"
                >
                  {/* The rail segment for the gap *below* this step. It starts at
                      52px — the 48px dot plus a 4px air gap — and stops 2px short
                      of the next one, so it can never appear to run under a dot
                      (the dots are translucent, which is what made the old
                      `top-11` rail visibly leak through them). Centred on the
                      `w-12` dot column, not a hand-derived constant. */}
                  {!last && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-6 top-[3.25rem] bottom-0.5 w-[3px] -translate-x-1/2 overflow-hidden rounded-full bg-border/70"
                    >
                      <span
                        className="block w-full rounded-full transition-[height] duration-700 ease-out"
                        style={{
                          height: `${fill}%`,
                          // Hands over from this activity's hue to the next one, so
                          // the rail reads as one continuous gradient down the day.
                          backgroundImage: `linear-gradient(180deg, ${a.accent}, ${nextAccent})`,
                          boxShadow: fill > 0 ? `0 0 8px ${a.accent}80` : undefined,
                        }}
                      />
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-pressed={isSelected}
                    aria-current={isNow ? 'step' : undefined}
                    className="group flex flex-1 items-start gap-3.5 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  >
                    <div className="relative flex w-12 shrink-0 justify-center">
                      {isNow ? (
                        // Identity + live progress in one 48px mark: the arc is how
                        // far through this slot we are. Static by request — the
                        // arc and the lit rail below it already say "this is now",
                        // so nothing on the stepper pulses.
                        <ProgressRing progress={livePct / 100} size={48} stroke={3} accent={a.accent}>
                          <span
                            className={cn('inline-flex size-9 items-center justify-center rounded-full', a.dot)}
                          >
                            <Icon className="size-4.5" />
                          </span>
                        </ProgressRing>
                      ) : (
                        <span
                          className={cn(
                            'relative inline-flex size-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105',
                            a.dot,
                            isPast && 'opacity-60',
                          )}
                        >
                          <Icon className="size-5" />
                          {/* Done marker. Small, semantic green, ringed in the card
                              colour so it reads as a badge on the dot. */}
                          {isPast && (
                            <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-success text-success-foreground ring-2 ring-card">
                              <Check className="size-2.5" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1 rounded-xl px-3 py-2 transition-all duration-300',
                        !isSelected && 'group-hover:bg-muted/70',
                      )}
                      // The selected row lights up in its own activity hue instead
                      // of a flat primary tint, so selection and identity are the
                      // same signal. Inset ring rather than `ring-*`: it keeps the
                      // 1px edge inside the row's own box, which is what stopped
                      // the highlight nudging the text on select.
                      style={
                        isSelected
                          ? {
                              backgroundImage: `linear-gradient(100deg, ${a.accent}26, ${a.accent}0d 55%, transparent)`,
                              boxShadow: `inset 0 0 0 1px ${a.accent}59, 0 8px 24px -18px ${a.accent}`,
                            }
                          : undefined
                      }
                    >
                      {/* Time chip + title only. The activity *type* used to sit
                          here as a third item, but this column is ~290px wide: on
                          any slot with a longer title the eyebrow wrapped onto its
                          own line and every row ended up a different height. The
                          dot's icon and hue already say which activity it is, and
                          the moment card beside this one names the selected slot's
                          type in words — so the rows stay two lines, uniform.
                          `gap-y-1` still matters in Greek, where the title itself
                          can wrap. */}
                      {/* The duration rides *inside* the time chip rather than
                          beside it: a third flex item is what used to wrap this
                          ~290px column onto a ragged extra line. */}
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <span
                          className={cn(
                            'rounded-md px-1.5 py-0.5 font-heading text-[13px] font-bold tabular-nums transition-colors',
                            isNow || isSelected ? a.text : 'text-muted-foreground',
                          )}
                          style={
                            isNow || isSelected
                              ? { backgroundColor: `${a.accent}1f` }
                              : { backgroundColor: 'color-mix(in oklab, var(--muted) 70%, transparent)' }
                          }
                        >
                          {slot.time}
                          <span className="font-medium opacity-70">
                            {' · '}
                            {formatDuration(slot.mins, tl.hour, tl.minute)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'font-semibold text-foreground',
                            isPast && !isSelected && 'text-muted-foreground',
                          )}
                        >
                          {slot.title}
                        </span>
                      </div>
                      {/* Two lines is enough to recognise a slot; the one you pick
                          opens to its full detail, which is what the schedule is
                          for. Cheaper than a second card and it keeps ten slots
                          reachable without scrolling past prose. */}
                      <p
                        className={cn(
                          'mt-1 text-[13px] leading-relaxed text-muted-foreground',
                          !isSelected && 'line-clamp-2',
                        )}
                      >
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
  // From the first birthday the target stops being tummy time and becomes the
  // WHO's 180 min/day of movement — the label has to move with the number.
  const { mins: target, kind } = activityTargetForAge(
    currentBaby ? ageInMonths(currentBaby.birth_date) : null,
  )
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const total = tracker.completedMinutes + runningMin
  const pct = Math.round((total / target) * 100)
  const done = total >= target
  const clock = tracker.isRunning
    ? `${String(Math.floor(tracker.elapsedSeconds / 60)).padStart(2, '0')}:${String(tracker.elapsedSeconds % 60).padStart(2, '0')}`
    : null
  return (
    <div className="relative flex flex-col items-center gap-4 py-1">
      {/* Soft success-hued wash so the ring reads as "tummy" even at 0% — never a
          dead grey donut. The hue is `--success`, the same semantic token the
          completed ring uses, rather than a literal emerald. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1 mx-auto size-36 rounded-full bg-success/10 blur-2xl"
      />
      <ProgressRing progress={total / target} size={140} stroke={11} accent="var(--success)" complete={done}>
        <div className="flex flex-col items-center leading-none">
          {clock ? (
            <>
              <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">{clock}</span>
              <Eyebrow as="span" tone="inherit" className="mt-2 text-success">
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
                {kind === 'movement' ? t.daily.movementMinutes : t.daily.tummyMinutes}
              </Eyebrow>
            </>
          )}
        </div>
      </ProgressRing>

      <p className="-mt-0.5 text-xs font-medium">
        {done ? (
          <span className="text-success">{t.daily.tummyDone}</span>
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

      {/* The shared readout — this used to be a second, drifted copy of the one
          on `/feed` (bigger count, thicker bar, and it silently dropped the
          on-track / above-range status line). */}
      <FeedProgress count={count} range={range} />

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

