import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { SectionHeader } from '../components/SectionHeader'
import { TummyTimeChart } from '../components/charts'
import { useT } from '../i18n'

export function TummyTime() {
  const t = useT()
  const tt = t.tummyTime
  return (
    <section id="tummy-time">
      <SectionHeader module={4} title={tt.title} description={tt.description} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-foreground">{tt.chartTitle}</p>
                <div className="text-xs text-muted-foreground">{tt.chartSub}</div>
              </div>
              <Badge className="shrink-0 border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                {tt.badge}
              </Badge>
            </div>
            <TummyTimeChart />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <Card>
            <CardContent>
              <p className="m-0 font-semibold text-foreground">{tt.benefitsTitle}</p>
              <ul className="mt-2 list-disc pl-[18px] text-[13px] text-muted-foreground">
                {tt.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Alert className="border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
            <TriangleAlert />
            <AlertTitle className="text-amber-800 dark:text-amber-200">{tt.alertTitle}</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300/90">
              {tt.alertBefore}
              <strong>{tt.alertEm}</strong>
              {tt.alertAfter}
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent>
              <p className="m-0 font-semibold text-foreground">{tt.tipsTitle}</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tt.tips.map((tip) => (
                  <div key={tip.strong} className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
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
