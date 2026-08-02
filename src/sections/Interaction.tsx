import {
  Repeat,
  MessageCircle,
  BookOpen,
  Smile,
  Hand,
  MonitorOff,
  Clock,
  Hourglass,
  Users,
  Eye,
  HeartHandshake,
  Moon,
  TriangleAlert,
  Tv,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import {
  interactionStats,
  awakeWindowUppers,
  interactionHow,
  interactionSoloRules,
  screenBands,
  screenUppers,
} from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { FactList } from '@/components/FactList'
import { useT } from '../i18n'

const howIcons = [Repeat, MessageCircle, BookOpen, Smile, Hand, MonitorOff]
const soloRuleIcons = [Eye, HeartHandshake, Moon, TriangleAlert]

export function Interaction() {
  const t = useT()
  const ti = t.interaction
  const baby = useBabyAge()
  const activeWindow = baby ? bandIndex(baby.months, awakeWindowUppers) : -1
  const activeScreen = baby ? bandIndex(baby.months, screenUppers) : -1
  return (
    <section id="interaction">
      {/* How much — daily dose */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ti.howMuchTitle}
      </Eyebrow>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {interactionStats.map((stat, i) => (
          <Card key={ti.stats[i].label} className="h-full">
            <CardContent className="py-5">
              {/* The headline number takes the palette accent — the raw hex on
                  `interactionStats` cannot follow the light/dark or blue/red axis. */}
              <div className="font-heading text-2xl font-semibold text-primary sm:text-3xl">
                {stat.value}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {ti.stats[i].unit}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">{ti.stats[i].label}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{ti.stats[i].note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* **One card per age band, not two grids of the same seven bands.** The
          awake window and how that window divides were separate sections, so the
          page drew the identical seven bands twice — fourteen cards for seven
          objects, and the reader had to hold the age in their head while walking
          from one grid to the other. One band, one card: how long they are up,
          what the time is for, and how much of it is yours. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {ti.whenTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ti.whenNote}</p>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {ti.togetherNote}
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ti.windows.map((w, i) => (
          <Card key={w.age} className={cn('h-full', i === activeWindow && 'ring-2 ring-primary')}>
            <CardContent>
              {/* Muted, not a per-band hue: `scheduleTone` gave each age band
                  its own saturated colour, which encoded nothing a reader could
                  decode and drowned out the one colour on this page that *is*
                  meaningful — the ring on the band this child is in. */}
              <Eyebrow as="h4" size="sm" tone="muted">
                {w.age}
              </Eyebrow>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" /> {w.window}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground">{w.play}</p>
              {/* A definition list, not two paragraphs: each row is a labelled
                  quantity, and the labels repeat down the cards. */}
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Users className="size-3.5" /> {ti.togetherLabel}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                    {ti.solo[i].together}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Eye className="size-3.5" /> {ti.aloneLabel}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-semibold text-foreground">
                    {ti.solo[i].alone}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {ti.solo[i].note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mb-10">
        <CardContent>
          <FactList
            facts={interactionSoloRules.map((rule, i) => ({
              Icon: soloRuleIcons[i],
              title: ti.soloRules[i].title,
              text: ti.soloRules[i].text,
              iconClassName: rule.tone === 'success' ? undefined : statusTone[rule.tone].icon,
            }))}
          />
        </CardContent>
      </Card>

      {/* Screens — the one number here that is a ceiling, not a target. It sits
          with the interaction dose because that is what a screen displaces. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {ti.screenTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ti.screenNote}</p>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {screenBands.map((band, i) => (
          <Card
            key={ti.screens[i].age}
            className={cn('h-full', i === activeScreen && 'ring-2 ring-primary')}
          >
            <CardContent>
              <IconChip className={statusTone[band.tone].chip}>
                <Tv />
              </IconChip>
              <p className="mt-3 text-[15px] font-semibold text-foreground">{ti.screens[i].age}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Hourglass className="size-3.5" aria-hidden /> {ti.screens[i].limit}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {ti.screens[i].text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How — make the minutes count */}
      <Eyebrow as="h3" size="md" className="mb-4">
        {ti.howTitle}
      </Eyebrow>
      {/* Six methods in one card, not six cards. They are a list of ways to
          spend the same minutes — not six things to choose between — and six
          bordered surfaces each holding one sentence is what made this the
          longest page in the app. The one `warning` row keeps its tone, which is
          the only reason a row here is ever coloured. */}
      <Card>
        <CardContent>
          <FactList
            columns={3}
            facts={interactionHow.map((h, i) => ({
              Icon: howIcons[i],
              title: ti.how[i].title,
              text: ti.how[i].text,
              iconClassName: h.tone === 'success' ? undefined : statusTone[h.tone].icon,
            }))}
          />
        </CardContent>
      </Card>

      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{ti.sourcesLabel}</p>
    </section>
  )
}
