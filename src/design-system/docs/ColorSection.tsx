import { useAppStore } from '@/store'
import { semanticTokens, type PaletteId } from '@dimitrisafendras/liquid-glass/tokens'
import { DocSection, DocBlock, Panel, useCssVar } from './primitives'
import { dayActivityMeta, dayActivityOrder } from '@/components/dayActivity'
import { useT } from '@/i18n'

/** The published material docs, where the two ramps and their contrast report live. */
const MATERIAL_COLOR_DOCS = 'https://dimitrisafendras.github.io/liquid-glass/#color'

/**
 * This app's names for the two palettes.
 *
 * The package calls them "Blue" and "Orchid" — it describes what the colour is,
 * not who it is for, which is the only sensible thing for a general-purpose
 * design system to do. Here they are the boy/girl axis the app is actually
 * built around, so the app supplies its own wording rather than pushing that
 * framing back into the package.
 */
const APP_PALETTE_LABEL: Record<PaletteId, string> = { blue: 'Boy', red: 'Girl' }

/** OKLCH hue of a computed colour, for the separation figures below. */
function hueOf(color: string): number | null {
  const m = color.match(/oklch\([\d.]+ [\d.]+ ([\d.]+)/)
  return m ? Number(m[1]) : null
}

/**
 * One activity's colour, read off a live element rather than from a table.
 *
 * The swatch renders the real `dot` and `text` classes and then reports the hue
 * the browser actually resolved, so this page cannot drift from
 * `dayActivityMeta` the way a hand-maintained list of hexes would.
 */
function ActivitySwatch({ activity, label }: { activity: (typeof dayActivityOrder)[number]; label: string }) {
  const meta = dayActivityMeta[activity]
  const Icon = meta.icon
  const ref = (el: HTMLSpanElement | null) => {
    if (!el) return
    const h = hueOf(getComputedStyle(el).color)
    const out = el.parentElement?.querySelector('[data-hue]')
    if (out && h != null) out.textContent = `${Math.round(h)}°`
  }
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${meta.dot}`} aria-hidden>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span ref={ref} className={`font-medium ${meta.text}`}>
            {label}
          </span>
          <code data-hue className="text-[0.68rem] text-muted-foreground" />
        </div>
        <code className="block truncate text-xs text-muted-foreground">{meta.bar.replace('bg-', '')}</code>
      </div>
    </div>
  )
}

/**
 * The eight day-activity hues — the app's third colour axis, after theme and
 * palette, and the only place raw Tailwind ramps are sanctioned.
 */
function ActivityColorBlock() {
  const t = useT()
  return (
    <DocBlock
      title="Day-activity hues"
      description="Eight fixed colours, one per activity, shared by the day timeline, the “what’s now” card and the /schedule type picker. They are the app’s third colour axis — and the one case where raw Tailwind ramps beat tokens."
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {dayActivityOrder.map((activity) => (
          <ActivitySwatch key={activity} activity={activity} label={t.fullDay.types[activity]} />
        ))}
      </div>

      <Panel>
        <h4 className="font-heading text-base font-semibold">
          Fixed meanings, so they never follow the palette
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          An activity&rsquo;s colour is a fixed meaning, exactly like a state token: sleep is indigo
          whichever child the app is set up for. Tinting these with{' '}
          <code className="text-foreground">--primary</code> would make the whole day change colour
          when you switch palette, which would say nothing at all. They live in{' '}
          <code className="text-foreground">src/components/dayActivity.tsx</code> as one record —{' '}
          <code className="text-foreground">icon</code>, <code className="text-foreground">dot</code>,{' '}
          <code className="text-foreground">text</code>, <code className="text-foreground">bar</code>{' '}
          and a raw <code className="text-foreground">accent</code> hex for the places that must
          compute a colour (SVG strokes, gradient stops) rather than apply a class.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Hue separation is the whole design.</strong> In the{' '}
          <code className="text-foreground">/schedule</code> picker these are eight identical
          16&ndash;20px glyphs, so hue is often the only thing telling them apart.
          The set was picked by searching every 8-subset of the Tailwind families for the largest
          minimum pairwise OKLCH hue gap <em>at the steps the app actually paints</em> — 400 in the
          dark theme, 700 in the light one — while staying clear of the hues that already mean
          something else (<code className="text-foreground">--destructive</code> and the two palette
          primaries). Measuring the 500 ramp instead is wrong by up to 20°: <em>pink</em> is 354° at
          500 but 350° at 400 and 4° at 700. The floor is <strong className="text-foreground">27.6°</strong>,
          between <em>wind-down</em> and <em>active play</em> — and that is the ceiling too, since no
          other eight fit the circle better once both painted steps are counted. Before this,{' '}
          <em>care</em> was cyan and sat 22° from <em>feed</em>&rsquo;s sky: at 16px they were the
          same colour. Adding a ninth activity means re-running that search, not eyeballing a hue
          that looks free.
        </p>
      </Panel>
    </DocBlock>
  )
}

function SemanticSwatch({ cssVar, name, description }: { cssVar: string; name: string; description: string }) {
  const value = useCssVar(cssVar)
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

function StateTokenCard({ token }: { token: (typeof stateTokens)[number] }) {
  const live = useCssVar(token.cssVar)
  const liveFg = useCssVar(token.fgVar ?? '--foreground')
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

  return (
    <DocSection
      id="color"
      eyebrow="Color"
      title="The colour this app owns"
      intro="The two accent ramps and their contrast report belong to the material and are published with it. What is documented here is the half the package deliberately does not ship: this app's neutral base, the three state colours, and which palette it calls what."
    >
      <DocBlock
        title="Palette naming"
        description="The package names its palettes after the colour; this app names them after the axis it is built around."
      >
        <Panel contentClassName="flex flex-wrap items-center justify-between gap-4">
          <dl className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-2 text-sm">
            {(['blue', 'red'] as PaletteId[]).map((id) => (
              <div key={id} className="contents">
                <dt className="flex items-center gap-2 font-medium">
                  <span
                    aria-hidden
                    className="size-4 rounded-full ring-1 ring-black/10 dark:ring-white/15"
                    style={{ backgroundColor: id === palette ? 'var(--primary)' : undefined }}
                  />
                  {APP_PALETTE_LABEL[id]}
                </dt>
                <dd className="text-muted-foreground">
                  <code>{id}</code> — the package calls this{' '}
                  {id === 'blue' ? '“Blue”' : '“Orchid”'}
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={MATERIAL_COLOR_DOCS}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-foreground hover:text-primary"
          >
            See both ramps →
          </a>
        </Panel>
      </DocBlock>

      <DocBlock
        title="Semantic tokens (live)"
        description={`Reading this app's running values for the ${APP_PALETTE_LABEL[palette]} palette in ${dark ? 'dark' : 'light'} mode. The accent roles come from the package; the neutrals are this app's own. Toggle in the nav to watch them update.`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {semanticTokens.map((t) => (
            <SemanticSwatch key={t.cssVar} cssVar={t.cssVar} name={t.name} description={t.description} />
          ))}
        </div>
      </DocBlock>

      <ActivityColorBlock />

      <DocBlock
        title="Semantic state tokens"
        description="Three states, each a light/dark pair that inverts like the accent roles: the hue carries the text colour, its -foreground rides on top when the hue becomes a fill. Every figure below is WCAG AA (4.5:1) or better for normal text."
      >
        <div className="mb-4 grid gap-3 lg:grid-cols-3">
          {stateTokens.map((t) => (
            <StateTokenCard key={t.name} token={t} />
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
            <code className="text-foreground">[data-palette]</code> blocks the design system ships in{' '}
            <code className="text-foreground">palettes.css</code>, and live here instead. A state
            describes what happened,
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
