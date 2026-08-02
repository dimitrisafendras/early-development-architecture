import { HeartPulse, Scissors, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { IconChip } from '@/components/IconChip'
import { BrainGrowthChart } from '../components/charts'
import { useT } from '../i18n'

export function Neurobiology() {
  const t = useT()
  const tn = t.neurobiology
  return (
    <section id="neurobiology">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <p className="text-[15px] font-semibold text-foreground">{tn.chartTitle}</p>
            <div className="mt-4">
              <BrainGrowthChart />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted p-4">
                <div className="text-xs text-muted-foreground">{tn.newborn}</div>
                <div className="font-bold text-foreground">25%</div>
              </div>
              <div className="rounded-xl bg-accent p-4">
                <div className="text-xs text-accent-foreground">{tn.oneYear}</div>
                <div className="font-bold text-accent-foreground">70%</div>
              </div>
              <div className="rounded-xl bg-muted p-4">
                <div className="text-xs text-muted-foreground">{tn.adult}</div>
                <div className="font-bold text-foreground">100%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5">
          <Card className="h-full">
            <CardContent>
              <IconChip>
                <Zap />
              </IconChip>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                {tn.cards.synaptogenesis.title}
              </p>
              <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                {tn.cards.synaptogenesis.body}
              </p>
              {/* A rule and a line, not a tinted panel inside the card. The
                  tint was the card's hue and nothing more, so once the hue went
                  it was a second surface drawing a second boundary to say
                  "this is the takeaway" — which the rule and the weight say. */}
              <p className="mt-4 border-t border-border pt-3 text-xs font-semibold text-foreground">
                {tn.cards.synaptogenesis.action}
              </p>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent>
              <IconChip>
                <Scissors />
              </IconChip>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                {tn.cards.pruning.title}
              </p>
              <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                {tn.cards.pruning.body}
              </p>
              <p className="mt-4 border-t border-border pt-3 text-xs font-semibold text-foreground">
                {tn.cards.pruning.action}
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardContent className="py-5">
              <div className="flex items-start gap-4">
                <IconChip>
                  <HeartPulse />
                </IconChip>
                <div className="min-w-0">
                  <p className="m-0 text-[15px] font-semibold text-foreground">
                    {tn.cards.coregulation.title}
                  </p>
                  <p className="mt-1 mb-0 text-[13px] leading-relaxed text-muted-foreground">
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
