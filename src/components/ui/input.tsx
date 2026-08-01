import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"
import { controlSize, type ControlSizeProp } from "@/components/ui/control-size"

/**
 * A single-line text field.
 *
 * Height, radius and type scale come from the one control scale
 * (`control-size.ts`), so an `Input` is exactly as tall as the `Button`,
 * `NumberInput` or picker beside it at the same size. Give every control in a
 * row the same `size`.
 *
 * `bare` drops the field's own border, radius and focus ring so it can sit
 * *inside* another bordered shell — an input group, where a select or a button
 * is welded to the text field and the group draws the one border and takes the
 * one focus ring (see `ActivityField`). It keeps the height and type scale, so
 * the text still lands on the shared baseline. Use it only inside such a
 * shell: a `bare` Input on its own is an invisible field.
 */
function Input({
  className,
  type,
  size = "md",
  bare = false,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  size?: ControlSizeProp
  bare?: boolean
}) {
  const s = controlSize(size)

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 bg-transparent px-3 py-1 sm:px-2.5 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        bare
          ? "border-0"
          : "border border-input focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        s.height,
        !bare && s.radius,
        s.text,
        className
      )}
      {...props}
    />
  )
}

export { Input }
