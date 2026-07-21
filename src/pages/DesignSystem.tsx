import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Baby, Moon, Sun, ArrowLeft } from 'lucide-react'

import { useAppStore } from '@/store'
import '@/design-system/ds.css'
import { GlassNav, GlassToggleGroup, GlassSurface, GlassButton } from '@/design-system/components'
import { PrinciplesSection } from '@/design-system/docs/PrinciplesSection'
import { MaterialsSection } from '@/design-system/docs/MaterialsSection'
import { ColorSection } from '@/design-system/docs/ColorSection'
import { TypographySection } from '@/design-system/docs/TypographySection'
import { SpacingRadiusSection } from '@/design-system/docs/SpacingRadiusSection'
import { ComponentsSection } from '@/design-system/docs/ComponentsSection'
import { AccessibilitySection } from '@/design-system/docs/AccessibilitySection'

const SECTIONS: { href: string; label: string }[] = [
  { href: '#principles', label: 'Principles' },
  { href: '#materials', label: 'Materials' },
  { href: '#color', label: 'Color' },
  { href: '#typography', label: 'Type' },
  { href: '#spacing', label: 'Spacing' },
  { href: '#components', label: 'Components' },
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

export default function DesignSystem() {
  const dark = useAppStore((s) => s.dark)
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const activeHref = useActiveSection()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlassNav
        activeHref={activeHref}
        links={SECTIONS}
        brand={
          <>
            <Baby className="size-4 text-primary" aria-hidden />
            <span>Liquid Glass</span>
          </>
        }
        actions={
          <>
            <GlassToggleGroup
              ariaLabel="Color theme"
              size="sm"
              value={dark ? 'dark' : 'light'}
              onChange={(v) => {
                if ((v === 'dark') !== dark) toggleTheme()
              }}
              options={[
                { value: 'light', label: <Sun className="size-3.5" />, ariaLabel: 'Light theme' },
                { value: 'dark', label: <Moon className="size-3.5" />, ariaLabel: 'Dark theme' },
              ]}
            />
            <GlassToggleGroup
              ariaLabel="Accent palette"
              size="sm"
              value={palette}
              onChange={(v) => setPalette(v)}
              options={[
                { value: 'blue', label: 'Boy' },
                { value: 'red', label: 'Girl' },
              ]}
            />
            <GlassButton size="sm" className="hidden sm:inline-flex" render={<Link to="/" />}>
              <ArrowLeft className="size-3.5" /> Infographic
            </GlassButton>
          </>
        }
      />

      {/* Hero */}
      <header className="ds-aurora relative overflow-hidden">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-start px-5 py-24 sm:px-8 sm:py-32">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white uppercase backdrop-blur">
            Design System
          </span>
          <h1 className="mt-6 max-w-3xl font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-white drop-shadow-lg sm:text-7xl">
            Liquid Glass
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 drop-shadow">
            A translucent material for the control layer — highlight, shadow and illumination, lensing the content
            behind it. Built on shadcn/ui, adaptive across light, dark and two soft accent palettes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GlassButton tone="primary" render={<a href="#principles" />}>
              Explore principles
            </GlassButton>
            <GlassButton render={<a href="#materials" />}>See the material</GlassButton>
          </div>

          <GlassSurface interactive radius={28} className="mt-14 w-full max-w-md p-6 text-white">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">Regular glass</p>
            <p className="mt-2 font-heading text-xl font-semibold drop-shadow">Legible anywhere</p>
            <p className="mt-1.5 text-sm text-white/85 drop-shadow-sm">
              This card is real glass over the animated backdrop — the color behind it concentrates through the
              material. Hover to feel the lensing lift.
            </p>
          </GlassSurface>
        </div>
      </header>

      <main>
        <PrinciplesSection />
        <MaterialsSection />
        <ColorSection />
        <TypographySection />
        <SpacingRadiusSection />
        <ComponentsSection />
        <AccessibilitySection />
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Liquid Glass — design system for the early-development architecture.</p>
          <Link to="/" className="font-medium text-foreground hover:text-primary">
            ← Back to infographic
          </Link>
        </div>
      </footer>
    </div>
  )
}
