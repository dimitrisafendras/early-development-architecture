import type { ComponentType } from 'react'
import { Milk, Utensils, Moon, ToyBrick, Baby, Bath, Sparkles } from 'lucide-react'
import type { DayActivity } from '../data'

/** Per-activity icon + soft theme-aware accent (dot background + text).
 *  Single source shared by the /full-day timeline and the /daily "what's now"
 *  card so the two views always render the same activity identically.
 *  `accent` is the same hue as a raw CSS colour, for the places that need to
 *  compute one (SVG strokes, gradient stops) rather than apply a class. */
export const dayActivityMeta: Record<
  DayActivity,
  { icon: ComponentType<{ className?: string }>; dot: string; text: string; bar: string; accent: string }
> = {
  feed: { icon: Milk, dot: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', text: 'text-sky-700 dark:text-sky-400', bar: 'bg-sky-500', accent: '#0ea5e9' },
  // Solid food from ~6 months: its own hue and a fork, because a toddler's three
  // meals a day are not milk feeds and must not read as bottles on the timeline.
  meal: { icon: Utensils, dot: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', text: 'text-orange-700 dark:text-orange-400', bar: 'bg-orange-500', accent: '#f97316' },
  sleep: { icon: Moon, dot: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-700 dark:text-indigo-400', bar: 'bg-indigo-500', accent: '#6366f1' },
  play: { icon: ToyBrick, dot: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500', accent: '#f59e0b' },
  tummy: { icon: Baby, dot: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500', accent: '#10b981' },
  care: { icon: Bath, dot: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-700 dark:text-cyan-400', bar: 'bg-cyan-500', accent: '#06b6d4' },
  wind: { icon: Sparkles, dot: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-700 dark:text-fuchsia-400', bar: 'bg-fuchsia-500', accent: '#d946ef' },
}

export const dayActivityOrder: DayActivity[] = ['feed', 'meal', 'sleep', 'play', 'tummy', 'care', 'wind']
