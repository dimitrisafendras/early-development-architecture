import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Drag-to-reorder for a vertical list, on pointer events.
 *
 * **Why not the HTML5 drag API.** `dragstart`/`dragover` never fire for touch,
 * and this app is used one-handed on a phone while holding a baby — a reorder
 * that only works with a mouse is a reorder that does not work. Pointer events
 * cover touch, mouse and pen through one code path.
 *
 * **Why no library.** dnd-kit would bring keyboard dragging and collision
 * strategies for ~40KB; this list needs neither. The rows keep their ↑/↓
 * buttons, which are the accessible path anyway — dragging is unreachable by
 * keyboard and meaningless to a screen reader, so the buttons are not a
 * leftover to be deleted once this exists. They are the reason this can stay
 * this small.
 *
 * The list is not reordered while the pointer moves. Instead the hook reports
 * `draggingIndex` and `overIndex` and the caller shifts the rows visually;
 * committing once on release keeps `onReorder` to a single state update, and
 * means an abandoned drag costs nothing.
 */

export interface SortableState {
  /** Index being dragged, or `null` when idle. */
  draggingIndex: number | null
  /** Index the dragged row would land on. */
  overIndex: number | null
  /** Pixels the dragged row has travelled, for its transform. */
  offsetY: number
  /** Attach to each row's grip: `onPointerDown={start(index)}`. */
  start: (index: number) => (event: React.PointerEvent) => void
  /** Register a row element so the hook can measure it. */
  register: (index: number) => (el: HTMLElement | null) => void
}

export function useSortableList(count: number, onReorder: (from: number, to: number) => void): SortableState {
  const rows = useRef<(HTMLElement | null)[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)
  const [offsetY, setOffsetY] = useState(0)
  // Read inside the window listeners, which are bound once per drag.
  const startY = useRef(0)
  const dragging = useRef<number | null>(null)
  const over = useRef<number | null>(null)

  const register = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      rows.current[index] = el
    },
    [],
  )

  const start = useCallback(
    (index: number) => (event: React.PointerEvent) => {
      // Left button / primary contact only — a right-click or a second finger
      // must not start a drag.
      if (event.button !== 0) return
      event.preventDefault()
      dragging.current = index
      over.current = index
      startY.current = event.clientY
      setDraggingIndex(index)
      setOverIndex(index)
      setOffsetY(0)
    },
    [],
  )

  useEffect(() => {
    if (draggingIndex === null) return

    const onMove = (event: PointerEvent) => {
      const from = dragging.current
      if (from === null) return
      const dy = event.clientY - startY.current
      setOffsetY(dy)

      // Land on whichever row's midpoint the pointer is currently past. Measured
      // live rather than cached: the rows are cards whose height changes when a
      // title wraps, so a cached table would drift mid-drag.
      let target = from
      for (let i = 0; i < count; i++) {
        const el = rows.current[i]
        if (!el || i === from) continue
        const box = el.getBoundingClientRect()
        const mid = box.top + box.height / 2
        if (i < from && event.clientY < mid) { target = Math.min(target, i); }
        if (i > from && event.clientY > mid) { target = Math.max(target, i); }
      }
      if (target !== over.current) {
        over.current = target
        setOverIndex(target)
      }
    }

    const onUp = () => {
      const from = dragging.current
      const to = over.current
      dragging.current = null
      over.current = null
      setDraggingIndex(null)
      setOverIndex(null)
      setOffsetY(0)
      if (from !== null && to !== null && from !== to) onReorder(from, to)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    // A cancelled pointer (a system gesture, a call arriving) must not leave the
    // list stuck mid-drag.
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [draggingIndex, count, onReorder])

  return { draggingIndex, overIndex, offsetY, start, register }
}

/** Moves one item, returning a new array. */
export function reorder<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
