import { forwardRef } from "react"
import { cva } from "class-variance-authority"
import { cn } from "../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white hover:shadow-lg hover:shadow-[var(--color-primary-glow)] hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "glass border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] hover:shadow-md",
        ghost:
          "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]",
        destructive:
          "bg-[var(--color-destructive)] text-white hover:bg-[var(--color-destructive-hover)] hover:shadow-lg hover:shadow-[rgba(239,68,68,0.3)]",
        outline:
          "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)] hover:shadow-lg",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = forwardRef(({ className, variant, size, children, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === "default" && (
        <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
