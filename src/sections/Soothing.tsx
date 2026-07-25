import {
  Baby,
  MoveHorizontal,
  Volume2,
  Activity,
  CircleDot,
  Footprints,
  Heart,
  Ear,
  LifeBuoy,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '../components/SectionHeader'
import { useT } from '../i18n'

const sIcons = [Baby, MoveHorizontal, Volume2, Activity, CircleDot]
const moreIcons = [Footprints, Heart, Ear]

export function Soothing() {
  const t = useT()
  const ts = t.soothing
  return (
    <section id="soothing">
      <SectionHeader title={ts.title} description={ts.description} />

      {/* Key numbers */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ts.facts.map((f, i) => (
          <Card key={i} className="h-full border-border/70 bg-gradient-to-br from-card to-muted/30">
            <CardContent className="py-5">
              <div className="font-heading text-3xl font-semibold text-primary">{f.value}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{f.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The 5 S's */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.howTitle}
      </h3>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ts.practices.map((p, i) => {
          const Icon = sIcons[i]
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

      {/* More that soothes */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.moreTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ts.more.map((m, i) => {
          const Icon = moreIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <span className="inline-flex rounded-xl bg-gradient-to-br from-primary/25 to-primary/5 p-2.5 text-primary ring-1 ring-inset ring-primary/20">
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{m.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{m.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coping / safety callout */}
      <Card className="mt-6 overflow-hidden border-amber-500/40 bg-amber-500/5">
        <CardContent className="flex items-start gap-4 py-5">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <LifeBuoy className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-foreground">{ts.copingTitle}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{ts.copingText}</p>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">{ts.sourcesLabel}</p>
    </section>
  )
}
