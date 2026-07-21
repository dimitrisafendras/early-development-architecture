import { spacingScale, radiusScale } from '../tokens'
import { DocSection, DocBlock, Panel } from './primitives'

export function SpacingRadiusSection() {
  return (
    <DocSection
      id="spacing"
      eyebrow="Layout"
      title="Spacing & radius"
      intro="A 4px spacing grid keeps rhythm consistent. Radii follow a matching scale and nest concentrically so rounded elements sit cleanly inside one another."
    >
      <DocBlock title="Spacing scale" description="Base grid of 4px. Names map to Tailwind spacing utilities.">
        <Panel>
          <div className="space-y-2.5">
            {spacingScale.map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <div className="w-10 shrink-0 text-sm font-medium tabular-nums">{s.name}</div>
                <div className="h-3 rounded bg-primary" style={{ width: `${s.px}px` }} />
                <div className="text-xs tabular-nums text-muted-foreground">
                  {s.rem} · {s.px}px
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </DocBlock>

      <DocBlock title="Radius scale" description="From subtle to fully rounded (capsule).">
        <Panel>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
            {radiusScale.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className="mx-auto h-16 w-full border border-primary/40 bg-primary/10"
                  style={{ borderRadius: r.name === 'full' ? '9999px' : `${r.px}px` }}
                />
                <div className="mt-2 text-sm font-medium">{r.name}</div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  {r.px === 9999 ? '∞' : `${r.px}px`}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Concentric radii"
        description="Nested radius = outer radius − inset. This keeps curves parallel and is core to the Liquid Glass look."
      >
        <Panel className="flex flex-wrap items-center gap-8">
          <div
            className="flex items-center justify-center bg-primary/10 p-4"
            style={{ borderRadius: 28 }}
          >
            <div
              className="flex size-24 items-center justify-center bg-primary/20"
              style={{ borderRadius: 28 - 16 }}
            >
              <div className="size-10 rounded-full bg-primary" />
            </div>
          </div>
          <div className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            <p>
              Outer container: <code className="rounded bg-muted px-1 py-0.5 text-xs">radius 28</code>, inset{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">16</code>.
            </p>
            <p className="mt-2">
              Inner child therefore uses <code className="rounded bg-muted px-1 py-0.5 text-xs">28 − 16 = 12</code>. The
              curves stay visually concentric instead of crowding at the corners.
            </p>
          </div>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}
