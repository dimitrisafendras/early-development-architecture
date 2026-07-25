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
 */
function Input({
  className,
  type,
  size = "md",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: ControlSizeProp }) {
  const s = controlSize(size)

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 border border-input bg-transparent px-3 py-1 sm:px-2.5 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        s.height,
        s.radius,
        s.text,
        className
      )}
      {...props}
    />
  )
}

export { Input }
