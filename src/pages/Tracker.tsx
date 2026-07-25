import { useState } from 'react'
import { Play, Square, Trash2, Pencil, Check, Timer, CalendarDays, Flame, Hourglass, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassScrollArea } from '@/design-system/components'
import { ProgressRing } from '../components/ProgressRing'
import { StatTile } from '../components/StatTile'
import { TummyWeekChart } from '../components/charts'
import { SectionHeader } from '../components/SectionHeader'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker, useWeeklyMinutes, type TrackerSession } from '../lib/useTummyTracker'
import { tummyTargetForAgeMonths, ageInMonths, todayKey } from '../lib/schedule'
import { formatDateKey, useDateLocale } from '../lib/dates'
import { useT } from '../i18n'

function fmtClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** "HH:MM" for a time input, from an ISO timestamp. */
function timeOfDay(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
/** Re-stamp an ISO timestamp's time-of-day (same calendar day) from "HH:MM". */
function withTimeOfDay(iso: string, hhmm: string): string {
  const d = new Date(iso)
  const [h, m] = hhmm.split(':').map(Number)
  d.setHours(h || 0, m || 0, 0, 0)
  return d.toISOString()
}

/** Uses the app's locale, not the browser's, so times read the same everywhere. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function Tracker() {
  const t = useT()
  const locale = useDateLocale()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const week = useWeeklyMinutes(tracker.sessions, tracker.signedIn)

  const ageM = currentBaby ? ageInMonths(currentBaby.birth_date) : null
  const target = tummyTargetForAgeMonths(ageM)
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const totalWithRunning = tracker.completedMinutes + runningMin
  const remaining = Math.max(0, Math.round(target - totalWithRunning))
  const metTarget = totalWithRunning >= target

  const weekLabels = week.map((d) => formatDateKey(d.key, locale, { weekday: 'short' }))
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

  // Full history grouped by day, newest first.
  const todayK = todayKey()
  const yesterdayK = todayKey(new Date(Date.now() - 86_400_000))
  const historyDays: [string, typeof tracker.sessions][] = []
  for (const s of [...tracker.sessions].sort((a, b) => b.started_at.localeCompare(a.started_at))) {
    const key = todayKey(new Date(s.started_at))
    const group = historyDays.find(([k]) => k === key)
    if (group) group[1].push(s)
    else historyDays.push([key, [s]])
  }
  const dayLabel = (key: string) =>
    key === todayK
      ? t.tracker.todayLabel
      : key === yesterdayK
        ? t.tracker.yesterdayLabel
        : formatDateKey(key, locale, { weekday: 'short', day: 'numeric', month: 'short' })

  const targetContext = currentBaby
    ? t.tracker.targetForBaby.replace('{name}', currentBaby.name).replace('{age}', String(ageM))
    : t.tracker.targetForNoBaby

  return (
    <>
      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 page-px py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 -z-10 mx-auto h-56 max-w-2xl rounded-full bg-primary/15 opacity-60 blur-3xl"
        />
        <SectionHeader title={t.tracker.title} description={t.tracker.subtitle} />

        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <CardContent className="relative flex flex-col items-center gap-6 py-8">
            <ProgressRing progress={totalWithRunning / target} complete={metTarget}>
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
                <div
                  className={`mt-1 text-xs uppercase tracking-wider ${
                    metTarget ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  }`}
                >
                  {tracker.isRunning && !metTarget
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
                <Timer className="size-4 text-primary" /> {t.tracker.historyTitle}
              </p>
              {tracker.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.tracker.noHistory}</p>
              ) : (
                <GlassScrollArea className="max-h-[10.5rem]">
                  <div className="space-y-4 pr-1">
                  {historyDays.map(([key, list]) => (
                    <div key={key}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {dayLabel(key)}
                      </p>
                      <ul className="divide-y divide-border">
                        {list.map((s) => (
                          <SessionRow
                            key={s.id}
                            session={s}
                            locale={locale}
                            onSave={(patch) => tracker.update(s.id, patch)}
                            onRemove={() => tracker.remove(s.id)}
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                  </div>
                </GlassScrollArea>
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

/** One session in the history. Tap the pencil to adjust its start/end times
 *  inline; saving re-derives the duration and persists via `onSave`. */
function SessionRow({
  session,
  locale,
  onSave,
  onRemove,
}: {
  session: TrackerSession
  locale: string
  onSave: (patch: { started_at: string; ended_at: string }) => Promise<void>
  onRemove: () => void
}) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [start, setStart] = useState(timeOfDay(session.started_at))
  const [end, setEnd] = useState(timeOfDay(session.ended_at))
  const [busy, setBusy] = useState(false)
  const mins = Math.max(
    0,
    Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000),
  )

  async function save() {
    setBusy(true)
    try {
      await onSave({
        started_at: withTimeOfDay(session.started_at, start),
        ended_at: withTimeOfDay(session.ended_at, end),
      })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between py-2.5 text-sm">
        <span className="text-muted-foreground">
          {fmtTime(session.started_at, locale)} – {fmtTime(session.ended_at, locale)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="mr-1.5 font-semibold text-foreground">
            {mins} {t.tracker.minutesShort}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.common.edit}
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t.tracker.delete}
            onClick={onRemove}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      </li>
    )
  }

  return (
    <li className="flex flex-wrap items-end gap-3 py-3">
      <div className="space-y-1.5">
        <Label>{t.tracker.start}</Label>
        <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="w-28 tabular-nums" />
      </div>
      <div className="space-y-1.5">
        <Label>{t.tracker.stop}</Label>
        <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="w-28 tabular-nums" />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" onClick={save} disabled={busy}>
          <Check className="mr-1.5 size-4" /> {t.common.save}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
          {t.common.cancel}
        </Button>
      </div>
    </li>
  )
}
