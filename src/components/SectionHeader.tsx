import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  /** Escape hatch for the trailing margin — `PageFrame` drops it (`mb-0`)
   *  because its own flex gap already spaces the header from the first block. */
  className?: string
}

/**
 * The page header: one `h1` and one description, at one size, on every route.
 *
 * **One code path, two breakpoints — not two variants.** There used to be a
 * `compact` prop, and exactly one caller (the Day dashboard) passed it. It
 * existed for a real reason: on a phone the full-size header ate the top third
 * of the screen. But as an opt-in it meant the app's landing page rendered its
 * `h1` at `text-2xl` with no description while all nine other routes rendered
 * `text-3xl` with one — so the title *changed size* and the first card *changed
 * Y* as you navigated, which is the exact cross-route jump `PageFrame` exists to
 * eliminate, reintroduced one level down.
 *
 * The fix is to make the compact treatment the **mobile default everywhere**:
 *
 * - title `text-2xl` (24px) below `sm`, `text-4xl` (36px) from `sm` up
 * - description hidden below `sm`, `text-base` with `mt-4` from `sm` up
 *
 * Every route is now identical at every width *and* the phone keeps its vertical
 * space. The one real cost is the hidden description on phones — see the note
 * below on why that is the right side of the trade.
 *
 * **Why hide rather than shrink the description.** At 390px the description is
 * 2–3 wrapped lines of 14px text. Keeping it costs ~56px, which on the Day
 * dashboard is most of a schedule row — and every description in this app
 * restates what the title and the content immediately below it already say
 * ("Your Day" / "The whole day at a glance…"). It is orientation copy for a
 * first visit on a wide screen, not a load-bearing instruction, so it earns its
 * space from `sm` up and not below it.
 */
export function SectionHeader({ title, description, className }: Props) {
  return (
    <div className={cn('mb-4 max-w-3xl sm:mb-8', className)}>
      {/* `h1`: this is the page title on every route now that `PageFrame` owns the
          header — the sections that used to render their own heading no longer do,
          so an `h2` here left every page without an `h1`. */}
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="hidden leading-relaxed text-muted-foreground sm:mt-4 sm:block sm:text-base">
        {description}
      </p>
    </div>
  )
}
