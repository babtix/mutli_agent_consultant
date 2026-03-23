import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { MessageSquare, Eye, EyeOff, ArrowRight, Sparkles, Lock, Zap, Brain } from "lucide-react"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      await login(username, password)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de la connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-chart-2/10 to-chart-3/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, oklch(0.437 0.078 188.216 / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.704 0.14 182.503 / 0.1) 0%, transparent 40%)",
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-xl shadow-primary/30">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Multi-IA Consultant</span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Votre plateforme
            <br />
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              d'IA multi-agents
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Consultez plusieurs agents IA spécialisés qui utilisent des modèles locaux via Ollama. Sécurisé, rapide, et entièrement sous votre contrôle.
          </p>

          <div className="mt-12 flex gap-6">
            {[
              { icon: Lock, label: "IA Locale" },
              { icon: Zap, label: "Temps réel" },
              { icon: Brain, label: "Multi-agents" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="w-5 h-5" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Multi-IA Consultant</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Bon retour <Sparkles className="w-6 h-6 text-primary" />
            </h2>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="login-username" className="text-sm font-medium">
                Nom d'utilisateur ou email
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="votre nom d'utilisateur"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-chart-2 text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
