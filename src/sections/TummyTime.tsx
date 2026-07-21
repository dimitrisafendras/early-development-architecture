import { TriangleAlert } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { SectionHeader } from '../components/SectionHeader'
import { TummyTimeChart } from '../components/charts'

export function TummyTime() {
  return (
    <section id="tummy-time">
      <SectionHeader
        module={4}
        title="Physical Optimization: Daily Tummy Time"
        description="Supervised tummy time while awake is essential for neck, back, and shoulder core strength, motor milestone progression, and preventing flat spots (plagiocephaly)."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-foreground">
                  Tummy Time Progression Target
                </p>
                <div className="text-xs text-muted-foreground">
                  Cumulative minutes per day from birth to 4 months
                </div>
              </div>
              <Badge className="shrink-0 border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                Physical Milestone
              </Badge>
            </div>
            <TummyTimeChart />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          <Card>
            <CardContent>
              <p className="m-0 font-semibold text-foreground">🦴 Biomechanical Benefits</p>
              <ul className="mt-2 list-disc pl-[18px] text-[13px] text-muted-foreground">
                <li>Strengthens extensor muscles in neck, spine, and trunk.</li>
                <li>Prepares upper limbs for pushing up, rolling, and crawling.</li>
                <li>
                  Prevents <em>positional plagiocephaly</em> (flat spots on skull).
                </li>
                <li>Enhances spatial perception and visual-motor integration.</li>
              </ul>
            </CardContent>
          </Card>

          <Alert className="border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
            <TriangleAlert />
            <AlertTitle className="text-amber-800 dark:text-amber-200">
              Crucial Safety Directive
            </AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300/90">
              Tummy time is exclusively for when the infant is{' '}
              <strong>awake and 100% supervised by an adult</strong>. For sleep, infants must ALWAYS
              be placed strictly on their back on a flat, firm surface.
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent>
              <p className="m-0 font-semibold text-foreground">Pro-Tips for Content Tummy Time</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                  <strong className="text-foreground">Chest-to-Chest:</strong> Lay on your back with
                  baby on your chest for comfort.
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                  <strong className="text-foreground">High Contrast:</strong> Place black-and-white
                  cards at eye level.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
