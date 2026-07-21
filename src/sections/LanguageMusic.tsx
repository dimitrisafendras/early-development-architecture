import { Ear, Music2, Volume1, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '../components/SectionHeader'
import { ParenteseChart } from '../components/charts'
import { useT } from '../i18n'

/** Icon + tint per card; text comes from i18n by index. */
const cardStyles: { Icon: LucideIcon; iconClass: string }[] = [
  { Icon: Music2, iconClass: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300' },
  { Icon: Volume1, iconClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-300' },
  { Icon: Ear, iconClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' },
]

export function LanguageMusic() {
  const t = useT()
  const tl = t.languageMusic
  return (
    <section id="language-music">
      <SectionHeader module={3} title={tl.title} description={tl.description} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardContent>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-foreground">{tl.chartTitle}</p>
                <div className="text-xs text-muted-foreground">{tl.chartSub}</div>
              </div>
              <Badge className="shrink-0 border-transparent bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300">
                {tl.badge}
              </Badge>
            </div>
            <ParenteseChart />
            <div className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">{tl.noteLabel}</strong> {tl.noteBefore}
              <em>{tl.noteEm}</em>
              {tl.noteAfter}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {cardStyles.map(({ Icon, iconClass }, i) => (
            <Card key={tl.cards[i].title}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <span className={`inline-flex shrink-0 rounded-xl p-2.5 ${iconClass}`}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <div>
                    <p className="m-0 font-semibold text-foreground">{tl.cards[i].title}</p>
                    <p className="mt-1 mb-0 text-[13px] text-muted-foreground">{tl.cards[i].text}</p>
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
