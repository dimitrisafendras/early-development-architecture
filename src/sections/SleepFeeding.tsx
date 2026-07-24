import { MoonStar, Bed, DoorOpen, Ban, Utensils, CheckCircle2, MinusCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SectionHeader } from '../components/SectionHeader'
import { sleepStats, safeSleepRules, feedingRows, type StatusTone } from '../data'
import { useT } from '../i18n'

const ruleTone: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}
const ruleIcons = [MoonStar, Bed, DoorOpen, Ban]

export function SleepFeeding() {
  const t = useT()
  const ts = t.sleepFeeding
  return (
    <section id="sleep-feeding">
      <SectionHeader module={9} title={ts.title} description={ts.description} />

      {/* Sleep — how much */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.sleepTitle}
      </h3>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sleepStats.map((stat, i) => (
          <Card key={ts.sleepStats[i].label} className="h-full">
            <CardContent className="py-5">
              <div className="font-heading text-3xl font-semibold" style={{ color: stat.color }}>
                {stat.value}
                <span className="ml-1 text-sm font-medium text-muted-foreground">
                  {ts.sleepStats[i].unit}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {ts.sleepStats[i].label}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {ts.sleepStats[i].note}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safe sleep */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.safeSleepTitle}
      </h3>
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {safeSleepRules.map((rule, i) => {
          const Icon = ruleIcons[i]
          return (
            <Card key={ts.safeSleep[i].title} className="h-full">
              <CardContent>
                <span className={`inline-flex rounded-xl p-2.5 ${ruleTone[rule.tone]}`}>
                  <Icon className="size-5" aria-hidden />
                </span>
                <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">
                  {ts.safeSleep[i].title}
                </p>
                <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">
                  {ts.safeSleep[i].text}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feeding — how often & how much */}
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.feedingTitle}
      </h3>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{ts.feedingNote}</p>
      <Card className="mb-4">
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ts.feedHeaders.age}</TableHead>
                <TableHead>{ts.feedHeaders.frequency}</TableHead>
                <TableHead>{ts.feedHeaders.amount}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedingRows.map((_, i) => (
                <TableRow key={ts.feeding[i].age}>
                  <TableCell className="font-semibold text-foreground">{ts.feeding[i].age}</TableCell>
                  <TableCell className="text-muted-foreground">{ts.feeding[i].frequency}</TableCell>
                  <TableCell className="text-muted-foreground">{ts.feeding[i].amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Utensils className="size-3.5" /> {ts.feedMax}
          </p>
        </CardContent>
      </Card>

      {/* Cues */}
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {ts.cuesTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="mb-3 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> {ts.hungerLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              {ts.hungerCues.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-emerald-500">•</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="mb-3 flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
              <MinusCircle className="size-4" /> {ts.fullLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              {ts.fullCues.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-amber-500">•</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{ts.sourcesLabel}</p>
    </section>
  )
}
