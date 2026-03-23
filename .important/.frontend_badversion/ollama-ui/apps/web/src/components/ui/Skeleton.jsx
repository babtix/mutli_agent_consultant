import { cn } from "@/lib/utils"

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-3)]",
        className
      )}
    />
  )
}

export function AgentCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  )
}

export function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-1 px-2">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-full rounded-[var(--radius-md)]" />
      ))}
    </div>
  )
}
