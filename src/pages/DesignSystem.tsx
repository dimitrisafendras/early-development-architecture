import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { PageFrame } from '@/components/PageFrame'
import { GlassSurface, GlassButton } from '@dimitrisafendras/liquid-glass'
import { PrinciplesSection } from '@/design-system/docs/PrinciplesSection'
import { MaterialsSection } from '@/design-system/docs/MaterialsSection'
import { ColorSection } from '@/design-system/docs/ColorSection'
import { TypographySection } from '@/design-system/docs/TypographySection'
import { SpacingRadiusSection } from '@/design-system/docs/SpacingRadiusSection'
import { ComponentsSection } from '@/design-system/docs/ComponentsSection'
import { ShellSection } from '@/design-system/docs/ShellSection'
import { ConventionsSection } from '@/design-system/docs/ConventionsSection'
import { PatternsSection } from '@/design-system/docs/PatternsSection'
import { AccessibilitySection } from '@/design-system/docs/AccessibilitySection'

const SECTIONS: { href: string; label: string }[] = [
  { href: '#principles', label: 'Principles' },
  { href: '#materials', label: 'Materials' },
  { href: '#color', label: 'Color' },
  { href: '#typography', label: 'Type' },
  { href: '#spacing', label: 'Spacing' },
  { href: '#components', label: 'Components' },
  { href: '#shell', label: 'Shell' },
  { href: '#conventions', label: 'Conventions' },
  { href: '#patterns', label: 'Patterns' },
  { href: '#accessibility', label: 'A11y' },
]

/** Tracks which section is in view for nav highlighting. */
function useActiveSection() {
  const [active, setActive] = useState<string>('#principles')
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.href.slice(1))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(`#${visible[0].target.id}`)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  return active
}

/**
 * "On this page" jump nav, in the frame's toolbar slot.
 *
 * It scrolls horizontally rather than wrapping: ten section names would other-
 * wise stack to three rows on a phone and push the whole document down.
 */
function SectionNav({ activeHref }: { activeHref: string }) {
  return (
    <nav
      aria-label="On this page"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {SECTIONS.map((s) => {
        const active = activeHref === s.href
        return (
          <a
            key={s.href}
            href={s.href}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/70',
              active
                ? 'bg-primary/15 text-foreground'
                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
            )}
          >
            {s.label}
          </a>
        )
      })}
    </nav>
  )
}

/**
 * The one place the page shows the material at full strength rather than
 * describing it: a bounded aurora band with real glass floating on it.
 *
 * `dark` scope forces the dark glass tint — the aurora is vivid in both app
 * themes, so a dark frosted surface is what keeps the white text legible. It is
 * a contained, rounded band rather than a full-bleed hero because this page now
 * sits inside the app shell like every other route.
 */
function Hero() {
  return (
    <div className="ds-aurora dark relative overflow-hidden rounded-3xl">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-black/55 via-black/15 to-transparent"
      />
      <div className="relative z-10 flex flex-col items-start p-6 sm:p-10">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white uppercase backdrop-blur">
          Design System
        </span>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 drop-shadow sm:text-lg">
          A translucent material for the control layer — highlight, shadow and illumination, lensing the
          content behind it. Built on shadcn/ui, adaptive across light, dark and two soft accent palettes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <GlassButton tone="primary" size="sm" render={<a href="#principles" />}>
            Explore principles
          </GlassButton>
          <GlassButton size="sm" render={<a href="#materials" />}>
            See the material
          </GlassButton>
          <GlassButton
            size="sm"
            render={
              <a
                href="https://github.com/dimitrisafendras/liquid-glass"
                target="_blank"
                rel="noreferrer"
              />
            }
          >
            Source on GitHub
          </GlassButton>
        </div>

        <GlassSurface interactive radius={24} className="mt-8 w-full max-w-md p-5 text-white">
          <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">Regular glass</p>
          <p className="mt-1.5 font-heading text-lg font-semibold drop-shadow">Legible anywhere</p>
          <p className="mt-1.5 text-sm text-white/85 drop-shadow-sm">
            This card is real glass over the animated backdrop — the color behind it concentrates through
            the material. Hover to feel the lensing lift.
          </p>
        </GlassSurface>
      </div>
    </div>
  )
}

export default function DesignSystem() {
  const activeHref = useActiveSection()

  return (
    <PageFrame title="Liquid Glass" toolbar={<SectionNav activeHref={activeHref} />}>
      <Hero />

      <div>
        <PrinciplesSection />
        <MaterialsSection />
        <ColorSection />
        <TypographySection />
        <SpacingRadiusSection />
        <ComponentsSection />
        {/* Shell → Conventions → Patterns reads outside-in: the frame every route
            sits in, then the numbers that fill it, then the one page archetype
            built from both. */}
        <ShellSection />
        <ConventionsSection />
        <PatternsSection />
        <AccessibilitySection />
      </div>

      <p className="border-t border-border pt-6 text-sm text-muted-foreground">
        The material ships as{' '}
        <a
          href="https://github.com/dimitrisafendras/liquid-glass"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground hover:text-primary"
        >
          @dimitrisafendras/liquid-glass
        </a>
        ; the shell, conventions and patterns above are this app's.
      </p>
    </PageFrame>
  )
}
