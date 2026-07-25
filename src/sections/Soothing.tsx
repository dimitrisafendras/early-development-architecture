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
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import { useT } from '../i18n'

const sIcons = [Baby, MoveHorizontal, Volume2, Activity, CircleDot]
const moreIcons = [Footprints, Heart, Ear]

export function Soothing() {
  const t = useT()
  const ts = t.soothing
  return (
    <section id="soothing">
      {/* Key numbers */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ts.facts.map((f, i) => (
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

      {/* The 5 S's */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.howTitle}
      </Eyebrow>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {ts.practices.map((p, i) => {
          const Icon = sIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <IconChip>
                  <Icon />
                </IconChip>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{p.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{p.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* More that soothes */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.moreTitle}
      </Eyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ts.more.map((m, i) => {
          const Icon = moreIcons[i]
          return (
            <Card key={i} className="h-full">
              <CardContent>
                <IconChip>
                  <Icon />
                </IconChip>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{m.title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{m.text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Coping / safety callout — a warning state, so surface, edge and chip all
          come from `--warning`. The chip used to take `statusTone.warning`
          (Tailwind amber) while the card was `amber-500/5`, which put two
          different ambers on one surface; both are the token now.

          Card body text on `bg-warning/5` is 4.94:1 light / 6.35:1 dark, and the
          chip glyph on the stacked tint is 4.58:1 / 7.10:1 — both AA even though
          the glyph is decorative and only owes 3:1. `ring-warning/20` is passed
          explicitly: a caller `bg-*` makes `cn` drop IconChip's gradient, but
          its `ring-primary/20` is a separate key and would otherwise survive,
          leaving a palette-tinted edge on a warning chip. */}
      <Card className="mt-6 bg-warning/5 ring-1 ring-warning/40">
        <CardContent className="flex items-start gap-4 py-5">
          <IconChip className="bg-warning/10 text-warning ring-warning/20">
            <LifeBuoy />
          </IconChip>
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
