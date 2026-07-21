import { useAppStore } from '@/store'
import { Badge } from '@/components/ui/badge'
import { palettes, semanticTokens, contrastReport, type Palette } from '../tokens'
import { DocSection, DocBlock, Panel, useCssVar } from './primitives'

function Ramp({ palette, active }: { palette: Palette; active: boolean }) {
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <h4 className="font-heading text-base font-semibold">
          {palette.label} <span className="text-muted-foreground">· {palette.audience}</span>
        </h4>
        {active && <Badge>Active</Badge>}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {palette.ramp.map((step) => (
          <div key={step.name} className="min-w-0">
            <div
              className="h-14 w-full rounded-lg ring-1 ring-black/5 dark:ring-white/10"
              style={{ backgroundColor: step.oklch }}
              title={`${step.oklch}`}
            />
            <div className="mt-1.5 text-center">
              <div className="text-[0.7rem] font-semibold tabular-nums">{step.name}</div>
              <div className="text-[0.62rem] text-muted-foreground uppercase">{step.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function SemanticSwatch({ cssVar, name, description, dep }: { cssVar: string; name: string; description: string; dep: string }) {
  const value = useCssVar(cssVar, [dep])
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span
        className="size-10 shrink-0 rounded-lg ring-1 ring-black/10 dark:ring-white/15"
        style={{ backgroundColor: `var(${cssVar})` }}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{name}</span>
          <code className="truncate text-[0.68rem] text-muted-foreground">{value || cssVar}</code>
        </div>
        <p className="truncate text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ColorSection() {
  const dark = useAppStore((s) => s.dark)
  const palette = useAppStore((s) => s.palette)
  const dep = `${dark ? 'dark' : 'light'}-${palette}`

  return (
    <DocSection
      id="color"
      eyebrow="Color"
      title="Two palettes, one accent at a time"
      intro="Every surface is neutral; a single accent palette tints the primary, accent and ring roles. Soft blue for boys, soft rose for girls. Both ramps are documented; only the active one drives the running UI."
    >
      <DocBlock title="Palette ramps" description="Perceptual oklch ramps, 50 → 900. Values are theme-independent.">
        <div className="space-y-4">
          <Ramp palette={palettes.blue} active={palette === 'blue'} />
          <Ramp palette={palettes.red} active={palette === 'red'} />
        </div>
      </DocBlock>

      <DocBlock
        title="Semantic tokens (live)"
        description={`Reading the running values for the ${palette === 'blue' ? 'Boy' : 'Girl'} palette in ${dark ? 'dark' : 'light'} mode. Toggle in the nav to watch them update.`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {semanticTokens.map((t) => (
            <SemanticSwatch key={t.cssVar} cssVar={t.cssVar} name={t.name} description={t.description} dep={dep} />
          ))}
        </div>
      </DocBlock>

      <DocBlock title="Contrast of primary-foreground on primary" description="All pairs meet WCAG AA (4.5:1) for normal text.">
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contrastReport.map((r) => (
              <div key={`${r.palette}-${r.theme}`} className="rounded-xl border border-border p-4">
                <div className="text-sm font-medium capitalize">
                  {palettes[r.palette].label} · {r.theme}
                </div>
                <div className="mt-1 font-heading text-2xl font-semibold tabular-nums">{r.ratio.toFixed(2)}:1</div>
                <Badge variant="secondary" className="mt-2">
                  {r.level}
                </Badge>
              </div>
            ))}
          </div>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}
