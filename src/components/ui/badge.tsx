import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Two deliberate deviations from the stock shadcn badge, both made so that the
 * app's own pills could finally *use* this component instead of re-typing it:
 *
 * - `rounded-full`, not `rounded-4xl`. `--radius-4xl` is 1.625rem (26px), so a
 *   badge was a stadium only up to 26px tall and started showing corners above
 *   it. Every hand-rolled pill in the app used `rounded-full`, which is a good
 *   part of why none of them adopted this component.
 * - a `size` scale. The stock badge is `h-5` / `px-2` / `font-medium`, markedly
 *   smaller and lighter than the ~26px `px-3 py-1 font-semibold` pills the app
 *   actually shows, so adopting it would have *shrunk* seven visible chips.
 *   `size="default"` is now that 26px pill; `size="sm"` is the stock one.
 *
 * The `soft` variant is the app's most common pill: a tinted primary wash with
 * primary text, which re-tints with the blue/orchid palette axis for free.
 */
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        soft: "bg-primary/10 text-primary [a]:hover:bg-primary/15",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-5 gap-1 px-2 py-0.5 text-xs font-medium [&>svg]:size-3!",
        default: "h-6.5 px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, size }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
