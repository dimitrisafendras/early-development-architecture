import { Utensils, CheckCircle2, MinusCircle } from 'lucide-react'
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
import { feedingRows, feedingUppers } from '../data'
import { AgeBadge, useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { cn } from '@/lib/utils'
import { useT } from '../i18n'

export function Feeding() {
  const t = useT()
  const tf = t.feeding
  const baby = useBabyAge()
  const activeRow = baby ? bandIndex(baby.months, feedingUppers) : -1
  return (
    <section id="feeding">
      <SectionHeader module={10} title={tf.title} description={tf.description} />

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          {tf.tableTitle}
        </h3>
        <AgeBadge />
      </div>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{tf.tableNote}</p>
      <Card className="mb-10">
        <CardContent>
          {/* Phones get one stacked block per age band. The three columns are
              all `whitespace-nowrap` text, so a real table here could only be
              read by scrolling it sideways inside the card — the least
              discoverable gesture on a touch screen. The table itself returns
              from `sm` up, where the row fits. */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {feedingRows.map((_, i) => (
              <li
                key={tf.rows[i].age}
                className={cn(
                  'rounded-xl border p-3',
                  i === activeRow ? 'border-primary/40 bg-primary/10' : 'border-border bg-muted/40',
                )}
              >
                <p className="font-semibold text-foreground">{tf.rows[i].age}</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
                  <dt className="text-muted-foreground">{tf.headers.frequency}</dt>
                  <dd className="m-0 text-foreground">{tf.rows[i].frequency}</dd>
                  <dt className="text-muted-foreground">{tf.headers.amount}</dt>
                  <dd className="m-0 text-foreground">{tf.rows[i].amount}</dd>
                </dl>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tf.headers.age}</TableHead>
                  <TableHead>{tf.headers.frequency}</TableHead>
                  <TableHead>{tf.headers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedingRows.map((_, i) => (
                  <TableRow key={tf.rows[i].age} className={cn(i === activeRow && 'bg-primary/10')}>
                    <TableCell className="font-semibold text-foreground">{tf.rows[i].age}</TableCell>
                    <TableCell className="text-muted-foreground">{tf.rows[i].frequency}</TableCell>
                    <TableCell className="text-muted-foreground">{tf.rows[i].amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Utensils className="size-3.5 shrink-0" /> {tf.max}
          </p>
        </CardContent>
      </Card>

      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
        {tf.cuesTitle}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p className="mb-3 flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" /> {tf.hungerLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              {tf.hungerCues.map((c) => (
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
              <MinusCircle className="size-4" /> {tf.fullLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] text-muted-foreground">
              {tf.fullCues.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="text-amber-500">•</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{tf.sourcesLabel}</p>
    </section>
  )
}
