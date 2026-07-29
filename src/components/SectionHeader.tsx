import { cn } from '@/lib/utils'

interface Props {
  title: string
  /** Escape hatch for the trailing margin — `PageFrame` drops it (`mb-0`)
   *  because its own flex gap already spaces the header from the first block. */
  className?: string
}

/**
 * The page title and its description — one `h1`, one size, on every route.
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
 * The title is `text-2xl` (24px) below `sm` and `text-3xl` (30px) from `sm` up —
 * a step down from the old 36px, because the title now shares its line with the
 * live readings in `HeaderStatus` and a 36px title left them nowhere to sit.
 *
 * **There is no subheading any more.** Every route used to pass a one-line
 * description under its title, and every one of them restated the title or the
 * content directly beneath it ("Your Day" / "The whole day at a glance…"). Two
 * lines of orientation copy per page bought nothing and pushed the first card
 * down, so the header is now the title and the live readings beside it. Page
 * copy that is genuinely *content* belongs in the page, not in the frame.
 */
export function SectionHeader({ title, className }: Props) {
  return (
    // `leading-tight` on the heading: the default `leading-normal` on a 30px title
    // adds ~9px of invisible space under the baseline, which read as the header
    // band being loose no matter how small the flex gap got.
    <div className={cn('min-w-0 max-w-3xl', className)}>
      {/* `h1`: this is the page title on every route now that `PageFrame` owns the
          header — the sections that used to render their own heading no longer do,
          so an `h2` here left every page without an `h1`. */}
      <h1 className="font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
    </div>
  )
}
