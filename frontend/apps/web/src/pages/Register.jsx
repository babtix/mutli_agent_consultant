import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { MessageSquare, Eye, EyeOff, ArrowRight, UserPlus, CheckCircle, Sparkles } from "lucide-react"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères")
      return
    }

    setLoading(true)
    try {
      await register(email, username, password)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.detail || "Échec de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-2/10 via-primary/10 to-chart-3/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 80% 50%, oklch(0.437 0.078 188.216 / 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, oklch(0.704 0.14 182.503 / 0.1) 0%, transparent 40%)",
        }} />
        
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center shadow-xl shadow-chart-2/30">
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">Multi-IA Consultant</span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Rejoignez
            <br />
            <span className="bg-gradient-to-r from-chart-2 to-primary bg-clip-text text-transparent">
              notre plateforme
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            Créez votre compte et accédez immédiatement à nos agents IA spécialisés. Configuration simple, démarrage instantané.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Accès immédiat aux agents IA",
              "Historique de conversations sécurisé",
              "Export des conversations en PDF, MD, JSON",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-2 to-primary flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Multi-IA Consultant</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              Créer un compte <Sparkles className="w-6 h-6 text-primary" />
            </h2>
            <p className="text-muted-foreground">Inscrivez-vous pour commencer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-xl animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-username" className="text-sm font-medium">Nom d'utilisateur</label>
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="votre_nom"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium">Mot de passe</label>
              <div className="relative">
                <input
                  id="register-password"
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

            <div className="space-y-2">
              <label htmlFor="register-confirm" className="text-sm font-medium">Confirmer le mot de passe</label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-chart-2 to-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
