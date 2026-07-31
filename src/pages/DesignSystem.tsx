import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'
import { PageFrame } from '@/components/PageFrame'
import { GlassSurface, GlassButton } from '@dimitrisafendras/liquid-glass'
import { ColorSection } from '@/design-system/docs/ColorSection'
import { ComponentsSection } from '@/design-system/docs/ComponentsSection'
import { ShellSection } from '@/design-system/docs/ShellSection'
import { ConventionsSection } from '@/design-system/docs/ConventionsSection'
import { PatternsSection } from '@/design-system/docs/PatternsSection'

/** The published material docs — the canonical home of everything this page
 *  used to restate. */
const MATERIAL_DOCS = 'https://dimitrisafendras.github.io/liquid-glass/'

/**
 * Only what this app owns.
 *
 * Principles, Materials, Type, Spacing and A11y described the *material*, which
 * now ships as a package and documents itself at MATERIAL_DOCS. Keeping second
 * copies here meant two sets of prose about one thing, and they had already
 * begun to disagree — this page was still calling the typeface Geist and still
 * telling readers to hand-roll a scrim the material had since absorbed. What is
 * left is the half no package can document: this app's shell, its control
 * scale, its conventions, its one page archetype, and the colour it owns.
 */
const SECTIONS: { href: string; label: string }[] = [
  { href: '#color', label: 'Color' },
  { href: '#components', label: 'Components' },
  { href: '#shell', label: 'Shell' },
  { href: '#conventions', label: 'Conventions' },
  { href: '#patterns', label: 'Patterns' },
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
          How this app applies the Liquid Glass material: its shell, its control scale, its conventions and
          the one page archetype built from them. The material itself — principles, variants, colour ramps,
          type and accessibility — is a package, and documents itself.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <GlassButton
            tone="primary"
            size="sm"
            render={<a href={MATERIAL_DOCS} target="_blank" rel="noreferrer" />}
          >
            Material documentation
          </GlassButton>
          <GlassButton size="sm" render={<a href="#shell" />}>
            This app's shell
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
        <ColorSection />
        <ComponentsSection />
        {/* Shell → Conventions → Patterns reads outside-in: the frame every route
            sits in, then the numbers that fill it, then the one page archetype
            built from both. */}
        <ShellSection />
        <ConventionsSection />
        <PatternsSection />
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
        </a>{' '}
        and is documented at{' '}
        <a
          href={MATERIAL_DOCS}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground hover:text-primary"
        >
          its own site
        </a>
        . Everything above is this app's own.
      </p>
    </PageFrame>
  )
}
