import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--color-muted-foreground)]">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children ? <>{children}</> : <Outlet />
}
