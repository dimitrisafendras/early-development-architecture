import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
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
import { TummyConsole } from '../components/TummyConsole'
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
  slotEndTime,
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
      {/* No `min-h` floor: from `lg` the shell is one viewport tall, so `flex-1`
          already hands this grid the exact height left over. The floor existed
          for the window where `lg` laid out two columns but the column had no
          fixed height yet — it would now fight the viewport on a short landscape
          tablet and push the row past the fold. */}
      <div className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]">
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
                {/* The way back to live, and the only control in this state —
                    so it is a button, not a link. As bare link text beside a
                    grey chip it was the quietest thing in the card, which is
                    backwards: the card is showing a moment that is *not* now,
                    and the one thing the caregiver needs is the way out of that.
                    `secondary` rather than `default`: the loudest button in this
                    card belongs to the tool below, whatever the tool is. */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onJumpToNow}
                  className="travelling-ring"
                >
                  <LocateFixed className="mr-1.5 size-3.5" /> {t.day.jumpToNow}
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
            {/* What this moment actually asks of you. It used to live in the
                timeline, opening on the row you picked — so the day's list was
                carrying the day's *instructions*, and reading one meant reading
                across both columns. The list answers when and what; this card
                answers everything else about the one moment it is showing. */}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cur.detail}</p>
          </div>

        </div>

        {/* The hand-off to what comes next, on its own line.
            It was a 56px square at the far right of the title's row: an icon
            over a 10px time, with the moment's actual *name* only in a tooltip.
            Four things made it read as decoration rather than as the second most
            important fact on the card — no visible name, the far-right position
            where chrome lives, the same rounded-chip shape as the status pills
            beside it, and an affordance that only appeared on hover, which on a
            phone is never. "Next" is also a *relation*, and a square holds an
            identity, not a relation.

            So: a full-width row that says what is next in words. It gets
            position and one hue chip; it does not get a ring, a display size, a
            colour field or motion, because the current moment owns all four and
            "what's now" is the card's whole purpose. A `text-sm` title under a
            muted eyebrow cannot be mistaken for the 2xl display title above it.
            Moving it off the title's line also gives that title back the width
            it was losing to a square. */}
        <button
          type="button"
          onClick={() => onSelectSlot(nextIdx)}
          className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 text-left outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/70"
        >
          <span
            aria-hidden
            className={cn(
              'inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
              nextMeta.dot,
            )}
          >
            <NextIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            {/* Muted, not the activity's hue: two hue-coloured eyebrows in one
                card would make now and next peers. */}
            <Eyebrow as="span" tone="muted" className="block">
              {tl.upNext}
              {/* The accessible name is computed from this row's own text, so
                  without a separator it runs "Up next Midday feed" together. */}
              <span className="sr-only">:</span>
            </Eyebrow>
            <span className="mt-0.5 flex items-baseline gap-x-2">
              <span className="truncate text-sm font-semibold text-foreground">{next.title}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {next.time}
                {/* Only while live: `untilNext` is measured against the wall
                    clock, so on a previewed slot it would be counting down to
                    something other than what the card is showing. The absolute
                    time is always true. */}
                {isNow && (
                  <>
                    {' · '}
                    {t.day.nextIn} {formatDuration(untilNext, tl.hour, tl.minute)}
                  </>
                )}
              </span>
            </span>
          </span>
          {/* Rest-state affordance. Without it the row still read as a badge on
              touch, where the hover lift never happens. */}
          <ChevronRight
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </button>

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
          ) : type === 'tummy' || type === 'active' ? (
            <TummyWidget />
          ) : type === 'sleep' ? (
            <SafeSleepInfo />
          ) : (
            <TopicInfo type={type} />
          )}
        </GlassScrollArea>
      </CardContent>
    </Card>
  )
}

/** The Wiki topic an activity maps to — the row's link is named after it. */
function wikiTopicFor(type: DayActivity) {
  return findTopic(dayActivityMeta[type].wiki)
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
        {/* The recentre control rides at the *top* of the list, not the bottom.
            `GlassScrollArea`'s own `overlay` prop pins it to the bottom edge,
            which is where you look for "more below" — but this button means "you
            have scrolled away from now", and the day runs downward, so it is
            almost always sitting above you. Hanging it off the bottom put the
            way back at the far end of the direction you would have to travel.

            Anchored here rather than by changing the package: the prop is one
            fixed position in an external, tagged dependency, and this is one
            absolutely-positioned child of a `relative` wrapper. It is still the
            floating glass control the Liquid Glass guidance sanctions — the same
            component, over content, in the one place on this page that qualifies. */}
        <div className="relative flex min-h-0 flex-1 flex-col">
          {!nowInView && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-1">
              <GlassButton
                size="sm"
                onClick={recenter}
                className="travelling-ring pointer-events-auto text-xs font-semibold"
              >
                <LocateFixed className="size-3.5 text-primary" /> {t.day.jumpToNow}
              </GlassButton>
            </div>
          )}
        {/* `proximity`, never `mandatory`: rows settle onto the centre line when
            you let go — the carousel dial — but browsing the day freely, and the
            programmatic `centerChild` behind "jump to now", are both left alone. */}
        <GlassScrollArea
          ref={areaRef}
          className="max-h-[21rem] snap-y snap-proximity lg:max-h-none"
        >
          <ol className="relative px-1.5">
            {schedule.map((slot, i) => {
              const a = dayActivityMeta[slot.type]
              const Icon = a.icon
              const last = i === schedule.length - 1
              const isNow = i === currentSlot
              const isPast = i < currentSlot
              const isSelected = i === activeIdx
              // `%` no more: on the last row there is no next slot, and wrapping
              // to the first one gradiented a rail that is never drawn toward the
              // wrong end of the day.
              const nextAccent = last ? a.accent : dayActivityMeta[schedule[i + 1].type].accent
              const prevAccent = i === 0 ? a.accent : dayActivityMeta[schedule[i - 1].type].accent
              /**
               * How much of the segment *leaving* row j is behind us: solid for
               * every segment before NOW, live for the one leaving it, unlit
               * after. The rail says the one thing the old flat line never did —
               * how much of the day is done.
               */
              const segFill = (j: number) => (j < currentSlot ? 100 : j === currentSlot ? livePct : 0)
              // A segment spans two rows: the bottom half of the row it leaves and
              // the top half of the row it arrives at. So each half fills over its
              // own half of the segment's range — the first 50% drains into the
              // bottom half, the rest into the next row's top half.
              const bottomFill = Math.min(100, segFill(i) * 2)
              const topFill = Math.max(0, segFill(i - 1) * 2 - 100)
              // The hue at a segment's midpoint, which is where the two halves
              // meet — so the handover reads as one gradient down the whole day
              // rather than restarting at every dot.
              const midBelow = `color-mix(in oklab, ${a.accent}, ${nextAccent})`
              const midAbove = `color-mix(in oklab, ${prevAccent}, ${a.accent})`
              return (
                <li
                  key={`${slot.time}-${i}`}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="group relative flex snap-center gap-3.5 pb-8 last:pb-1"
                >
                  {/* **The row's control is an overlay, not a wrapper.** The
                      focused card carries a real `<Link>` into the Wiki now, and
                      a link inside a button is invalid HTML that browsers silently
                      unnest — so the button became a stretched, transparent layer
                      over the whole row and everything else renders beside it.
                      Hit area and behaviour are unchanged; the link sits above it
                      and takes its own clicks back with `pointer-events-auto`.
                      The accessible name moves to an `sr-only` copy of the title,
                      since the button no longer contains the text.

                      The trade: `pointer-events-none` on the content layer means
                      the rows' text cannot be selected. Acceptable for a stepper
                      whose every row is a control, but it is a real loss and not
                      an accident. */}
                  <button
                    type="button"
                    onClick={() => onSelect(i)}
                    aria-pressed={isSelected}
                    aria-current={isNow ? 'step' : undefined}
                    className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                  >
                    <span className="sr-only">{slot.title}</span>
                  </button>
                  <div className="pointer-events-none flex flex-1 items-stretch gap-3.5">
                    {/* **Each row owns half of the segment above it and half of
                        the segment below it.** The rail used to be one span per
                        row that started at the mark's bottom edge and deliberately
                        overran into the next row, because the next mark's centre
                        depends on that row's height and this row cannot know it —
                        so it overshot and let the next mark cover the excess.

                        That was correct by concealment. It cost three families of
                        linked magic numbers (the overshoot encoded the row's
                        padding, the start offsets encoded every mark diameter, the
                        diameters encoded the halo), it required marks to stay
                        opaque for ever, and it was 0.7px from failing: a wrapped
                        title on the focused card — one long Greek moment name —
                        would have opened a visible gap in the rail directly above
                        the most prominent row in the list.

                        Two flex halves instead. The bottom half ends at this row's
                        bottom, which *is* the next row's top, which is where its
                        top half begins — so every join is exact for any pair of
                        row heights, for ever. The one fixed number left is the
                        `-bottom-8` that carries the bottom half across the row's
                        own `pb-8`, and it sits next to the padding it mirrors.

                        It also makes the fill honest. Only ~45% of the old rail
                        was ever visible, the rest hidden behind the next mark, so
                        a live segment looked complete at 45% of the slot — and by
                        a different fraction on every row, since it depended on the
                        height of whatever came next. Here 100% lands exactly on
                        the next mark. */}
                    <div className="relative flex w-18 shrink-0 flex-col items-center self-stretch">
                      {/* The tail of the segment arriving from the row above. */}
                      <span
                        aria-hidden
                        className={cn(
                          'relative w-[3px] flex-1 overflow-hidden bg-border',
                          i === 0 && 'invisible',
                        )}
                      >
                        <span
                          className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
                          style={{
                            height: `${topFill}%`,
                            backgroundImage: `linear-gradient(180deg, ${midAbove}, ${a.accent})`,
                          }}
                        />
                      </span>
                      <span className="relative z-10 rounded-full bg-card p-1">
                      {isNow ? (
                        // Identity + live progress in one 48px mark: the arc is how
                        // far through this slot we are. Static by request — the
                        // arc and the lit rail below it already say "this is now",
                        // so nothing on the stepper pulses.
                        <ProgressRing
                          progress={livePct / 100}
                          size={isSelected ? 56 : 48}
                          stroke={3}
                          accent={a.accent}
                        >
                          <span
                            className={cn(
                              'inline-flex items-center justify-center rounded-full bg-card',
                              isSelected ? 'size-11' : 'size-9',
                            )}
                          >
                            <span
                              className={cn(
                                'inline-flex size-full items-center justify-center rounded-full',
                                a.dot,
                              )}
                            >
                              <Icon className={isSelected ? 'size-5' : 'size-4.5'} />
                            </span>
                          </span>
                        </ProgressRing>
                      ) : (
                        <span
                          className={cn(
                            'relative z-10 inline-flex items-center justify-center rounded-full bg-card',
                            // The focused step grows with its card — the mark and
                            // the moment it belongs to are one thing, so scaling
                            // only the card left the dot looking like a different
                            // row's.
                            // No hover scale: the row already lights up on hover,
                            // and on the focused mark the scaled circle ate the
                            // halo's air. No `transition-all` either — it animated
                            // width and height, which reflows every row in the
                            // list for 300ms and left `centerChild` measuring a
                            // position the row had not finished moving to.
                            isSelected ? 'size-14' : 'size-12',
                          )}
                        >
                          {/* The activity tint is a *separate* layer over an
                              opaque `bg-card`, not the same element's background.
                              Both are background-color utilities, so merging them
                              onto one class list drops one of them — and the one
                              that survived was the translucent tint, which let the
                              rail run visibly through every dot. */}
                          {/* The dimming belongs to the *tint*, not to the mark.
                              On the whole mark it also faded the done badge — so
                              every green check the app has ever shown rendered at
                              60%, against a colour whose whole job is to be read
                              as semantic. */}
                          <span
                            className={cn(
                              'inline-flex size-full items-center justify-center rounded-full',
                              a.dot,
                              isPast && 'opacity-60',
                            )}
                          >
                            <Icon className={isSelected ? 'size-6' : 'size-5'} />
                          </span>
                          {/* Done marker, on the rim. At `-bottom-0.5 -right-0.5`
                              its centre sat *outside* the circle — more than half
                              the badge on the halo's padding, where its `ring-card`
                              was invisible against the halo's own card colour. */}
                          {isPast && (
                            <span className="absolute bottom-0 right-0 grid size-4 place-items-center rounded-full bg-success text-success-foreground ring-2 ring-card">
                              <Check className="size-2.5" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                      )}
                      </span>
                      {/* The head of the segment leaving this row. The inner span
                          is absolute so it can reach `-bottom-8` — exactly the
                          `<li>`'s own `pb-8` — and meet the next row's top half
                          with no seam. */}
                      <span
                        aria-hidden
                        className={cn('relative w-[3px] flex-1', last && 'invisible')}
                      >
                        <span className="absolute inset-x-0 top-0 -bottom-8 overflow-hidden bg-border">
                          <span
                            className="block w-full transition-[height] duration-700 ease-out"
                            style={{
                              height: `${bottomFill}%`,
                              backgroundImage: `linear-gradient(180deg, ${a.accent}, ${midBelow})`,
                            }}
                          />
                        </span>
                      </span>
                    </div>
                    <div
                      className={cn(
                        'min-w-0 flex-1 rounded-xl transition-[background-color,box-shadow,padding,margin] duration-300',
                        // The focused card is bigger, and it pushes its
                        // neighbours away: a picker's centre cell, not a list
                        // row that happens to be tinted. The tint and the ring
                        // alone made selection a *colour*, which is the one
                        // signal this list already spends on activity identity —
                        // eight hues, one per kind — so the selected row read as
                        // "another blue thing" rather than as the one in focus.
                        // Size and air are the axes nothing else here uses.
                        isSelected ? 'my-2 bg-card px-4 py-3.5' : 'px-3 py-2 group-hover:bg-muted/70',
                      )}
                      // **The focused row is the only card in the list that is
                      // materially raised.** It was a translucent wash in the
                      // activity's hue — but hue is the axis this list already
                      // spends on identity, eight of them, one per kind, so a
                      // tinted row read as "another blue thing" rather than as the
                      // one in focus. And the lift under it (`0 8px 24px -18px`)
                      // collapsed to almost nothing.
                      //
                      // Opaque, lifted, with the accent kept to a 1px inset edge
                      // and the mark beside it. A surface that is actually off the
                      // page reads as the lens of a carousel at a glance; a tint
                      // reads as a hover state. `scale-[1.02]` is gone with it —
                      // six pixels on a 300px box, invisible as size, but as a
                      // transform it rasterised the text at a fractional scale for
                      // the whole 300ms and softened every selection.
                      style={
                        isSelected
                          ? {
                              boxShadow: `inset 0 0 0 1px ${a.accent}59, 0 12px 32px -12px ${a.accent}66`,
                            }
                          : undefined
                      }
                    >
                      {/* **Title first, then when.** Side by side the chip won
                          the row — it is bold, tabular and sitting in a tinted
                          field, against a title in plain semibold — so the eye
                          walked a column of times looking for the thing each one
                          names. The name is what you are scanning for; the clock
                          is how you place it once you have found it.

                          The activity *type* used to sit on this line as a third
                          item, but this column is ~290px wide: on any slot with a
                          longer title the eyebrow wrapped and every row ended up
                          a different height. The dot's icon and hue already say
                          which activity it is, and the moment card beside this
                          one names the selected slot's type in words. */}
                      <span
                        className={cn(
                          'block font-semibold text-foreground transition-all duration-300',
                          isSelected && 'font-heading text-[17px] leading-tight',
                          isPast && !isSelected && 'text-muted-foreground',
                        )}
                      >
                        {slot.title}
                      </span>
                      {/* The duration rides *inside* the chip rather than beside
                          it: a second element on this line is what used to wrap
                          the ~290px column onto a ragged extra line. */}
                      <span
                        className={cn(
                          'mt-1 inline-block rounded-md px-1.5 py-0.5 font-heading text-[13px] font-bold tabular-nums transition-colors',
                          isNow || isSelected ? a.text : 'text-muted-foreground',
                        )}
                        style={
                          isNow || isSelected
                            ? { backgroundColor: `${a.accent}1f` }
                            : { backgroundColor: 'color-mix(in oklab, var(--muted) 70%, transparent)' }
                        }
                      >
                        {/* The window, not a start time and a length. "11:55 ·
                            30m" put two numbers on one line with a separator and
                            no units to tell them apart — `30m` scans as another
                            clock time, and the reader has to work out which of
                            the two is the odd one out before either means
                            anything. Two clock times either side of a dash is a
                            range on sight, and it answers the question a day plan
                            is actually asked: not "how long is this" but "when am
                            I free again". The length is still on the moment's own
                            card, where there is room to label it. */}
                        {slot.time}
                        <span className="opacity-70">{' – '}</span>
                        {slotEndTime(slot.time, slot.mins)}
                      </span>
                      {/* Named after what it opens, not after where it goes.
                          "Read more in the Wiki" was the same sentence under
                          every one of the day's twenty-eight moments — it told
                          you the destination's filing system and nothing about
                          whether what was behind it was worth a tap. The topic's
                          own title does that.

                          Only on the focused card, and it takes its own clicks
                          back from the row's overlay button — the row selects,
                          this leaves the page, and the two must not be the same
                          tap. */}
                      {isSelected && wikiTopicFor(slot.type) && (
                        <Link
                          to={wikiPath(a.wiki)}
                          // A chip in the moment's own hue rather than a line of
                          // blue text. Underlined primary made it the one thing
                          // on the card that belonged to the app's accent instead
                          // of to the activity — a feed card tinted teal with a
                          // blue link in it. In the hue it reads as part of the
                          // card, and as something to press rather than something
                          // to read.
                          style={{
                            color: a.accent,
                            borderColor: `${a.accent}59`,
                            backgroundColor: `${a.accent}14`,
                          }}
                          className="group/wiki pointer-events-auto relative z-10 mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] font-semibold transition-shadow hover:shadow-sm"
                        >
                          <BookOpen className="size-3.5 shrink-0" />
                          {t.day.learnAbout.replace(
                            '{topic}',
                            wikiTopicFor(slot.type)!.label(t),
                          )}
                          <ArrowRight className="size-3 shrink-0 transition-transform group-hover/wiki:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </GlassScrollArea>
        </div>
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
  const topic = findTopic(dayActivityMeta[type].wiki)
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
  // WHO's 180 min/day of movement — the label moves with the number.
  const { mins: target, kind } = activityTargetForAge(
    currentBaby ? ageInMonths(currentBaby.birth_date) : null,
  )

  return (
    <div className="flex flex-col gap-4">
      {/* The same console `/tracker` runs, at dashboard density. It used to be a
          second instrument entirely — a progress ring with its own clock, its
          own labels and its own idea of what the arc measured — which is the
          drift `FeedProgress` and `AddFeedForm` already fixed for feeds. */}
      <TummyConsole tracker={tracker} target={target} movement={kind === 'movement'} compact />

      <Link
        to="/tracker"
        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline sm:min-h-0"
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

