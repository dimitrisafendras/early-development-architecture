import { useState } from 'react'
import { Bell, Check, Info, TriangleAlert, Settings, Star } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/ui/number-input'
import { Calendar } from '@/components/ui/calendar'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker, TimeColumns } from '@/components/ui/time-picker'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { ChoiceGroup } from '@/components/ChoiceGroup'
import { LiveBadge, LiveDot } from '@/components/ui/live-badge'
import { todayKey } from '@/lib/schedule'
import { nowDateTimeKey } from '@/lib/dates'

import { controlSizes, type ControlSize } from '@/components/ui/control-size'

import { GlassSurface, GlassButton, GlassToggleGroup } from '@dimitrisafendras/liquid-glass'
import { DocSection, DocBlock, Panel, DoDont } from './primitives'

/**
 * One row of every control at a single size, so the shared scale is provable by
 * eye: if any control in a row is a different height, the scale is broken.
 */
function ControlSizeRow({
  size,
  note,
  method,
  onMethod,
  value,
  onValue,
  date,
  onDate,
}: {
  size: ControlSize
  note: string
  method: 'bottle' | 'breast' | 'solid'
  onMethod: (v: 'bottle' | 'breast' | 'solid') => void
  value: number | null
  onValue: (v: number | null) => void
  date: string
  onDate: (v: string) => void
}) {
  return (
    <div className="border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <code className="text-sm font-semibold text-foreground">{size}</code>
        <span className="font-mono text-xs text-muted-foreground">{controlSizes[size].height}</span>
        <span className="text-xs text-muted-foreground">{note}</span>
      </div>
      {/* `items-center`, not `items-end`: any height mismatch shows up as a
          control floating off the row's centre line. */}
      <div className="flex flex-wrap items-center gap-3">
        <Button size={size}>Save</Button>
        <Button size={size} variant="outline">
          Cancel
        </Button>
        <Input size={size} className="w-28" defaultValue="Ada" aria-label={`Text field, ${size}`} />
        <NumberInput
          size={size}
          value={value}
          onValueChange={onValue}
          unit="ml"
          className="w-32 flex-none"
        />
        <DatePicker size={size} value={date} onValueChange={onDate} className="w-36" />
        <ChoiceGroup
          size={size}
          ariaLabel={`Method, ${size}`}
          value={method}
          onChange={onMethod}
          options={[
            { value: 'bottle', label: 'Bottle' },
            { value: 'breast', label: 'Breast' },
          ]}
        />
      </div>
    </div>
  )
}

/** Labelled specimen tile. */
function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Panel>
      <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </Panel>
  )
}

export function ComponentsSection() {
  const [checked, setChecked] = useState(true)
  const [segment, setSegment] = useState('week')
  const [agree, setAgree] = useState<boolean>(true)
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week')
  const [method, setMethod] = useState<'bottle' | 'breast' | 'solid'>('bottle')
  const [weight, setWeight] = useState<number | null>(6.4)
  const [feed, setFeed] = useState<number | null>(120)
  const [naps, setNaps] = useState<number | null>(3)
  const [measuredOn, setMeasuredOn] = useState(todayKey())
  const [birthDate, setBirthDate] = useState('2026-05-02')
  const [bedtime, setBedtime] = useState('19:30')
  const [fedAt, setFedAt] = useState(nowDateTimeKey())

  return (
    <DocSection
      id="components"
      eyebrow="Components"
      title="The gallery, live"
      intro="Every primitive re-tints with the active palette and adapts to light or dark. Content components stay opaque; only the glass family uses the material."
    >
      <DocBlock
        title="Control sizes - sm / md / lg"
        description={
          <>
            Every control takes the same three sizes, and at a given size they are exactly the same
            height: <code className="text-foreground">Button</code>,{' '}
            <code className="text-foreground">Input</code>,{' '}
            <code className="text-foreground">NumberInput</code>, the three pickers and{' '}
            <code className="text-foreground">ChoiceGroup</code>. One table drives all of them:{' '}
            <code className="text-foreground">ui/control-size.ts</code>. Phones get a real touch
            target; from <code className="text-foreground">sm</code> up everything collapses to the
            compact desktop scale. <code className="text-foreground">default</code> is the legacy
            alias of <code className="text-foreground">md</code>.
            <br />
            <strong className="font-semibold text-foreground">The invariant, stated once:</strong> at{' '}
            <code className="text-foreground">md</code> every one of them is{' '}
            <code className="text-foreground">h-11</code> on a phone and{' '}
            <code className="text-foreground">h-8</code> from <code className="text-foreground">sm</code>, on a
            10px radius. If one control in a row does not match that pair, it is the control that is wrong, not
            the row. Two things broke it and were fixed:{' '}
            <code className="text-foreground">ChoiceGroup</code> defaulted to{' '}
            <code className="text-foreground">lg</code>, and the number stepper built its own field chrome.
          </>
        }
      >
        <div className="grid gap-4">
          <Panel>
            <div className="flex flex-col gap-4">
              <ControlSizeRow
                size="sm"
                note="Dense rows: table cells, inline edit."
                method={method}
                onMethod={setMethod}
                value={naps}
                onValue={setNaps}
                date={measuredOn}
                onDate={setMeasuredOn}
              />
              <ControlSizeRow
                size="md"
                note="The default. 44px on a phone, the touch minimum."
                method={method}
                onMethod={setMethod}
                value={feed}
                onValue={setFeed}
                date={measuredOn}
                onDate={setMeasuredOn}
              />
              <ControlSizeRow
                size="lg"
                note="A page's primary action, hero forms."
                method={method}
                onMethod={setMethod}
                value={feed}
                onValue={setFeed}
                date={measuredOn}
                onDate={setMeasuredOn}
              />
            </div>
          </Panel>
          <DoDont
            dos={[
              'Give every control in a row the same size - one size per row, chosen for the row.',
              'Make a control stand out with its variant: fill, weight, colour.',
              'Use md unless the row is deliberately dense (sm) or is the page primary action (lg).',
            ]}
            donts={[
              'Mix sizes in one row - a lg button beside md fields is what makes a form look ragged.',
              'Reach for a taller size to signal importance. That is what variant is for.',
              'Patch a height with a className (h-10, sm:h-9). If a size is wrong, fix the scale.',
            ]}
          />
        </div>
      </DocBlock>

      <DocBlock title="shadcn/ui primitives">
        <div className="grid gap-4 lg:grid-cols-2">
          <Specimen label="Button — variants">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </Specimen>

          <Specimen label="Button — sizes & icons">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Settings">
              <Settings />
            </Button>
            <Button>
              <Bell /> With icon
            </Button>
          </Specimen>

          <Specimen label="Badge">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge>
              <Star /> Featured
            </Badge>
          </Specimen>

          <Panel>
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              ChoiceGroup — required single choice
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              A ToggleGroup in the <code className="text-foreground">pill</code> variant, where the pressed
              option takes the palette fill instead of <code className="text-foreground">bg-muted</code>. It
              swallows deselection, because none of the choices it covers has a valid empty state.
              Detached pills are the point: these options are <em>items</em>, so the set can grow
              and wrap, and no one of them is "next" to another. For a setting with fixed
              positions, use <code className="text-foreground">SegmentedGroup</code> below.
            </p>
            <div className="flex flex-col gap-3">
              <ChoiceGroup
                ariaLabel="Which baby"
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'bottle', label: 'Oriana' },
                  { value: 'breast', label: 'Elias' },
                  { value: 'solid', label: 'Nadia' },
                ]}
              />
              <ChoiceGroup
                ariaLabel="Size — default"
                size="default"
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'bottle', label: 'Oriana' },
                  { value: 'breast', label: 'Elias' },
                  { value: 'solid', label: 'Nadia' },
                ]}
              />
            </div>
          </Panel>

          <Specimen label="Switch & Checkbox">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={checked} onCheckedChange={setChecked} />
              Notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} />
              I agree
            </label>
          </Specimen>

          <Panel className="lg:col-span-2">
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Card</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Milestone tracker</CardTitle>
                  <CardDescription>0–3 months developmental window.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Content surfaces stay solid and opaque — glass is reserved for the floating control layer.
                </CardContent>
                <CardFooter className="gap-2">
                  <Button size="sm">Open</Button>
                  <Button size="sm" variant="outline">
                    Dismiss
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                  <CardDescription>Weekly check-ins completed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={72} />
                  <Progress value={38} />
                </CardContent>
              </Card>
            </div>
          </Panel>

          <Panel>
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Tabs</p>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="motor">Motor</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3 text-muted-foreground">
                A summary of the developmental stage.
              </TabsContent>
              <TabsContent value="motor" className="pt-3 text-muted-foreground">
                Gross and fine motor milestones.
              </TabsContent>
              <TabsContent value="social" className="pt-3 text-muted-foreground">
                Social and emotional signals.
              </TabsContent>
            </Tabs>
          </Panel>

          <Panel>
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">Accordion</p>
            <Accordion>
              <AccordionItem value="a">
                <AccordionTrigger>What is the control layer?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The floating plane of bars and controls above your content — the only place glass belongs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Why not glass on cards?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Content needs stable legibility. Translucency over dense text undermines contrast.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Panel>

          <Specimen label="Alert">
            <div className="w-full space-y-3">
              <Alert>
                <Info />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>This palette re-tints every primitive live.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertTitle>Contrast warning</AlertTitle>
                <AlertDescription>Clear glass over low-contrast media needs a scrim.</AlertDescription>
              </Alert>
            </div>
          </Specimen>

          <Specimen label="LiveBadge — the one thing that is true right now">
            <div className="flex flex-col items-start gap-3">
              <LiveBadge detail="4 mo">In use now</LiveBadge>
              <LiveBadge detail="12:04">Timer running</LiveBadge>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LiveDot className="text-primary" />
                Now · 4 mo
              </p>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                A plain <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Badge</code> saying "in use
                now" is the same shape as the badge saying "15 moments" — a label, when the
                fact is live. This is that pill with the state made visible: a pulsing dot, an
                inset ring, and an optional <code className="rounded bg-muted px-1.5 py-0.5 text-xs">detail</code>{' '}
                for the value the claim rests on. Use{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">LiveDot</code> alone where the
                same fact needs a quieter mention.
              </p>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                One per view. Its whole power is that nothing else on the screen moves — a
                second one and both stop meaning anything. The halo is dropped under{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">prefers-reduced-motion</code>,
                where a ping that cannot animate reads as a rendering fault rather than a signal.
              </p>
            </div>
          </Specimen>

          <Specimen label="SegmentedGroup — one control, several positions">
            <div className="flex flex-col gap-3">
              <SegmentedGroup
                ariaLabel="Demo range"
                value={segment}
                onValueChange={setSegment}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                  { value: 'all', label: 'All time' },
                ]}
              />
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Reach for this whenever one <em>setting</em> has a small, fixed set of
                mutually exclusive positions — a range, a view mode, an age band, the
                three ways a feed can happen. A row of detached pills says "four
                things"; a segmented track says "one thing, currently here", and the
                thumb travels to the choice you make. It is a{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">radiogroup</code>: one Tab stop, arrows move the selection.
              </p>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                Keep <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ChoiceGroup</code> for the other
                case: picking among <em>items</em> rather than settings — which baby, which
                starting point for a new program. Those sets are data, so they grow, shrink
                and have no natural order, and a track with a travelling thumb would be
                claiming a sequence that isn't there.
              </p>
            </div>
          </Specimen>

          <Specimen label="Separator, Tooltip & ScrollArea">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className={buttonVariants({ variant: 'outline' })}>Hover me</TooltipTrigger>
                <TooltipContent>Rendered on the foreground layer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-8" />
            <ScrollArea className="h-24 w-40 rounded-lg border border-border">
              <div className="space-y-1 p-3 text-sm">
                {['Reflexes', 'Grasping', 'Tracking', 'Cooing', 'Rolling', 'Sitting', 'Babbling'].map((x) => (
                  <div key={x}>{x}</div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex w-full items-center gap-3 pt-1 text-sm text-muted-foreground">
              Above / below <Separator className="flex-1" /> a horizontal rule
            </div>
          </Specimen>
        </div>
      </DocBlock>

      <DocBlock
        title="Data entry"
        description="Two controls the browser normally owns and refuses to theme — the number spinner and the date picker — rebuilt on our own tokens."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Number stepper
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              An <code className="text-foreground">Input</code> first: the same height, the same 10px radius,
              the same border and fill, and the value at Input's own type scale, set{' '}
              <code className="text-foreground">font-semibold tabular-nums</code> so nothing shifts while
              stepping. The optional <code className="text-foreground">unit</code> trails it as a{' '}
              <code className="text-foreground">0.78em</code> muted suffix.
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              There are <strong className="font-semibold text-foreground">no bordered elements inside the
              field</strong>. Each cap is a full-height hit area whose only visible chrome is an inset key: a{' '}
              <code className="text-foreground">p-1</code> inner span at{' '}
              <code className="text-foreground">rounded-sm</code> (6px, which is the field's 10px minus the 4px
              inset, so the two radii are concentric), carrying the same{' '}
              <code className="text-foreground">from-primary/20 to-primary/5</code> gradient and{' '}
              <code className="text-foreground">ring-1 ring-inset ring-primary/20</code> as{' '}
              <code className="text-foreground">StatTile</code>'s icon chip — so it re-tints with the palette
              for free. Hover deepens the gradient; press sinks the key (
              <code className="text-foreground">scale-[0.94]</code>, shadow removed), and that is disabled under{' '}
              <code className="text-foreground">motion-reduce</code>. The earlier version divided the caps from
              the value with hairlines, which read as leaking lines rather than as one control.
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Hold a cap to repeat; arrow keys step, with alt for the small step and shift for the large one. An
              optional <strong className="font-semibold text-foreground">value bar</strong> — a 2px track on the
              field's bottom inside edge, inset by one cap width per side so it spans only the value cell — turns
              the number into a readout at a glance. It renders only when a scale is given:{' '}
              <code className="text-foreground">indicatorMax</code> switches it on (falling back to{' '}
              <code className="text-foreground">max</code> when that is set), with an optional{' '}
              <code className="text-foreground">indicatorMin</code> that defaults to 0. It is a readout and never
              a clamp. In the app: weight <code className="text-foreground">indicatorMax=15</code>, height{' '}
              <code className="text-foreground">40–110</code>, head{' '}
              <code className="text-foreground">30–55</code>, feed amount{' '}
              <code className="text-foreground">indicatorMax=250</code>, breast minutes{' '}
              <code className="text-foreground">indicatorMax=45</code>.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ds-weight">Weight — with value bar</Label>
                <NumberInput
                  id="ds-weight"
                  value={weight}
                  onValueChange={setWeight}
                  floor={0}
                  step={0.1}
                  smallStep={0.01}
                  unit="kg"
                  indicatorMax={15}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-feed">Bottle — with value bar</Label>
                <NumberInput
                  id="ds-feed"
                  value={feed}
                  onValueChange={setFeed}
                  floor={0}
                  step={10}
                  largeStep={50}
                  unit="ml"
                  indicatorMax={250}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-naps">Naps — small</Label>
                <NumberInput id="ds-naps" size="sm" value={naps} onValueChange={setNaps} floor={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-naps-lg">Naps — large</Label>
                <NumberInput id="ds-naps-lg" size="lg" value={naps} onValueChange={setNaps} floor={0} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-empty">Empty state</Label>
                <NumberInput id="ds-empty" value={null} placeholder="—" unit="ml" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-num-disabled">Disabled</Label>
                <NumberInput id="ds-num-disabled" value={12} disabled unit="ml" />
              </div>
            </div>
          </Panel>

          <Panel>
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Date picker
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              A field-shaped trigger showing the date the way the locale writes it, opening the calendar in a
              popover. Values are plain <code className="text-foreground">YYYY-MM-DD</code> keys, so no entry
              ever shifts across a timezone.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-birth">Birth date</Label>
                <DatePicker
                  id="ds-birth"
                  value={birthDate}
                  onValueChange={setBirthDate}
                  max={todayKey()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ds-date-empty">Nothing picked</Label>
                <DatePicker id="ds-date-empty" max={todayKey()} />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="ds-date-disabled">Disabled</Label>
                <DatePicker id="ds-date-disabled" value={todayKey()} disabled />
              </div>
            </div>
          </Panel>

          <Panel className="lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Time picker
            </p>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Two scroll columns rather than the browser's own control. Minutes sit on a five-minute grid,
              because that is the precision anyone reports a feed or a nap in — a value off the grid still
              shows up in the list instead of being rounded away. Hour labels follow the locale's clock.
            </p>
            <div className="flex flex-wrap items-start gap-6">
              <div className="w-56 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-bedtime">Bedtime</Label>
                  <TimePicker id="ds-bedtime" value={bedtime} onValueChange={setBedtime} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-time-empty">Nothing picked</Label>
                  <TimePicker id="ds-time-empty" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-time-disabled">Disabled</Label>
                  <TimePicker id="ds-time-disabled" value="07:15" disabled />
                </div>
              </div>
              <div className="rounded-2xl border border-border p-3">
                <TimeColumns value={bedtime} onValueChange={setBedtime} />
              </div>
              <p className="min-w-56 flex-1 text-sm text-muted-foreground">
                The columns are usable on their own when a form has room for them. Each is a listbox with one
                tab stop; arrow keys move within a column, Home and End jump to its ends.
              </p>
            </div>
          </Panel>

          <Panel className="lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Calendar
            </p>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              The grid is always six weeks tall, so the panel never changes height between months. Today keeps
              a ring; the selection takes the palette's fill. Days past the maximum drop out. The footer
              carries the two picks that cover almost every entry.
            </p>
            <div className="flex flex-wrap items-start gap-6">
              <div className="rounded-2xl border border-border p-3">
                <Calendar value={measuredOn} onValueChange={setMeasuredOn} max={todayKey()} />
              </div>
              <div className="min-w-56 flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ds-selected">Selected value</Label>
                  <Input id="ds-selected" readOnly value={measuredOn} className="tabular-nums" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Arrow keys move by a day, up and down by a week, Home and End across the week, Page Up and
                  Page Down by a month.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Date and time
            </p>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              One field for a moment in time. The offsets lead because they answer what almost every entry
              asks — this happened now, or a little while ago — and settle it in a single press. The calendar
              and columns wait below for the entry written up hours later. Today's moments read as
              "Today, 19:30", since the date adds nothing there.
            </p>
            <div className="flex flex-wrap items-start gap-6">
              <div className="w-64 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-fed">Fed at</Label>
                  <DateTimePicker
                    id="ds-fed"
                    value={fedAt}
                    onValueChange={setFedAt}
                    maxDate={todayKey()}
                    labels={{ today: 'Today' }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ds-fed-empty">Nothing picked</Label>
                  <DateTimePicker id="ds-fed-empty" maxDate={todayKey()} />
                </div>
              </div>
              <div className="min-w-56 flex-1 space-y-1.5">
                <Label htmlFor="ds-fed-value">Stored value</Label>
                <Input id="ds-fed-value" readOnly value={fedAt} className="tabular-nums" />
                <p className="pt-2 text-sm text-muted-foreground">
                  The same <code className="text-foreground">YYYY-MM-DDTHH:MM</code> shape the native
                  datetime input produced, so a form swapping to this control needs no other change.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </DocBlock>

      <DocBlock title="Glass family" description="The material components — shown over an aurora so the lensing reads.">
        {/* `dark` scope: the aurora backdrop is vivid in both themes, so the glass
            uses the dark tint to keep the GlassSurface white text legible. */}
        <div className="ds-aurora dark relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <GlassButton tone="primary">
                <Check /> Primary
              </GlassButton>
              <GlassButton>Neutral</GlassButton>
              <GlassButton variant="clear" tone="primary">
                Clear
              </GlassButton>
              <GlassToggleGroup
                ariaLabel="Demo range"
                value={seg}
                onChange={setSeg}
                options={[
                  { value: 'day', label: 'Day' },
                  { value: 'week', label: 'Week' },
                  { value: 'month', label: 'Month' },
                ]}
              />
            </div>
            <GlassSurface interactive radius={24} className="max-w-md p-6 text-white">
              <p className="font-heading text-lg font-semibold drop-shadow">GlassSurface</p>
              <p className="mt-1 text-sm text-white/85 drop-shadow-sm">
                The core material — highlight, illumination and shadow layers composited over a lensing backdrop.
                Hover to feel it lift.
              </p>
            </GlassSurface>
          </div>
        </div>
      </DocBlock>
    </DocSection>
  )
}
