import { useNavigate, useOutletContext } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import api from "../lib/api"
import { MessageSquare, Bot, Sparkles, ArrowRight, Zap } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { agents, fetchConversations } = useOutletContext()

  async function handleStartChat(agent) {
    try {
      const res = await api.post("/conversations/", {
        title: `Chat avec ${agent.name}`,
        agent_id: agent._id,
      })
      await fetchConversations()
      navigate(`/chat/${res.data._id}`)
    } catch (err) {
      console.error("Failed to create conversation:", err)
    }
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Propulsé par Ollama
          </div>
          <h1 className="text-4xl font-bold mb-3">
            Bonjour,{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              {user?.username}
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Sélectionnez un agent IA spécialisé pour démarrer une conversation
          </p>
        </div>

        {/* Agent Grid */}
        {agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, i) => (
              <button
                key={agent._id}
                onClick={() => handleStartChat(agent)}
                className="group relative bg-card border border-border/50 rounded-2xl p-6 text-left hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-chart-2/30 transition-colors">
                    {agent.logo_url ? (
                      <img
                        src={`http://localhost:8008${agent.logo_url}`}
                        alt={agent.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <Bot className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {agent.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/60 bg-muted/50 px-2 py-1 rounded-md">
                      {agent.model_name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Aucun agent disponible</h3>
            <p className="text-muted-foreground text-sm">
              Un administrateur doit d'abord créer des agents IA
            </p>
          </div>
        )}

        {/* Quick stats */}
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>{agents.length} agent{agents.length !== 1 ? "s" : ""} disponible{agents.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Réponses en temps réel</span>
          </div>
        </div>
      </div>
    </div>
  )
}
