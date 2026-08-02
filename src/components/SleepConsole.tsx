import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveBadge } from '@/components/ui/live-badge'
import { cn } from '@/lib/utils'
import type { useSleepLog } from '../lib/useSleepLog'
import { formatClock } from '../lib/clock'
import { useT } from '../i18n'

/** Uses the app's locale, not the browser's, so it agrees with the time fields. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/**
 * Start / stop, and the running clock.
 *
 * One button, two states: a sleep is either running or it is not, and the page
 * cannot offer both at once — which is also why `start` and `stop` in the hook
 * both refuse to act against the wrong state rather than trusting this button.
 *
 * **Shared between `/sleep` and the Day dashboard**, like `TummyConsole` and
 * `FeedProgress` before it. `compact` is a *density* switch only — a smaller
 * button and a smaller clock — because the moment the two screens are allowed to
 * say different things they drift into two instruments, which is exactly what
 * happened to the tummy widget before this rule existed.
 */
export function SleepConsole({
  log,
  locale,
  compact = false,
}: {
  log: ReturnType<typeof useSleepLog>
  locale: string
  compact?: boolean
}) {
  const t = useT()
  const tsl = t.sleepLog
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* **Filled in both states, because both are the only thing to press.**
          Stopping was `outline` — the quietest variant in the scale — while a
          sleep was running, which is exactly backwards: at that moment there is
          precisely one action on the screen, it is time-critical (the number it
          writes is how long the night was), and it was the faintest control on a
          card whose next-loudest thing is a clock that cannot be clicked. The
          variant is the emphasis knob, so it says the same thing in both states:
          this is the button. */}
      <Button
        size={compact ? 'md' : 'lg'}
        disabled={busy}
        onClick={() => void run(log.running ? () => log.stop() : () => log.start())}
      >
        {log.running ? <Sun /> : <Moon />}
        {log.running ? tsl.stop : tsl.start}
      </Button>
      {log.running && (
        <span className="flex items-center gap-3">
          <LiveBadge>{tsl.running}</LiveBadge>
          <span
            // Named so the suite can watch it tick. Never mounted twice: the two
            // screens that render this console are two routes.
            id="sleep-clock"
            className={cn(
              'font-heading font-semibold tabular-nums text-foreground',
              compact ? 'text-lg' : 'text-2xl',
            )}
          >
            {/* A clock, not a duration: this number is still moving, and
                `formatDuration` rounds to the minute — so a sleep you had just
                started read `0min` for its first sixty seconds and gave no sign
                the timer was running. `formatClock` is what the tummy console
                has always read. */}
            {formatClock(log.runningSeconds)}
          </span>
          {!compact && (
            <span className="text-xs text-muted-foreground">
              {tsl.startedAt.replace('{time}', fmtTime(log.running.started_at, locale))}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
