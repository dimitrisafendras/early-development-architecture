import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { TummyTimeChart } from '../components/charts'
import { useBabyAge } from '../components/AgeBadge'
import { activityTargetForAge } from '../lib/schedule'
import { BulletList } from '@/components/BulletList'
import { useT } from '../i18n'

export function TummyTime() {
  const t = useT()
  const tt = t.tummyTime
  const baby = useBabyAge()
  // Past the first birthday the banner has to stop asking for tummy minutes and
  // start asking for movement minutes — same field, different target entirely.
  const target = activityTargetForAge(baby?.months ?? null)
  return (
    <section id="tummy-time">
      {baby && (
        <Card className="mb-6 bg-primary/5 ring-1 ring-primary/30">
          <CardContent className="text-sm font-medium text-foreground">
            {(target.kind === 'movement' ? tt.ageTargetMovement : tt.ageTarget)
              .replace('{name}', baby.name)
              .replace('{age}', String(baby.months))
              .replace('{mins}', String(target.mins))}
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{tt.chartTitle}</p>
                <div className="text-xs text-muted-foreground">{tt.chartSub}</div>
              </div>
              <Badge
                className={cn(
                  'shrink-0 border-transparent',
                  statusTone.success.soft,
                  statusTone.success.text,
                )}
              >
                {tt.badge}
              </Badge>
            </div>
            <TummyTimeChart />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <Card>
            <CardContent>
              <p className="m-0 text-[15px] font-semibold text-foreground">{tt.benefitsTitle}</p>
              {/* The shared dot, not `list-disc`: a `::marker` takes its size,
                  colour and indent from the user agent and matched neither of
                  the app's other two bullet spellings. */}
              <BulletList className="mt-3 text-muted-foreground" items={tt.benefits.map((b) => b)} />
            </CardContent>
          </Card>

          {/* The Alert primitive ships a tighter `rounded-lg` / `px-2.5 py-2`; it
              sits in a column of Cards, so it takes the card geometry (14px
              radius, 16px padding) to stop the column's edges from stepping.

              A genuine warning state, so it takes `--warning` rather than a
              literal amber. One `text-warning` on the root replaces the old
              four-way light/dark pair (`amber-800`/`amber-200` for the text plus
              `amber-600`/`amber-400` for the icon) because the token already
              inverts per theme; the icon inherits via the primitive's
              `*:[svg]:text-current`. `text-warning` on this `bg-warning/10`
              surface is 4.88:1 light / 7.86:1 dark. */}
          <Alert className="rounded-xl border-warning/25 bg-warning/10 p-4 text-warning">
            <TriangleAlert />
            <AlertTitle>{tt.alertTitle}</AlertTitle>
            {/* Overrides the primitive's baked-in `text-muted-foreground`. */}
            <AlertDescription className="text-warning">
              {tt.alertBefore}
              <strong>{tt.alertEm}</strong>
              {tt.alertAfter}
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent>
              <p className="m-0 text-[15px] font-semibold text-foreground">{tt.tipsTitle}</p>
              {/* A list, not tinted boxes inside a card. Each tip is one
                  sentence with a lead-in — that is a definition list, and
                  wrapping each in its own filled panel put six boundaries around
                  six lines of text on a surface that was already a card. */}
              <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {tt.tips.map((tip) => (
                  <div key={tip.strong} className="text-[13px] leading-relaxed">
                    <dt className="inline font-semibold text-foreground">{tip.strong}</dt>{' '}
                    <dd className="inline text-muted-foreground">{tip.text}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Where tummy time goes after six months. Without this the page reads as
          though a two-year-old still owes 60 minutes on their front. */}
      <Eyebrow as="h3" size="md" className="mt-10 mb-2">
        {tt.afterTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{tt.afterNote}</p>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {tt.after.map((row) => (
          <div key={row.strong} className="text-[13px] leading-relaxed">
            <dt className="inline font-semibold text-foreground">{row.strong}</dt>{' '}
            <dd className="inline text-muted-foreground">{row.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
