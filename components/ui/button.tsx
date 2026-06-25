import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "btn-gradient text-white",
        outline:
          "border-primary/20 bg-white/60 text-foreground backdrop-blur-xl hover:bg-primary/8 hover:border-primary/30 dark:bg-white/5",
        secondary:
          "bg-primary/10 text-primary hover:bg-primary/15",
        ghost:
          "hover:bg-primary/8 hover:text-primary rounded-xl",
        destructive:
          "bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
        glass:
          "bg-white/60 text-foreground backdrop-blur-xl border border-white/50 shadow-sm hover:bg-white/80 hover:shadow-md dark:bg-white/5 dark:border-white/10",
      },
      size: {
        default: "h-10 gap-2 px-5",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-8 gap-1.5 px-4 text-[0.8rem]",
        lg: "h-12 gap-2 px-7 text-base",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full",
        "icon-lg": "size-12 rounded-full",
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
