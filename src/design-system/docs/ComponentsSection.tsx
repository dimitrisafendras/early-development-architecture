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
