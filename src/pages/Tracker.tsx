import { useState } from 'react'
import {
  Trash2,
  Pencil,
  Timer,
  CalendarDays,
  Flame,
  Hourglass,
  Target,
  Cloud,
  Smartphone,
  Plus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GlassScrollArea } from '@dimitrisafendras/liquid-glass'
import { TummyConsole } from '../components/TummyConsole'
import { SessionFields, draftFromSession, newSessionDraft } from '../components/SessionFields'
import { StatTile } from '../components/StatTile'
import { TummyWeekChart } from '../components/charts'
import { WidgetPage, WidgetCard, WidgetStatGrid, WidgetSplit } from '../components/WidgetPage'
import { useBabies } from '../lib/useBabies'
import { useTummyTracker, useWeeklyMinutes, type TrackerSession } from '../lib/useTummyTracker'
import { activityTargetForAge, ageInMonths, todayKey } from '../lib/schedule'
import {
  formatDateKey,
  useDateLocale,
} from '../lib/dates'
import { useT } from '../i18n'

/** Uses the app's locale, not the browser's, so times read the same everywhere. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/** Minutes between two ISO timestamps, rounded, never negative. */
function minutesBetween(startISO: string, endISO: string): number {
  return Math.max(0, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000))
}

export default function Tracker() {
  const t = useT()
  const locale = useDateLocale()
  const { currentBaby } = useBabies()
  const tracker = useTummyTracker(currentBaby?.id ?? null, currentBaby?.household_id ?? null)
  const week = useWeeklyMinutes(tracker.sessions, tracker.signedIn)

  const ageM = currentBaby ? ageInMonths(currentBaby.birth_date) : null
  // Under a year this is the tummy-time ramp; from the first birthday it is the
  // WHO's 180 min/day of movement, and `kind` swaps the page's labels with it.
  const { mins: target, kind: targetKind } = activityTargetForAge(ageM)
  // Past the first birthday this page is an *active-play* log, not a tummy-time
  // log: same timer, same target, different thing being timed — and a different
  // slot type to read out of the day program.
  const movementKind = targetKind === 'movement'
  /**
   * What the day program plans for this activity.
   *
   * The target is age-derived and knew nothing about the day the caregiver
   * actually authored on `/schedule`, so the two sat side by side saying
   * unrelated things — a program with three five-minute tummy slots under a
   * sixty-minute target, and no way to see that the plan does not reach it.
   * `useSchedule` resolves the program in effect for this child's age, which is
   * the same one `/daily` runs the day from.
   */
  // The moment the running session began, so neither form can be saved onto it.
  const runningSince = tracker.activeStart

  // The "log a past session" form in the History card — open, and its draft.
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState(newSessionDraft)

  const runningMin = tracker.isRunning ? tracker.elapsedSeconds / 60 : 0
  const totalWithRunning = tracker.completedMinutes + runningMin

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

  const movement = movementKind

  return (
    <WidgetPage
      title={movement ? t.tracker.titleMovement : t.tracker.title}
      inputLabel={movement ? t.tracker.sessionLabelMovement : t.tracker.sessionLabel}
      glance={
        <>
          <WidgetStatGrid>
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
          </WidgetStatGrid>
        </>
      }
      input={
        /* The timer console.

           It was a ring — a 168px disc growing to 216 — and it was wrong twice
           over. It said one number, a fraction of the target, drawn round; but
           the thing a caregiver is actually managing here is the *shape* of the
           day, because tummy time is guided as short, frequent sessions, and
           "twelve of sixty" is the same arc whether it arrived in one stretch or
           six. And being a disc it was as tall as it was wide, so on a card
           1100px across it either floated in a lake of space or got inflated
           until it filled one — which is what it had been doing.

           A bar answers both. Segments give the day its shape, minutes map to
           width against the target so it is a true scale rather than a set of
           proportions, and it is as wide as the card gives it. That freed the
           height for the two things worth being big: the clock, and the button
           that drives it.

           A plain `Card`, like the input tier on `/feed` and `/baby` — no tinted
           gradient, no `border-primary/20` (Card draws its edge as a ring, so
           that border rendered nothing). No title: the tier eyebrow names it. */
        <Card>
          <CardContent className="flex flex-col gap-7">
            {/* The console itself is shared with the `/daily` dashboard, which
                is where the two used to drift: this page ran a session bar
                while the dashboard ran a progress ring with its own clock and
                its own idea of what the arc measured. */}
            <TummyConsole tracker={tracker} target={target} movement={movement} />

            {/* Footer strip — the context that used to crowd the action, now
                spanning the card so its width is used at every breakpoint. */}
            <div className="flex flex-col gap-1.5 border-t border-border/70 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="flex items-center gap-1.5">
                <Target aria-hidden className="size-3.5 shrink-0 text-primary/70" />
                {targetContext}
              </span>
              <span className="flex items-center gap-1.5">
                {tracker.signedIn ? (
                  <Cloud aria-hidden className="size-3.5 shrink-0 text-primary/70" />
                ) : (
                  <Smartphone aria-hidden className="size-3.5 shrink-0 text-primary/70" />
                )}
                {tracker.signedIn ? t.tracker.synced : t.tracker.localOnly}
              </span>
            </div>
          </CardContent>
        </Card>
      }
      detail={
        <WidgetSplit>
          <WidgetCard
            icon={<Timer />}
            title={t.tracker.historyTitle}
            footer={
              <>
                <span className="text-muted-foreground">{t.tracker.cumulativeToday}: </span>
                {/* Rounded here, at the display. The hook keeps the exact value
                    so two readings of one total cannot disagree — but exact
                    means 2.2159, which is not a thing to show anyone. */}
                <span className="font-bold text-primary">
                  {Math.round(tracker.completedMinutes)}
                </span>
                <span className="text-muted-foreground"> / {target} {t.tracker.minutesShort}</span>
              </>
            }
          >
            {/* Logging one by hand belongs here, beside the list it lands in —
                not in the input tier, where it would compete with Start for the
                page's one primary action. The timer is still the way you record
                a session; this is the way you record the one you forgot to
                time. */}
            {adding ? (
              <div className="mb-3 rounded-xl bg-muted p-3">
                <SessionFields
                  idPrefix="s-new"
                  draft={draft}
                  onChange={setDraft}
                  // "Save", not "Log a past session" again: the opener already
                  // said that, and repeating it makes the two buttons
                  // indistinguishable to anyone reading by label alone.
                  submitLabel={t.common.save}
                  runningSince={runningSince}
                  onCancel={() => setAdding(false)}
                  onSubmit={async (started_at, ended_at) => {
                    await tracker.addManual(started_at, ended_at)
                    setAdding(false)
                  }}
                />
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="mb-3"
                onClick={() => {
                  setDraft(newSessionDraft())
                  setAdding(true)
                }}
              >
                <Plus className="mr-1.5 size-4" /> {t.tracker.addManual}
              </Button>
            )}
            {tracker.sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.tracker.noHistory}</p>
            ) : (
              <GlassScrollArea className="max-h-[10.5rem]">
                <div id="tummy-history" className="space-y-4 pr-1">
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
                            runningSince={runningSince}
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
          </WidgetCard>

          <WidgetCard
            title={t.tracker.weekTitle}
            meta={`${daysOnTarget}/7 · ${t.tracker.statDaysOnTarget}`}
          >
            <TummyWeekChart labels={weekLabels} minutes={weekMinutes} target={target} />
          </WidgetCard>
        </WidgetSplit>
      }
    />
  )
}

/**
 * One session in the history. Tap the pencil to adjust its day and its
 * start/stop times inline; saving re-derives the duration and persists via
 * `onSave`.
 *
 * **One date for both timestamps, not one each.** `started_at` and `ended_at`
 * are stored as independent instants, so a pair of date-time pickers would be
 * the literal mapping — and would let a session start on Tuesday and end on
 * Friday. A tummy session is one sitting; a single date makes that state
 * unreachable instead of merely unlikely. The cost is that a session running
 * through midnight cannot be expressed, which no tummy session does.
 *
 * The row previously held the date fixed and edited only the clock times, so a
 * session recorded on the wrong day was uncorrectable.
 */
function SessionRow({
  session,
  locale,
  runningSince,
  onSave,
  onRemove,
}: {
  session: TrackerSession
  locale: string
  /** Editing a past session must not move it onto the running one either. */
  runningSince: Date | null
  onSave: (patch: { started_at: string; ended_at: string }) => Promise<void>
  onRemove: () => void
}) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(() => draftFromSession(session))
  const mins = minutesBetween(session.started_at, session.ended_at)

  if (editing) {
    return (
      <li className="py-3">
        {/* The same three fields the "log a past session" form uses — they ask
            the same questions and enforce the same rule, so they are one
            component rather than two that drift. */}
        <SessionFields
          idPrefix={`s-${session.id}`}
          draft={draft}
          onChange={setDraft}
          submitLabel={t.common.save}
          runningSince={runningSince}
          onCancel={() => setEditing(false)}
          onSubmit={async (started_at, ended_at) => {
            await onSave({ started_at, ended_at })
            setEditing(false)
          }}
        />
      </li>
    )
  }

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
          onClick={() => {
            setDraft(draftFromSession(session))
            setEditing(true)
          }}
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
