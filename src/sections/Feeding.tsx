import { Utensils, CheckCircle2, MinusCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { feedingRows, feedingUppers } from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { cn } from '@/lib/utils'
import { statusTone } from '../lib/tone'
import { useT } from '../i18n'

export function Feeding() {
  const t = useT()
  const tf = t.feeding
  const baby = useBabyAge()
  const activeRow = baby ? bandIndex(baby.months, feedingUppers) : -1
  return (
    <section id="feeding">
      {/* No age badge here any more: the frame's header band reads the child's
          name and age on every route, so this was the same fact twice. */}
      <Eyebrow as="h3" size="md" className="mb-2">
        {tf.tableTitle}
      </Eyebrow>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{tf.tableNote}</p>
      <Card className="mb-10">
        <CardContent>
          {/* Phones get one stacked block per age band. The three columns are
              all `whitespace-nowrap` text, so a real table here could only be
              read by scrolling it sideways inside the card — the least
              discoverable gesture on a touch screen. The table itself returns
              from `sm` up, where the row fits. */}
          <ul className="flex flex-col gap-4 sm:hidden">
            {feedingRows.map((_, i) => (
              <li key={tf.rows[i].age}>
                {/* A denser row than a full card, so it takes the DS's own
                    `size="sm"` spacing step rather than a hand-set padding. */}
                <Card
                  size="sm"
                  className={cn(i === activeRow && 'bg-primary/5 ring-1 ring-primary/30')}
                >
                  <CardContent>
                    <p className="text-[15px] font-semibold text-foreground">{tf.rows[i].age}</p>
                    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] leading-relaxed">
                      <dt className="min-w-0 text-muted-foreground">{tf.headers.frequency}</dt>
                      <dd className="m-0 text-foreground">{tf.rows[i].frequency}</dd>
                      <dt className="min-w-0 text-muted-foreground">{tf.headers.amount}</dt>
                      <dd className="m-0 text-foreground">{tf.rows[i].amount}</dd>
                    </dl>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tf.headers.age}</TableHead>
                  {/* The primitive sets `whitespace-nowrap` on every cell; the
                      Greek frequency/amount strings run ~30% longer than the
                      English and would push the table into a sideways scroll,
                      so those two columns wrap. Only the age band stays on one
                      line — it is the row's anchor. */}
                  <TableHead className="whitespace-normal">{tf.headers.frequency}</TableHead>
                  <TableHead className="whitespace-normal">{tf.headers.amount}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedingRows.map((_, i) => (
                  <TableRow key={tf.rows[i].age} className={cn(i === activeRow && 'bg-primary/10')}>
                    <TableCell className="font-semibold text-foreground">{tf.rows[i].age}</TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {tf.rows[i].frequency}
                    </TableCell>
                    <TableCell className="whitespace-normal text-muted-foreground">
                      {tf.rows[i].amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Utensils className="size-3.5 shrink-0" /> {tf.max}
          </p>
        </CardContent>
      </Card>

      <Eyebrow as="h3" size="md" className="mb-4">
        {tf.cuesTitle}
      </Eyebrow>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent>
            <p
              className={cn(
                'mb-3 flex items-center gap-2 text-[15px] font-semibold',
                statusTone.success.text,
              )}
            >
              <CheckCircle2 className="size-4" /> {tf.hungerLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {tf.hungerCues.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className={statusTone.success.icon}>•</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p
              className={cn(
                'mb-3 flex items-center gap-2 text-[15px] font-semibold',
                statusTone.warning.text,
              )}
            >
              <MinusCircle className="size-4" /> {tf.fullLabel}
            </p>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {tf.fullCues.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className={statusTone.warning.icon}>•</span> {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Capped like the intro paragraphs. At full width this ran to ~187
          characters a line — the longest measure in the app, on its smallest
          type. */}
      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{tf.sourcesLabel}</p>
    </section>
  )
}
