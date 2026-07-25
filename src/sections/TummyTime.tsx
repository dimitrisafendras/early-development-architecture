import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { TummyTimeChart } from '../components/charts'
import { useBabyAge } from '../components/AgeBadge'
import { tummyTargetForAgeMonths } from '../lib/schedule'
import { useT } from '../i18n'

export function TummyTime() {
  const t = useT()
  const tt = t.tummyTime
  const baby = useBabyAge()
  return (
    <section id="tummy-time">
      {baby && (
        <Card className="mb-6 bg-primary/5 ring-1 ring-primary/30">
          <CardContent className="text-sm font-medium text-foreground">
            {tt.ageTarget
              .replace('{name}', baby.name)
              .replace('{age}', String(baby.months))
              .replace('{mins}', String(tummyTargetForAgeMonths(baby.months)))}
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
              <ul className="mt-2 list-disc pl-[18px] text-[13px] leading-relaxed text-muted-foreground">
                {tt.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
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
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {tt.tips.map((tip) => (
                  <div
                    key={tip.strong}
                    className="rounded-xl bg-muted p-4 text-[13px] leading-relaxed text-muted-foreground"
                  >
                    <strong className="text-foreground">{tip.strong}</strong> {tip.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
