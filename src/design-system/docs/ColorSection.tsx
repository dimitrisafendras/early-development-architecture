import { useAppStore } from '@/store'
import { Badge } from '@/components/ui/badge'
import { palettes, semanticTokens, contrastReport, type Palette } from '@dimitrisafendras/liquid-glass/tokens'
import { DocSection, DocBlock, Panel, useCssVar } from './primitives'

function Ramp({ palette, active }: { palette: Palette; active: boolean }) {
  return (
    <Panel>
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

/**
 * The semantic state tokens, with the ratios each value was tuned against.
 *
 * Measured with the standard WCAG 2.x formula (sRGB relative luminance), with
 * the `/10` tints composited over the opaque surface beneath them — the same
 * method that produced the figures in the `--destructive` and
 * `--muted-foreground` comments in `src/index.css`.
 */
const stateTokens = [
  {
    name: 'destructive',
    cssVar: '--destructive',
    role: 'Errors, deletion, "do not do this"',
    light: 'oklch(0.51 0.21 27.5)',
    dark: 'oklch(0.704 0.191 22.216)',
    onSurface: '6.38 / 6.19',
    onOwnTint: '5.30 / 5.46',
    onFill: '6.38 / 6.19',
    fgVar: null,
  },
  {
    name: 'success',
    cssVar: '--success',
    role: 'Target reached, streak kept, "on track"',
    light: 'oklch(0.5 0.115 157)',
    dark: 'oklch(0.72 0.15 158)',
    onSurface: '5.67 / 7.70',
    onOwnTint: '4.92 / 6.59',
    onFill: '5.45 / 7.34',
    fgVar: '--success-foreground',
  },
  {
    name: 'warning',
    cssVar: '--warning',
    role: 'Safety caution, over/under a healthy range',
    light: 'oklch(0.52 0.105 80)',
    dark: 'oklch(0.8 0.15 80)',
    onSurface: '5.59 / 9.44',
    onOwnTint: '4.88 / 7.86',
    onFill: '5.35 / 8.71',
    fgVar: '--warning-foreground',
  },
] as const

function StateTokenCard({ token, dep }: { token: (typeof stateTokens)[number]; dep: string }) {
  const live = useCssVar(token.cssVar, [dep])
  const liveFg = useCssVar(token.fgVar ?? '--foreground', [dep])
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-lg text-xs font-bold ring-1 ring-black/10 dark:ring-white/15"
          style={{
            backgroundColor: `var(${token.cssVar})`,
            color: token.fgVar ? `var(${token.fgVar})` : 'white',
          }}
        >
          Aa
        </span>
        <div className="min-w-0">
          <code className="text-sm font-semibold" style={{ color: `var(${token.cssVar})` }}>
            {token.name}
          </code>
          <p className="text-xs text-muted-foreground">{token.role}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-1.5 text-xs">
        {[
          ['Light', token.light],
          ['Dark', token.dark],
          ['Live', live || '—'],
          [
            token.fgVar ? `Live ${token.fgVar.replace('--', '')}` : 'Foreground',
            token.fgVar ? liveFg || '—' : 'literal white (no token)',
          ],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
            <dd className="min-w-0 truncate font-mono text-[0.68rem]">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 border-t border-border pt-3">
        <p className="mb-1.5 text-[0.68rem] font-semibold tracking-wide text-muted-foreground uppercase">
          Contrast · light / dark
        </p>
        <dl className="space-y-1 text-xs tabular-nums">
          {[
            [`text-${token.name} on background/card`, token.onSurface],
            [`text-${token.name} on bg-${token.name}/10`, token.onOwnTint],
            [
              token.fgVar ? `foreground on bg-${token.name}` : `white on bg-${token.name}`,
              token.onFill,
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-2">
              <dt className="min-w-0 truncate text-muted-foreground">{k}</dt>
              <dd className="shrink-0 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
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
      intro="Every surface is neutral; a single accent palette tints the primary, accent and ring roles. Soft blue for boys, soft orchid for girls — a violet-pink rather than a rose, so the accent never reads as the destructive red. Both ramps are documented; only the active one drives the running UI."
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

      <DocBlock
        title="Semantic state tokens"
        description="Three states, each a light/dark pair that inverts like the accent roles: the hue carries the text colour, its -foreground rides on top when the hue becomes a fill. Every figure below is WCAG AA (4.5:1) or better for normal text."
      >
        <div className="mb-4 grid gap-3 lg:grid-cols-3">
          {stateTokens.map((t) => (
            <StateTokenCard key={t.name} token={t} dep={dep} />
          ))}
        </div>

        <Panel>
          <h4 className="font-heading text-base font-semibold">
            State tokens do not change with the palette
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <code className="text-foreground">--destructive</code>,{' '}
            <code className="text-foreground">--success</code> and{' '}
            <code className="text-foreground">--warning</code> are deliberately absent from the{' '}
            <code className="text-foreground">[data-palette]</code> blocks in{' '}
            <code className="text-foreground">src/index.css</code>. A state describes what happened,
            not whose app it is — &ldquo;target reached&rdquo; has to be the same green whether the
            blue or the orchid palette is active, or the colour stops meaning anything. Only the
            three brand roles (<code className="text-foreground">primary</code>,{' '}
            <code className="text-foreground">accent</code>,{' '}
            <code className="text-foreground">ring</code>) follow the palette axis. If you want a
            palette-tinted green, you want <code className="text-foreground">--primary</code>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            They are tuned for <em>text</em>, not for prettiness — the same trade the darkened{' '}
            <code className="text-foreground">--muted-foreground</code> makes.{' '}
            <code className="text-foreground">--success</code> lands on Tailwind{' '}
            <code className="text-foreground">emerald-700</code> rather than a bright{' '}
            <code className="text-foreground">-500</code>, which would only reach ~2.5:1 on a light
            card. Two caveats: the numbers above are for a state tint over{' '}
            <code className="text-foreground">bg-card</code> or{' '}
            <code className="text-foreground">bg-background</code> — stacking a{' '}
            <code className="text-foreground">/10</code> state tint on top of the already-tinted{' '}
            <code className="text-foreground">bg-accent</code> drops all three tokens (destructive
            included) to ~4.1–4.4:1, so put state tints on a plain card. And every value sits inside
            sRGB, so the authored <code className="text-foreground">oklch()</code> is what actually
            ships.
          </p>
        </Panel>
      </DocBlock>
    </DocSection>
  )
}
