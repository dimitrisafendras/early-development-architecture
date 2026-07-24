import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Square, Radio, ArrowRight, CalendarDays, ListChecks, Flame } from 'lucide-react'
import { SectionHeader } from '../components/SectionHeader'
import { AgeBadge } from '../components/AgeBadge'
import { ProgressRing } from '../components/ProgressRing'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { scheduleBlocks } from '../data'
import { checklistItems } from '../data'
import { activeBlockIndex, minutesUntilBlockStart, tummyTargetForAgeMonths, ageInMonths } from '../lib/schedule'
import { topicPath } from '../sections/registry'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker } from '../lib/useTummyTracker'
import { useDailyChecklist } from '../lib/useDailyChecklist'
import { useT } from '../i18n'

export default function Daily() {
  const t = useT()
  return (
    <>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader title={t.daily.title} description={t.daily.subtitle} />
          <AgeBadge />
        </div>

        <NowWidget />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TummyWidget />
          <ChecklistWidget />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LinkCard to={topicPath('full-day')} icon={<CalendarDays className="size-5" />} label={t.daily.fullDayCta} />
          <LinkCard to={topicPath('daily-routine')} icon={<ListChecks className="size-5" />} label={t.daily.learnRoutine} />
        </div>
      </main>
    </>
  )
}

function formatCountdown(mins: number, h: string, m: string): string {
  const hr = Math.floor(mins / 60)
  const mn = mins % 60
  return hr > 0 ? `${hr}${h} ${mn}${m}` : `${mn}${m}`
}

function NowWidget() {
  const t = useT()
  const tl = t.routineLive
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const active = activeBlockIndex(now)
  const next = (active + 1) % scheduleBlocks.length
  const untilNext = minutesUntilBlockStart(next, now)
  const suggestions = t.routine.blocks[active].items
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="py-5">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Radio className="size-3.5" /> {t.daily.nowTitle}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{tl.rightNow}</div>
              <div className="font-semibold text-foreground">{t.routine.blocks[active].title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="uppercase tracking-wider">{tl.upNext}</span>
            <ArrowRight className="size-4" />
            <span className="font-medium text-foreground">{t.routine.blocks[next].title}</span>
            <span>· {tl.in} {formatCountdown(untilNext, tl.hour, tl.minute)}</span>
          </div>
        </div>

        {/* Proposed next activities for the current block */}
        <div className="mt-4 border-t border-primary/15 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {t.daily.suggestedNow}
          </p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((item) => (
              <li key={item.strong} className="flex gap-2 text-[13px] text-muted-foreground">
                <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">{item.strong}</strong> {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function TummyWidget() {
  const t = useT()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const target = tummyTargetForAgeMonths(currentBaby ? ageInMonths(currentBaby.birth_date) : null)
  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const total = tracker.completedMinutes + runningMin
  const clock = tracker.isRunning
    ? `${String(Math.floor(tracker.elapsedSeconds / 60)).padStart(2, '0')}:${String(tracker.elapsedSeconds % 60).padStart(2, '0')}`
    : null
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <p className="self-start text-[15px] font-semibold text-foreground">{t.daily.tummyTitle}</p>
        <ProgressRing progress={total / target} size={160} stroke={12}>
          <div>
            <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">
              {clock ?? Math.round(total)}
              {!clock && <span className="text-base text-muted-foreground"> / {target}</span>}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {tracker.isRunning ? t.tracker.running : `${Math.round((total / target) * 100)}% ${t.daily.ofTarget}`}
            </div>
          </div>
        </ProgressRing>
        {tracker.isRunning ? (
          <Button variant="destructive" onClick={() => void tracker.stop()}>
            <Square className="mr-2 size-4" /> {t.daily.stopSession}
          </Button>
        ) : (
          <Button onClick={() => void tracker.start()}>
            <Play className="mr-2 size-4" /> {t.daily.startSession}
          </Button>
        )}
        <Link to="/tracker" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {t.daily.openTracker} <ArrowRight className="size-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}

function ChecklistWidget() {
  const t = useT()
  const { checked, streak, total, toggle } = useDailyChecklist()
  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-foreground">{t.daily.checklistTitle}</p>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Flame className="size-3.5" /> {streak}
            </span>
          )}
        </div>
        <ul className="space-y-1.5">
          {checklistItems.map((item, i) => {
            const isChecked = checked.includes(item.id)
            return (
              <li key={item.id}>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors',
                    isChecked ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => toggle(item.id)} />
                  <span className={cn('text-foreground', isChecked && 'text-muted-foreground line-through')}>
                    {t.summary.items[i].title}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-bold text-primary">{checked.length}</span> / {total} {t.daily.checklistDone}
        </p>
      </CardContent>
    </Card>
  )
}

function LinkCard({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground transition-[border-color,box-shadow] outline-none hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/70"
    >
      <span className="inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</span>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
