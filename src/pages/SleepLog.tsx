import { useState } from 'react'
import { Moon, MoonStar, Sun, Timer, Trash2, Pencil, Hourglass } from 'lucide-react'
import { useBabyAge } from '../components/AgeBadge'
import { StatTile } from '../components/StatTile'
import { WidgetPage, WidgetCard, WidgetStatGrid, WidgetSplit } from '../components/WidgetPage'
import { TummyWeekChart } from '../components/charts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LiveBadge } from '@/components/ui/live-badge'
import { useBabies } from '../lib/useBabies'
import { useSleepLog, sleepMinutes, type SleepEntry } from '../lib/useSleepLog'
import { useFieldLabels } from '../lib/useFieldLabels'
import { bandIndex, formatDuration, todayKey } from '../lib/schedule'
import { dateTimeKeyFromISO, formatDateKey, isoFromDateTimeKey, useDateLocale } from '../lib/dates'
import { sleepTargets, sleepTargetUppers } from '../data'
import { useT } from '../i18n'

/** Uses the app's locale, not the browser's, so it agrees with the time fields. */
function fmtTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/**
 * Night or nap, **derived from the clock and never stored**.
 *
 * A stored kind would be one more thing to get wrong at 3am, and the rule that
 * actually distinguishes them is the clock: a sleep beginning between 19:00 and
 * 05:00 is the night. It is a label on a list, not a fact the totals depend on —
 * every number on this page counts minutes, so if this rule is wrong it is
 * wrong in the caption and nowhere else. That is the whole reason it is derived.
 */
function isNight(iso: string): boolean {
  const h = new Date(iso).getHours()
  return h >= 19 || h < 5
}

export default function SleepLog() {
  const t = useT()
  const tsl = t.sleepLog
  const { currentBaby } = useBabies()
  const locale = useDateLocale()
  const baby = useBabyAge()
  const log = useSleepLog(currentBaby?.id ?? null, currentBaby?.household_id ?? null)

  const range = baby ? sleepTargets[bandIndex(baby.months, sleepTargetUppers)] : null
  const hoursToday = log.todayMinutes / 60
  const status = !range
    ? null
    : hoursToday < range[0]
      ? tsl.belowRange
      : hoursToday <= range[1]
        ? tsl.inRange
        : tsl.aboveRange

  const dur = (mins: number) => formatDuration(mins, t.feed.hourShort, t.feed.minShort)

  const awakeText = log.running
    ? tsl.running
    : log.minsSinceLast == null
      ? tsl.never
      : dur(log.minsSinceLast)

  // Last 7 days of sleep, oldest → newest, attributed to the day each sleep
  // *started* — see `useSleepLog` for why a night is not split across two dates.
  const week = (() => {
    const days: { key: string; mins: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ key: todayKey(d), mins: 0 })
    }
    for (const s of log.sleeps) {
      const bucket = days.find((d) => d.key === todayKey(new Date(s.started_at)))
      if (bucket) bucket.mins += sleepMinutes(s)
    }
    return days
  })()

  const todayCard = (
    <WidgetCard
      icon={<Moon />}
      title={tsl.todayTitle}
      footer={
        <span className="text-xs text-muted-foreground">
          {log.signedIn ? tsl.synced : tsl.localOnly}
        </span>
      }
    >
      {log.todaySleeps.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tsl.none}</p>
      ) : (
        <ul id="sleep-today" className="divide-y divide-border">
          {log.todaySleeps.map((s) => (
            <SleepRow
              key={s.id}
              entry={s}
              onSave={(patch) => log.update(s.id, patch)}
              onRemove={() => log.remove(s.id)}
            />
          ))}
        </ul>
      )}
    </WidgetCard>
  )

  return (
    <WidgetPage
      title={tsl.title}
      inputLabel={tsl.add}
      glance={
        <WidgetStatGrid>
          <StatTile
            icon={<Moon className="size-4" />}
            label={tsl.totalToday}
            value={dur(log.todayMinutes)}
          />
          <StatTile
            icon={<Hourglass className="size-4" />}
            label={tsl.countToday}
            value={`${log.todaySleeps.length}`}
          />
          <StatTile
            icon={<MoonStar className="size-4" />}
            label={tsl.longestToday}
            value={log.longestToday ? dur(log.longestToday) : tsl.never}
          />
          <StatTile icon={<Sun className="size-4" />} label={tsl.sinceLast} value={awakeText} />
        </WidgetStatGrid>
      }
      input={
        <Card>
          <CardContent className="flex flex-col gap-4">
            {/* The live control first: a sleep you are in the middle of is the
                only thing on this page that cannot wait. */}
            <SleepConsole log={log} locale={locale} />
            <AddSleepForm onAdd={log.add} />
            {range && (
              <p className="text-xs text-muted-foreground">
                {tsl.target.replace('{range}', `${range[0]}–${range[1]}`)} {tsl.targetNote}
                {status && <span className="ml-1 font-medium text-foreground">{status}</span>}
              </p>
            )}
          </CardContent>
        </Card>
      }
      detail={
        log.sleeps.length > 0 ? (
          <WidgetSplit>
            {todayCard}
            <WidgetCard icon={<MoonStar />} title={tsl.weekTitle}>
              {/* Hours, not minutes: a night is 600 minutes and an axis running
                  to 900m is not a number anyone reads at a glance. The dashed
                  line is the *bottom* of the typical range — the end of it a
                  short night falls off. */}
              <TummyWeekChart
                labels={week.map((d) => formatDateKey(d.key, locale, { weekday: 'short' }))}
                minutes={week.map((d) => Math.round((d.mins / 60) * 10) / 10)}
                target={range ? range[0] : 0}
                seriesLabel={tsl.weekSeries}
                tickSuffix={t.feed.hourShort}
              />
            </WidgetCard>
          </WidgetSplit>
        ) : (
          todayCard
        )
      }
    />
  )
}

/**
 * Start / stop, and the running clock.
 *
 * One button, two states: a sleep is either running or it is not, and the page
 * cannot offer both at once — which is also why `start` and `stop` in the hook
 * both refuse to act against the wrong state rather than trusting this button.
 */
function SleepConsole({
  log,
  locale,
}: {
  log: ReturnType<typeof useSleepLog>
  locale: string
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
        size="lg"
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
          <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
            {formatDuration(log.runningMinutes, t.feed.hourShort, t.feed.minShort)}
          </span>
          <span className="text-xs text-muted-foreground">
            {tsl.startedAt.replace('{time}', fmtTime(log.running.started_at, locale))}
          </span>
        </span>
      )}
    </div>
  )
}

/**
 * Log a sleep that has already finished.
 *
 * The other half of the page, and the one that gets used more: nobody is awake
 * at 05:40 to press "they woke up", so a night is nearly always entered
 * afterwards with both ends known. Both times are full date-and-time pickers
 * rather than clock times — a night starts on one date and ends on another, and
 * a picker that only edits the clock cannot express that at all.
 */
function AddSleepForm({
  onAdd,
}: {
  onAdd: (input: { started_at: string; ended_at: string; note: string | null }) => Promise<void>
}) {
  const t = useT()
  const tsl = t.sleepLog
  const fields = useFieldLabels()
  // An hour ago to now, not now to now: the form opens on a *valid* sleep, so
  // it does not greet the caregiver with its own validation error, and an hour
  // is the shape of the thing being logged.
  const [start, setStart] = useState(() =>
    dateTimeKeyFromISO(new Date(Date.now() - 60 * 60_000).toISOString()),
  )
  const [end, setEnd] = useState(() => dateTimeKeyFromISO(new Date().toISOString()))
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const startISO = isoFromDateTimeKey(start)
  const endISO = isoFromDateTimeKey(end)
  // Both checks refuse rather than clamp: a wrong time is a fact about the
  // night, and silently moving it would file a sleep the caregiver never had.
  const error =
    new Date(endISO).getTime() > Date.now()
      ? tsl.endInFuture
      : new Date(endISO).getTime() <= new Date(startISO).getTime()
        ? tsl.endBeforeStart
        : null

  async function submit() {
    if (error) return
    setBusy(true)
    try {
      await onAdd({ started_at: startISO, ended_at: endISO, note: note.trim() || null })
      setNote('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor="sleep-start">{tsl.startLabel}</Label>
          <DateTimePicker id="sleep-start" size="md" value={start} onValueChange={setStart} {...fields.dateTimePicker} />
        </div>
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor="sleep-end">{tsl.endLabel}</Label>
          {/* The *end* is what is wrong in both cases — it is either before the
              start or in the future — so that is the field that carries the
              invalid state, not both of them. */}
          <DateTimePicker
            id="sleep-end"
            size="md"
            value={end}
            onValueChange={setEnd}
            invalid={Boolean(error)}
            {...fields.dateTimePicker}
          />
        </div>
        <div className="min-w-[10rem] flex-1 space-y-1.5">
          <Label htmlFor="sleep-note">{tsl.noteLabel}</Label>
          <Input id="sleep-note" size="md" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <Button size="md" disabled={busy || Boolean(error)} onClick={() => void submit()}>
          <Timer /> {tsl.save}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

/** One finished sleep. Edited in place, both ends at once — a sleep is an
 *  interval, so correcting one end without seeing the other is how you end up
 *  with a nap that finishes before it starts. */
function SleepRow({
  entry,
  onSave,
  onRemove,
}: {
  entry: SleepEntry
  onSave: (patch: { started_at: string; ended_at: string }) => Promise<void>
  onRemove: () => void
}) {
  const t = useT()
  const tsl = t.sleepLog
  const locale = useDateLocale()
  const fields = useFieldLabels()
  const [editing, setEditing] = useState(false)
  const [start, setStart] = useState(dateTimeKeyFromISO(entry.started_at))
  const [end, setEnd] = useState(dateTimeKeyFromISO(entry.ended_at ?? entry.started_at))
  const [busy, setBusy] = useState(false)

  const startISO = isoFromDateTimeKey(start)
  const endISO = isoFromDateTimeKey(end)
  const error =
    new Date(endISO).getTime() > Date.now()
      ? tsl.endInFuture
      : new Date(endISO).getTime() <= new Date(startISO).getTime()
        ? tsl.endBeforeStart
        : null

  async function save() {
    if (error) return
    setBusy(true)
    try {
      await onSave({ started_at: startISO, ended_at: endISO })
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 py-2.5 text-sm">
        <span className="flex items-center gap-3">
          <span className="font-heading font-semibold tabular-nums text-foreground">
            {fmtTime(entry.started_at, locale)}
            <span className="opacity-70">{' – '}</span>
            {entry.ended_at ? fmtTime(entry.ended_at, locale) : '…'}
          </span>
          <Badge variant="soft">{isNight(entry.started_at) ? tsl.night : tsl.nap}</Badge>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="mr-1.5 font-semibold text-foreground">
            {formatDuration(sleepMinutes(entry), t.feed.hourShort, t.feed.minShort)}
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
            aria-label={tsl.delete}
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
    <li className="flex flex-col gap-3 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor={`s-start-${entry.id}`}>{tsl.startLabel}</Label>
          <DateTimePicker
            id={`s-start-${entry.id}`}
            size="md"
            value={start}
            onValueChange={setStart}
            {...fields.dateTimePicker}
          />
        </div>
        <div className="min-w-[12rem] space-y-1.5">
          <Label htmlFor={`s-end-${entry.id}`}>{tsl.endLabel}</Label>
          <DateTimePicker
            id={`s-end-${entry.id}`}
            size="md"
            value={end}
            onValueChange={setEnd}
            invalid={Boolean(error)}
            {...fields.dateTimePicker}
          />
        </div>
        <Button size="md" disabled={busy || Boolean(error)} onClick={() => void save()}>
          {t.common.save}
        </Button>
        <Button size="md" variant="ghost" onClick={() => setEditing(false)}>
          {t.common.cancel}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </li>
  )
}
