import {
  Clock,
  Droplets,
  Bath,
  CalendarDays,
  ShieldAlert,
  Thermometer,
  Waves,
  Hand,
  MoonStar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import { statusTone } from '../lib/tone'
import { FactList } from '@/components/FactList'
import { useT } from '../i18n'

const practiceIcons = [Clock, Droplets, Bath, CalendarDays]
const safetyIcons = [ShieldAlert, Thermometer, Waves, Hand]

export function Bathing() {
  const t = useT()
  const tb = t.bathing
  return (
    <section id="bathing">
      {/* Key numbers */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tb.facts.map((f, i) => (
          <Card key={i} className="h-full">
            <CardContent className="py-5">
              <div className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
                {f.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{f.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to bathe */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {tb.howTitle}
      </Eyebrow>
      {/* Four steps of one practice, so one card and one list — four separate
          cards proposed four independent choices. */}
      <Card className="mb-10">
        <CardContent>
          <FactList
            facts={tb.practices.map((p, i) => ({
              Icon: practiceIcons[i],
              title: p.title,
              text: p.text,
            }))}
          />
        </CardContent>
      </Card>

      {/* Safety */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {tb.safetyTitle}
      </Eyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tb.safety.map((s, i) => {
          const Icon = safetyIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <IconChip className={statusTone.danger.chip}>
                  <Icon />
                </IconChip>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{s.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bath as a bedtime ritual */}
      <Card className="mt-6 bg-primary/5 ring-1 ring-primary/30">
        <CardContent className="flex items-start gap-4 py-5">
          <IconChip>
            <MoonStar />
          </IconChip>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground">{tb.bedtimeTitle}</p>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
              {tb.bedtimeText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capped like the intro paragraphs. At full width this ran to ~187
          characters a line — the longest measure in the app, on its smallest
          type. */}
      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{tb.sourcesLabel}</p>
    </section>
  )
}
