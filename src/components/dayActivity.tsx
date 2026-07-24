import type { ComponentType } from 'react'
import { Milk, Moon, ToyBrick, Baby, Bath, Sparkles } from 'lucide-react'
import type { DayActivity } from '../data'

/** Per-activity icon + soft theme-aware accent (dot background + text).
 *  Single source shared by the /full-day timeline and the /daily "what's now"
 *  card so the two views always render the same activity identically. */
export const dayActivityMeta: Record<
  DayActivity,
  { icon: ComponentType<{ className?: string }>; dot: string; text: string; bar: string }
> = {
  feed: { icon: Milk, dot: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', text: 'text-sky-700 dark:text-sky-400', bar: 'bg-sky-500' },
  sleep: { icon: Moon, dot: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400', text: 'text-indigo-700 dark:text-indigo-400', bar: 'bg-indigo-500' },
  play: { icon: ToyBrick, dot: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', text: 'text-amber-700 dark:text-amber-400', bar: 'bg-amber-500' },
  tummy: { icon: Baby, dot: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-700 dark:text-emerald-400', bar: 'bg-emerald-500' },
  care: { icon: Bath, dot: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-700 dark:text-cyan-400', bar: 'bg-cyan-500' },
  wind: { icon: Sparkles, dot: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', text: 'text-fuchsia-700 dark:text-fuchsia-400', bar: 'bg-fuchsia-500' },
}

export const dayActivityOrder: DayActivity[] = ['feed', 'sleep', 'play', 'tummy', 'care', 'wind']
