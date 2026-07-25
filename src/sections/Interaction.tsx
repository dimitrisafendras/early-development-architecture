import { Repeat, MessageCircle, BookOpen, Smile, Hand, MonitorOff, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  interactionStats,
  awakeWindows,
  awakeWindowUppers,
  interactionHow,
  type ScheduleTone,
} from '../data'
import type { StatusTone } from '../data'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { useT } from '../i18n'

const windowTone: Record<ScheduleTone, string> = {
  amber: 'text-amber-700 dark:text-amber-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
  sky: 'text-sky-700 dark:text-sky-400',
  cyan: 'text-cyan-700 dark:text-cyan-400',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-400',
  indigo: 'text-indigo-700 dark:text-indigo-400',
}

const howTone: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

const howIcons = [Repeat, MessageCircle, BookOpen, Smile, Hand, MonitorOff]

export function Interaction() {
  const t = useT()
  const ti = t.interaction
  const baby = useBabyAge()
  const activeWindow = baby ? bandIndex(baby.months, awakeWindowUppers) : -1
  return (
    <section id="interaction">
      {/* How much — daily dose */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ti.howMuchTitle}
      </h3>
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {interactionStats.map((stat, i) => (
          <Card key={ti.stats[i].label} className="h-full">
            <CardContent className="py-5">
              <div className="font-heading text-3xl font-semibold" style={{ color: stat.color }}>
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

      {/* When — awake windows */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          {ti.whenTitle}
        </h3>
        <AgeBadge />
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ti.whenNote}</p>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {awakeWindows.map((w, i) => (
          <Card
            key={ti.windows[i].age}
            className={
              i === activeWindow
                ? 'h-full ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'h-full'
            }
          >
            <CardContent>
              <div className={`text-sm font-bold ${windowTone[w.tone]}`}>{ti.windows[i].age}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock className="size-3.5" /> {ti.windows[i].window}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground">{ti.windows[i].play}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How — make the minutes count */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ti.howTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interactionHow.map((h, i) => {
          const Icon = howIcons[i]
          return (
            <Card key={ti.how[i].title} className="h-full">
              <CardContent>
                <span className={`inline-flex rounded-xl p-2.5 ${howTone[h.tone]}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
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
