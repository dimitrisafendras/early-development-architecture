import { HeartPulse, Scissors, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { BrainGrowthChart } from '../components/charts'

export function Neurobiology() {
  return (
    <section id="neurobiology">
      <SectionHeader
        module={1}
        title="The Biological Imperative: Explosive Brain Growth"
        description="An infant's brain doubles in size during the first year, establishing the neural architecture for a lifetime of cognitive, emotional, and social capacity."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardContent>
            <p className="text-[15px] font-semibold text-foreground">
              Brain Mass % relative to Adult Size
            </p>
            <div className="mt-4">
              <BrainGrowthChart />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xs text-muted-foreground">Newborn</div>
                <div className="font-bold text-foreground">25%</div>
              </div>
              <div className="rounded-lg bg-accent p-2">
                <div className="text-xs text-accent-foreground/80">1 Year</div>
                <div className="font-bold text-accent-foreground">70%</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-xs text-muted-foreground">Adult</div>
                <div className="font-bold text-foreground">100%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          <Card className="h-full">
            <CardContent>
              <span className="inline-flex rounded-xl bg-amber-100 p-2.5 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Zap className="size-5" aria-hidden />
              </span>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                Synaptogenesis Surge
              </p>
              <p className="m-0 text-[13px] text-muted-foreground">
                Neurons form over 1 million new synaptic connections every single second. Sensory
                inputs (eye contact, gentle touch, rhythmic voice) determine which synapses are
                preserved.
              </p>
              <div className="mt-3 rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                ⚡ Action: High-quality engagement reinforces synapses.
              </div>
            </CardContent>
          </Card>

          <Card className="h-full">
            <CardContent>
              <span className="inline-flex rounded-xl bg-sky-100 p-2.5 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <Scissors className="size-5" aria-hidden />
              </span>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                Pruning Mechanism
              </p>
              <p className="m-0 text-[13px] text-muted-foreground">
                Unused neural connections are systematically pruned away. Consistent interaction
                "lights up" specific pathways, converting temporary brain activity into permanent
                structure.
              </p>
              <div className="mt-3 rounded-lg bg-sky-50 p-2 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                💡 "Neurons that fire together, wire together."
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2">
            <CardContent>
              <div className="flex items-start gap-4">
                <span className="inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                  <HeartPulse className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="m-0 text-[15px] font-semibold text-foreground">
                    Coregulation &amp; Stress System Calibration
                  </p>
                  <p className="mt-1 mb-0 text-[13px] text-muted-foreground">
                    A newborn cannot regulate their own nervous system. Prompt, soothing responses
                    to distress buffer the infant's brain against high cortisol levels, setting up
                    healthy HPA-axis (stress response) baseline controls.
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
