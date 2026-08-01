import { useMemo, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Skeleton } from '@/components/ui/skeleton'
import { PageFrame } from '../components/PageFrame'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { Eyebrow } from '../components/Eyebrow'
import { ReportDocument } from '../components/report/ReportDocument'
import type { ReportSections } from '../components/report/ReportDocument'
import { useBabies } from '../lib/useBabies'
import { useReportData, rangeStartISO, type ReportRange } from '../lib/useReportData'
import { useDateLocale } from '../lib/dates'
import { ageInMonths, formatAgeLabel } from '../lib/schedule'
import { useT } from '../i18n'

/**
 * `/export` — the printable report and its controls.
 *
 * **The preview is the document.** The page renders exactly one
 * `ReportDocument`; the Export button calls `window.print()` and the
 * `@media print` block in `index.css` hides the app around it. So what you
 * approve on screen and what leaves the printer cannot disagree — there is no
 * second layout to keep in sync.
 *
 * Not a `WidgetPage`: the widget rhythm is glance → input → detail, and this
 * page has no glance tier and nothing to log. It is a document with a control
 * strip, so it takes `PageFrame` directly.
 */
export default function Export() {
  const t = useT()
  const tr = t.report
  const locale = useDateLocale()
  const { babies, currentBaby, currentBabyId, setCurrentBabyId } = useBabies()
  const [range, setRange] = useState<ReportRange>('30d')
  const [sections, setSections] = useState<ReportSections>({
    summary: true,
    logs: true,
    growth: true,
  })

  const sinceISO = useMemo(
    () => rangeStartISO(range, currentBaby?.birth_date ?? null),
    [range, currentBaby?.birth_date],
  )
  const data = useReportData(currentBabyId ?? null, sinceISO)

  // Stamped once per range change rather than on every render, so the
  // "Generated …" line doesn't tick over while you are reading the preview.
  const generatedAt = useMemo(() => new Date(), [sinceISO, currentBabyId])

  const subject = {
    name: currentBaby?.name ?? null,
    ageLabel: currentBaby
      ? formatAgeLabel(ageInMonths(currentBaby.birth_date), t.baby.monthsShort, t.baby.yearsShort)
      : null,
    birthDate: currentBaby?.birth_date ?? null,
  }

  const toggle = (key: keyof ReportSections) => (on: boolean) =>
    setSections((s) => ({ ...s, [key]: on }))

  const toolbar = (
    <div className="flex flex-col gap-4">
      {babies.length > 1 && (
        <Field label={t.baby.selectLabel}>
          <ChoiceGroup
            ariaLabel={t.baby.selectLabel}
            size="md"
            value={currentBabyId ?? babies[0].id}
            onChange={setCurrentBabyId}
            options={babies.map((b) => ({ value: b.id, label: b.name }))}
          />
        </Field>
      )}

      {/* Range and sections are the same kind of control at the same size, so
          they share a row and wrap together on a phone. */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <Field label={tr.rangeLabel}>
          <ChoiceGroup
            ariaLabel={tr.rangeLabel}
            size="md"
            value={range}
            onChange={setRange}
            options={[
              { value: '7d', label: tr.range7 },
              { value: '30d', label: tr.range30 },
              { value: 'all', label: tr.rangeAll },
            ]}
          />
        </Field>

        <Field label={tr.sectionsLabel}>
          {/* `pill`, so an included section takes the palette fill and an
              excluded one reads as a muted chip — the same on/off language the
              range group beside it uses. Independent switches, so toggles
              rather than a ChoiceGroup, which is a single required choice. */}
          <div className="flex flex-wrap gap-1.5">
            <Toggle variant="pill" size="md" pressed={sections.summary} onPressedChange={toggle('summary')}>
              {tr.sectionSummary}
            </Toggle>
            <Toggle variant="pill" size="md" pressed={sections.logs} onPressedChange={toggle('logs')}>
              {tr.sectionLogs}
            </Toggle>
            <Toggle variant="pill" size="md" pressed={sections.growth} onPressedChange={toggle('growth')}>
              {tr.sectionGrowth}
            </Toggle>
          </div>
        </Field>

        {/* The page's one primary. `sm:ml-auto` puts it at the end of the row
            once there is width for it, and full-bleed under the controls on a
            phone where a trailing button would be the hardest thing to reach. */}
        <Button size="md" onClick={() => window.print()} className="w-full sm:ml-auto sm:w-auto">
          <Download className="mr-2 size-4" /> {tr.action}
        </Button>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Printer className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {tr.hint}
      </p>
    </div>
  )

  return (
    // Nothing here is marked "don't print": the print stylesheet hides the whole
    // page and un-hides `#report-document` alone, so the controls, the lead and
    // any chrome added later stay off paper without being annotated.
    <PageFrame title={tr.title} toolbar={toolbar}>
      <p className="-mt-2 max-w-2xl text-sm text-muted-foreground">{tr.lead}</p>

      <Eyebrow>{tr.preview}</Eyebrow>

      {data.loading ? (
        <div className="flex flex-col gap-4" aria-live="polite" aria-busy>
          <span className="sr-only">{tr.loading}</span>
          <Skeleton className="h-24" />
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : (
        <ReportDocument
          subject={subject}
          sections={sections}
          data={data}
          sinceISO={sinceISO}
          locale={locale}
          generatedAt={generatedAt}
        />
      )}
    </PageFrame>
  )
}

/** A labelled control cluster in the toolbar. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow as="span" size="sm" tone="muted">
        {label}
      </Eyebrow>
      {children}
    </div>
  )
}
