import type { ReactNode } from 'react'
import { Milk, Timer, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FeedWeekChart, TummyWeekChart, GrowthChart } from '../charts'
import { formatDateKey, formatTimeKey, timeKeyFromISO, toDateKey } from '../../lib/dates'
import { dayKeysInRange } from '../../lib/useReportData'
import type { ReportData } from '../../lib/useReportData'
import type { FeedEntry } from '../../lib/useFeedLog'
import type { TrackerSession } from '../../lib/useTummyTracker'
import type { Measurement } from '../../lib/db'
import { useT } from '../../i18n'

/**
 * The printable report — one component that is both the on-screen preview and
 * the printed document.
 *
 * **There is deliberately no second, print-only layout.** The obvious shape for
 * this feature is a hidden `<div>` rendered only for the printer, but then the
 * thing you approve on screen and the thing that comes out of the printer are
 * two pieces of code that drift apart the first time either is edited. This is
 * rendered once; `@media print` in `index.css` hides the app *around* it, and
 * nothing about the document itself changes between screen and paper.
 *
 * **It is a light page in both places.** `.report-document` carries its own
 * neutral tokens (see `index.css`), and the charts are pinned with
 * `scheme="light"` because chart.js paints from JavaScript values a print
 * stylesheet cannot reach. Nothing here takes the palette accent for text
 * either: a dark palette's accent is around L 0.72, which is ~2.3:1 on white.
 * The accent survives only in the masthead hairline and the chart fills, where
 * it is decoration.
 *
 * Everything else is plain semantic markup and shadcn tokens — no glass, no
 * aurora. A printed page is the one surface in this app with no theme and no
 * hover state.
 */

export interface ReportSections {
  summary: boolean
  logs: boolean
  growth: boolean
}

export interface ReportSubject {
  name: string | null
  ageLabel: string | null
  birthDate: string | null
}

/** Minutes between two ISO instants, never negative. */
function minutesBetween(startISO: string, endISO: string): number {
  return Math.max(0, Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000))
}

/** Groups entries by their **local** day key — the day a parent would say it was. */
function byDay<T>(rows: T[], at: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const row of rows) {
    const key = toDateKey(new Date(at(row)))
    const list = map.get(key)
    if (list) list.push(row)
    else map.set(key, [row])
  }
  return map
}

export function ReportDocument({
  subject,
  sections,
  data,
  sinceISO,
  locale,
  generatedAt,
}: {
  subject: ReportSubject
  sections: ReportSections
  data: ReportData
  sinceISO: string
  locale: string
  generatedAt: Date
}) {
  const t = useT()
  const tr = t.report
  const days = dayKeysInRange(sinceISO)
  const feedsByDay = byDay(data.feeds, (f) => f.fed_at)
  const sessionsByDay = byDay(data.sessions, (s) => s.started_at)

  const totalFeeds = data.feeds.length
  const totalMl = data.feeds.reduce((sum, f) => sum + (f.amount_ml ?? 0), 0)
  const totalTummy = data.sessions.reduce((sum, s) => sum + minutesBetween(s.started_at, s.ended_at), 0)
  const dayCount = Math.max(1, days.length)
  const latestWeight = [...data.measurements]
    .reverse()
    .find((m) => m.weight_kg != null)?.weight_kg

  const rangeCaption = `${formatDateKey(days[0], locale, { day: 'numeric', month: 'short' })} – ${formatDateKey(
    days[days.length - 1],
    locale,
    { day: 'numeric', month: 'short', year: 'numeric' },
  )}`

  const nothing = totalFeeds === 0 && data.sessions.length === 0 && data.measurements.length === 0

  return (
    // `report-document` is the print anchor: the print stylesheet keeps this
    // subtree and hides everything else on the page.
    <article
      id="report-document"
      className="report-document rounded-xl border border-border bg-card p-6 text-foreground sm:p-8"
    >
      <ReportMasthead
        subject={subject}
        rangeCaption={rangeCaption}
        generated={tr.generated.replace(
          '{date}',
          new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(generatedAt),
        )}
        title={tr.documentTitle}
        noBaby={tr.noBaby}
      />

      {nothing && !data.loading && (
        <p className="py-10 text-center text-sm text-muted-foreground">{tr.empty}</p>
      )}

      {sections.summary && !nothing && (
        <ReportBlock>
          <FigureGrid>
            <Figure label={tr.statFeedsPerDay} value={(totalFeeds / dayCount).toFixed(1)} />
            <Figure label={tr.statMilkPerDay} value={Math.round(totalMl / dayCount)} unit={t.feed.mlShort} />
            <Figure
              label={tr.statTummyPerDay}
              value={Math.round(totalTummy / dayCount)}
              unit={t.tracker.minutesShort}
            />
            <Figure
              label={tr.statLatestWeight}
              value={latestWeight != null ? latestWeight.toFixed(2) : '—'}
              unit={latestWeight != null ? 'kg' : undefined}
            />
            <Figure label={tr.statDaysCovered} value={days.length} />
            <Figure label={tr.statTotalFeeds} value={totalFeeds} />
            <Figure label={tr.statTotalTummy} value={totalTummy} unit={t.tracker.minutesShort} />
            <Figure label={tr.statMeasurements} value={data.measurements.length} />
          </FigureGrid>
        </ReportBlock>
      )}

      {sections.logs && (
        <>
          <ReportBlock title={tr.feedsTitle} icon={<Milk className="size-4" />}>
            {totalFeeds === 0 ? (
              <Muted>{tr.empty}</Muted>
            ) : (
              <>
                <ChartFrame caption={tr.trendFeeds}>
                  <FeedWeekChart
                    scheme="light"
                    labels={days.map((d) => formatDateKey(d, locale, { day: 'numeric', month: 'short' }))}
                    ml={days.map((d) =>
                      (feedsByDay.get(d) ?? []).reduce((sum, f) => sum + (f.amount_ml ?? 0), 0),
                    )}
                    counts={days.map((d) => (feedsByDay.get(d) ?? []).length)}
                    mlLabel={t.feed.mlShort}
                    feedsLabel={t.feed.progressFeeds}
                  />
                </ChartFrame>
                <DayTable
                  days={days}
                  rowsByDay={feedsByDay}
                  locale={locale}
                  columns={[tr.colTime, tr.colMethod, tr.colAmount, tr.colNote]}
                  renderRow={(f: FeedEntry) => [
                    formatTimeKey(timeKeyFromISO(f.fed_at), locale),
                    t.feed[f.method],
                    f.amount_ml != null
                      ? `${f.amount_ml} ${t.feed.mlShort}`
                      : f.minutes != null
                        ? `${f.minutes} ${t.feed.minShort}`
                        : '—',
                    f.note ?? '',
                  ]}
                  dayTotal={(rows: FeedEntry[]) => {
                    const ml = rows.reduce((sum, f) => sum + (f.amount_ml ?? 0), 0)
                    return `${rows.length} × · ${ml} ${t.feed.mlShort}`
                  }}
                  totalLabel={tr.dayTotal}
                />
              </>
            )}
          </ReportBlock>

          <ReportBlock title={tr.tummyTitle} icon={<Timer className="size-4" />}>
            {data.sessions.length === 0 ? (
              <Muted>{tr.empty}</Muted>
            ) : (
              <>
                <ChartFrame caption={tr.trendTummy}>
                  <TummyWeekChart
                    scheme="light"
                    labels={days.map((d) => formatDateKey(d, locale, { day: 'numeric', month: 'short' }))}
                    minutes={days.map((d) =>
                      (sessionsByDay.get(d) ?? []).reduce(
                        (sum, s) => sum + minutesBetween(s.started_at, s.ended_at),
                        0,
                      ),
                    )}
                    target={0}
                  />
                </ChartFrame>
                <DayTable
                  days={days}
                  rowsByDay={sessionsByDay}
                  locale={locale}
                  columns={[tr.colStart, tr.colStop, tr.colDuration]}
                  renderRow={(s: TrackerSession) => [
                    formatTimeKey(timeKeyFromISO(s.started_at), locale),
                    formatTimeKey(timeKeyFromISO(s.ended_at), locale),
                    `${minutesBetween(s.started_at, s.ended_at)} ${t.tracker.minutesShort}`,
                  ]}
                  dayTotal={(rows: TrackerSession[]) => {
                    const mins = rows.reduce((sum, s) => sum + minutesBetween(s.started_at, s.ended_at), 0)
                    return `${rows.length} × · ${mins} ${t.tracker.minutesShort}`
                  }}
                  totalLabel={tr.dayTotal}
                />
              </>
            )}
          </ReportBlock>
        </>
      )}

      {sections.growth && (
        <ReportBlock title={tr.growthTitle} icon={<Ruler className="size-4" />}>
          {!data.growthAvailable ? (
            <Muted>{tr.growthSignedOut}</Muted>
          ) : data.measurements.length === 0 ? (
            <Muted>{tr.empty}</Muted>
          ) : (
            <>
              <ChartFrame caption={tr.trendWeight}>
                <GrowthChart
                  scheme="light"
                  labels={data.measurements.map((m) =>
                    formatDateKey(m.measured_on, locale, { day: 'numeric', month: 'short' }),
                  )}
                  data={data.measurements.map((m) => m.weight_kg)}
                  label={tr.colWeight}
                  yTitle="kg"
                />
              </ChartFrame>
              <FlatTable
                columns={[tr.colDate, tr.colWeight, tr.colHeight, tr.colHead, tr.colNote]}
                rows={data.measurements.map((m: Measurement) => [
                  formatDateKey(m.measured_on, locale, { day: 'numeric', month: 'short', year: 'numeric' }),
                  m.weight_kg != null ? `${m.weight_kg.toFixed(2)} kg` : '—',
                  m.height_cm != null ? `${m.height_cm} cm` : '—',
                  m.head_cm != null ? `${m.head_cm} cm` : '—',
                  m.note ?? '',
                ])}
              />
            </>
          )}
        </ReportBlock>
      )}
    </article>
  )
}

/* ---------------------------------------------------------------- pieces --- */

/**
 * The document's title block.
 *
 * Carries the accent rule from `PageFrame`'s header so the printed page is
 * recognisably from this app, and repeats on no page but the first — a masthead
 * on every sheet would be letterhead, which this is not.
 */
function ReportMasthead({
  subject,
  rangeCaption,
  generated,
  title,
  noBaby,
}: {
  subject: ReportSubject
  rangeCaption: string
  generated: string
  title: string
  noBaby: string
}) {
  return (
    <header className="mb-6 flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-heading text-2xl font-semibold">{title}</h2>
        <p className="font-heading text-sm font-semibold tabular-nums">{rangeCaption}</p>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground">
        <p>
          {subject.name ? (
            <>
              <span className="font-semibold text-foreground">{subject.name}</span>
              {subject.ageLabel && <> · {subject.ageLabel}</>}
            </>
          ) : (
            noBaby
          )}
        </p>
        <p className="tabular-nums">{generated}</p>
      </div>
      <div
        aria-hidden
        className="mt-1 h-px w-full bg-gradient-to-r from-primary/45 via-border to-transparent"
      />
    </header>
  )
}

/** One section. `break-inside: avoid` keeps a heading off the foot of a page. */
function ReportBlock({
  title,
  icon,
  children,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="report-block mt-6 first:mt-0">
      {title && (
        <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-semibold">
          <span className="text-muted-foreground">{icon}</span>
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}

function Muted({ children }: { children: ReactNode }) {
  return <p className="py-3 text-sm text-muted-foreground">{children}</p>
}

function FigureGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
}

/** A headline number. Label under value, because the number is what's read. */
function Figure({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <div className="report-figure rounded-lg border border-border bg-muted/40 px-3 py-2.5">
      <p className="font-heading text-xl font-semibold tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      <p className="mt-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
    </div>
  )
}

/** A chart with its caption. Fixed height so a page break can be predicted. */
function ChartFrame({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="report-figure mb-4">
      {children}
      <figcaption className="mt-1 text-center text-[11px] text-muted-foreground">{caption}</figcaption>
    </figure>
  )
}

const CELL = 'px-2 py-1.5 text-left align-top'

/**
 * A table grouped by day, with a subtotal row closing each day.
 *
 * Days with nothing logged are skipped rather than printed empty: over a
 * 30-day range the blank rows would outnumber the real ones and the reader
 * would be scanning past whitespace to find the data.
 */
function DayTable<T>({
  days,
  rowsByDay,
  locale,
  columns,
  renderRow,
  dayTotal,
  totalLabel,
}: {
  days: string[]
  rowsByDay: Map<string, T[]>
  locale: string
  columns: string[]
  renderRow: (row: T) => ReactNode[]
  dayTotal: (rows: T[]) => string
  totalLabel: string
}) {
  const populated = days.filter((d) => (rowsByDay.get(d) ?? []).length > 0)
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-[11px] tracking-wide text-muted-foreground uppercase">
          {columns.map((c) => (
            <th key={c} className={cn(CELL, 'font-medium')} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      {populated.map((day) => {
        const rows = rowsByDay.get(day) ?? []
        return (
          <tbody key={day} className="report-day">
            <tr>
              <th
                scope="colgroup"
                colSpan={columns.length}
                className="px-2 pt-3 pb-1 text-left font-heading text-sm font-semibold"
              >
                {formatDateKey(day, locale, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </th>
            </tr>
            {[...rows]
              .sort((a, b) => String(renderRow(a)[0]).localeCompare(String(renderRow(b)[0])))
              .map((row, i) => (
                <tr key={i} className="border-b border-border/60">
                  {renderRow(row).map((cell, j) => (
                    <td key={j} className={cn(CELL, j === 0 && 'tabular-nums')}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            <tr className="border-b border-border">
              <td className={cn(CELL, 'text-xs text-muted-foreground')} colSpan={columns.length - 1}>
                {totalLabel}
              </td>
              <td className={cn(CELL, 'text-xs font-semibold tabular-nums')}>{dayTotal(rows)}</td>
            </tr>
          </tbody>
        )
      })}
    </table>
  )
}

/** An ungrouped table — growth is already one row per date. */
function FlatTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-border text-[11px] tracking-wide text-muted-foreground uppercase">
          {columns.map((c) => (
            <th key={c} className={cn(CELL, 'font-medium')} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="report-day border-b border-border/60">
            {row.map((cell, j) => (
              <td key={j} className={cn(CELL, 'tabular-nums')}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
