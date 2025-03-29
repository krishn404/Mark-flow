import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-white hover:bg-purple-700 purple-glow transition-all duration-300",
        secondary: "bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm border border-white/10",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
      },
      size: {
        default: "h-14 px-8 py-2",
        sm: "h-10 px-4",
        lg: "h-16 px-10 text-lg",
        icon: "h-14 w-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
