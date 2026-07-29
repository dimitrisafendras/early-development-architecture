import { useEffect, useState } from 'react'
import {
  Heart,
  MessageCircle,
  Lightbulb,
  Footprints,
  Check,
  TriangleAlert,
  Stethoscope,
  PhoneCall,
  LifeBuoy,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Eyebrow } from '@/components/Eyebrow'
import { IconChip } from '@/components/IconChip'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { cn } from '@/lib/utils'
import { statusTone, scheduleTone } from '../lib/tone'
import { milestoneBands, milestoneUppers, milestoneDomainOrder } from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { useT } from '../i18n'

/** Ask · ring today · request help · trust yourself. */
const actEarlyIcons = [Stethoscope, PhoneCall, LifeBuoy, Eye]

const domainIcons = {
  social: Heart,
  language: MessageCircle,
  cognitive: Lightbulb,
  motor: Footprints,
} as const

export function Milestones() {
  const t = useT()
  const tm = t.milestones
  const baby = useBabyAge()

  // Ten checkpoints is too much to read at once, and the only one that matters
  // today is the one this child is heading for — so the page opens on their
  // band (`bandIndex` returns the first band whose upper bound they are under,
  // i.e. the *next* checkpoint) and the pills move between the rest.
  const ownBand = baby ? bandIndex(baby.months, milestoneUppers) : 2
  const [band, setBand] = useState(ownBand)
  useEffect(() => setBand(ownBand), [ownBand])
  const current = tm.bands[band]
  const tone = scheduleTone[milestoneBands[band].tone]

  return (
    <section id="milestones">
      {/* No age badge beside the pills: the frame's header band already reads the
          child's name and age on every route, so a second copy here was the same
          fact twice, 40px apart. */}
      <ChoiceGroup
        className="mb-6"
        ariaLabel={tm.bandLabel}
        size="sm"
        value={String(band)}
        onChange={(v) => setBand(Number(v))}
        options={tm.ages.map((age, i) => ({ value: String(i), label: age }))}
      />

      {/* The four CDC domains for the selected checkpoint. Each list is a real
          checklist, so it renders as one — a tick per line, not prose. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {milestoneDomainOrder.map((domain) => {
          const Icon = domainIcons[domain]
          const items = current[domain]
          return (
            <Card key={domain} className="h-full">
              <CardContent>
                <div className="flex items-center gap-3">
                  <IconChip className={cn(tone.soft, tone.text)}>
                    <Icon />
                  </IconChip>
                  {/* The checkpoint is named once, by the pressed pill above —
                      repeating it on all four cards put the same four words in
                      one viewport four times. */}
                  <Eyebrow as="h3" size="md" tone="inherit" className="text-foreground">
                    {tm.domains[domain]}
                  </Eyebrow>
                </div>
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] leading-relaxed text-foreground">
                      <Check className={cn('mt-0.5 size-4 shrink-0', tone.icon)} aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <p className="mt-6 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        {tm.note}
      </p>

      {/* The whole point of the CDC programme is the second half of its name, so
          "act early" is an alert rather than another card of advice. */}
      {/* Same warning treatment as the tummy-time safety directive: the token
          pair, the card geometry, one `text-warning` on the root. */}
      <Alert className="mt-6 rounded-xl border-warning/25 bg-warning/10 p-4 text-warning">
        <TriangleAlert />
        <AlertTitle>{tm.actEarlyTitle}</AlertTitle>
        {/* Overrides the primitive's baked-in `text-muted-foreground`. */}
        <AlertDescription className="text-warning">{tm.actEarlyLead}</AlertDescription>
      </Alert>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tm.actEarly.map((row, i) => {
          // One icon per card, not four identical warning triangles — each of
          // these is a different action (ask, ring, request, trust yourself).
          const Icon = actEarlyIcons[i]
          return (
          <Card key={row.title} className="h-full">
            <CardContent>
              <IconChip
                className={cn(
                  // The escalation card (a lost skill) is the one danger tone on
                  // the page; the rest are ordinary guidance.
                  i === 1 ? statusTone.danger.chip : statusTone.success.chip,
                )}
              >
                <Icon />
              </IconChip>
              <p className="mt-3 mb-1 text-[15px] font-semibold text-foreground">{row.title}</p>
              <p className="m-0 text-[13px] leading-relaxed text-muted-foreground">{row.text}</p>
            </CardContent>
          </Card>
          )
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{tm.sourcesLabel}</p>
    </section>
  )
}
