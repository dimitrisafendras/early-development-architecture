import { useMemo } from 'react'
import { Play, Square, Timer } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LiveBadge } from '@/components/ui/live-badge'
import { Eyebrow } from './Eyebrow'
import { SessionBar, plannedLengthAt } from './SessionBar'
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
  const plannedMinutes = planned.reduce((sum, mins) => sum + mins, 0)

  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const totalWithRunning = tracker.completedMinutes + runningMin
  const remaining = Math.max(0, Math.round(target - totalWithRunning))
  const metTarget = totalWithRunning >= target

  // How long the sitting now being timed is meant to run, from the plan — so
  // the clock can read "01:12 / 05:00" instead of an elapsed time with nothing
  // to measure itself against.
  const blocks = planned.length ? planned : [target]
  const thisSessionMins = plannedLengthAt(blocks, tracker.completedMinutes)

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
              {fmtClock(tracker.elapsedSeconds)}
              {thisSessionMins > 0 && (
                <span
                  className={cn(
                    'font-medium text-muted-foreground',
                    compact ? 'text-sm' : 'text-xl sm:text-2xl',
                  )}
                >
                  {' / '}
                  {fmtClock(Math.round(thisSessionMins * 60))}
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
              {Math.round(totalWithRunning)}
              <span
                className={cn(
                  'font-medium text-muted-foreground',
                  compact ? 'text-sm' : 'text-xl sm:text-2xl',
                )}
              >
                {' / '}
                {target} {t.tracker.minutesShort}
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
            {metTarget ? t.tracker.targetMet : `${remaining} ${t.tracker.toGo}`}
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
                {tracker.todaySessions.length}
              </span>{' '}
              {planned.length > 0
                ? t.tracker.ofPlanned.replace('{n}', String(planned.length))
                : t.tracker.sessionsToday.toLowerCase()}
            </span>
            {lastToday && !compact && (
              <>
                <span aria-hidden>·</span>
                <span className="tabular-nums">
                  {fmtTime(lastToday.started_at, locale)}–{fmtTime(lastToday.ended_at, locale)}
                </span>
              </>
            )}
          </span>
          {/* The plan's total and the age target, stated together. When the plan
              falls short of the target that is a real thing to know, and it was
              invisible while the two lived on separate pages. On the dashboard
              there is no room for both, and the target is the one the number
              above is already measured against. */}
          <span className="flex flex-wrap items-center gap-x-1.5 tabular-nums">
            {!compact && planned.length > 0 && (
              <>
                <span>{t.tracker.planned.replace('{mins}', String(plannedMinutes))}</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>
              {t.tracker.targetLabel}: {target} {t.tracker.minutesShort}
            </span>
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

/** A session's clock times, in the reader's locale. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

