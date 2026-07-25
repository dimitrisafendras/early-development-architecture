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
import { SectionHeader } from '../components/SectionHeader'
import { useT } from '../i18n'

const practiceIcons = [Clock, Droplets, Bath, CalendarDays]
const safetyIcons = [ShieldAlert, Thermometer, Waves, Hand]

export function Bathing() {
  const t = useT()
  const tb = t.bathing
  return (
    <section id="bathing">
      <SectionHeader title={tb.title} description={tb.description} />

      {/* Key numbers */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tb.facts.map((f, i) => (
          <Card key={i} className="h-full border-border/70 bg-gradient-to-br from-card to-muted/30">
            <CardContent className="py-5">
              <div className="font-heading text-3xl font-semibold text-primary">{f.value}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{f.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to bathe */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {tb.howTitle}
      </h3>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tb.practices.map((p, i) => {
          const Icon = practiceIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <span className="inline-flex rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 p-2.5 text-primary ring-1 ring-inset ring-primary/20">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{p.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{p.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Safety */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {tb.safetyTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tb.safety.map((s, i) => {
          const Icon = safetyIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <span className="inline-flex rounded-xl bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-400">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{s.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{s.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Bath as a bedtime ritual */}
      <Card className="mt-6 overflow-hidden border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-4 py-5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-primary ring-1 ring-inset ring-primary/20">
            <MoonStar className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground">{tb.bedtimeTitle}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{tb.bedtimeText}</p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">{tb.sourcesLabel}</p>
    </section>
  )
}
