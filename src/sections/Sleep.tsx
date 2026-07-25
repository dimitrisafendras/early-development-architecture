import { MoonStar, Bed, DoorOpen, Ban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import { sleepStats, safeSleepRules } from '../data'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { useT } from '../i18n'

const ruleIcons = [MoonStar, Bed, DoorOpen, Ban]

export function Sleep() {
  const t = useT()
  const ts = t.sleep
  const baby = useBabyAge()
  // Tile 0 = newborn (0–3 mo), tile 1 = infant (4–12 mo); highlight the one that fits.
  const activeStat = baby ? (baby.months < 4 ? 0 : baby.months < 12 ? 1 : -1) : -1
  return (
    <section id="sleep">
      {/* The age badge rides the first content row — the page header above is the
          frame's, so this is where the "which baby / which band" cue belongs. */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Eyebrow as="h3" size="md">
          {ts.statsTitle}
        </Eyebrow>
        <AgeBadge />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sleepStats.map((stat, i) => (
          <Card
            key={ts.stats[i].label}
            className={cn('h-full', i === activeStat && 'ring-2 ring-primary')}
          >
            <CardContent className="py-5">
              {/* The headline number takes the palette accent — the raw hex on
                  `sleepStats` cannot follow the light/dark or blue/red axis. */}
              <div className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
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

      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.safeTitle}
      </Eyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {safeSleepRules.map((rule, i) => {
          const Icon = ruleIcons[i]
          return (
            <Card key={ts.safe[i].title} className="h-full">
              <CardContent>
                <IconChip className={statusTone[rule.tone].chip}>
                  <Icon />
                </IconChip>
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
