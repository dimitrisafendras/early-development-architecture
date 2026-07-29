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
  awakeWindows,
  awakeWindowUppers,
  interactionHow,
  interactionSoloRules,
  screenBands,
  screenUppers,
} from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { cn } from '@/lib/utils'
import { scheduleTone, statusTone } from '../lib/tone'
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

      {/* When — awake windows. No age badge: the frame's header band reads the
          child's name and age on every route. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {ti.whenTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ti.whenNote}</p>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {awakeWindows.map((w, i) => (
          <Card
            key={ti.windows[i].age}
            className={cn('h-full', i === activeWindow && 'ring-2 ring-primary')}
          >
            <CardContent>
              <Eyebrow as="h4" size="sm" tone="inherit" className={scheduleTone[w.tone].text}>
                {ti.windows[i].age}
              </Eyebrow>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" /> {ti.windows[i].window}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground">{ti.windows[i].play}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How much of the window is *yours* — and how much is theirs. The awake
          windows above say how long the baby is up; this says how that time
          divides, which is the question a caregiver actually asks next. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {ti.togetherTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {ti.togetherNote}
      </p>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {awakeWindows.map((w, i) => (
          <Card
            key={`solo-${ti.windows[i].age}`}
            className={cn('h-full', i === activeWindow && 'ring-2 ring-primary')}
          >
            <CardContent>
              <Eyebrow as="h4" size="sm" tone="inherit" className={scheduleTone[w.tone].text}>
                {ti.windows[i].age}
              </Eyebrow>
              {/* A definition list, not two paragraphs: each row is a labelled
                  quantity, and the labels repeat down the four cards. */}
              <dl className="mt-3 space-y-3">
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
              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {ti.solo[i].note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {interactionSoloRules.map((rule, i) => {
          const Icon = soloRuleIcons[i]
          return (
            <Card key={ti.soloRules[i].title} className="h-full">
              <CardContent>
                <IconChip className={statusTone[rule.tone].chip}>
                  <Icon />
                </IconChip>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                  {ti.soloRules[i].title}
                </p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                  {ti.soloRules[i].text}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interactionHow.map((h, i) => {
          const Icon = howIcons[i]
          return (
            <Card key={ti.how[i].title} className="h-full">
              <CardContent>
                <IconChip className={statusTone[h.tone].chip}>
                  <Icon />
                </IconChip>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{ti.how[i].title}</p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{ti.how[i].text}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{ti.sourcesLabel}</p>
    </section>
  )
}
