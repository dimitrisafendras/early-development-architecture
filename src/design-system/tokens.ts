/**
 * Liquid Glass — Design Tokens
 * ----------------------------------------------------------------------------
 * Single source of truth for the design system, exported as *typed data* so the
 * documentation route can render swatches, tables and specimens directly from
 * these values. The CSS custom-property values below intentionally mirror the
 * `[data-palette]` blocks in `src/index.css` — keep them in sync.
 *
 * Grounded in Apple's Liquid Glass material (WWDC25): a translucent material
 * built from three conceptual layers — highlight, shadow and illumination —
 * that lenses the content behind it. See `components/GlassSurface`.
 */

export type PaletteId = 'blue' | 'red'
export type ThemeMode = 'light' | 'dark'

/* -------------------------------------------------------------------------- */
/* Color                                                                      */
/* -------------------------------------------------------------------------- */

export interface ColorStep {
  /** Ramp step name, e.g. "500". */
  name: string
  /** Authoring value (oklch) used in CSS. */
  oklch: string
  /** Precomputed sRGB hex for display / copy. */
  hex: string
}

export interface SemanticRoles {
  /** Fill for primary actions. */
  primary: string
  /** Legible text/icon color on `primary`. WCAG AA verified. */
  primaryForeground: string
  /** Focus ring — matches `primary`. */
  ring: string
  /** Tinted, low-emphasis surface. */
  accent: string
  /** Text/icon color on `accent`. */
  accentForeground: string
}

export interface Palette {
  id: PaletteId
  /** Human label shown in the switcher. */
  label: string
  /** Short audience tag from the brief. */
  audience: string
  /** Perceptual ramp, light-reference (used for swatch grids). */
  ramp: ColorStep[]
  /** Semantic role mapping per theme. */
  semantic: Record<ThemeMode, SemanticRoles>
}

const blueRamp: ColorStep[] = [
  { name: '50', oklch: 'oklch(0.972 0.013 250)', hex: '#eff7fe' },
  { name: '100', oklch: 'oklch(0.938 0.030 250)', hex: '#dcedfe' },
  { name: '200', oklch: 'oklch(0.886 0.055 250)', hex: '#bfddfd' },
  { name: '300', oklch: 'oklch(0.812 0.088 251)', hex: '#97c6f9' },
  { name: '400', oklch: 'oklch(0.702 0.130 251)', hex: '#5da3ed' },
  { name: '500', oklch: 'oklch(0.620 0.145 252)', hex: '#3a89da' },
  { name: '600', oklch: 'oklch(0.550 0.150 253)', hex: '#2172c6' },
  { name: '700', oklch: 'oklch(0.472 0.132 255)', hex: '#1d5ba3' },
  { name: '800', oklch: 'oklch(0.394 0.105 257)', hex: '#1c457d' },
  { name: '900', oklch: 'oklch(0.318 0.078 259)', hex: '#183259' },
]

/**
 * The "Girl" ramp is an **orchid** (violet-pink), hue band 338–342 — not the
 * crimson it started as. It was retuned so the two palettes read as siblings
 * rather than as "the safe one and the alarming one": crimson at 600 sat only
 * ~20° from `--destructive`, so a primary button and a delete button were the
 * same colour family. Hexes below are the rasterized sRGB of the oklch beside
 * them (verified in-browser, not hand-converted); 100 / 600 / 700 are exactly
 * the `--accent` / `--primary` / `--accent-foreground` values in
 * `src/index.css`, which is what keeps this table honest.
 */
const redRamp: ColorStep[] = [
  { name: '50', oklch: 'oklch(0.974 0.012 338)', hex: '#fcf3f9' },
  { name: '100', oklch: 'oklch(0.95 0.03 338)', hex: '#fde7f6' },
  { name: '200', oklch: 'oklch(0.9 0.055 338)', hex: '#f7d1eb' },
  { name: '300', oklch: 'oklch(0.83 0.085 339)', hex: '#edb2da' },
  { name: '400', oklch: 'oklch(0.735 0.125 341)', hex: '#de89c1' },
  { name: '500', oklch: 'oklch(0.645 0.155 340)', hex: '#c963ab' },
  { name: '600', oklch: 'oklch(0.56 0.17 340)', hex: '#b24393' },
  { name: '700', oklch: 'oklch(0.49 0.165 342)', hex: '#9a2e7a' },
  { name: '800', oklch: 'oklch(0.41 0.14 342)', hex: '#79215f' },
  { name: '900', oklch: 'oklch(0.34 0.1 340)', hex: '#581f48' },
]

export const palettes: Record<PaletteId, Palette> = {
  blue: {
    id: 'blue',
    label: 'Boy',
    audience: 'soft blue',
    ramp: blueRamp,
    semantic: {
      light: {
        primary: 'oklch(0.550 0.150 253)',
        primaryForeground: 'oklch(0.985 0.008 250)',
        ring: 'oklch(0.550 0.150 253)',
        accent: 'oklch(0.938 0.030 250)',
        accentForeground: 'oklch(0.420 0.120 255)',
      },
      dark: {
        primary: 'oklch(0.720 0.110 248)',
        primaryForeground: 'oklch(0.220 0.050 255)',
        ring: 'oklch(0.720 0.110 248)',
        accent: 'oklch(0.300 0.050 255)',
        accentForeground: 'oklch(0.850 0.060 250)',
      },
    },
  },
  red: {
    id: 'red',
    label: 'Girl',
    audience: 'soft orchid',
    ramp: redRamp,
    semantic: {
      light: {
        primary: 'oklch(0.56 0.17 340)',
        primaryForeground: 'oklch(0.985 0.008 340)',
        ring: 'oklch(0.56 0.17 340)',
        accent: 'oklch(0.95 0.03 338)',
        accentForeground: 'oklch(0.49 0.165 342)',
      },
      dark: {
        primary: 'oklch(0.72 0.13 342)',
        primaryForeground: 'oklch(0.22 0.058 342)',
        ring: 'oklch(0.72 0.13 342)',
        accent: 'oklch(0.32 0.058 340)',
        accentForeground: 'oklch(0.88 0.05 340)',
      },
    },
  },
}

/**
 * WCAG AA (4.5:1) verified pairs for `primary-foreground` on `primary`.
 *
 * Measured, not estimated: each ratio is the WCAG 2.x relative-luminance
 * computation over the *rasterized sRGB* of the two oklch values above. The
 * previous table was optimistic on both palettes (it claimed 5.89 for blue
 * light and 5.66 for red light, against real figures of 4.70 and 4.88) — a
 * contrast table that flatters itself is worse than no table, because it stops
 * anyone re-checking. Re-measure whenever a palette moves.
 */
export const contrastReport: Array<{
  palette: PaletteId
  theme: ThemeMode
  ratio: number
  level: 'AA' | 'AAA'
}> = [
  { palette: 'blue', theme: 'light', ratio: 4.7, level: 'AA' },
  { palette: 'blue', theme: 'dark', ratio: 7.01, level: 'AAA' },
  { palette: 'red', theme: 'light', ratio: 4.88, level: 'AA' },
  { palette: 'red', theme: 'dark', ratio: 6.67, level: 'AAA' },
]

/**
 * Semantic shadcn tokens surfaced in the docs with live values. `var` is the
 * CSS custom property the docs read at runtime (so switching theme/palette
 * updates the displayed value live).
 */
export interface SemanticTokenDoc {
  name: string
  cssVar: string
  description: string
}

export const semanticTokens: SemanticTokenDoc[] = [
  { name: 'background', cssVar: '--background', description: 'App canvas behind everything.' },
  { name: 'foreground', cssVar: '--foreground', description: 'Default body text/icon color.' },
  { name: 'card', cssVar: '--card', description: 'Opaque content surface (never glass).' },
  { name: 'card-foreground', cssVar: '--card-foreground', description: 'Text on cards.' },
  { name: 'primary', cssVar: '--primary', description: 'Active accent fill (per palette).' },
  { name: 'primary-foreground', cssVar: '--primary-foreground', description: 'Text on primary. AA verified.' },
  { name: 'accent', cssVar: '--accent', description: 'Low-emphasis tinted surface.' },
  { name: 'accent-foreground', cssVar: '--accent-foreground', description: 'Text on accent.' },
  { name: 'muted', cssVar: '--muted', description: 'Neutral quiet surface.' },
  { name: 'muted-foreground', cssVar: '--muted-foreground', description: 'Secondary text.' },
  { name: 'border', cssVar: '--border', description: 'Hairline separators / control borders.' },
  { name: 'ring', cssVar: '--ring', description: 'Focus ring (matches primary).' },
]

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

export interface FontFamilyToken {
  role: string
  stack: string
  note: string
}

export const fontFamilies: FontFamilyToken[] = [
  {
    role: 'Sans / UI',
    stack: "'Comfortaa Variable', ui-rounded, system-ui, sans-serif",
    note: 'Primary UI + body. Rounded, friendly; full Greek + Latin coverage.',
  },
  {
    role: 'Heading',
    stack: "'Comfortaa Variable', ui-rounded, system-ui, sans-serif",
    note: 'Shares the Comfortaa family; separated by weight + tracking.',
  },
]

export interface TypeStep {
  name: string
  /** rem size. */
  size: string
  /** px equivalent for reference. */
  px: number
  weight: number
  lineHeight: string
  /** letter-spacing */
  tracking: string
  sample: string
}

export const typeScale: TypeStep[] = [
  { name: 'Display', size: '3.5rem', px: 56, weight: 620, lineHeight: '1.02', tracking: '-0.03em', sample: 'Liquid Glass' },
  { name: 'H1', size: '2.5rem', px: 40, weight: 600, lineHeight: '1.08', tracking: '-0.025em', sample: 'Adaptive material' },
  { name: 'H2', size: '1.75rem', px: 28, weight: 600, lineHeight: '1.15', tracking: '-0.02em', sample: 'Highlight, shadow, glow' },
  { name: 'H3', size: '1.25rem', px: 20, weight: 600, lineHeight: '1.25', tracking: '-0.01em', sample: 'Lensing over content' },
  { name: 'Body Large', size: '1.125rem', px: 18, weight: 400, lineHeight: '1.6', tracking: '0', sample: 'Glass bends and concentrates light.' },
  { name: 'Body', size: '1rem', px: 16, weight: 400, lineHeight: '1.6', tracking: '0', sample: 'The default reading size for prose.' },
  { name: 'Small', size: '0.875rem', px: 14, weight: 400, lineHeight: '1.5', tracking: '0', sample: 'Supporting copy and captions.' },
  { name: 'Caption', size: '0.75rem', px: 12, weight: 500, lineHeight: '1.4', tracking: '0.01em', sample: 'LABELS · META · 12PX' },
]

export const weights: Array<{ name: string; value: number }> = [
  { name: 'Regular', value: 400 },
  { name: 'Medium', value: 500 },
  { name: 'Semibold', value: 600 },
  { name: 'Bold', value: 700 },
]

/* -------------------------------------------------------------------------- */
/* Spacing                                                                    */
/* -------------------------------------------------------------------------- */

export interface SpaceStep {
  name: string
  rem: string
  px: number
}

/** 4px base grid. */
export const spacingScale: SpaceStep[] = [
  { name: '1', rem: '0.25rem', px: 4 },
  { name: '2', rem: '0.5rem', px: 8 },
  { name: '3', rem: '0.75rem', px: 12 },
  { name: '4', rem: '1rem', px: 16 },
  { name: '6', rem: '1.5rem', px: 24 },
  { name: '8', rem: '2rem', px: 32 },
  { name: '12', rem: '3rem', px: 48 },
  { name: '16', rem: '4rem', px: 64 },
]

/* -------------------------------------------------------------------------- */
/* Radius                                                                     */
/* -------------------------------------------------------------------------- */

export interface RadiusStep {
  name: string
  cssVar: string
  px: number
}

/** Base `--radius` is 0.625rem (10px); scale mirrors index.css @theme. */
export const radiusScale: RadiusStep[] = [
  { name: 'sm', cssVar: '--radius-sm', px: 6 },
  { name: 'md', cssVar: '--radius-md', px: 8 },
  { name: 'lg', cssVar: '--radius-lg', px: 10 },
  { name: 'xl', cssVar: '--radius-xl', px: 14 },
  { name: '2xl', cssVar: '--radius-2xl', px: 18 },
  { name: '3xl', cssVar: '--radius-3xl', px: 22 },
  { name: 'full', cssVar: '9999px', px: 9999 },
]

/* -------------------------------------------------------------------------- */
/* Material — blur / saturation / tint (the Liquid Glass recipe)              */
/* -------------------------------------------------------------------------- */

export interface MaterialToken {
  variant: 'regular' | 'clear'
  label: string
  usage: string
  /** backdrop-filter blur radius (px). */
  blur: number
  /** backdrop-filter saturation (%). Lensing: concentrate color from behind. */
  saturate: number
  /** Interior tint opacity, light theme (0–1). */
  tintLight: number
  /** Interior tint opacity, dark theme (0–1). */
  tintDark: number
}

export const materials: MaterialToken[] = [
  {
    variant: 'regular',
    label: 'Regular',
    usage: 'Default. Adaptive + legible over any content. Use everywhere in the control layer.',
    blur: 20,
    saturate: 180,
    tintLight: 0.55,
    tintDark: 0.44,
  },
  {
    variant: 'clear',
    label: 'Clear',
    usage: 'More transparent. Only over bright, media-rich content. Needs a dimming scrim if legibility drops.',
    blur: 14,
    saturate: 150,
    tintLight: 0.24,
    tintDark: 0.22,
  },
]

/* -------------------------------------------------------------------------- */
/* Elevation / shadow                                                         */
/* -------------------------------------------------------------------------- */

export interface ElevationToken {
  name: string
  level: number
  css: string
  usage: string
}

export const elevations: ElevationToken[] = [
  {
    name: 'Flat',
    level: 0,
    css: 'none',
    usage: 'Content sitting directly on the canvas.',
  },
  {
    name: 'Raised',
    level: 1,
    css: '0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.06)',
    usage: 'Cards and quiet surfaces.',
  },
  {
    name: 'Floating',
    level: 2,
    css: '0 8px 24px rgb(0 0 0 / 0.12), 0 2px 6px rgb(0 0 0 / 0.08)',
    usage: 'Glass nav bars and toolbars — the control layer.',
  },
  {
    name: 'Overlay',
    level: 3,
    css: '0 16px 48px rgb(0 0 0 / 0.20), 0 4px 12px rgb(0 0 0 / 0.12)',
    usage: 'Popovers, menus, floating capsules on scroll.',
  },
]
