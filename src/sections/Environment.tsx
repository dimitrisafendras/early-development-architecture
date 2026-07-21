import { Ban, EyeOff, Users, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { efficiencyScores, type StatusTone } from '../data'
import { useT } from '../i18n'

/** Icon + tint per reason; text comes from i18n by index. */
const reasonStyles: { Icon: LucideIcon; wrapClass: string; iconClass: string }[] = [
  { Icon: Ban, wrapClass: 'bg-rose-500/8 dark:bg-rose-500/10', iconClass: 'text-rose-600 dark:text-rose-400' },
  { Icon: EyeOff, wrapClass: 'bg-amber-500/8 dark:bg-amber-500/10', iconClass: 'text-amber-600 dark:text-amber-400' },
  { Icon: Users, wrapClass: 'bg-emerald-500/8 dark:bg-emerald-500/10', iconClass: 'text-emerald-600 dark:text-emerald-400' },
]

/** Fixed status semantics for the developmental-efficiency meters. */
const scoreStyles: Record<StatusTone, { label: string; bar: string }> = {
  // Score labels are text on the muted panel — light uses -700 to clear AA.
  success: { label: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
  warning: { label: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' },
  danger: { label: 'text-rose-700 dark:text-rose-400', bar: 'bg-rose-500' },
}

export function Environment() {
  const t = useT()
  const te = t.environment
  return (
    <section id="environment">
      <SectionHeader module={6} title={te.title} description={te.description} />
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div>
              <p className="mb-3 text-[15px] font-semibold text-foreground">{te.reasonsTitle}</p>
              {reasonStyles.map(({ Icon, wrapClass, iconClass }, i) => (
                <div
                  key={te.reasons[i].strong}
                  className={`mb-3 flex items-start gap-3 rounded-xl p-3 ${wrapClass}`}
                >
                  <Icon className={`mt-0.5 size-5 shrink-0 ${iconClass}`} aria-hidden />
                  <div className="text-[13px] text-foreground/80">
                    <strong className="text-foreground">{te.reasons[i].strong}</strong>{' '}
                    {te.reasons[i].text}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-muted p-6">
              <p className="mb-4 text-center font-semibold text-foreground">{te.scoreTitle}</p>
              {efficiencyScores.map((score, i) => {
                const s = scoreStyles[score.tone]
                return (
                  <div key={score.label} className="mb-4">
                    <div className={`mb-1 flex justify-between text-xs font-semibold ${s.label}`}>
                      <span>{te.scores[i].label}</span>
                      <span>{te.scores[i].text}</span>
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
                        className={`h-full rounded-full transition-all ${s.bar}`}
                        style={{ width: `${score.value}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="m-0 mt-4 text-center text-[11px] italic text-muted-foreground">
                {te.footnote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
