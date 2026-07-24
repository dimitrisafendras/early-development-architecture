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
import { todayKey } from '@/lib/schedule'
import { nowDateTimeKey } from '@/lib/dates'

import { GlassSurface, GlassButton, GlassToggleGroup } from '../components'
import { DocSection, DocBlock, Panel } from './primitives'

/** Labelled specimen tile. */
function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Panel className="p-5">
      <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </Panel>
  )
}

export function ComponentsSection() {
  const [checked, setChecked] = useState(true)
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

          <Panel className="p-5">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              ChoiceGroup — required single choice
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              A ToggleGroup in the <code className="text-foreground">pill</code> variant, where the pressed
              option takes the palette fill instead of <code className="text-foreground">bg-muted</code>. It
              swallows deselection, because none of the choices it covers has a valid empty state.
            </p>
            <div className="flex flex-col gap-3">
              <ChoiceGroup
                ariaLabel="Feed method"
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'bottle', label: 'Bottle' },
                  { value: 'breast', label: 'Breast' },
                  { value: 'solid', label: 'Solid' },
                ]}
              />
              <ChoiceGroup
                ariaLabel="Size — default"
                size="default"
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'bottle', label: 'Bottle' },
                  { value: 'breast', label: 'Breast' },
                  { value: 'solid', label: 'Solid' },
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

          <Panel className="p-5 lg:col-span-2">
            <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Card</p>
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

          <Panel className="p-5">
            <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Tabs</p>
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

          <Panel className="p-5">
            <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Accordion</p>
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
          <Panel className="p-5">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Number stepper
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Decrement and increment caps flank the value, divided by hairlines so the control reads as one
              segmented piece. Digits are tabular, so nothing shifts while stepping. Hold a cap to repeat;
              arrow keys step, with alt for the small step and shift for the large one.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ds-weight">Weight</Label>
                <NumberInput
                  id="ds-weight"
                  value={weight}
                  onValueChange={setWeight}
                  floor={0}
                  step={0.1}
                  smallStep={0.01}
                  unit="kg"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-feed">Bottle</Label>
                <NumberInput
                  id="ds-feed"
                  value={feed}
                  onValueChange={setFeed}
                  floor={0}
                  step={10}
                  largeStep={50}
                  unit="ml"
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

          <Panel className="p-5">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Date picker
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              A field-shaped trigger showing the date the way the locale writes it, opening the calendar in a
              popover. Values are plain <code className="text-foreground">YYYY-MM-DD</code> keys, so no entry
              ever shifts across a timezone.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="ds-birth">Birth date</Label>
                <DatePicker
                  id="ds-birth"
                  value={birthDate}
                  onValueChange={setBirthDate}
                  max={todayKey()}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ds-date-empty">Nothing picked</Label>
                <DatePicker id="ds-date-empty" max={todayKey()} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="ds-date-disabled">Disabled</Label>
                <DatePicker id="ds-date-disabled" value={todayKey()} disabled />
              </div>
            </div>
          </Panel>

          <Panel className="p-5 lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Time picker
            </p>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Two scroll columns rather than the browser's own control. Minutes sit on a five-minute grid,
              because that is the precision anyone reports a feed or a nap in — a value off the grid still
              shows up in the list instead of being rounded away. Hour labels follow the locale's clock.
            </p>
            <div className="flex flex-wrap items-start gap-6">
              <div className="w-56 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ds-bedtime">Bedtime</Label>
                  <TimePicker id="ds-bedtime" value={bedtime} onValueChange={setBedtime} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ds-time-empty">Nothing picked</Label>
                  <TimePicker id="ds-time-empty" />
                </div>
                <div className="space-y-1.5">
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

          <Panel className="p-5 lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
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

          <Panel className="p-5 lg:col-span-2">
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
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
                <div className="space-y-1.5">
                  <Label htmlFor="ds-fed">Fed at</Label>
                  <DateTimePicker
                    id="ds-fed"
                    value={fedAt}
                    onValueChange={setFedAt}
                    maxDate={todayKey()}
                    labels={{ today: 'Today' }}
                  />
                </div>
                <div className="space-y-1.5">
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
