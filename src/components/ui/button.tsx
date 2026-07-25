import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { controlSizes } from "@/components/ui/control-size"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Heights come from the one control scale in `control-size.ts` — a button
      // is exactly as tall as an `Input`, a `NumberInput` or a picker at the
      // same size, so a form row can never come out ragged. Only padding, gap
      // and type are the button's own. See that file for the rule.
      size: {
        default: `${controlSizes.md.height} gap-1.5 px-4 sm:px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`,
        /** The documented name for `default`. */
        md: `${controlSizes.md.height} gap-1.5 px-4 sm:px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`,
        sm: `${controlSizes.sm.height} gap-1 ${controlSizes.sm.radius} px-3.5 text-[0.8rem] sm:px-2.5 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5`,
        lg: `${controlSizes.lg.height} gap-1.5 px-5 sm:px-3.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2`,
        icon: controlSizes.md.square,
        "icon-sm": `${controlSizes.sm.square} ${controlSizes.sm.radius} in-data-[slot=button-group]:rounded-lg`,
        "icon-lg": controlSizes.lg.square,
        /** Off-scale, deliberately: a dense inline chip (a table cell's action,
         *  a caption-sized link). Never put one in a row beside a field. */
        xs: "h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-xs sm:h-6 sm:px-2 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        "icon-xs":
          "size-8 rounded-[min(var(--radius-md),10px)] sm:size-6 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
