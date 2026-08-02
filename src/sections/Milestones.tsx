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
import { SegmentedGroup } from '@/components/ui/segmented-group'
import { statusTone } from '../lib/tone'
import { milestoneUppers, milestoneDomainOrder } from '../data'
import { useBabyAge } from '../components/AgeBadge'
import { bandIndex } from '../lib/schedule'
import { FactList } from '@/components/FactList'
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

  return (
    <section id="milestones">
      {/* No age badge beside the pills: the frame's header band already reads the
          child's name and age on every route, so a second copy here was the same
          fact twice, 40px apart. */}
      <SegmentedGroup
        className="mb-6"
        ariaLabel={tm.bandLabel}
        size="sm"
        value={String(band)}
        onValueChange={(v) => setBand(Number(v))}
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
                  {/* The chip's default tint. It used to take the checkpoint's
                      own `scheduleTone` hue, so all four domain cards changed
                      colour together as you stepped along the age axis — six
                      hues signalling nothing except which pill was pressed,
                      which the pressed pill already says. */}
                  <IconChip>
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
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* A rule and a line, not a tinted panel: the tint made a caveat look
          like a fifth domain card. */}
      <p className="mt-6 max-w-3xl border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
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
      {/* Four actions under one alert, so one card and one list. As four cards
          they read as four separate warnings; they are four steps of the same
          one, which the alert above already states. */}
      <Card className="mt-4">
        <CardContent>
          <FactList
            facts={tm.actEarly.map((row, i) => ({
              // One glyph per row, not four identical triangles — each of these
              // is a different action (ask, ring, request, trust yourself).
              Icon: actEarlyIcons[i],
              title: row.title,
              text: row.text,
              // The escalation row (a lost skill) is the one danger tone on the
              // page; the rest are ordinary guidance and take the default.
              iconClassName: i === 1 ? statusTone.danger.icon : undefined,
            }))}
          />
        </CardContent>
      </Card>

      <p className="mt-6 max-w-3xl text-xs text-muted-foreground">{tm.sourcesLabel}</p>
    </section>
  )
}
