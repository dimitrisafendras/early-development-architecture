import { Contrast, EyeOff, Gauge, Type } from 'lucide-react'

import { DocSection, DocBlock, Panel } from './primitives'

const rules = [
  {
    icon: Contrast,
    title: 'Contrast',
    body: 'primary-foreground on primary is verified at WCAG AA (≥4.5:1) in both palettes and both themes. Body text meets AA against every surface token.',
  },
  {
    icon: EyeOff,
    title: 'Reduced transparency',
    body: 'prefers-reduced-transparency: reduce swaps every glass surface for a near-opaque one, drops the blur and removes the highlight / illumination layers — enforced in CSS.',
  },
  {
    icon: Gauge,
    title: 'Reduced motion',
    body: 'prefers-reduced-motion: reduce halts the animated aurora backdrops, the lensing hover shift and the segmented-control thumb transition.',
  },
  {
    icon: Type,
    title: 'Legibility over media',
    body: 'Text on clear glass carries a subtle shadow, and clear glass is restricted to bright content. If legibility drops, add a dimming scrim rather than switching variant.',
  },
]

export function AccessibilitySection() {
  return (
    <DocSection
      id="accessibility"
      eyebrow="Accessibility"
      title="Legible, adaptive, honest"
      intro="Glass is a beautiful default, not an excuse to lose legibility. Every material decision has an accessible fallback, and the control layer stays fully keyboard operable."
    >
      <DocBlock title="Guarantees">
        <div className="grid gap-4 sm:grid-cols-2">
          {rules.map((r) => {
            const Icon = r.icon
            return (
              <Panel key={r.title} className="p-5">
                <Icon className="size-5 text-primary" aria-hidden />
                <h4 className="mt-3 font-heading text-base font-semibold">{r.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </Panel>
            )
          })}
        </div>
      </DocBlock>

      <DocBlock title="Keyboard & focus" description="The glass controls follow native semantics and standard ARIA patterns.">
        <Panel>
          <ul className="space-y-3 text-sm text-foreground/80">
            <li className="flex gap-3">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              GlassToggleGroup implements the radiogroup pattern — roving tab index with arrow-key navigation and
              <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">aria-checked</code>.
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Every interactive glass element renders a visible focus ring in the active palette (
              <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">--ring</code>).
            </li>
            <li className="flex gap-3">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              Decorative highlight and illumination layers are <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">aria-hidden</code>
              and never trap focus.
            </li>
          </ul>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}
