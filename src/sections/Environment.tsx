import { Ban, EyeOff, Users, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { efficiencyScores } from '../data'

interface Reason {
  Icon: LucideIcon
  wrapClass: string
  iconClass: string
  strong: string
  text: string
}

const reasons: Reason[] = [
  {
    Icon: Ban,
    wrapClass: 'bg-red-50 dark:bg-red-500/10',
    iconClass: 'text-red-600 dark:text-red-400',
    strong: 'Lack of 3D Contingency:',
    text: "Screen characters cannot respond to the infant's 1-4 second serve. The feedback loop breaks, causing frustration or passive brain states.",
  },
  {
    Icon: EyeOff,
    wrapClass: 'bg-amber-50 dark:bg-amber-500/10',
    iconClass: 'text-amber-600 dark:text-amber-400',
    strong: 'Background TV Overhead:',
    text: 'Constant background noise reduces caregiver word count by 500–1000 words per hour and fragments infant sustained attention.',
  },
  {
    Icon: Users,
    wrapClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    strong: 'Live Human Primacy:',
    text: 'Babies learn language exclusively from live human social gaze and joint attention in the first 18–24 months.',
  },
]

export function Environment() {
  return (
    <section id="environment">
      <SectionHeader
        module={6}
        title="Environmental Architecture: Screen Deficit vs. Live Interaction"
        description="Infant brains cannot transfer 2D screen stimuli into real-world comprehension—a phenomenon known in developmental psychology as the Video Deficit Effect."
      />
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[15px] font-semibold text-foreground">
                Why Screens Fail Newborn Neural Wiring
              </p>
              {reasons.map(({ Icon, wrapClass, iconClass, strong, text }) => (
                <div
                  key={strong}
                  className={`mb-3 flex items-start gap-3 rounded-xl p-3 ${wrapClass}`}
                >
                  <Icon className={`mt-0.5 size-5 shrink-0 ${iconClass}`} aria-hidden />
                  <div className="text-[13px] text-foreground/80">
                    <strong className="text-foreground">{strong}</strong> {text}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-muted p-6">
              <p className="mb-4 text-center font-semibold text-foreground">
                Developmental Efficiency Score
              </p>
              {efficiencyScores.map((score) => (
                <div key={score.label} className="mb-4">
                  <div
                    className="mb-1 flex justify-between text-xs font-semibold"
                    style={{ color: score.color }}
                  >
                    <span>{score.label}</span>
                    <span>{score.text}</span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-border"
                    role="progressbar"
                    aria-valuenow={score.value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={score.label}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${score.value}%`, background: score.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="m-0 mt-4 text-center text-[11px] italic text-muted-foreground">
                * Based on EEG theta/beta power ratios and eye-tracking habituation studies in infant
                psychology literature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
