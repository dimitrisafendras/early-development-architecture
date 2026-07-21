import { Layers, Droplets, Sparkles, PanelTop } from 'lucide-react'

import { DocSection, DocBlock, Panel, DoDont } from './primitives'

const layers = [
  {
    icon: Sparkles,
    name: 'Highlight',
    body: 'A specular light cast along the top edge — the sense that light is glancing off a physical surface.',
  },
  {
    icon: Layers,
    name: 'Shadow',
    body: 'Depth separation from whatever sits behind, so the glass reads as a distinct floating plane.',
  },
  {
    icon: Droplets,
    name: 'Illumination',
    body: 'An adaptive interior glow that tints the material to its surroundings and light/dark context.',
  },
]

export function PrinciplesSection() {
  return (
    <DocSection
      id="principles"
      eyebrow="Foundations"
      title="What Liquid Glass is"
      intro="A translucent material for the controls that float above your content. It is built from three conceptual layers and, crucially, it lenses — bending and concentrating the light of the content behind it rather than simply blurring it."
    >
      <DocBlock title="The three layers" description="Every glass surface composes these together.">
        <div className="grid gap-4 sm:grid-cols-3">
          {layers.map((l) => {
            const Icon = l.icon
            return (
              <Panel key={l.name} className="p-5">
                <Icon className="size-5 text-primary" aria-hidden />
                <h4 className="mt-3 font-heading text-base font-semibold">{l.name}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
              </Panel>
            )
          })}
        </div>
      </DocBlock>

      <DocBlock
        title="Lensing, not flat blur"
        description="Glass concentrates color and light from behind it. We approximate this in CSS."
      >
        <Panel>
          <div className="grid gap-6 text-sm sm:grid-cols-3">
            <div>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">backdrop-blur</code>
              <p className="mt-2 text-muted-foreground">Softens the background so foreground text stays legible.</p>
            </div>
            <div>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">backdrop-saturate</code>
              <p className="mt-2 text-muted-foreground">Concentrates color from behind — the tell-tale lensing effect.</p>
            </div>
            <div>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">gradient layers</code>
              <p className="mt-2 text-muted-foreground">Highlight + illumination fake refraction at the edges.</p>
            </div>
          </div>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Where glass belongs"
        description="Glass is for the navigation / control layer — not for content."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="p-5">
            <PanelTop className="size-5 text-primary" aria-hidden />
            <h4 className="mt-3 font-heading text-base font-semibold">Control layer → glass</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Bars, toolbars, floating buttons and capsule controls that hover above the content plane.
            </p>
          </Panel>
          <Panel className="p-5">
            <Layers className="size-5 text-muted-foreground" aria-hidden />
            <h4 className="mt-3 font-heading text-base font-semibold">Content layer → opaque</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Cards of text and data stay on solid surfaces. Never stack glass on glass.
            </p>
          </Panel>
        </div>
      </DocBlock>

      <DocBlock title="Regular vs Clear" description="Two variants. Never mix them within one cluster.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="p-5">
            <h4 className="font-heading text-base font-semibold">Regular</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              The default. Adaptive and legible over anything — text, photos, gradients. Use it almost everywhere.
            </p>
          </Panel>
          <Panel className="p-5">
            <h4 className="font-heading text-base font-semibold">Clear</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              More transparent, for bright media-rich backdrops only. Add a dimming scrim if legibility drops.
            </p>
          </Panel>
        </div>
      </DocBlock>

      <DocBlock title="Do & Don't">
        <DoDont
          dos={[
            'Reserve glass for floating controls above content.',
            'Keep one accent palette active at a time.',
            'Use concentric radii — nested radius = outer − inset.',
            'Verify text contrast on top of the material.',
          ]}
          donts={[
            'Put glass on content cards of text or data.',
            'Stack glass on glass.',
            'Mix regular and clear in the same cluster.',
            'Rely on clear glass over low-contrast backgrounds.',
          ]}
        />
      </DocBlock>
    </DocSection>
  )
}
