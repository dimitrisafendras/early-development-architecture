import { Play, Square, Trash2, Timer } from 'lucide-react'
import { NavBar } from '../components/NavBar'
import { Footer } from '../components/Footer'
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
  const pct = Math.round((totalWithRunning / target) * 100)

  const weekLabels = week.map((d) =>
    new Date(d.key).toLocaleDateString([], { weekday: 'short' }),
  )

  return (
    <>
      <NavBar />
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
                  {tracker.isRunning ? t.tracker.running : `${pct}% ${t.tracker.ofTarget}`}
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

            <p className="text-xs text-muted-foreground">
              {tracker.signedIn ? t.tracker.synced : t.tracker.localOnly}
            </p>
          </CardContent>
        </Card>

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
              <p className="mb-4 text-[15px] font-semibold text-foreground">{t.tracker.weekTitle}</p>
              <TummyWeekChart
                labels={weekLabels}
                minutes={week.map((d) => Math.round(d.minutes))}
                target={target}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
