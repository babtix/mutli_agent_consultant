import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Bot, MessageSquare, Zap, ArrowRight, TrendingUp, Activity } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/axiosClient"
import { Skeleton } from "@/components/ui/Skeleton"

export function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get("/agents/"), api.get("/conversations/")])
      .then(([a, c]) => setStats({ agents: a.data.length, conversations: c.data.length }))
      .catch(() => setStats({ agents: 0, conversations: 0 }))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    {
      label: "AI Agents",
      value: stats?.agents ?? 0,
      icon: Bot,
      gradient: "from-[#6366f1] to-[#a855f7]",
      to: "/agents",
      description: "Active agents",
    },
    {
      label: "Conversations",
      value: stats?.conversations ?? 0,
      icon: MessageSquare,
      gradient: "from-[#06b6d4] to-[#6366f1]",
      to: "/chat",
      description: "Total chats",
    },
  ]

  const quickActions = [
    {
      title: "Create an Agent",
      description: "Configure a custom AI persona with system prompts",
      icon: Bot,
      to: "/agents",
      color: "primary",
    },
    {
      title: "Start Chatting",
      description: "Begin a conversation with your AI agents",
      icon: MessageSquare,
      to: "/chat",
      color: "accent",
    },
  ]

  return (
    <div className="min-h-screen p-8 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              Dashboard
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-2">
            Welcome back, <span className="gradient-text">{user?.username}</span>
          </h1>
          <p className="text-[var(--color-muted-foreground)]">
            Your AI workspace is ready to assist you
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {cards.map(({ label, value, icon: Icon, gradient, to, description }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                to={to}
                className="group block relative overflow-hidden rounded-[var(--radius-xl)] glass-strong border border-[var(--color-border)] p-8 transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-2xl hover:-translate-y-1"
              >
                {/* Gradient overlay */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    <ArrowRight size={24} className="text-[var(--color-subtle)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">{label}</p>
                    {loading ? (
                      <Skeleton className="h-12 w-24" />
                    ) : (
                      <p className="text-5xl font-bold text-[var(--color-foreground)]">{value}</p>
                    )}
                    <p className="text-sm text-[var(--color-subtle)]">{description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-strong rounded-[var(--radius-xl)] border border-[var(--color-border)] p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity size={24} className="text-[var(--color-primary)]" />
            <h2 className="text-xl font-bold text-[var(--color-foreground)]">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map(({ title, description, icon: Icon, to, color }, i) => (
              <Link
                key={title}
                to={to}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] glass border border-[var(--color-border)] p-6 transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color === 'primary' ? 'bg-[var(--color-primary-muted)]' : 'bg-[var(--color-accent-muted)]'} shrink-0`}>
                    <Icon size={24} className={color === 'primary' ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent)]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{description}</p>
                  </div>
                  <ArrowRight size={20} className="text-[var(--color-subtle)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Activity indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-sm text-[var(--color-subtle)]"
        >
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
          <span>All systems operational</span>
        </motion.div>
      </div>
    </div>
  )
}
