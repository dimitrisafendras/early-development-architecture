import { MoonStar, Bed, DoorOpen, Ban, BedDouble, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import { sleepStats, safeSleepRules, napBands, napUppers } from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { cn } from '@/lib/utils'
import { statusTone, scheduleTone } from '../lib/tone'
import { bandIndex } from '../lib/schedule'
import { useT } from '../i18n'

const ruleIcons = [MoonStar, Bed, DoorOpen, Ban, BedDouble]

export function Sleep() {
  const t = useT()
  const ts = t.sleep
  const baby = useBabyAge()
  // Tiles 0–3 are the four sleep-total bands (0–3 mo, 4–12 mo, 1–2 y, 3 y); tile
  // 4 is the safe-sleep boundary and is never "current".
  const activeStat = baby
    ? baby.months < 4
      ? 0
      : baby.months < 12
        ? 1
        : baby.months < 24
          ? 2
          : 3
    : -1
  const activeNap = baby ? bandIndex(baby.months, napUppers) : -1
  return (
    <section id="sleep">
      {/* No age badge here any more: the frame's header band reads the child's
          name and age on every route, so this was the same fact twice. */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.statsTitle}
      </Eyebrow>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-5">
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

      {/* How the naps consolidate and drop — the question that replaces "how much
          sleep" once the totals stop moving much. Same age-banded card idiom as
          the awake windows on the interaction page. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {ts.napsTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ts.napsNote}</p>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {napBands.map((band, i) => (
          <Card
            key={ts.naps[i].age}
            className={cn('h-full', i === activeNap && 'ring-2 ring-primary')}
          >
            <CardContent>
              <Eyebrow as="h4" size="sm" tone="inherit" className={scheduleTone[band.tone].text}>
                {ts.naps[i].age}
              </Eyebrow>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" /> {ts.napHeaders.naps}: {ts.naps[i].naps}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground">{ts.naps[i].shape}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.safeTitle}
      </Eyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
