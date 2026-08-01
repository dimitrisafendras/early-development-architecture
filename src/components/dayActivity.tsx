import type { ComponentType } from 'react'
import { Milk, Utensils, Moon, ToyBrick, Baby, Bath, Sparkles, Footprints } from 'lucide-react'
import type { DayActivity } from '../data'
import type { Messages } from '../i18n'

/**
 * Everything the app knows about one kind of moment, in one record.
 *
 * Shared by the /full-day timeline, the /daily "what's now" card, the
 * `/schedule` editor and its preset palette, so the four always render — and
 * link — the same activity identically. Three association fields make that
 * literal rather than a convention each surface re-derives:
 *
 *   `wiki` — the Wiki topic that explains this activity. Lived as a private
 *            `typeWiki` table inside `Day.tsx`, invisible to everything else.
 *   `tool` — the widget page that *logs* it, or `null` when nothing does. This
 *            is what makes the day and the trackers one product: a feed on the
 *            schedule can hand you the feed logger, and a tummy slot the timer,
 *            without each surface hard-coding the route.
 *   `accent` — the hue as a raw CSS colour, for the places that must compute one
 *            (SVG strokes, gradient stops) rather than apply a class.
 *
 * **The eight hues are chosen for separation, not taste.** These are the one
 * place the app uses raw Tailwind palette classes rather than shadcn tokens
 * (see the colour rule in CLAUDE.md): an activity's colour is a fixed meaning,
 * so it must NOT re-tint with the blue/pink palette — sleep is indigo whichever
 * child the app is set up for.
 *
 * Because they are often told apart by hue alone — in the `/schedule` picker
 * they are eight identical glyphs in a menu, and on the timeline eight small
 * dots — adjacent hues are a bug. The set was chosen by searching every
 * 8-subset of the Tailwind families for the largest minimum pairwise OKLCH hue
 * gap **at the steps this app actually paints** — 400 in the dark theme, 700 in
 * the light one — while staying as clear as possible of the hues that already
 * mean something else (`--destructive`, and the two palette primaries).
 *
 * Measuring the 500 ramp instead, as the first version of this search did, is
 * wrong by up to 20°: `pink` is 354° at 500 but 349.8° at 400 and 4.0° at 700.
 * In hue order at the 400 step:
 *
 *     meal    56°  orange     play   92°  yellow    tummy 129°  lime
 *     care   182°  teal       feed  212°  cyan      sleep 277°  indigo
 *     wind   322°  fuchsia    active 350°  pink
 *
 * **Minimum pairwise gap 27.6°**, between `wind` and `active` at the 400 step —
 * and that is the ceiling, not a compromise: no other 8-subset of the palette
 * does better once both painted steps are counted. Eight hues will not fit a
 * circle that also has to avoid red, the blue primary and the pink primary.
 * `active` lands nearest the red palette's primary; an activity always carries
 * its icon and is never drawn as a filled primary-style control, so the two do
 * not get confused in practice.
 *
 * `care` was cyan and sat 22° from `feed`'s sky — indistinguishable at the size
 * the picker draws them. Opening that gap moved `tummy`, `play` and, when
 * `active` was added, `feed` too. If you add a ninth activity, re-run that
 * search rather than eyeballing a hue that looks free.
 */
export const dayActivityMeta: Record<
  DayActivity,
  {
    icon: ComponentType<{ className?: string }>
    dot: string
    text: string
    bar: string
    accent: string
    /** Wiki topic slug explaining this activity. */
    wiki: string
    /** The widget page that logs it, or `null` when nothing does. */
    tool: { to: string; label: (t: Messages) => string } | null
  }
> = {
  feed: { icon: Milk, dot: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-700 dark:text-cyan-400', bar: 'bg-cyan-500', accent: '#06b6d4', wiki: 'feeding', tool: { to: '/feed', label: (t) => t.nav.feed } },
  // Solid food from ~6 months: its own hue and a fork, because a toddler's three
  // meals a day are not milk feeds and must not read as bottles on the timeline.
  // Still logged in the feed log — it takes a `solid` method.
  meal: { icon: Utensils, dot: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', text: 'text-orange-700 dark:text-orange-400', bar: 'bg-orange-500', accent: '#f97316', wiki: 'feeding', tool: { to: '/feed', label: (t) => t.nav.feed } },
  sleep: { icon: Moon, dot: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-700 dark:text-indigo-400', bar: 'bg-indigo-500', accent: '#6366f1', wiki: 'sleep', tool: null },
  play: { icon: ToyBrick, dot: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400', text: 'text-yellow-700 dark:text-yellow-400', bar: 'bg-yellow-500', accent: '#eab308', wiki: 'serve-return', tool: null },
  tummy: { icon: Baby, dot: 'bg-lime-500/15 text-lime-600 dark:text-lime-400', text: 'text-lime-700 dark:text-lime-400', bar: 'bg-lime-500', accent: '#84cc16', wiki: 'tummy-time', tool: { to: '/tracker', label: (t) => t.nav.tracker } },
  care: { icon: Bath, dot: 'bg-teal-500/15 text-teal-600 dark:text-teal-400', text: 'text-teal-700 dark:text-teal-400', bar: 'bg-teal-500', accent: '#14b8a6', wiki: 'bathing', tool: null },
  wind: { icon: Sparkles, dot: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-700 dark:text-fuchsia-400', bar: 'bg-fuchsia-500', accent: '#d946ef', wiki: 'soothing', tool: null },
  // Logged by the same timer as tummy time: past the first birthday `/tracker`
  // *is* the active-play tracker (see `activityTargetForAge`), so pointing this
  // at a second page would be inventing a tool the app doesn't have.
  active: { icon: Footprints, dot: 'bg-pink-500/15 text-pink-600 dark:text-pink-400', text: 'text-pink-700 dark:text-pink-400', bar: 'bg-pink-500', accent: '#ec4899', wiki: 'interaction-time', tool: { to: '/tracker', label: (t) => t.nav.tracker } },
}

export const dayActivityOrder: DayActivity[] = [
  'feed',
  'meal',
  'sleep',
  'play',
  'tummy',
  'active',
  'care',
  'wind',
]
