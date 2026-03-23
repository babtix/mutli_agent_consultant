import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Sparkles, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/Toast"
import { Input } from "@/components/ui/Input"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast("Please fill in all fields", "error")
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      toast("Welcome back!", "success")
      navigate("/dashboard")
    } catch {
      toast("Invalid credentials", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[var(--color-primary)] opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--color-accent)] opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        {/* Card */}
        <div className="glass-strong rounded-[var(--radius-xl)] p-10 shadow-2xl border border-[var(--color-border)] relative overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-primary)] opacity-10 rounded-full blur-3xl" />
          
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 mb-10 relative z-10">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-[var(--radius-lg)] blur-xl opacity-60" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] shadow-2xl">
                <Sparkles size={28} className="text-white" />
              </div>
            </motion.div>
            <div className="text-center">
              <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
              <p className="text-sm text-[var(--color-muted-foreground)]">Sign in to continue to Multi-IA</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            <Input
              icon={Mail}
              placeholder="Username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <div className="relative">
              <Input
                icon={Lock}
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-subtle)] hover:text-[var(--color-foreground)] transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 h-12 w-full rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-primary-glow)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Don't have an account?{" "}
              <Link to="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--color-subtle)]">Powered by AI • Secured by Design</p>
        </div>
      </motion.div>
    </div>
  )
}
