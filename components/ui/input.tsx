import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-14 w-full rounded-2xl px-6 text-base text-white input-background",
          "border border-white/5 search-glow",
          "placeholder:text-white/30",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/20",
          "transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
