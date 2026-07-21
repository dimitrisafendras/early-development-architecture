import { HeartPulse, Scissors, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { BrainGrowthChart } from '../components/charts'
import { useT } from '../i18n'

export function Neurobiology() {
  const t = useT()
  const tn = t.neurobiology
  return (
    <section id="neurobiology">
      <SectionHeader module={1} title={tn.title} description={tn.description} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardContent>
            <p className="text-[15px] font-semibold text-foreground">{tn.chartTitle}</p>
            <div className="mt-4">
              <BrainGrowthChart />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xs text-muted-foreground">{tn.newborn}</div>
                <div className="font-bold text-foreground">25%</div>
              </div>
              <div className="rounded-lg bg-accent p-2">
                <div className="text-xs text-accent-foreground">{tn.oneYear}</div>
                <div className="font-bold text-accent-foreground">70%</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xs text-muted-foreground">{tn.adult}</div>
                <div className="font-bold text-foreground">100%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          <Card className="h-full">
            <CardContent>
              <span className="inline-flex rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
                <Zap className="size-5" aria-hidden />
              </span>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                {tn.cards.synaptogenesis.title}
              </p>
              <p className="m-0 text-[13px] text-muted-foreground">{tn.cards.synaptogenesis.body}</p>
              <div className="mt-3 rounded-lg bg-amber-500/10 p-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                {tn.cards.synaptogenesis.action}
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent>
              <span className="inline-flex rounded-xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-400">
                <Scissors className="size-5" aria-hidden />
              </span>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                {tn.cards.pruning.title}
              </p>
              <p className="m-0 text-[13px] text-muted-foreground">{tn.cards.pruning.body}</p>
              <div className="mt-3 rounded-lg bg-sky-500/10 p-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
                {tn.cards.pruning.action}
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardContent>
              <div className="flex items-start gap-4">
                <span className="inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
                  <HeartPulse className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="m-0 text-[15px] font-semibold text-foreground">
                    {tn.cards.coregulation.title}
                  </p>
                  <p className="mt-1 mb-0 text-[13px] text-muted-foreground">
                    {tn.cards.coregulation.body}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
