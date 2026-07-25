import * as React from 'react'
import { cn } from '@/lib/utils'
import '@/design-system/ds.css'

export interface GlassScrollAreaHandle {
  /** Smooth- (or instantly-) scroll a descendant element to the vertical centre. */
  centerChild: (el: HTMLElement | null, behavior?: ScrollBehavior) => void
  /** The scrolling viewport node — e.g. to use as an IntersectionObserver root. */
  getViewport: () => HTMLDivElement | null
}

export interface GlassScrollAreaProps {
  children: React.ReactNode
  /**
   * Optional inline cap on the viewport height (any CSS length). When omitted the
   * area fills its parent's height (it's a flex column that grows to fill), so a
   * flex/height-constrained parent drives the size. Use responsive `max-h-*`
   * utility classes via `className` if you need a breakpoint-specific cap.
   */
  maxHeight?: number | string
  /** Depth of the top/bottom fade, in px. */
  fade?: number
  className?: string
  /** Floating control rendered over the bottom-centre of the viewport (unmasked),
   *  e.g. a "recenter" button. */
  overlay?: React.ReactNode
}

/**
 * A scroll viewport on the Liquid Glass system: content dissolves into a soft
 * fade at whichever edge has more to reveal, the scrollbar is a frosted sliver
 * that only surfaces while scrolling or on hover, and an optional floating
 * control (e.g. "jump to now") can hover over the content without being faded.
 *
 * The fades are `mask-image` on the viewport itself, so they work over any
 * background and never need a matching solid colour.
 */
export const GlassScrollArea = React.forwardRef<GlassScrollAreaHandle, GlassScrollAreaProps>(
  function GlassScrollArea({ children, maxHeight, fade = 28, className, overlay }, ref) {
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const idleTimer = React.useRef<number | undefined>(undefined)
    const [edges, setEdges] = React.useState({ top: false, bottom: false })

    const measure = React.useCallback(() => {
      const c = viewportRef.current
      if (!c) return
      setEdges({
        top: c.scrollTop > 2,
        bottom: c.scrollTop + c.clientHeight < c.scrollHeight - 2,
      })
    }, [])

    React.useImperativeHandle(
      ref,
      () => ({
        getViewport: () => viewportRef.current,
        centerChild: (el, behavior = 'smooth') => {
          const c = viewportRef.current
          if (!c || !el) return
          // A beat lets item heights settle (web fonts, layout) before measuring.
          window.setTimeout(() => {
            const cRect = c.getBoundingClientRect()
            const eRect = el.getBoundingClientRect()
            const target = c.scrollTop + (eRect.top - cRect.top) - (c.clientHeight - el.clientHeight) / 2
            c.scrollTo({
              top: Math.max(0, Math.min(target, c.scrollHeight - c.clientHeight)),
              behavior,
            })
          }, 60)
        },
      }),
      [],
    )

    // Keep the fades in sync with scroll position and any content/size change.
    React.useEffect(() => {
      const c = viewportRef.current
      if (!c) return
      measure()
      const ro = new ResizeObserver(measure)
      ro.observe(c)
      Array.from(c.children).forEach((child) => ro.observe(child))
      return () => ro.disconnect()
    }, [measure])

    const onScroll = () => {
      measure()
      const c = viewportRef.current
      if (!c) return
      c.classList.add('is-scrolling')
      window.clearTimeout(idleTimer.current)
      idleTimer.current = window.setTimeout(() => c.classList.remove('is-scrolling'), 900)
    }

    const maskTop = edges.top ? 'transparent' : '#000'
    const maskBottom = edges.bottom ? 'transparent' : '#000'
    const mask = `linear-gradient(to bottom, ${maskTop} 0, #000 ${fade}px, #000 calc(100% - ${fade}px), ${maskBottom} 100%)`

    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={viewportRef}
          onScroll={onScroll}
          className={cn('ds-scroll-glass min-h-0 flex-1 overflow-y-auto', className)}
          style={{ maxHeight, WebkitMaskImage: mask, maskImage: mask }}
        >
          {children}
        </div>
        {overlay && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2">
            {overlay}
          </div>
        )}
      </div>
    )
  },
)
