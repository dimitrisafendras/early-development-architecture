import { Ear, Music2, Volume1, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconChip } from '@/components/IconChip'
import { ParenteseChart } from '../components/charts'
import { useT } from '../i18n'

/** Icon per card; text comes from i18n by index. Three cards, one chip tint —
 *  each used to carry a different hue (fuchsia, amber, emerald) for three points
 *  that are not ranked, contrasted or otherwise distinguished by colour. */
const cardIcons: LucideIcon[] = [Music2, Volume1, Ear]

export function LanguageMusic() {
  const t = useT()
  const tl = t.languageMusic
  return (
    <section id="language-music">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-foreground">{tl.chartTitle}</p>
                <div className="text-xs text-muted-foreground">{tl.chartSub}</div>
              </div>
              <Badge variant="soft" className="shrink-0">
                {tl.badge}
              </Badge>
            </div>
            <ParenteseChart />
            {/* A rule, not a tinted box inside the card the chart already sits
                in — the note explains the chart above it, so it belongs to the
                same surface. */}
            <div className="mt-4 max-w-3xl border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
              <strong className="text-foreground">{tl.noteLabel}</strong> {tl.noteBefore}
              <em>{tl.noteEm}</em>
              {tl.noteAfter}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {cardIcons.map((Icon, i) => (
            <Card key={tl.cards[i].title}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <IconChip>
                    <Icon />
                  </IconChip>
                  <div className="min-w-0">
                    <p className="m-0 text-[15px] font-semibold text-foreground">
                      {tl.cards[i].title}
                    </p>
                    <p className="mt-1 mb-0 text-[13px] leading-relaxed text-muted-foreground">
                      {tl.cards[i].text}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
