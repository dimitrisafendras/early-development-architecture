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
import { FactList } from '@/components/FactList'
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
      {/* The five S's are five steps of one technique, so they read as one
          list. Five cards each carrying a 40px gradient chip made the chips the
          page's dominant texture — at one per card in a uniform grid a chip
          stops being a signpost. */}
      <Card className="mb-10">
        <CardContent>
          <FactList
            columns={3}
            facts={ts.practices.map((p, i) => ({ Icon: sIcons[i], title: p.title, text: p.text }))}
          />
        </CardContent>
      </Card>

      {/* More that soothes */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ts.moreTitle}
      </Eyebrow>
      {/* One card holding a list, not three cards holding one line each: these
          are further things that soothe, not three alternatives to weigh up. */}
      <Card>
        <CardContent>
          <FactList
            columns={3}
            facts={ts.more.map((m, i) => ({ Icon: moreIcons[i], title: m.title, text: m.text }))}
          />
        </CardContent>
      </Card>

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
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
              {ts.copingText}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capped like the intro paragraphs. At full width this ran to ~187
          characters a line — the longest measure in the app, on its smallest
          type. */}
      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{ts.sourcesLabel}</p>
    </section>
  )
}
