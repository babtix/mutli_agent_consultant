import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agents", icon: Bot, label: "Agents" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-screen glass-strong border-r border-[var(--color-border)] shrink-0 overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[var(--color-primary)] to-transparent opacity-5 pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-4 px-6 h-20 border-b border-[var(--color-border)] shrink-0 relative z-10">
        <motion.div
          animate={{ scale: collapsed ? 1.1 : 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl blur-lg opacity-60" />
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col"
            >
              <span className="font-bold text-base gradient-text">Multi-IA</span>
              <span className="text-xs text-[var(--color-subtle)]">AI Consultant</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 p-4 flex-1 mt-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                isActive
                  ? "bg-gradient-to-r from-[var(--color-primary-muted)] to-transparent text-[var(--color-primary)] shadow-lg"
                  : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]",
                collapsed && "justify-center"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-[var(--color-border)] space-y-2">
        <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl glass", collapsed && "justify-center px-0")}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full blur-md opacity-60" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {user?.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col min-w-0 flex-1"
              >
                <span className="text-sm font-semibold text-[var(--color-foreground)] truncate">{user?.username}</span>
                <span className="text-xs text-[var(--color-subtle)]">{user?.is_admin ? "Admin" : "User"}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-muted-foreground)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--color-destructive)] transition-all duration-300",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={20} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-4 top-24 z-20 flex items-center justify-center w-8 h-8 rounded-full glass border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)] transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  )
}
