import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-primary/15 bg-white/60 px-4 py-2 text-sm backdrop-blur-xl transition-all outline-none placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5",
        className
      )}
      {...props}
    />
  )
}

export { Input }
