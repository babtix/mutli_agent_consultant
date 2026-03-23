import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  MessageSquare,
  Zap,
  ArrowRight,
  Sparkles,
  Globe,
  Lock,
  FileText,
  Code,
  BrainCircuit,
} from "lucide-react"

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Multi-Agents IA",
    desc: "Consultez plusieurs agents IA spécialisés, chacun avec son propre rôle et expertise.",
  },
  {
    icon: Lock,
    title: "100% Local & Sécurisé",
    desc: "Vos données restent sur vos serveurs. Aucune donnée n'est envoyée à des services tiers.",
  },
  {
    icon: Zap,
    title: "Réponses en Temps Réel",
    desc: "Streaming en direct des réponses pour une expérience de chat fluide et instantanée.",
  },
  {
    icon: FileText,
    title: "Upload & Export",
    desc: "Importez des PDF et DOCX, exportez vos conversations en Markdown, texte ou JSON.",
  },
  {
    icon: Globe,
    title: "Propulsé par Ollama",
    desc: "Utilisez n'importe quel modèle compatible Ollama : LLaMA, Mistral, DeepSeek, et plus.",
  },
  {
    icon: Code,
    title: "Open Source",
    desc: "Code ouvert, extensible et personnalisable pour s'adapter à vos besoins métier.",
  },
]

export default function Home() {
  const { isAuthenticated } = useAuth()

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Multi-IA Consultant</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/20"
            >
              Commencer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme d'IA Multi-Agents
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fade-in">
              Votre consultant{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-1 bg-clip-text text-transparent">
                IA intelligent
              </span>
              <br />
              entièrement local
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed">
              Déployez des agents IA spécialisés propulsés par Ollama. Sécurisé,
              rapide, et sous votre contrôle total. Aucune donnée n'est envoyée
              à l'extérieur.
            </p>

            <div className="flex items-center justify-center gap-4 animate-fade-in">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-chart-2 text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-primary/25"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-2xl border border-border text-sm font-medium hover:bg-accent transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in">
            {[
              { value: "100%", label: "Local & Privé" },
              { value: "∞", label: "Agents créables" },
              { value: "< 1s", label: "Temps de réponse" },
              { value: "0€", label: "Open Source" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une plateforme complète pour intégrer l'IA dans vos processus métier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="group bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/15 flex items-center justify-center mb-4 group-hover:from-primary/25 group-hover:to-chart-2/25 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">Stack Technologique</h2>
            <p className="text-muted-foreground">Technologies modernes et éprouvées</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              "React",
              "Tailwind CSS",
              "Shadcn UI",
              "FastAPI",
              "MongoDB",
              "Ollama",
              "Vite",
              "JWT Auth",
            ].map((tech) => (
              <div
                key={tech}
                className="px-5 py-2.5 rounded-xl bg-card border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Créez votre compte et commencez à utiliser vos agents IA en quelques secondes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-chart-2 text-primary-foreground font-semibold text-base hover:opacity-90 transition-all shadow-xl shadow-primary/25"
          >
            Commencer gratuitement
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
              <MessageSquare className="w-3 h-3 text-primary-foreground" />
            </div>
            Multi-IA Consultant
          </div>
          <p>© {new Date().getFullYear()} · Projet universitaire</p>
        </div>
      </footer>
    </div>
  )
}
