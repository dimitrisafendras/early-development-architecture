import { Eye } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { materials } from '../tokens'
import { GlassSurface, GlassButton } from '../components'
import { DocSection, DocBlock, Panel } from './primitives'

function GlassDemoCard({ variant }: { variant: 'regular' | 'clear' }) {
  const isClear = variant === 'clear'
  return (
    <GlassSurface
      variant={variant}
      interactive
      radius={24}
      className="w-full p-6 text-white"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">{variant}</p>
      <p className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white drop-shadow">
        {isClear ? 'Clear glass' : 'Regular glass'}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-white/85 drop-shadow-sm">
        {isClear
          ? 'Thinner and more transparent — notice more of the backdrop bleeds through. For bright media only.'
          : 'Adaptive and legible over anything. Watch the color behind it concentrate through the material.'}
      </p>
      <div className="mt-4 flex gap-2">
        <GlassButton variant={variant} size="sm" tone="primary">
          Action
        </GlassButton>
        <GlassButton variant={variant} size="sm">
          Secondary
        </GlassButton>
      </div>
    </GlassSurface>
  )
}

export function MaterialsSection() {
  return (
    <DocSection
      id="materials"
      eyebrow="Material"
      title="The glass, over content"
      intro="Translucency and lensing only mean something over real content. Both variants are shown floating above a vivid, animated backdrop — hover to feel the lensing shift."
    >
      <DocBlock title="Regular vs Clear" description="Side by side over the same animated aurora backdrop.">
        <div className="ds-aurora relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="relative z-10 grid gap-6 sm:grid-cols-2">
            <GlassDemoCard variant="regular" />
            <GlassDemoCard variant="clear" />
          </div>
        </div>
      </DocBlock>

      <DocBlock
        title="Clear over bright media"
        description="Clear glass needs bright, busy content behind it — and often a scrim."
      >
        <div className="ds-photo relative overflow-hidden rounded-3xl p-6 sm:p-10">
          <div className="relative z-10 mx-auto max-w-md">
            <GlassSurface variant="clear" radius={24} className="p-6 text-white">
              <p className="font-heading text-xl font-semibold drop-shadow">Now Playing</p>
              <p className="mt-1 text-sm text-white/85 drop-shadow-sm">
                Over saturated imagery, clear glass keeps the media the hero while the controls float in front.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <GlassButton variant="clear" size="icon" tone="primary" aria-label="Play">
                  ▶
                </GlassButton>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-2/5 rounded-full bg-white/90" />
                </div>
              </div>
            </GlassSurface>
          </div>
        </div>
      </DocBlock>

      <DocBlock title="Material tokens" description="The recipe behind each variant, exported from tokens.ts.">
        <Panel className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Blur</TableHead>
                <TableHead>Saturate</TableHead>
                <TableHead>Tint (light / dark)</TableHead>
                <TableHead className="hidden md:table-cell">Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m.variant}>
                  <TableCell className="font-medium">{m.label}</TableCell>
                  <TableCell className="tabular-nums">{m.blur}px</TableCell>
                  <TableCell className="tabular-nums">{m.saturate}%</TableCell>
                  <TableCell className="tabular-nums">
                    {m.tintLight} / {m.tintDark}
                  </TableCell>
                  <TableCell className="hidden max-w-xs text-xs whitespace-normal text-muted-foreground md:table-cell">
                    {m.usage}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </DocBlock>

      <DocBlock title="Reduced-transparency fallback">
        <Panel className="flex items-start gap-3">
          <Eye className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="text-sm leading-relaxed text-muted-foreground">
            When the viewer requests reduced transparency, every <code className="rounded bg-muted px-1 py-0.5 text-xs">.ds-glass</code>{' '}
            surface drops its blur and light layers and falls back to a near-opaque surface (≈96–97% opacity) with a
            hairline border — the same layout, guaranteed legibility. This is enforced in CSS via{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">@media (prefers-reduced-transparency: reduce)</code>,
            so it needs no JavaScript and cannot be bypassed by a component.
          </div>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}
