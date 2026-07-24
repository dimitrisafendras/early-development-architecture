import { MoonStar, Bed, DoorOpen, Ban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { sleepStats, safeSleepRules, type StatusTone } from '../data'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { cn } from '@/lib/utils'
import { useT } from '../i18n'

const ruleTone: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}
const ruleIcons = [MoonStar, Bed, DoorOpen, Ban]

export function Sleep() {
  const t = useT()
  const ts = t.sleep
  const baby = useBabyAge()
  // Tile 0 = newborn (0–3 mo), tile 1 = infant (4–12 mo); highlight the one that fits.
  const activeStat = baby ? (baby.months < 4 ? 0 : baby.months < 12 ? 1 : -1) : -1
  return (
    <section id="sleep">
      <SectionHeader module={9} title={ts.title} description={ts.description} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          {ts.statsTitle}
        </h3>
        <AgeBadge />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sleepStats.map((stat, i) => (
          <Card
            key={ts.stats[i].label}
            className={cn('h-full', i === activeStat && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}
          >
            <CardContent className="py-5">
              <div className="font-heading text-3xl font-semibold" style={{ color: stat.color }}>
                {stat.value}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {ts.stats[i].unit}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{ts.stats[i].label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ts.stats[i].note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.safeTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {safeSleepRules.map((rule, i) => {
          const Icon = ruleIcons[i]
          return (
            <Card key={ts.safe[i].title} className="h-full">
              <CardContent>
                <span className={`inline-flex rounded-xl p-2.5 ${ruleTone[rule.tone]}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{ts.safe[i].title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{ts.safe[i].text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{ts.sourcesLabel}</p>
    </section>
  )
}
