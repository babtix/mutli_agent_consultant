import { useState, useEffect, useCallback } from "react"
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import { toast } from "sonner"
import api from "../../lib/api"
import ConfirmDialog from "../ConfirmDialog"
import {
  MessageSquare,
  Plus,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  Clock,
  Trash2,
  Edit3,
  Check,
  ChevronLeft,
  UserCircle,
  Command,
} from "lucide-react"

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [agents, setAgents] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [confirmState, setConfirmState] = useState({ open: false, id: null, title: "", message: "" })

  useEffect(() => {
    fetchConversations()
    fetchAgents()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      // Ctrl+N or Cmd+N → new chat with first agent
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        if (agents.length > 0) handleNewChat(agents[0]._id)
      }
      // Ctrl+/ or Cmd+/ → toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        setSidebarOpen((prev) => !prev)
      }
      // Ctrl+Shift+D → toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "D") {
        e.preventDefault()
        toggleTheme()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [agents, toggleTheme])

  async function fetchConversations() {
    try {
      const res = await api.get("/conversations/?limit=50")
      setConversations(res.data)
    } catch (err) {
      console.error("Failed to fetch conversations:", err)
    }
  }

  async function fetchAgents() {
    try {
      const res = await api.get("/agents/")
      setAgents(res.data)
    } catch (err) {
      console.error("Failed to fetch agents:", err)
    }
  }

  async function handleNewChat(agentId) {
    try {
      const agent = agents.find((a) => a._id === agentId)
      const res = await api.post("/conversations/", {
        title: `Chat avec ${agent?.name || "Agent"}`,
        agent_id: agentId,
      })
      await fetchConversations()
      navigate(`/chat/${res.data._id}`)
      setMobileSidebarOpen(false)
      toast.success(`Nouvelle conversation avec ${agent?.name || "Agent"}`)
    } catch (err) {
      console.error("Failed to create conversation:", err)
      toast.error("Impossible de créer la conversation")
    }
  }

  function requestDeleteConversation(e, convId) {
    e.stopPropagation()
    e.preventDefault()
    const conv = conversations.find((c) => c._id === convId)
    setConfirmState({
      open: true,
      id: convId,
      title: "Supprimer la conversation",
      message: `Êtes-vous sûr de vouloir supprimer "${conv?.title || "cette conversation"}" ? Cette action est irréversible.`,
    })
  }

  async function confirmDeleteConversation() {
    const convId = confirmState.id
    setConfirmState({ open: false, id: null, title: "", message: "" })
    try {
      await api.delete(`/conversations/${convId}`)
      setConversations((prev) => prev.filter((c) => c._id !== convId))
      if (location.pathname.includes(convId)) {
        navigate("/")
      }
      toast.success("Conversation supprimée")
    } catch (err) {
      console.error("Failed to delete conversation:", err)
      toast.error("Impossible de supprimer la conversation")
    }
  }

  async function handleRename(e, convId) {
    e.stopPropagation()
    e.preventDefault()
    if (!editTitle.trim()) return
    try {
      await api.put(`/conversations/${convId}`, { title: editTitle.trim() })
      setConversations((prev) =>
        prev.map((c) => (c._id === convId ? { ...c, title: editTitle.trim() } : c))
      )
      setEditingId(null)
      toast.success("Conversation renommée")
    } catch (err) {
      console.error("Failed to rename conversation:", err)
      toast.error("Impossible de renommer")
    }
  }

  function handleLogout() {
    logout()
    navigate("/login")
    toast.success("Déconnecté avec succès")
  }

  function getAgentName(agentId) {
    const agent = agents.find((a) => a._id === agentId)
    return agent?.name || "Agent"
  }

  // Group conversations by date
  function groupConversations() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const groups = { today: [], yesterday: [], thisWeek: [], older: [] }

    conversations.forEach((conv) => {
      const date = new Date(conv.updated_at)
      if (date >= today) groups.today.push(conv)
      else if (date >= yesterday) groups.yesterday.push(conv)
      else if (date >= weekAgo) groups.thisWeek.push(conv)
      else groups.older.push(conv)
    })

    return groups
  }

  const groups = groupConversations()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">Multi-IA</span>
          </Link>
          <button
            onClick={() => { setSidebarOpen(false); setMobileSidebarOpen(false); }}
            className="p-1.5 rounded-md hover:bg-accent transition-colors lg:block hidden"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Agent Selector */}
        {agents.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
              Nouveau Chat
            </p>
            <div className="grid gap-1">
              {agents.map((agent) => (
                <button
                  key={agent._id}
                  onClick={() => handleNewChat(agent._id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-all duration-200 group text-left w-full"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center shrink-0 group-hover:from-primary/30 group-hover:to-chart-2/30 transition-colors">
                    {agent.logo_url ? (
                      <img src={`http://localhost:8008${agent.logo_url}`} alt="" className="w-5 h-5 rounded" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-primary" />
                    )}
                  </div>
                  <span className="truncate text-foreground/80 group-hover:text-foreground transition-colors">
                    {agent.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {[
          { label: "Aujourd'hui", items: groups.today },
          { label: "Hier", items: groups.yesterday },
          { label: "Cette semaine", items: groups.thisWeek },
          { label: "Plus ancien", items: groups.older },
        ]
          .filter((g) => g.items.length > 0)
          .map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((conv) => {
                  const isActive = location.pathname === `/chat/${conv._id}`
                  return (
                    <div
                      key={conv._id}
                      className={`group relative flex items-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "hover:bg-accent/50 text-foreground/70 hover:text-foreground"
                      }`}
                    >
                      {editingId === conv._id ? (
                        <form onSubmit={(e) => handleRename(e, conv._id)} className="flex items-center gap-1 w-full px-2 py-1.5">
                          <input
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="flex-1 bg-background/50 text-sm rounded px-2 py-1 outline-none border border-border"
                            onKeyDown={(e) => e.key === "Escape" && setEditingId(null)}
                          />
                          <button type="submit" className="p-1 hover:text-primary">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      ) : (
                        <Link
                          to={`/chat/${conv._id}`}
                          onClick={() => setMobileSidebarOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm w-full truncate"
                        >
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                          <span className="truncate">{conv.title}</span>
                        </Link>
                      )}

                      {editingId !== conv._id && (
                        <div className="absolute right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              setEditingId(conv._id)
                              setEditTitle(conv.title)
                            }}
                            className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => requestDeleteConversation(e, conv._id)}
                            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        {conversations.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground/60">Aucune conversation</p>
            <p className="text-xs text-muted-foreground/40 mt-1">Sélectionnez un agent pour démarrer</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <Link
          to="/"
          onClick={() => setMobileSidebarOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === "/" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          <Home className="w-4 h-4" />
          Accueil
        </Link>
        <Link
          to="/conversations"
          onClick={() => setMobileSidebarOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === "/conversations" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          Historique
        </Link>
        {isAdmin && (
          <Link
            to="/settings"
            onClick={() => setMobileSidebarOpen(false)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              location.pathname === "/settings" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Settings className="w-4 h-4" />
            Administration
          </Link>
        )}
        <Link
          to="/account"
          onClick={() => setMobileSidebarOpen(false)}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === "/account" ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          <UserCircle className="w-4 h-4" />
          Mon Compte
        </Link>

        {/* User */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/30">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      {sidebarOpen && (
        <aside className="hidden lg:flex w-72 border-r border-border/50 bg-sidebar flex-col shrink-0 animate-slide-in-left">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar z-50 lg:hidden border-r border-border/50 animate-slide-in-left">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (collapsed sidebar toggle + mobile menu) */}
        <header className="h-12 border-b border-border/50 flex items-center px-4 shrink-0 bg-background/80 backdrop-blur-sm">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-accent transition-colors mr-2 hidden lg:block">
              <Menu className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1.5 rounded-md hover:bg-accent transition-colors mr-2 lg:hidden">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          {/* Keyboard shortcuts hint */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-mono">Ctrl+N</kbd> Nouveau chat</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-mono">Ctrl+/</kbd> Sidebar</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <Outlet context={{ conversations, fetchConversations, agents, fetchAgents }} />
        </main>
      </div>
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Supprimer"
        onConfirm={confirmDeleteConversation}
        onCancel={() => setConfirmState({ open: false, id: null, title: "", message: "" })}
        destructive
      />
    </div>
  )
}
