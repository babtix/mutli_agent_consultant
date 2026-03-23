import { forwardRef } from "react"
import { cn } from "@/lib/utils"

export const Input = forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-sm font-medium text-[var(--color-muted-foreground)]">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-subtle)]">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-[var(--radius-md)] glass border border-[var(--color-border)] px-4 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-subtle)] transition-all duration-300",
          "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-muted)] focus:shadow-lg",
          "hover:border-[var(--color-border)]",
          error && "border-[var(--color-destructive)] focus:border-[var(--color-destructive)] focus:ring-[rgba(239,68,68,0.2)]",
          Icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-[var(--color-destructive)] flex items-center gap-1.5">{error}</p>}
  </div>
))
Input.displayName = "Input"
