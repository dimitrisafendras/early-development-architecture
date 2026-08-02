import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LiveBadge } from '@/components/ui/live-badge'
import { cn } from '@/lib/utils'
import type { useSleepLog } from '../lib/useSleepLog'
import { formatDuration } from '../lib/schedule'
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
      <Button
        size={compact ? 'md' : 'lg'}
        variant={log.running ? 'outline' : 'default'}
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
            className={cn(
              'font-heading font-semibold tabular-nums text-foreground',
              compact ? 'text-lg' : 'text-2xl',
            )}
          >
            {formatDuration(log.runningMinutes, t.feed.hourShort, t.feed.minShort)}
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
