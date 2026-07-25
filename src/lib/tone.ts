import type { ScheduleTone, StatusTone } from '../data'

/**
 * The one status/hue tone table for the Learn topic sections.
 *
 * **Why it exists.** The same idea — "render this hue softly, theme-aware" —
 * was spelled out six times across the sections (`Sleep`, `Interaction`,
 * `Environment`, `ServeReturn`, `Routine`, `LanguageMusic`), and the copies
 * disagreed: the light text shade was `-600` in three of them and `-700` in the
 * other three, and the dark shade was `-400` in five and `-300` in one. Two
 * neighbouring cards could therefore show the same "amber" at two different
 * lightnesses.
 *
 * These hues are the one place CLAUDE.md allows raw Tailwind palette classes:
 * they are semantically fixed (success / caution / danger, and the per-block
 * schedule identity), so they must *not* follow the blue/red palette axis. Every
 * other colour in a section still goes through the shadcn tokens.
 *
 * Each tone exposes the six roles the call sites actually need. The light shade
 * differs per role on purpose, and only for contrast:
 *
 * | slot   | value                          | role                                        |
 * |--------|--------------------------------|---------------------------------------------|
 * | `soft` | `bg-X-500/10`                  | tinted sub-panel behind normal text          |
 * | `text` | `text-X-700 dark:text-X-400`   | tone-coloured **text** — `-600` on white is 3.2–3.8:1 and fails AA, `-700` clears it |
 * | `icon` | `text-X-600 dark:text-X-400`   | a bare glyph (check, bullet, chip icon) — a non-text graphic needs 3:1, so the brighter `-600` is fine and is what most sections already used |
 * | `chip` | `soft` + `icon`                | the tint + icon colour of an `IconChip`      |
 * | `fill` | `bg-X-700 text-white`          | a solid tone fill. `-700` keeps white text at ≥4.7:1, and the foreground is bundled in because it must **not** flip with the theme: the fill is theme-fixed, and `--primary-foreground` inverts (near-white in light, near-black in dark) so `text-primary-foreground` would go dark-on-dark |
 * | `bar`  | `bg-X-500`                     | a meter/progress fill (a graphic, not text)  |
 *
 * Class strings are written out in full — Tailwind scans source text, so a
 * template-built `bg-${hue}-500/10` would simply never be generated.
 */
export interface Tone {
  /** Soft tinted surface for a sub-panel that carries normal text. */
  soft: string
  /** Tone-coloured text on an opaque surface (AA-safe: `-700` light, `-400` dark). */
  text: string
  /** Tone-coloured bare glyph — check marks, bullets, chip icons. */
  icon: string
  /** `soft` + `icon` — the tint of an `IconChip`. */
  chip: string
  /** Solid tone fill, foreground included (theme-fixed white). */
  fill: string
  /** Meter / progress-bar fill. */
  bar: string
}

const emerald: Tone = {
  soft: 'bg-emerald-500/10',
  text: 'text-emerald-700 dark:text-emerald-400',
  icon: 'text-emerald-600 dark:text-emerald-400',
  chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  fill: 'bg-emerald-700 text-white hover:bg-emerald-700',
  bar: 'bg-emerald-500',
}

const amber: Tone = {
  soft: 'bg-amber-500/10',
  text: 'text-amber-700 dark:text-amber-400',
  icon: 'text-amber-600 dark:text-amber-400',
  chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  fill: 'bg-amber-700 text-white hover:bg-amber-700',
  bar: 'bg-amber-500',
}

const rose: Tone = {
  soft: 'bg-rose-500/10',
  text: 'text-rose-700 dark:text-rose-400',
  icon: 'text-rose-600 dark:text-rose-400',
  chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  fill: 'bg-rose-700 text-white hover:bg-rose-700',
  bar: 'bg-rose-500',
}

const sky: Tone = {
  soft: 'bg-sky-500/10',
  text: 'text-sky-700 dark:text-sky-400',
  icon: 'text-sky-600 dark:text-sky-400',
  chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  fill: 'bg-sky-700 text-white hover:bg-sky-700',
  bar: 'bg-sky-500',
}

const cyan: Tone = {
  soft: 'bg-cyan-500/10',
  text: 'text-cyan-700 dark:text-cyan-400',
  icon: 'text-cyan-600 dark:text-cyan-400',
  chip: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  fill: 'bg-cyan-700 text-white hover:bg-cyan-700',
  bar: 'bg-cyan-500',
}

const fuchsia: Tone = {
  soft: 'bg-fuchsia-500/10',
  text: 'text-fuchsia-700 dark:text-fuchsia-400',
  icon: 'text-fuchsia-600 dark:text-fuchsia-400',
  chip: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  fill: 'bg-fuchsia-700 text-white hover:bg-fuchsia-700',
  bar: 'bg-fuchsia-500',
}

const indigo: Tone = {
  soft: 'bg-indigo-500/10',
  text: 'text-indigo-700 dark:text-indigo-400',
  icon: 'text-indigo-600 dark:text-indigo-400',
  chip: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  fill: 'bg-indigo-700 text-white hover:bg-indigo-700',
  bar: 'bg-indigo-500',
}

export type ToneHue = 'emerald' | 'amber' | 'rose' | 'sky' | 'cyan' | 'fuchsia' | 'indigo'

/** Every hue, by name — for the sections that pick a hue directly. */
export const tone: Record<ToneHue, Tone> = { emerald, amber, rose, sky, cyan, fuchsia, indigo }

/** The fixed status semantics: good / caution / harmful. */
export const statusTone: Record<StatusTone, Tone> = {
  success: emerald,
  warning: amber,
  danger: rose,
}

/** The per-block schedule identity hues (day rhythm, awake windows). */
export const scheduleTone: Record<ScheduleTone, Tone> = {
  amber,
  emerald,
  sky,
  cyan,
  fuchsia,
  indigo,
}
