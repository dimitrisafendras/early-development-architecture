import type { ReactNode } from 'react'
import { Play, Square, Trash2, Timer, CalendarDays, Flame, Hourglass, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '../components/ProgressRing'
import { TummyWeekChart } from '../components/charts'
import { SectionHeader } from '../components/SectionHeader'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker, useWeeklyMinutes } from '../lib/useTummyTracker'
import { tummyTargetForAgeMonths, ageInMonths } from '../lib/schedule'
import { useT } from '../i18n'

function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Tracker() {
  const t = useT()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const week = useWeeklyMinutes(tracker.sessions, tracker.signedIn)

  const ageM = currentBaby ? ageInMonths(currentBaby.birth_date) : null
  const target = tummyTargetForAgeMonths(ageM)
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const totalWithRunning = tracker.completedMinutes + runningMin
  const remaining = Math.max(0, Math.round(target - totalWithRunning))
  const metTarget = totalWithRunning >= target

  const weekLabels = week.map((d) => new Date(d.key).toLocaleDateString([], { weekday: 'short' }))
  const weekMinutes = week.map((d) => Math.round(d.minutes))
  const weekTotal = weekMinutes.reduce((a, b) => a + b, 0)
  const daysOnTarget = week.filter((d) => d.minutes >= target).length

  // Day streak: consecutive days up to today with the target met (from the 7-day window).
  let streak = 0
  for (let i = week.length - 1; i >= 0; i--) {
    if (week[i].minutes >= target) streak++
    else break
  }

  // Average completed-session length across the 7-day window.
  const durations = tracker.sessions.map(
    (s) => (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000,
  )
  const avgSession = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  const targetContext = currentBaby
    ? t.tracker.targetForBaby.replace('{name}', currentBaby.name).replace('{age}', String(ageM))
    : t.tracker.targetForNoBaby

  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
        <SectionHeader title={t.tracker.title} description={t.tracker.subtitle} />

        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <ProgressRing progress={totalWithRunning / target}>
              <div>
                {tracker.isRunning ? (
                  <div className="font-heading text-4xl font-semibold tabular-nums text-foreground">
                    {fmtClock(tracker.elapsedSeconds)}
                  </div>
                ) : (
                  <div className="font-heading text-4xl font-semibold text-foreground">
                    {Math.round(totalWithRunning)}
                    <span className="text-lg text-muted-foreground"> / {target}</span>
                  </div>
                )}
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {tracker.isRunning
                    ? t.tracker.running
                    : metTarget
                      ? t.tracker.targetMet
                      : `${remaining} ${t.tracker.toGo}`}
                </div>
              </div>
            </ProgressRing>

            {tracker.isRunning ? (
              <Button size="lg" variant="destructive" onClick={() => void tracker.stop()}>
                <Square className="mr-2 size-4" /> {t.tracker.stop}
              </Button>
            ) : (
              <Button size="lg" onClick={() => void tracker.start()}>
                <Play className="mr-2 size-4" /> {t.tracker.start}
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              {targetContext}
              <br />
              {tracker.signedIn ? t.tracker.synced : t.tracker.localOnly}
            </p>
          </CardContent>
        </Card>

        {/* Stats at a glance */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile
            icon={<Target className="size-4" />}
            label={t.tracker.statToday}
            value={`${Math.round(totalWithRunning)}`}
            unit={`/ ${target} ${t.tracker.minutesShort}`}
          />
          <StatTile
            icon={<CalendarDays className="size-4" />}
            label={t.tracker.statWeek}
            value={`${weekTotal}`}
            unit={t.tracker.minutesShort}
          />
          <StatTile
            icon={<Flame className="size-4" />}
            label={t.tracker.statStreak}
            value={`${streak}`}
          />
          <StatTile
            icon={<Hourglass className="size-4" />}
            label={t.tracker.statAvg}
            value={`${avgSession}`}
            unit={t.tracker.minutesShort}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <p className="mb-4 flex items-center gap-2 text-[15px] font-semibold text-foreground">
                <Timer className="size-4 text-primary" /> {t.tracker.sessionsToday}
              </p>
              {tracker.todaySessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.tracker.noSessions}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {tracker.todaySessions.map((s) => {
                    const mins = Math.max(
                      0,
                      Math.round(
                        (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) /
                          60000,
                      ),
                    )
                    return (
                      <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-muted-foreground">
                          {fmtTime(s.started_at)} – {fmtTime(s.ended_at)}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">
                            {mins} {t.tracker.minutesShort}
                          </span>
                          <button
                            type="button"
                            aria-label={t.tracker.delete}
                            onClick={() => void tracker.remove(s.id)}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              <div className="mt-4 border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">{t.tracker.cumulativeToday}: </span>
                <span className="font-bold text-primary">{tracker.completedMinutes}</span>
                <span className="text-muted-foreground"> / {target} {t.tracker.minutesShort}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-foreground">{t.tracker.weekTitle}</p>
                <span className="text-xs text-muted-foreground">
                  {daysOnTarget}/7 · {t.tracker.statDaysOnTarget}
                </span>
              </div>
              <TummyWeekChart labels={weekLabels} minutes={weekMinutes} target={target} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

function StatTile({
  icon,
  label,
  value,
  unit,
}: {
  icon: ReactNode
  label: string
  value: string
  unit?: string
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="text-primary">{icon}</span>
          {label}
        </div>
        <div className="mt-1 font-heading text-2xl font-semibold text-foreground">
          {value}
          {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
