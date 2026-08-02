import { useMemo } from 'react'
import { Play, Square, Timer } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LiveBadge } from '@/components/ui/live-badge'
import { Eyebrow } from './Eyebrow'
import { SessionBar, blockAt, filledBlocks } from './SessionBar'
import { useSchedule } from '../lib/useSchedule'
import { useDateLocale } from '../lib/dates'
import type { useTummyTracker } from '../lib/useTummyTracker'
import { useT } from '../i18n'

/** Minutes as `mm:ss`, the readout's own format. */
function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * The tummy-time (or active-play) console: the clock, the day's sessions, and
 * the one button that drives them.
 *
 * **One component, two screens.** `/tracker` and the `/daily` dashboard both
 * show this, and they had drifted into two different instruments — the page ran
 * a session bar while the dashboard ran a progress ring with its own clock,
 * its own labels and its own idea of what the arc measured. The same drift had
 * already been fixed for feeds, where `/feed` and the dashboard share
 * `FeedProgress` and `AddFeedForm`; this is that fix for the other half.
 *
 * `compact` is the dashboard's variant, and it is a *density* switch, not a
 * different design: same readout, same bar, same button, smaller type and a
 * shorter caption. Anything that changes what the widget *says* between the two
 * screens belongs in the caller, not in a second branch here — the point of the
 * shared component is that both places state the same facts the same way.
 *
 * The tracker itself is a prop rather than a hook call, because `/tracker`
 * already holds an instance for its tiles and history and two would mean two
 * subscriptions to the same data. The day program *is* read here, since both
 * callers want exactly the same slice of it.
 */
export function TummyConsole({
  tracker,
  target,
  movement,
  compact = false,
  className,
}: {
  tracker: ReturnType<typeof useTummyTracker>
  /** The age-derived daily goal in minutes. */
  target: number
  /** Past the first birthday this logs active play, not tummy time. */
  movement: boolean
  /** The dashboard's denser variant. */
  compact?: boolean
  className?: string
}) {
  const t = useT()
  const locale = useDateLocale()

  /**
   * What the day program plans for this activity.
   *
   * The target is age-derived and knows nothing about the day the caregiver
   * authored on `/schedule`, so the two used to sit on separate pages saying
   * unrelated things. `useSchedule` resolves the program in effect for this
   * child's age — the same one `/daily` runs the day from.
   */
  const daySchedule = useSchedule()
  const planned = useMemo(
    () =>
      daySchedule
        .filter((slot) => slot.type === (movement ? 'active' : 'tummy'))
        .map((slot) => slot.mins),
    [daySchedule, movement],
  )

  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const totalWithRunning = tracker.completedMinutes + runningMin

  /**
   * **The plan governs this console when the day has one.**
   *
   * The console used to serve two masters: the bar was scaled by the day
   * program while "done", the green fill, the stopped readout and "to go" were
   * scaled by the age target. Every remaining incoherence came from that split,
   * and the newborn day showed it plainly — three planned five-minute sessions
   * against a five-minute target, so the bar turned green and announced the
   * target met with two of its three blocks still standing empty. Green means
   * done; the shape said a third done.
   *
   * One scale, and it is the caregiver's: they wrote the day, and the
   * instrument's job is to hold them to *their* plan rather than arbitrate
   * between their plan and the WHO on every glance. The age target has not gone
   * anywhere — it still governs the tiles, the week chart and the streak, and it
   * still judges the plan itself where the plan is written, on `/schedule`. It
   * governs here only when the day plans nothing of this kind.
   */
  const plannedTotal = planned.reduce((sum, mins) => sum + mins, 0)
  const goal = planned.length ? plannedTotal : target
  const byPlan = planned.length > 0

  /**
   * **Everything on this readout counts the same number.**
   *
   * The big figure printed `round(totalWithRunning)` while "to go" and the green
   * fill were computed from the raw one, so at 29.6 of 30 the console said
   * "30 / 30 min" and "1 MIN TO GO" on the same line — the identical
   * disagreement the `ceil` below was added to fix, one rounding step further
   * up. There is one displayed total now and both readings are derived from it,
   * so they cannot contradict each other at any value.
   *
   * `floor`, not `round`, is what makes that safe: rounding 29.6 up to 30 would
   * declare the goal met with 24 seconds still to run.
   */
  const shownTotal = Math.floor(totalWithRunning)
  const remaining = Math.max(0, goal - shownTotal)
  const metTarget = shownTotal >= goal

  /**
   * The session now being timed: how long the plan says it should run, and how
   * much of it was already done before this sitting.
   *
   * The clock counts from `into`, not from zero. Stopping at one minute and
   * pressing Start again used to reset the readout to 00:00 while the bar
   * carried on from a fifth full — the two describing the same session and
   * disagreeing by exactly the minutes already banked.
   */
  const blocks = planned.length ? planned : [target]
  const block = blockAt(blocks, tracker.completedMinutes)
  // Planned sessions actually completed — not sittings. See `filledBlocks`.
  const doneSessions = filledBlocks(blocks, tracker.completedMinutes)
  const sessionSeconds = Math.round(block.into * 60) + tracker.elapsedSeconds

  // The most recent completed session today — the pacing fact neither the tiles
  // nor the bar carry: not how much, but when you last did one.
  const lastToday = [...tracker.todaySessions].sort((a, b) =>
    b.started_at.localeCompare(a.started_at),
  )[0]

  return (
    <div className={cn('flex flex-col', compact ? 'gap-4' : 'gap-7', className)}>
      {/* The readout, on its own line so it can be as big as it deserves — it is
          the one thing being watched. */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          {tracker.isRunning ? (
            <div
              className={cn(
                'font-heading leading-none font-semibold tabular-nums text-foreground',
                compact ? 'text-3xl' : 'text-5xl sm:text-6xl',
              )}
            >
              {fmtClock(sessionSeconds)}
              {block.length > 0 && (
                <span
                  className={cn(
                    'font-medium text-muted-foreground',
                    compact ? 'text-sm' : 'text-xl sm:text-2xl',
                  )}
                >
                  {' / '}
                  {fmtClock(Math.round(block.length * 60))}
                </span>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'font-heading leading-none font-semibold text-foreground',
                compact ? 'text-3xl' : 'text-5xl sm:text-6xl',
              )}
            >
              {shownTotal}
              <span
                className={cn(
                  'font-medium text-muted-foreground',
                  compact ? 'text-sm' : 'text-xl sm:text-2xl',
                )}
              >
                {' / '}
                {goal} {t.tracker.minutesShort}
              </span>
            </div>
          )}
          <Eyebrow className={compact ? 'mt-1.5' : 'mt-2.5'}>
            {tracker.isRunning
              ? movement
                ? t.tracker.sessionLabelMovement
                : t.tracker.sessionLabel
              : t.tracker.todayLabel}
          </Eyebrow>
        </div>

        {/* The live half of the readout, opposite it: `LiveBadge` while
            recording, the distance to target while stopped — so the corner is
            never simply empty. */}
        {tracker.isRunning ? (
          <LiveBadge>{t.tracker.running}</LiveBadge>
        ) : (
          <Eyebrow
            className={cn('mt-1.5', metTarget && 'text-success')}
            tone={metTarget ? 'inherit' : 'muted'}
          >
            {/* "Day plan complete" when the plan is the scale — announcing the
                *target* met while the plan's own blocks stood empty was the
                clearest symptom of the console serving two masters. */}
            {metTarget
              ? byPlan
                ? t.tracker.planMet
                : t.tracker.targetMet
              : `${remaining} ${t.tracker.toGo}`}
          </Eyebrow>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Minutes pour into the planned blocks in order. Deliberately not one
            block per session: stopping a five-minute block at one minute and
            pressing Start again used to jump to the *next* block, leaving the
            previous one permanently a fifth full. */}
        <SessionBar
          // With no plan of this kind in the program, the target itself is the
          // single block — the bar still reads rather than emptying out.
          planned={blocks}
          done={tracker.completedMinutes}
          running={runningMin}
          complete={metTarget}
        />
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {/* Sessions first, minutes second — the bar is counted in sessions,
              so its caption has to be too. */}
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <Timer aria-hidden className="size-3.5 shrink-0 text-primary/70" />
            <span className="tabular-nums">
              <span className="font-semibold text-foreground">
                {planned.length > 0 ? doneSessions : tracker.todaySessions.length}
              </span>{' '}
              {planned.length > 0
                ? t.tracker.ofPlanned.replace('{n}', String(planned.length))
                : t.tracker.sessionsToday.toLowerCase()}
            </span>
            {lastToday && !compact && (
              <>
                <span aria-hidden>·</span>
                {/* One labelled instant, not a range. "1 of 3 sessions planned ·
                    01:46–01:48" put an unlabelled span of time immediately after
                    a count of sessions, and every reading of it was wrong: a
                    duration, the window the sessions fall in, the next one due.
                    The fact this line wants is *pacing* — when the last one was
                    — and its start time says that on its own. The end time only
                    ever restated the duration, which the bar already draws. */}
                <span className="tabular-nums">
                  {t.tracker.lastSessionAt.replace(
                    '{time}',
                    fmtTime(lastToday.started_at, locale),
                  )}
                </span>
              </>
            )}
          </span>
          {/* One number, and it names the scale actually in force. Both used to
              sit here — "Day plans 15 min · Daily target: 5 min" — which turned
              every glance into "so which am I doing?". Now the console answers
              that itself, and says which answer it used. */}
          <span className="tabular-nums">
            {byPlan
              ? `${t.tracker.planLabel}: ${plannedTotal} ${t.tracker.minutesShort}`
              : `${t.tracker.targetLabel}: ${target} ${t.tracker.minutesShort}`}
          </span>
        </div>
      </div>

      {/* The action. Full width on a phone and on the dashboard; on a wide page
          wide enough to stay the obvious thing to press. */}
      {tracker.isRunning ? (
        <Button
          size={compact ? 'md' : 'lg'}
          variant="destructive"
          className={cn('w-full', !compact && 'sm:w-auto sm:min-w-64 sm:self-start')}
          onClick={() => void tracker.stop()}
        >
          <Square className="mr-2 size-4" /> {t.tracker.stop}
        </Button>
      ) : (
        <Button
          size={compact ? 'md' : 'lg'}
          className={cn('w-full', !compact && 'sm:w-auto sm:min-w-64 sm:self-start')}
          onClick={() => void tracker.start()}
        >
          <Play className="mr-2 size-4" /> {t.tracker.start}
        </Button>
      )}
    </div>
  )
}

/**
 * A session's clock time, on a 24-hour clock.
 *
 * `hourCycle: 'h23'` rather than the locale's own choice: this sits inline in a
 * caption that already runs "1 of 3 sessions planned · …", and an "AM"/"PM"
 * hanging off the end of it is two more tokens in a line whose whole job is to
 * be read at a glance. `h23` also pins midnight to `00:xx` — `hour12: false`
 * alone yields `24:xx` on some locales.
 */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

