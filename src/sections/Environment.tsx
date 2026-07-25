import { Ban, EyeOff, Users, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { efficiencyScores, type StatusTone } from '../data'
import { useT } from '../i18n'

/** Icon + status semantic per reason; text comes from i18n by index. */
const reasons: { Icon: LucideIcon; tone: StatusTone }[] = [
  { Icon: Ban, tone: 'danger' },
  { Icon: EyeOff, tone: 'warning' },
  { Icon: Users, tone: 'success' },
]

export function Environment() {
  const t = useT()
  const te = t.environment
  return (
    <section id="environment">
      <Card>
        <CardContent>
          {/* A list beside its meter panel — the one 2-column split, and like the
              other chart/list splits it stacks below `lg`. */}
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-[15px] font-semibold text-foreground">{te.reasonsTitle}</p>
              {reasons.map(({ Icon, tone }, i) => (
                <div
                  key={te.reasons[i].strong}
                  className={cn(
                    'mb-3 flex items-start gap-3 rounded-xl p-4',
                    statusTone[tone].soft,
                  )}
                >
                  <Icon className={cn('mt-0.5 size-5 shrink-0', statusTone[tone].icon)} aria-hidden />
                  <div className="min-w-0 text-[13px] leading-relaxed text-foreground/80">
                    <strong className="text-foreground">{te.reasons[i].strong}</strong>{' '}
                    {te.reasons[i].text}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-muted p-4">
              <p className="mb-4 text-center text-[15px] font-semibold text-foreground">
                {te.scoreTitle}
              </p>
              {efficiencyScores.map((score, i) => {
                const s = statusTone[score.tone]
                return (
                  <div key={score.label} className="mb-4">
                    {/* Label and value share one line; Greek labels are long, so
                        the pair wraps rather than colliding. */}
                    <div
                      className={cn(
                        'mb-1 flex flex-wrap justify-between gap-x-2 text-xs font-semibold',
                        s.text,
                      )}
                    >
                      <Eyebrow as="span" size="sm" tone="inherit" className="min-w-0">
                        {te.scores[i].label}
                      </Eyebrow>
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
                        className={cn('h-full rounded-full transition-all', s.bar)}
                        style={{ width: `${score.value}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="m-0 mt-4 text-center text-xs italic text-muted-foreground">
                {te.footnote}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
